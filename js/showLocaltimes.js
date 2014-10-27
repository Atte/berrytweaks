BerryTweaks.modules['showLocaltimes'] = (function(){
"use strict";

var mapDataCache = null;
var mapDataWaiting = [];

var clockUpdateInterval = null;

var self = {
	'getMapData': function(callback){
		if ( mapDataCache ){
			callback(mapDataCache);
			return;
		}

		mapDataWaiting.push(callback);

		if ( mapDataWaiting.length == 1 ){
			$.getJSON('https://atte.fi/berrymap/json.php', function(data){
				mapDataCache = data;
				mapDataWaiting.forEach(function(waiter){
					waiter(mapDataCache);
				});
				mapDataWaiting = null;
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
		self.getMapData(function(data){
			data = data[nick.toLowerCase()];
			if ( !data )
				return;

			$.getJSON('http://api.geonames.org/timezoneJSON', {
				'username': 'Atte',
				'lat': data.lat,
				'lng': data.lng
			}, function(data){
				el.append(
					$('<div>', {
						'class': 'localtime',
						'css': {
							'position': 'absolute',
							'top': 0,
							'right': 0
						}
					})
				);
				
				el.css({
					'position': 'relative'
				});

				el.data('localtime_offset', (new Date(data.time)).getTime() - Date.now());
				
				self.update();
			});
		});
	},
	'enable': function(){
		$('#chatlist > ul > li').each(function(){
			self.handleUser($(this).data('nick'));
		});
		clockUpdateInterval = setInterval(self.update, 1000*60);
	},
	'disable': function(){
		if ( clockUpdateInterval ){
			clearInterval(clockUpdateInterval);
			clockUpdateInterval = null;
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