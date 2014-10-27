BerryTweaks.modules['hideLoggedin'] = (function(){
"use strict";

var removedNode = null;

var self = {
	'enable': function(){
		whenExists('.loginAs', function(el){
			var node = el.contents()[0];
			if ( node.nodeType == Element.TEXT_NODE ){
				removedNode = node;
				node.remove();
			}
		});
	},
	'disable': function(){
		if ( !removedNode )
			return;

		whenExists('.loginAs', function(el){
			el.prepend(removedNode);
			removedNode = null;
		});
	}
};

return self;

})();