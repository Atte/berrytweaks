BerryTweaks.modules['autoshowVideo'] = (function(){
"use strict";

var self = {
	'css': false,
	'libs': ['video'],
	'onChange': function(video){
		if ( !window.MT || !MT.loaded )
			return;

		var isShown = MT.storage.state.video;

		// if current is volatile; ensure shown, return
		if ( video.isVolatile ){
			if ( !isShown ){
				console.log('Current is volatile; showing video');
				MT.butts.video.$.click();
			}
			return;
		}

		// if video hidden; return
		if ( !isShown )
			return;

		// if volatiles on list; return
		for ( var vid = window.ACTIVE; vid != window.PLAYLIST.first; vid = vid.next ){
			if ( vid.volat )
				return;
		}

		// hide video
		if ( !hasVolatiles ){
			console.log('Out of volatiles; hiding video');
			MT.butts.video.$.click();
		}
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
