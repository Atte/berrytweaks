BerryTweaks.lib['nick'] = (function(){
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
			$.getJSON('https://atte.fi/berrytweaks/api/nicks.py', function(data){
				self.cache = data;
				self.callbacks.forEach(function(waiter){
					waiter(self.cache);
				});
				self.callbacks = null;
			});
		}
	},
	'resolve': function(nick, callback){
		self.getData(function(data){
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
	}
};

return self;

})();