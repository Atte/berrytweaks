BerryTweaks.modules['ircifyModlog'] = (function(){
'use strict';

// TODO: proper detection of "joined" status of self
const self = {
    css: true,
    previous: null,
    holdActs: true,
    addLogMsg(data) {
        if (self.holdActs) {
            return;
        }

        const nick = data.logEvent && data.logEvent.data && data.logEvent.data.mod || data.nick;

        let msg = data.logEvent && data.logEvent.formatted || data.msg;
        if (msg.startsWith(data.nick + ' ')) {
            msg = msg.substr(data.nick.length + 1);
        }

        const key = `${data.timestamp}|${nick}|${msg}`;
        if ( !nick || !msg || nick === 'Server' || key === self.previous )
            return;

        self.previous = key;
        addChatMsg({
            msg: {
                nick: nick,
                msg: `<span class="berrytweaks-ircify-modlog">${msg} </span>`,
                metadata:  {
                    graymute: false,
                    nameflaunt: false,
                    flair: null,
                    channel: 'main'
                },
                emote: 'act',
                timestamp: data.timestamp
            },
            ghost: false
        }, '#chatbuffer');
    },
    enable() {
        setTimeout(function() {
            self.holdActs = false;
        }, 5000);
    },
    bind: {
        patchAfter: {
            addLogMsg(data) {
                self.addLogMsg(data);
            }
        }
    }
};

return self;

})();
