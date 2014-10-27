BerryTweaks.modules['hideFloaty'] = (function(){
"use strict";

var self = {
	'enable': function(){
		$('head').append(
			$('<link>', {
				'id': 'berrytweaks-hide-floaty',
				'rel': 'stylesheet',
				'href': 'https://atte.fi/berrytweaks/css/hideFloaty.css'
			})
		);
	},
	'disable': function(){
		$('#berrytweaks-hide-floaty').remove();
	}
};

return self;

})();