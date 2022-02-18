BerryTweaks.modules['altTab'] = (function(){
'use strict';

const self = {
    handler(e) {
        if ( window.TYPE < 2 )
            return;

        if ( e.altKey && !e.shiftKey && !e.ctrlKey ){
            let target = null;
            switch ( e.keyCode ){
                case 49: // 1
                case 97: // a
                case 112: // F1
                    target = 'main';
                    break;
                case 50: // 2
                case 98: // b
                case 113: // F2
                    target = 'admin';
                    break;
                default:
                    return;
            }
            e.stopImmediatePropagation();
            e.preventDefault();
            window.showChat(target);
        }
    },
    enable() {
        $(window).on('keydown.btweaksAltTab', self.handler);
    },
    disable() {
        $(window).off('.btweaksAltTab');
    }
};

return self;

})();
