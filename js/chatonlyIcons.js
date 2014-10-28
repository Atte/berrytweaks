BerryTweaks.modules['chatonlyIcons'] = (function(){
"use strict";

var classes = {
	'Poll': 'poll-button',
	'Playlist': 'playlist-button'
};

var self = {
	'css': true,
	'enable': function(){
		$.each(classes, function(text, cls){
			whenExists('#chatControls > .settings:contains('+text+')', function(el){
				el.addClass(cls).addClass('berrytweaks-icon');
			})
		});
	}
};

return self;

})();