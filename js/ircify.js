BerryTweaks.modules['ircify'] = (function(){
"use strict";

var self = {
	'css': true,
	'verbs': {
		'join': 'joined',
		'part': 'left'
	},
	'partTimeoutHandles': {},
	'holdActs': true,
	'act': function(nick, type, time){
		if ( !nick || self.holdActs )
			return;

		addChatMsg({
			'msg': {
				'nick': nick,
				'msg': '<span class="berrytweaks-ircify-' + type + '">' + self.verbs[type] + '</span>',
				'metadata':  {
					'graymute': false,
					'nameflaunt': false,
					'flair': null,
					'channel': 'main'
				},
				'emote': 'act',
				'timestamp': time.getTime()
			},
			'ghost': false
		}, '#chatbuffer');
	},
	'loadTimeout': function(){
		var secs = BerryTweaks.loadSettings().timeoutSmoothing;
		if ( secs === undefined )
			return 5;
		else
			return secs;
	},
	'addUser': function(nick){
		if ( nick == window.NAME )
			self.holdActs = false;

		if ( self.partTimeoutHandles[nick] ){
			clearTimeout(self.partTimeoutHandles[nick]);
			self.partTimeoutHandles[nick] = null;
		}
		else
			self.act(nick, 'join', new Date());
	},
	'rmUser': function(nick){
		if ( self.partTimeoutHandles[nick] )
			return;

		var time = new Date();
		self.partTimeoutHandles[nick] = setTimeout(function(){
			self.partTimeoutHandles[nick] = null;
			self.act(nick, 'part', time);
		}, self.loadTimeout() * 1000);
	},
	'enable': function(){
		if ( window.CHATLIST.hasOwnProperty(window.NAME) )
			self.holdActs = false;
	},
	'addSettings': function(container){
		$('<div>', {

		}).append(
			$('<label>', {
				'for': 'berrytweaks-ircify-timeout',
				'text': 'Hide disconnects shorter than '
			})
		).append(
			$('<input>', {
				'id': 'berrytweaks-ircify-timeout',
				'type': 'number',
				'step': 1,
				'min': 0,
				'value': self.loadTimeout()
			}).change(function(){
				var settings = BerryTweaks.loadSettings();
				settings.timeoutSmoothing = +$(this).val();
				BerryTweaks.saveSettings(settings);
			})
		).append(
			$('<label>', {
				'for': 'berrytweaks-ircify-timeout',
				'text': ' seconds'
			})
		).appendTo(container);
	}
};

BerryTweaks.patch(window, 'addUser', function(data){
	if ( !self.enabled )
		return;

	self.addUser(data.nick);
});

BerryTweaks.patch(window, 'rmUser', function(nick){
	if ( !self.enabled )
		return;

	self.rmUser(nick);
}, true);

socket.on('reconnecting', function(){
	self.holdActs = true;
});

return self;

})();
