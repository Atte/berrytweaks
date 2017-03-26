BerryTweaks.modules['hideLoggedin'] = (function(){
'use strict';

const self = {
    'removedNode': null,
    'enable': function(){
        whenExists('.loginAs', function(el){
            const node = el.contents()[0];
            if ( node.nodeType === Element.TEXT_NODE ){
                self.removedNode = node;
                node.remove();
            }
        });
    },
    'disable': function(){
        if ( !self.removedNode )
            return;

        whenExists('.loginAs', function(el){
            el.prepend(self.removedNode);
            self.removedNode = null;
        });
    }
};

return self;

})();
