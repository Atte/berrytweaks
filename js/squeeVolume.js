BerryTweaks.modules['squeeVolume'] = (function(){
"use strict";

var self = {
	'css': false,
	'getVolume': function(){
		var vol = BerryTweaks.loadSettings().squeeVolume;
		if ( vol === undefined )
			return 1.0;
		else
			return vol;
	},
	'setVolume': function(vol){
		var settings = BerryTweaks.loadSettings();
		settings.squeeVolume = vol;
		BerryTweaks.saveSettings(settings);
	},
	'enable': function(){
		NOTIFY.volume = self.getVolume();
	},
	'disable': function(){
		NOTIFY.volume = 1.0;
	},
	'addSettings': function(container){
		$('<div>', {

		}).slider({
			'min': 0.0,
			'max': 1.0,
			'step': 0.01,
			'value': self.getVolume(),
			'stop': function(event, ui){
				self.setVolume(ui.value);

				if ( self.enabled )
					NOTIFY.volume = ui.value;
			}
		}).appendTo(container);
	}
};

return self;

})();
