BerryTweaks.modules['ircifyModlog'] = (function(){
'use strict';

const self = {
    css: true,
    previous: null,
    addLogMsg(data) {
        const key = `${data.timestamp}|${data.nick}|${data.msg}`;
        if ( data.nick === 'Server' || key === self.previous )
            return;

        let msg = data.msg;
        if (msg.startsWith(data.nick + ' ')) {
            msg = msg.substr(data.nick.length + 1);
        }

        self.previous = key;
        addChatMsg({
            msg: {
                nick: data.nick,
                msg: `<span class="berrytweaks-ircify-modlog">${msg} </span>`,
                metadata:  {
                    graymute: false,
                    nameflaunt: false,
                    flair: null,
                    channel: 'main'
                },
                emote: 'act',
                timestamp: new Date(data.timestamp)
            },
            ghost: false
        }, '#chatbuffer');
    },
    bind: {
        socket: {
            adminLog(data) {
                if (window.TYPE >= 2) {
                    self.addLogMsg(data);
                }
            }
        }
    }
};

return self;

})();
