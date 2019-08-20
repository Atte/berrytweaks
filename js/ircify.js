BerryTweaks.modules['ircify'] = (function(){
'use strict';

// TODO: proper detection of "joined" status of self
const self = {
    css: true,
    verbs: {
        join: 'joined',
        part: 'left'
    },
    partTimeoutHandles: {},
    holdActs: true,
    act(nick, type, time) {
        addChatMsg({
            msg: {
                nick,
                msg: `<span class="berrytweaks-ircify-${type}">${self.verbs[type]}</span>`,
                metadata:  {
                    graymute: false,
                    nameflaunt: false,
                    flair: null,
                    channel: 'main'
                },
                emote: 'act',
                timestamp: time
            },
            ghost: false
        }, '#chatbuffer');
    },
    addUser(nick) {
        if (self.holdActs || !nick)
            return;

        if ( self.partTimeoutHandles[nick] ){
            clearTimeout(self.partTimeoutHandles[nick]);
            self.partTimeoutHandles[nick] = null;
        }
        else
            self.act(nick, 'join', BerryTweaks.getServerTime());
    },
    rmUser(nick) {
        if (self.holdActs || !nick || self.partTimeoutHandles[nick])
            return;

        const time = BerryTweaks.getServerTime();
        self.partTimeoutHandles[nick] = setTimeout(() => {
            self.partTimeoutHandles[nick] = null;
            self.act(nick, 'part', time);
            delete window.CHATLIST[nick];
        }, BerryTweaks.getSetting('timeoutSmoothing', 5) * 1000);
    },
    enable() {
        setTimeout(function() {
            self.holdActs = false;
        }, 5000);
    },
    addSettings(container) {
        $('<div>', {

        }).append(
            $('<label>', {
                for: 'berrytweaks-ircify-timeout',
                text: 'Hide disconnects shorter than '
            })
        ).append(
            $('<input>', {
                id: 'berrytweaks-ircify-timeout',
                type: 'number',
                step: 1,
                min: 0,
                css: {
                    width: '3em'
                },
                value: BerryTweaks.getSetting('timeoutSmoothing', 5)
            }).change(function() {
                BerryTweaks.setSetting('timeoutSmoothing', +$(this).val());
            })
        ).append(
            $('<label>', {
                for: 'berrytweaks-ircify-timeout',
                text: ' seconds'
            })
        ).appendTo(container);
    },
    bind: {
        patchAfter: {
            addUser(data) {
                self.addUser(data.nick);
            }
        },
        patchBefore: {
            rmUser(nick) {
                self.rmUser(nick);
            }
        },
        socket: {
            reconnecting() {
                self.holdActs = true;
                setTimeout(function() {
                    self.holdActs = false;
                }, 5000);
            }
        }
    }
};

return self;

})();
