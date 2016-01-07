BerryTweaks.modules['videoTitle'] = (function(){
"use strict";

var self = {
	'css': true,
	'libs': ['video'],
	'time': 0,
	'link': null,
	'onChange': function(video){
		self.link.html(video.title);
	},
	'onUpdate': function(video){
		self.link.attr('href', video.timedLink);
	},
	'enable': function(){
		$('#chatControls').append(
			self.link = $('<a>', {
				'id': 'berrytweaks-video_title',
				'target': '_blank',
				'text': 'Loading...'
			})
		);

		BerryTweaks.lib.video.subscribe(self.onChange, self.onUpdate);
	},
	'disable': function(){
		BerryTweaks.lib.video.unsubscribe(self.onChange, self.onUpdate);

		if ( self.link ){
			self.link.remove();
			self.link = null;
		}
	}
};

return self;

})();