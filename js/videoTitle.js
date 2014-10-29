BerryTweaks.modules['videoTitle'] = (function(){
"use strict";

var self = {
	'css': true,
	'link': null,
	'prevID': null,
	'titleUpdateInterval': null,
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
		if ( window.ACTIVE.videoid == self.prevID )
			return;
		self.prevID = window.ACTIVE.videoid;

		self.link.attr('href', self.videoLink(window.ACTIVE))
		self.link.html(decodeURIComponent(window.ACTIVE.videotitle));
	},
	'enable': function(){
		$('#chatControls').append(
			self.link = $('<a>', {
				'id': 'berrytweaks-video_title',
				'target': '_blank',
				'text': 'Loading...'
			})
		);

		self.update();
		self.titleUpdateInterval = setInterval(self.update, 1000*5);
	},
	'disable': function(){
		if ( self.titleUpdateInterval ){
			clearInterval(self.titleUpdateInterval);
			self.titleUpdateInterval = null;
		}

		if ( self.link ){
			self.link.remove();
			self.link = null;
		}

		self.prevID = null;
	}
};

return self;

})();