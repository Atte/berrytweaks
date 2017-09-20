BerryTweaks.modules['hideTitle'] = (function(){
'use strict';

const self = {
    oldTitle: null,
    oldNotifyTitle: null,
    enable() {
        if ( !self.oldTitle )
            self.oldTitle = window.WINDOW_TITLE;
        if ( !self.oldNotifyTitle )
            self.oldNotifyTitle = window.NOTIFY_TITLE;

        document.title = window.WINDOW_TITLE = 'BT';
        window.NOTIFY_TITLE = '!';
    },
    disable() {
        if ( self.oldTitle )
            document.title = window.WINDOW_TITLE = self.oldTitle;
        if ( self.oldNotifyTitle )
            window.NOTIFY_TITLE = self.oldNotifyTitle;
    }
};

return self;

})();
