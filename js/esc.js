BerryTweaks.modules['esc'] = (function(){
"use strict";

var self = {
	'css': false,
	'onEsc': function(e){
		if ( e.which !== 27 )
			return;

		// async in case the dialog is doing stuff on keydown
		setTimeout(function(){
			var wins = $(document.body).data('windows');
			if ( !wins || wins.length === 0 ){
				// MalTweaks header/motd/footer
				$('.floatinner:visible').last().next('.mtclose').click();
				return;
			}

			wins[wins.length-1].close();
		}, 0);
	},
	'enable': function(){
		$(document).on('keydown', self.onEsc);
	},
	'disable': function(){
		$(document).off('keydown', self.onEsc);
	}
};

return self;

})();
