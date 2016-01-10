BerryTweaks.modules['ircifyTitles'] = (function(){
"use strict";

var self = {
	'css': true,
	'libs': ['video'],
	'addZeroes': function(num){
		if ( num < 10 )
			return '0' + num;
		return ''+num;
	},
	'onChange': function(video){
		var length = '';
		if ( video.length ){
			length = self.addZeroes(video.length.s||0);

			if ( video.length.h )
				length = video.length.h + ':' + self.addZeroes(video.length.m||0) + ':' + length;
			else
				length = (video.length.m||0) + ':' + length;

			length = ' (' + length + ')';
		}

		addChatMsg({
			'msg': {
				'nick': 'Now Playing',
				'msg': '<span class="berrytweaks-ircify-title"><a href="javascript:void(0)" target="_blank">' + video.title + '</a>' + length + '</span>',
				'metadata':  {
					'graymute': false,
					'nameflaunt': false,
					'flair': null,
					'channel': 'main'
				},
				'emote': 'act',
				'timestamp': BerryTweaks.getServerTime()
			},
			'ghost': false
		}, '#chatbuffer');

		// add URL afterwards, or addChatMsg will shitty drunken regex it
		if ( video.link )
			$('#chatbuffer .berrytweaks-ircify-title > a').last().attr('href', video.link);
	},
	'enable': function(){
		BerryTweaks.lib.video.subscribe(self.onChange);
	},
	'disable': function(){
		BerryTweaks.lib.video.unsubscribe(self.onChange);
	}
};

return self;

})();
