BerryTweaks.modules['squeeSound'] = (function(){
"use strict";

var self = {
	'css': false,
	'original': NOTIFY.src,
	'setSound': function(){
		var url = self.loadSound();
		if ( self.enabled && url )
			NOTIFY.src = url;
		else
			NOTIFY.src = self.original;
	},
	'loadSound': function(){
		return BerryTweaks.loadSettings().squeeSound || '';
	},
	'saveSound': function(url){
		var settings = BerryTweaks.loadSettings();
		settings.squeeSound = url;
		BerryTweaks.saveSettings(settings);
	},
	'enable': function(){
		self.setSound();
	},
	'disable': function(){
		NOTIFY.src = self.original;
	},
	'addSettings': function(container){
		$('<input>', {
			'type': 'text',
			'value': self.loadSound(),
			'on': {
				'change': function(){
					self.saveSound($(this).val());
					self.setSound();
				}
			}
		}).appendTo(container);
	}
};

return self;

})();
