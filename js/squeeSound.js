BerryTweaks.modules['squeeSound'] = (function(){
'use strict';

const self = {
    'original': window.NOTIFY.src,
    'applySound': function(){
        const url = BerryTweaks.getSetting('squeeSound');
        if ( self.enabled && url )
            window.NOTIFY.src = url;
        else
            window.NOTIFY.src = self.original;
    },
    'enable': function(){
        self.applySound();
    },
    'disable': function(){
        window.NOTIFY.src = self.original;
    },
    'addSettings': function(container){
        $('<input>', {
            'type': 'text',
            'value': BerryTweaks.getSetting('squeeSound', ''),
            'placeholder': 'Sound file URL',
            'css': {
                'width': '100%'
            },
            'on': {
                'change': function(){
                    BerryTweaks.setSetting('squeeSound', $(this).val());
                    self.applySound();
                }
            }
        }).appendTo(container);
    }
};

return self;

})();
