BerryTweaks.modules['sync'] = (function(){
"use strict";

var self = {
	'css': false,
	'libs': ['crypto'],
	'sync': function(){
		if ( !self.enabled )
			return;

		var nick = localStorage.getItem('nick');
		var pass = localStorage.getItem('pass');
		if ( !nick || !pass )
			return;

		var settings = BerryTweaks.loadSettings();
		var browser = {
			'version': settings.sync && settings.sync.version || 0,
			'data': {
				'squee': localStorage.getItem('highlightList'),
				'PEP': localStorage.getItem('PEP')
			}
		};

		$.post('https://atte.fi/berrytweaks/api/sync.php', {
			'action': 'sync',
			'id': BerryTweaks.lib.crypto.sha1(nick+'|'+pass),
			'payload': JSON.stringify(browser)
		}, function(server){
			var settings = BerryTweaks.loadSettings();
			if ( !settings.sync )
				settings.sync = {};
			settings.sync.version = server.version;
			BerryTweaks.saveSettings(settings);

			if ( server.data.squee ){
				localStorage.setItem('highlightList', server.data.squee);

				if ( server.data.squee.length > 0 )
					HIGHLIGHT_LIST = server.data.squee.split(';');
			}

			if ( server.data.PEP ){
				localStorage.setItem('PEP', server.data.PEP);

				if ( window.PEP ){
					PEP.alarms = PEP.getStorage();
					PEP.restarPlaylist();
				}
			}
		}, 'json');
	},
	'enable': function(){
		self.sync();
	},
	'disable': function(){
		
	}
};

BerryTweaks.patch(window, 'showCustomSqueesWindow', function(){
	if ( !self.enabled )
		return;

	$('.controlWindow > div > .button:nth-child(2)').click(function(){
		self.sync();
	});
});

whenExists('#manageAlarms', function(){
	BerryTweaks.patch(PEP, 'setStorage', function(){
		self.sync();
	})
});

return self;

})();
