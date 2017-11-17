BerryTweaks.modules['smoothenWut'] = (function(){
'use strict';

const self = {
    css: true,
    patchDone: false,
    reload() {
        if ( window.wutReloadUserColors )
            wutReloadUserColors();
    },
    enable() {
        if ( self.patchDone ){
            self.reload();
            return;
        }

        self.patchDone = true;
        BerryTweaks.whenExists('#wutColorStyles', () => {
            BerryTweaks.patch(window, 'wutProcessUsername', nick => {
                if ( !self.enabled )
                    return;

                const sheet = document.getElementById('wutColorStyles').sheet;
                const color = wutGetUsercolor(nick);

                sheet.insertRule(`.msg-${nick} { border-image: linear-gradient(to right, ${color}, transparent) 1 100%; }`, sheet.cssRules.length);
            });
            self.reload();
        });
    },
    disable() {
        self.reload();
    },
    concatContinuous(_to) {
        const container = $(_to).children().last();
        const previousContainer = container.prev();
        if ( container[0] && previousContainer[0] && container[0].className === previousContainer[0].className ){
            previousContainer.append(container.children());
            container.remove();
        }
    },
    bind: {
        patchAfter: {
            addChatMsg(data, _to) {
                self.concatContinuous(_to);
            }
        }
    }
};

return self;

})();
