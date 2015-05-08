BerryTweaks.modules['squeeVolume'] = (function(){
"use strict";

var self = {
	'css': false,
	'loadVolume': function(){
		var vol = BerryTweaks.loadSettings().squeeVolume;
		if ( vol === undefined )
			return 1.0;
		else
			return vol;
	},
	'saveVolume': function(vol){
		var settings = BerryTweaks.loadSettings();
		settings.squeeVolume = vol;
		BerryTweaks.saveSettings(settings);
	},
	'enable': function(){
		NOTIFY.volume = self.loadVolume();
	},
	'disable': function(){
		NOTIFY.volume = 1.0;
	},
	'addSettings': function(container){
		$('<div>', {

		}).slider({
			'range': 'min',
			'min': 0.0,
			'max': 1.0,
			'step': 0.01,
			'value': self.loadVolume(),
			'stop': function(event, ui){
				self.saveVolume(ui.value);

				if ( self.enabled )
					NOTIFY.volume = ui.value;
			}
		}).appendTo(container);
	}
};

return self;

})();
