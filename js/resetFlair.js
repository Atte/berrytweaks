BerryTweaks.modules['resetFlair'] = (function(){
"use strict";

var self = {
	'css': false,
	'flair': 0,
	'enable': function(){
		window.MY_FLAIR_ID = self.flair;
		setStorage('myFlairID', self.flair);
		$('#flairMenu').removeClass().addClass('flair_' + self.flair);
	}
};

return self;

})();
