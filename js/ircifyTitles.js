BerryTweaks.modules['ircifyTitles'] = (function(){
"use strict";

var self = {
	'css': true,
	'libs': ['video'],
	'onChange': function(video){
		var length = '';
		if ( video.length ){
			length = ''+video.length.s;
			if ( video.length.m )
				length = video.length.m + ':' + length;
			if ( video.length.h )
				length = video.length.h + ':' + length;

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
				'timestamp': (new Date()).getTime()
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
