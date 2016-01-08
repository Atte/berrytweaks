BerryTweaks.lib['user'] = (function(){
"use strict";

var self = {
	'callbacks': {},
	'cache': {},
	'cacheData': function(type, callback){
		if ( self.cache[type] ){
			callback(self.cache[type]);
			return;
		}

		if ( self.callbacks[type] )
			self.callbacks[type].push(callback);
		else
			self.callbacks[type] = [callback];

		if ( self.callbacks[type].length == 1 ){
			// yay ugly hacks
			var fname;
			if ( type == 'nicks' )
				fname = 'nicks.py';
			else if ( type == 'map' )
				fname = 'map.php';
			else
				fname = 'time.php?' + type;

			$.getJSON('https://atte.fi/berrytweaks/api/' + fname, function(data){
				self.cache[type] = data;
				self.callbacks[type].forEach(function(waiter){
					waiter(self.cache[type]);
				});
				self.callbacks[type] = null;
			});
		}
	},
	'getAliases': function(nick, callback){
		self.cacheData('nicks', function(data){
			if ( data.hasOwnProperty(nick) ){
				callback([nick].concat(data[nick]));
				return;
			}

			for ( var key in data ){
				if ( !data.hasOwnProperty(key) )
					continue;

				if ( data[key].indexOf(nick) != -1 ){
					callback([key].concat(data[key]));
					return;
				}
			}

			callback([nick]);
		});
	},
	'getMap': function(nick, callback){
		self.cacheData('map', function(data){
			self.getAliases(nick, function(keys){
				for ( var i=0; i<keys.length; ++i ){
					var mapdata = data[keys[i].toLowerCase()];
					if ( mapdata ){
						callback(mapdata);
						return;
					}
				}
				callback(null);
			});
		});
	},
	'getTime': function(nick, callback){
		self.getMap(nick, function(mapdata){
			if ( !mapdata )
				return;

			self.cacheData('lat=' + mapdata.lat + '&lng=' + mapdata.lng, function(timedata){
				callback(timedata);
			});
		});
	}
};

return self;

})();