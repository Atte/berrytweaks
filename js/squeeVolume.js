BerryTweaks.modules['squeeVolume'] = (function(){
"use strict";

var self = {
	'css': false,
	'setVolumes': function(){
		var vol = self.enabled ? self.loadVolume() : 1.0;

		// [<audio>, baseVolume=1.0]
		[
			[window.NOTIFY],
			[window.DRINK],
			[window.ATTENTION],
			[window.PEP && window.PEP.JAM],
			[window.OHMY, 0.5],
			[window.SHOOBEDOO, 0.5],
			[window.DOOT],
			[window.welcomeToTheJam]
		].forEach(function(el){
			if ( el[0] )
				el[0].volume = vol * (el[1] || 1.0);
		});
	},
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
		self.setVolumes();

		// in case some other scripts haven't loaded yet
		setTimeout(self.setVolumes, 1000 * 10);
	},
	'disable': function(){
		self.setVolumes();
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
				self.setVolumes();
			}
		}).appendTo(container);
	}
};

BerryTweaks.patch(window, 'initToastThemes', function(){
	if ( self.enabled )
		self.setVolumes();
});

return self;

})();
