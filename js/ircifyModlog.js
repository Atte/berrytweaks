BerryTweaks.modules['ircifyModlog'] = (function(){
'use strict';

// TODO: proper detection of "joined" status of self
const self = {
    css: true,
    holdActs: true,
    addLogMsg(data) {
        if (self.holdActs) {
            return;
        }

        const nick = cleanupSessionNick(data.logEvent && data.logEvent.data && data.logEvent.data.mod || data.nick);

        let msg = cleanupSessionNick(data.logEvent && data.logEvent.formatted || data.msg);
        if (msg.startsWith(data.nick + ' ')) {
            msg = msg.substr(data.nick.length + 1);
        }

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
                timestamp: new Date(data.timestamp)
            },
            ghost: false
        }, '#chatbuffer');
    },
    enable() {
        self.holdActs = Object.keys(CHATLIST || {}).length === 0;
    },
    bind: {
        socket: {
            adminLog(data) {
                self.addLogMsg(data);
            },
            createPlayer() {
                self.holdActs = false;
            }
        },
        patchAfter: {
            onSocketReconnecting() {
                self.holdActs = true;
            }
        }
    }
};

return self;

})();
