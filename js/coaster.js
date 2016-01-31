BerryTweaks.modules['coaster'] = (function(){
"use strict";

/*
0 = none
1 = wine
2 = cocktail
3 = cider
4 = liquor (light)
5 = liquor (dark)
6 = beer
*/

var self = {
	'reconnectInterval': 1000*10,
	'noboozeInterval': 1000*60*10,
	'tags': {
		'C3B2B387': 2,
		'83A88586': 1,
		'B319B787': 6
	},
	'sock': null,
	'reconnectTimeout': null,
	'noboozeTimeout': null,
	'currentID': null,
	'connect': function(){
		self.disconnect();

		self.sock = new WebSocket('ws://localhost:1337/');
		self.sock.onmessage = function(event){
			self.onMessage(event.data);
		};

		self.sock.onclose = function(){
			self.retryConnect();
		};
	},
	'disconnect': function(){
		if ( self.reconnectTimeout ){
			clearTimeout(self.reconnectTimeout);
			self.reconnectTimeout = null;
		}

		if ( !self.sock )
			return;

		self.sock.onclose = undefined;
		self.sock.close();
		self.sock = null;
	},
	'retryConnect': function(){
		if ( self.reconnectTimeout )
			return;

		self.reconnectTimeout = setTimeout(function(){
			self.reconnectTimeout = null;
			self.connect();
		}, self.reconnectInterval);
	},
	'onMessage': function(id){
		self.currentID = id;

		var flair = self.tags[id];
		if ( flair == undefined )
			return;

		if ( self.noboozeTimeout != null )
			clearTimeout(self.noboozeTimeout);

		self.noboozeTimeout = setTimeout(function(){
			self.setFlair(0);
			self.noboozeTimeout = null;
		}, self.noboozeInterval);

		if ( flair != MY_FLAIR_ID )
			self.setFlair(flair);
	},
	'setFlair': function(id){
		MY_FLAIR_ID = id;
		setStorage('myFlairID', id);
		$('#flairMenu').removeClass().addClass('flair_' + id);
	},
	'enable': function(){
		self.setFlair(0);
		self.connect();
	},
	'disable': function(){
		self.disconnect();
	}
};

return self;

})();
