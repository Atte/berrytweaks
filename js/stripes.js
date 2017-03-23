BerryTweaks.modules['stripes'] = (function(){
"use strict";

var self = {
    'isEven': true,
    'handleMessage': function(_to){
        var msg = $(_to).children().last();
        msg.addClass(self.isEven ? 'even' : 'odd');
        self.isEven = !self.isEven;
    },
    'enable': function(){
        self.isEven = true;
        $('#chatbuffer > div').each(function(_to){
            self.handleMessage(_to);
        });
    },
    'disable': function(){
        $('#chatbuffer > div').removeClass('even odd');
    }
};

BerryTweaks.patch(window, 'addChatMsg', function(data, _to){
    if ( !self.enabled )
        return;

    self.handleMessage(_to);
});

return self;

})();
