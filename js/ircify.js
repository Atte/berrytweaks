BerryTweaks.modules['ircify'] = (function(){
"use strict";

var self = {
	'css': true,
	'partTimeout': 5,
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
	'addUser': function(nick){
		console.log('add', nick);

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
		}, self.partTimeout * 1000);
	},
	'enable': function(){
		if ( window.CHATLIST.hasOwnProperty(window.NAME) )
			self.holdActs = false;
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
