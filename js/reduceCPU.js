BerryTweaks.modules['reduceCPU'] = (function(){
'use strict';

const self = {
    css: true,
    propTransfer: null,
    enable() {
        self.propTransfer = window.propTransfer;
        window.propTransfer = function(){};
    },
    disable() {
        window.propTransfer = self.propTransfer;
    }
};

return self;

})();
