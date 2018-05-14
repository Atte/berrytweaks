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
                sheet.insertRule(`.msg-${nick} + .msg-${nick} { margin-top: 0; }`, sheet.cssRules.length);
            });
            self.reload();
        });
    },
    disable() {
        self.reload();
    }
};

return self;

})();
