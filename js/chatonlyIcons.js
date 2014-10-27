BerryTweaks.modules['chatonlyIcons'] = (function(){
"use strict";

var icons = {
	'#chatControls > .settings:contains(Poll)': 'https://dl.atte.fi/famfamfam/chart_bar.png',
	'#chatControls > .settings:contains(Playlist)': 'https://dl.atte.fi/famfamfam/table.png'
}

var self = {
	'enable': function(){
		$.each(icons, function(sel, url){
			whenExists(sel, function(el){
				el.css('background', 'url('+url+') 0% 50% no-repeat scroll transparent');
			})
		});
	},
	'disable': function(){
		
	}
};

return self;

})();