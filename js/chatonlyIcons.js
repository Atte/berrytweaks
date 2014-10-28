BerryTweaks.modules['chatonlyIcons'] = (function(){
"use strict";

var self = {
	'css': true,
	'enable': function(){
		$.each(self.classes, function(text, cls){
			whenExists('#chatControls > .settings:contains('+text+')', function(el){
				el.addClass(cls).addClass('berrytweaks-icon');
			})
		});
	},
	'classes': {
		'Poll': 'poll-button',
		'Playlist': 'playlist-button'
	}
};

return self;

})();