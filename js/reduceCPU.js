BerryTweaks.modules['reduceCPU'] = (function(){
'use strict';

const self = {
    css: true,
    propTransfer: null,
    enable() {
        // TODO: actual detection
        setTimeout(function(){
            self.propTransfer = window.propTransfer;
            window.propTransfer = function(){};
        }, 1000 * 5);
    },
    disable() {
        if (self.propTransfer) {
            window.propTransfer = self.propTransfer;
        }
    }
};

return self;

})();
