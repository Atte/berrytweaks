BerryTweaks.modules['smoothenWut'] = (function(){
"use strict";

var self = {
    'css': true,
    'patchDone': false,
    'enable': function(){
        if ( self.patchDone ){
            wutReloadUserColors();
            return;
        }

        self.patchDone = true;
        whenExists('#wutColorStyles', function(){
            BerryTweaks.patch(window, 'wutProcessUsername', function(nick){
                if ( !self.enabled )
                    return;

                var sheet = document.getElementById('wutColorStyles').sheet;
                var color = wutGetUsercolor(nick);

                sheet.insertRule('.msg-'+nick+' { border-image: linear-gradient(to right, '+color+', transparent) 1 100%; }', sheet.cssRules.length);
            });
            wutReloadUserColors();
        });
    },
    'disable': function(){
        wutReloadUserColors();
    },
    'concatContinuous': function(_to){
        var container = $(_to).children().last();
        var previousContainer = container.prev();
        if ( container[0] && previousContainer[0] && container[0].className == previousContainer[0].className ){
            previousContainer.append(container.children());
            container.remove();
        }
    }
};

BerryTweaks.patch(window, 'addChatMsg', function(data, _to){
    if ( !self.enabled )
        return;

    self.concatContinuous(_to);
});

return self;

})();