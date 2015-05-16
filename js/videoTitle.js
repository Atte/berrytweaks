BerryTweaks.modules['videoTitle'] = (function(){
"use strict";

var self = {
	'css': true,
	'time': 0,
	'link': null,
	'prevID': null,
	'interval': null,
	'parseTime': function(time){
		return {
			'h': Math.floor(time / 60 / 60),
			'm': Math.floor((time / 60) % 60),
			's': Math.floor(time % 60)
		};
	},
	'timeString': function(time){
		if ( !time )
			return;

		time = self.parseTime(time);
		if ( time.h > 0 )
			return time.h+'h' + time.m+'m' + time.s+'s';
		else if ( time.m > 0 )
			return time.m+'m' + time.s+'s';
		else if ( time.s > 0 )
			return time.s+'s';
	},
	'videoLink': function(vid, time){
		if ( vid.meta && vid.meta.permalink )
			return vid.meta.permalink;

		var timeStr = self.timeString(time);

		switch ( vid.videotype ){
			case 'yt':
				return 'https://www.youtube.com/watch?v=' + vid.videoid + (timeStr ? '#t='+timeStr : '');
			case 'vimeo':
				return 'https://vimeo.com/' + vid.videoid + (timeStr ? '#t='+timeStr : '');
			case 'dm':
				return 'http://www.dailymotion.com/video/' + vid.videoid;
			case 'osmf':
				return vid.videoid;
		}
	},
	'update': function(){
		self.link.attr('href', self.videoLink(window.ACTIVE, Math.max(self.time-1, 0)));

		if ( window.ACTIVE.videoid != self.prevID ){
			self.prevID = window.ACTIVE.videoid;
			self.link.html(decodeURIComponent(window.ACTIVE.videotitle));
		}
	},
	'onSecondPassed': function(){
		self.time += 1;
		self.update();
	},
	'handleVideoDetails': function(data){
		self.time = data.time;
		self.update();
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
		self.interval = setInterval(self.onSecondPassed, 1000);
	},
	'disable': function(){
		if ( self.interval ){
			clearInterval(self.interval);
			self.interval = null;
		}

		if ( self.link ){
			self.link.remove();
			self.link = null;
		}

		self.prevID = null;
	}
};

socket.on('hbVideoDetail', function(data){
	if ( self.enabled )
		self.handleVideoDetails(data);
});

socket.on('forceVideoChange', function(data){
	if ( self.enabled )
		self.handleVideoDetails(data);
});

return self;

})();