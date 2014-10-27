BerryTweaks.modules['smoothenWut'] = (function(){
"use strict";

var patchDone = false;

var self = {
	'enable': function(){
		if ( patchDone )
			return;

		patchDone = true;
		whenExists('#wutColorStyles', function(){
			BerryTweaks.patch('wutProcessUsername', function(nick){
				if ( !self.enabled )
					return;

				var sheet = document.getElementById('wutColorStyles').sheet;

				var m = sheet.cssRules[0].cssText.match(/\bcolor\s*:\s*([^;}]+)/);
				var color = m && m[1];
				if ( !color )
					return;

				sheet.insertRule('.msg-'+nick+' { border-image: linear-gradient(to right, '+color+', transparent) 1 100%; }', sheet.cssRules.length);
				sheet.insertRule('#chatlist > ul > li.'+nick+' { border-left-width: 0; }', sheet.cssRules.length);
			});
			wutReloadUserColors();
		});
	},
	'disable': function(){
		
	}
};

BerryTweaks.patch('addChatMsg', function(data, _to){
	if ( !self.enabled )
		return;

	// concatenate messages from the same person to get a continuous line on the left
	var container = $(_to).children().last();
	var previousContainer = container.prev();
	if ( container[0] && previousContainer[0] && container[0].className == previousContainer[0].className ){
		previousContainer.append(container.children());
		container.remove();
	}
});

return self;

})();