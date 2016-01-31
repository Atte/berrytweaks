BerryTweaks.modules['squeeVolume'] = (function(){
"use strict";

var self = {
	'applyVolume': function(){
		var vol = self.enabled ? BerryTweaks.getSetting('squeeVolume', 1.0) : 1.0;

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
	'enable': function(){
		self.applyVolume();

		// in case some other scripts haven't loaded yet
		setTimeout(self.applyVolume, 1000 * 10);
	},
	'disable': function(){
		self.applyVolume();
	},
	'addSettings': function(container){
		$('<div>', {

		}).slider({
			'range': 'min',
			'min': 0.0,
			'max': 1.0,
			'step': 0.01,
			'value': BerryTweaks.getSetting('squeeVolume', 1.0),
			'stop': function(event, ui){
				BerryTweaks.setSetting('squeeVolume', ui.value);
				self.applyVolume();
				if ( window.NOTIFY )
					window.NOTIFY.play();
			}
		}).appendTo(container);
	}
};

BerryTweaks.patch(window, 'initToastThemes', function(){
	if ( self.enabled )
		self.applyVolume();
});

return self;

})();
