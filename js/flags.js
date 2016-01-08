BerryTweaks.modules['flags'] = (function(){
"use strict";

var self = {
	'css': true,
	'libs': ['user'],
	'handleUser': function(nick){
		if ( !nick )
			return;

		var el = $('#chatlist > ul > li.' + nick);
		BerryTweaks.lib.user.getTime(nick, function(timedata){
			if ( timedata.countryCode && !$('.berrytweaks-flag', el).length ){
				$('<div>', {
					'class': 'berrytweaks-flag',
					'css': {
						'background-image': 'url("https://dl.atte.fi/flags/' + timedata.countryCode.toLowerCase() + '.png")'
					}
				}).appendTo(el);
			}
		});
	},
	'enable': function(){
		$('#chatlist > ul > li').each(function(){
			self.handleUser($(this).data('nick'));
		});
	},
	'disable': function(){
		$('#chatlist > ul > li .berrytweaks-flag').remove();
	}
};

BerryTweaks.patch(window, 'addUser', function(data){
	if ( !self.enabled )
		return;

	self.handleUser(data && data.nick);
});

return self;

})();
