BerryTweaks.modules['videoTitle'] = (function(){
"use strict";

var link = null;
var prevID = null;

var titleUpdateInterval = null;

var self = {
	'videoLink': function(vid){
		if ( vid.meta && vid.meta.permalink )
			return vid.meta.permalink;

		switch ( vid.videotype ){
			case 'yt':
				return 'http://youtu.be/' + vid.videoid;
			case 'vimeo':
				return 'http://vimeo.com/' + vid.videoid;
			case 'dm':
				return 'http://www.dailymotion.com/video/' + vid.videoid;
		}
	},
	'update': function(){
		if ( window.ACTIVE.videoid == prevID )
			return;
		prevID = window.ACTIVE.videoid;

		link.attr('href', self.videoLink(window.ACTIVE))
		link.html(decodeURIComponent(window.ACTIVE.videotitle));
	},
	'enable': function(){
		$('#chatControls').append(
			link = $('<a>', {
				'target': '_blank',
				'text': 'Loading...',
				'css': {
					'float': 'left'
				}
			})
		);

		titleUpdateInterval = setInterval(self.update, 1000*5);
	},
	'disable': function(){
		if ( titleUpdateInterval ){
			clearInterval(titleUpdateInterval);
			titleUpdateInterval = null;
		}

		if ( link ){
			link.remove();
			link = null;
		}
	}
};

return self;

})();