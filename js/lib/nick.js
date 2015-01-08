BerryTweaks.lib['nick'] = (function(){
"use strict";

var self = {
	'aliases': {
		'Blueshift': ['bluephone'],
		'Chrono': ['Chrona'],
		'Cuddles_theBear': ['irCuddles_tBear'],
		'cyzon': ['ircyzon'],
		'Kris321': ['kris3phone'],
		'maharito': ['mahaquesarito', 'Mahayro'],
		'PonisEnvy': ['PonircEnvy'],
		'SalientBlue': ['SalientPhone'],
		'SomeStupidGuy': ['SomeStupidPhone'],
		'ShippingIsMagic': ['ShippingIsPhone'],
		'stevepoppers': ['stevephoners'],
		'Toastdeib': ['Toastphone'],
		'WeedWuff': ['SpecialCoalWuff']
	},
	'getKeys': function(nick){
		var keys = [nick];

		// resolve aliases
		$.each(self.aliases, function(key, val){
			for ( var i=0; i<val.length; ++i ){
				var alias = val[i].toLowerCase();
				if ( nick == alias ){
					keys.push(key);
					return false;
				}
			}
		});

		// add some default aliases
		keys.push(nick.replace(/[^a-z0-9]?phone/i, ''));
		keys.push(nick.replace(/[^a-z0-9]?irc/i, ''));

		// lowercase, filter out duplicates
		var out = [];
		keys.forEach(function(key){
			key = key.toLowerCase();
			if ( out.indexOf(key) == -1 )
				out.push(key);
		});
		
		return out;
	}
};

return self;

})();