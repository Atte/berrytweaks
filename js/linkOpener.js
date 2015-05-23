BerryTweaks.modules['linkOpener'] = (function(){
"use strict";

var self = {
	'css': false,
	'win': null,
	'hideSpoilers': BerryTweaks.loadSettings().hideSpoilerLinks || false,
	'handleMessage': function(msg){
		if ( !self.win || self.win.closed || msg.emote === 'request' )
			return;

		if ( self.hideSpoilers ){
			if ( msg.msg.indexOf('spoiler') !== -1 || msg.emote === 'spoiler' )
				return;
		}

		var m = msg.msg.match(/\bhttps?:\/\/[^\s]+/i);
		if ( m )
			self.win.location.href = m[0];
	},
	'addSettings': function(container){
		$('<div>', {

		}).append(
			$('<label>', {
				'for': 'berrytweaks-linkOpener-hideSpoilers',
				'text': "Don't open spoiler links"
			})
		).append(
			$('<input>', {
				'id': 'berrytweaks-linkOpener-hideSpoilers',
				'type': 'checkbox',
				'checked': self.hideSpoilers
			}).change(function(){
				var settings = BerryTweaks.loadSettings();
				settings.hideSpoilerLinks = self.hideSpoilers = !!$(this).prop('checked');
				BerryTweaks.saveSettings(settings);
			})
		).appendTo(container);

		$('<a>', {
			'href': 'javascript:void(0)',
			'click': function(){
				self.win = window.open('about:blank', 'linkOpener', 'menubar=no,toolbar=no,personalbar=no,location=yes');
			},
			'text': 'Open link opener window'
		}).appendTo(container);
	}
};

BerryTweaks.patch(window, 'addChatMsg', function(data, _to){
	if ( !self.enabled )
		return;

	self.handleMessage(data.msg);
});

return self;

})();
