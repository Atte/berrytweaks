BerryTweaks.modules['userMaps'] = (function(){
"use strict";

var self = {
	'libs': ['user'],
	'addMap': function(){
		// find window
		var dialogContent = $('#userOps').parents('.dialogContent');
		var dialogWindow = dialogContent.parents('.dialogWindow');
		var nick = $('h1', dialogContent).text();
		if ( !dialogContent || !dialogWindow || !nick )
			return;

		BerryTweaks.lib.user.getMap(nick, function(mapdata){
			if ( !mapdata )
				return;

			// add map
			$('<iframe>', {
				'class': 'berrytweaks-usermap',
				'frameborder': 0,
				'css': {
					'border': 'none',
					'width': 256,
					'height': 256
				},
				'src': 'https://www.google.com/maps/embed/v1/place?key=***REMOVED***&zoom=5&q='+mapdata.lat+','+mapdata.lng
			}).appendTo(dialogContent);

			// fix dialog position if it went outside the window
			var diaMargin = 8;
			var offset = dialogWindow.offset();
			var diaSize = {
				'height': dialogWindow.height() + diaMargin,
				'width': dialogWindow.width() + diaMargin
			};

			var win = $(window);
			var scroll = {
				'top': win.scrollTop(),
				'left': win.scrollLeft()
			};
			var winSize = {
				'height': win.height(),
				'width': win.width()
			};

			if ( offset.top + diaSize.height > scroll.top + winSize.height )
				offset.top = scroll.top + winSize.height - diaSize.height;

			if ( offset.left + diaSize.width > scroll.left + winSize.width )
				offset.left = scroll.left + winSize.width - diaSize.width;

			dialogWindow.offset(offset);
		});
	},
	'disable': function(){
		$('.berrytweaks-usermap').remove();
	}
};

BerryTweaks.patch(window, 'showUserActions', function(who){
	if ( !self.enabled )
		return;

	setTimeout(function(){
		self.addMap();
	}, 200+100); // dialog fade-in
});


return self;

})();