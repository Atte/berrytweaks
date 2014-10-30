BerryTweaks.modules['chatonlyIcons'] = (function(){
"use strict";

var self = {
	'css': true,
	'classes': {
		'Poll': 'poll-button',
		'Playlist': 'playlist-button'
	},
	'enable': function(){
		$.each(self.classes, function(text, cls){
			whenExists('#chatControls > .settings:contains('+text+')', function(el){
				el.addClass(cls).addClass('berrytweaks-icon');
			})
		});
	}
};

return self;

})();