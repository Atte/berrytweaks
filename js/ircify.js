BerryTweaks.modules['ircify'] = (function(){
"use strict";

var self = {
	'css': true,
	'partTimeout': 5,
	'partTimeoutHandles': {},
	'holdJoins': true,
	'act': function(nick, type, time){
		if ( !nick )
			return;

		var text = ({
			'join': 'joined',
			'part': 'left'
		})[type];

		addChatMsg({
			'msg': {
				'nick': nick,
				'msg': '<span class="berrytweaks-ircify-' + type + '">' + text + '</span>',
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
		if ( nick == window.NAME )
			self.holdJoins = false;

		if ( self.partTimeoutHandles[nick] ){
			clearTimeout(self.partTimeoutHandles[nick]);
			self.partTimeoutHandles[nick] = null;
		}
		else{
			if ( !self.holdJoins )
				self.act(nick, 'join', new Date());
		}
	},
	'rmUser': function(nick){
		if ( self.partTimeoutHandles[nick] )
			return;

		var time = new Date();
		self.partTimeoutHandles[nick] = setTimeout(function(){
			self.act(nick, 'part', time);
			self.partTimeoutHandles[nick] = null;
		}, self.partTimeout * 1000);
	}
};

BerryTweaks.patch(window, 'addUser', function(data){
	if ( !self.enabled ){
		self.holdJoins = false;
		return;
	}

	self.addUser(data.nick);
});

BerryTweaks.patch(window, 'rmUser', function(nick){
	if ( !self.enabled )
		return;

	self.rmUser(nick);
}, true);

return self;

})();
