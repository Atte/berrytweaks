BerryTweaks.modules['noReferrer'] = (function(){
"use strict";

var self = {
	'css': false,
	'convertAll': function(_to){
		$('a[rel!="noopener noreferrer"]', _to).attr("rel", "noopener noreferrer");
	},
	'enable': function(){
		whenExists('#chatbuffer', function(el){
			convertAll(el);
		});
	}
};

BerryTweaks.patch(window, 'addChatMsg', function(data, _to){
	if ( !self.enabled )
		return;

	self.convertAll(_to);
});

return self;

})();
