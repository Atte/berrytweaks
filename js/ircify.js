BerryTweaks.modules['ircify'] = (function(){
"use strict";

var self = {
	'css': true,
	'partTimeout': 5,
	'partTimeoutHandles': {},
	'act': function(nick, cls, text){
		if ( !nick )
			return;

		addChatMsg({
			'msg': {
				'nick': nick,
				'msg': '<span class="berrytweaks-ircify-' + cls + '">' + text + '</span>',
				'metadata':  {
					'graymute': false,
					'nameflaunt': false,
					'flair': null,
					'channel': 'main'
				},
				'emote': false,
				'timestamp': (new Date()).getTime()
			},
			'ghost': false
		}, '#chatbuffer');
	},
	'addUser': function(nick){
		if ( self.partTimeoutHandles[nick] ){
			clearTimeout(self.partTimeoutHandles[nick]);
			self.partTimeoutHandles[nick] = null;
		}
		else
			self.act(nick, 'join', 'joined');
	},
	'rmUser': function(nick){
		if ( self.partTimeoutHandles[nick] )
			return;

		self.partTimeoutHandles[nick] = setTimeout(function(){
			self.act(nick, 'part', 'left');
			self.partTimeoutHandles[nick] = null;
		}, self.partTimeout * 1000);
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

return self;

})();
