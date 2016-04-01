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
		console.warn('Why are you calling getTime!?');
		self.getMap(nick, function(mapdata){
			if ( !mapdata )
				return;

			self.cacheData('lat=' + mapdata.lat + '&lng=' + mapdata.lng, function(timedata){
				callback(timedata);
			});
		});
	},
	'getTimes': function(nicks, callback, finalCallback){
		var datas = {};
		nicks.forEach(function(nick){
			self.getMap(nick, function(mapdata){
				datas[nick] = mapdata;
				var keys = Object.keys(datas);
				if ( keys.length == nicks.length ){
					var url = [];
					keys.forEach(function(key){
						if ( !datas[key] )
							return;

						url.push('lat[]=' + datas[key].lat + '&lng[]=' + datas[key].lng);
					});
					self.cacheData(url.join('&'), function(timedata){
						keys.forEach(function(key, i){
							if ( datas[key] )
								callback(key, timedata.results[i]);
						});
						if ( finalCallback )
							finalCallback();
					});
				}
			});
		});
	}
};

return self;

})();
