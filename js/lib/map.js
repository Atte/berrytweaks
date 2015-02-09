BerryTweaks.lib['map'] = (function(){
"use strict";

var self = {
	'cache': null,
	'callbacks': [],
	'getData': function(callback){
		if ( self.cache ){
			callback(self.cache);
			return;
		}

		self.callbacks.push(callback);

		if ( self.callbacks.length == 1 ){
			$.getJSON('https://atte.fi/berrytweaks/api/map.php', function(data){
				self.cache = data;
				self.callbacks.forEach(function(waiter){
					waiter(self.cache);
				});
				self.callbacks = null;
			});
		}
	},
	'getUserData': function(nick, callback){
		self.getData(function(mapdata){
			BerryTweaks.lib.nick.resolve(nick, function(keys){
				for ( var i=0; i<keys.length; ++i ){
					var userdata = mapdata[keys[i].toLowerCase()];
					if ( userdata ){
						callback(userdata);
						return;
					}
				}
				callback(null);
			});
		});
	}
};

return self;

})();