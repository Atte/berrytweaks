BerryTweaks.modules['showLocaltimes'] = (function(){
"use strict";

var self = {
	'css': true,
	'clockUpdateInterval': null,
	'mapDataCache': null,
	'mapDataWaiting': [],
	'getMapData': function(callback){
		if ( self.mapDataCache ){
			callback(self.mapDataCache);
			return;
		}

		self.mapDataWaiting.push(callback);

		if ( self.mapDataWaiting.length == 1 ){
			$.getJSON('https://atte.fi/berrytweaks/api/map.php', function(data){
				self.mapDataCache = data;
				self.mapDataWaiting.forEach(function(waiter){
					waiter(self.mapDataCache);
				});
				self.mapDataWaiting = null;
			}, 'xml');
		}
	},
	'update': function(){
		var now = Date.now();
		$('#chatlist > ul > li').each(function(){
			var el = $(this);
			var offset = el.data('localtime_offset');
			if ( offset == null )
				return;

			var time = new Date(now + offset);
			var mins = time.getMinutes();
			$('.localtime', el).text(time.getHours() + ':' + (mins<10 ? '0'+mins : mins));
		});
	},
	'handleUser': function(nick){
		if ( !nick )
			return;

		var el = $('#chatlist > ul > li.' + nick);
		self.getMapData(function(mapdata){
			var userdata = mapdata && mapdata[nick.toLowerCase()];
			if ( !userdata )
				return;

			$.getJSON('http://api.geonames.org/timezoneJSON', {
				'username': 'Atte',
				'lat': userdata.lat,
				'lng': userdata.lng
			}, function(timedata){
				el.append(
					$('<div>', {
						'class': 'localtime'
					})
				);

				el.data('localtime_offset', (new Date(timedata.time)).getTime() - Date.now());
				
				self.update();
			});
		});
	},
	'enable': function(){
		$('#chatlist > ul > li').each(function(){
			self.handleUser($(this).data('nick'));
		});
		self.clockUpdateInterval = setInterval(self.update, 1000*60);
	},
	'disable': function(){
		if ( self.clockUpdateInterval ){
			clearInterval(self.clockUpdateInterval);
			self.clockUpdateInterval = null;
		}

		$('#chatlist > ul > li .localtime').remove();
	}
};

BerryTweaks.patch('addUser', function(data){
	if ( !self.enabled )
		return;

	self.handleUser(data && data.nick);
});

return self;

})();