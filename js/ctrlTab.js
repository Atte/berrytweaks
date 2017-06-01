BerryTweaks.modules['ctrlTab'] = (function(){
'use strict';

const self = {
    handler(e) {
        if ( e.ctrlKey && !e.altKey && e.keyCode === 9 ){
            e.stopImmediatePropagation();
            e.preventDefault();
            window.cycleChatTab(e.shiftKey);
        }
    },
    enable() {
        $(window).on('keydown', self.handler);
    },
    disable() {
        $(window).off('keydown', self.handler);
    }
};

return self;

})();