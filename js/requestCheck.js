BerryTweaks.modules['requestCheck'] = (function(){
"use strict";

var self = {
	'accepted': [],
	// callback({allowed:[], blocked:[]})
	'getRestrictions': function(id, callback){
		$.getJSON('https://www.googleapis.com/youtube/v3/videos', {
			'key': '***REMOVED***',
			'part': 'contentDetails',
			'id': id
		}, function(data){
			var res = data && data.items && data.items[0] && data.items[0].contentDetails && data.items[0].contentDetails.regionRestriction || {};
			callback({
				'allowed': res.allowed || null,
				'blocked': res.blocked || []
			});
		});
	},
	'formatCountries': function(lst){
		lst.sort();
		return lst.join(', ');
	},
	'handleRequest': function(msg){
		var m = msg.match(/\bhttps?:\/\/(?:www\.)?youtube\.com\/watch.*[?&]v=([^?&\s]+)/);
		if ( !m )
			m = msg.match(/\bhttps?:\/\/youtu\.be\/([^?\s]+)/);
		if ( !m )
			return;

		var id = m[1];
		if ( self.accepted.indexOf(id) !== -1 )
			return;

		var tis = this;
		var args = arguments;

		self.getRestrictions(id, function(res){
			if ( !res.allowed && res.blocked.length === 0 ){
				self.accepted.push(id);
				sendChatMsg.apply(tis, args);
				return;
			}

			var msg = 'The requested video is ';
			if ( res.allowed )
				msg += 'only viewable in: ' + self.formatCountries(res.allowed);
			else
				msg += 'not viewable in: ' + self.formatCountries(res.blocked);

			BerryTweaks.confirm(msg, function(ok){
				if ( !ok )
					return;

				self.accepted.push(id);
				sendChatMsg.apply(tis, args);
			});
		});
		return false;
	}
};

BerryTweaks.patch(window, 'sendChatMsg', function(msg){
	if ( !self.enabled )
		return;

	if ( /^\s*\/r/.test(msg) )
		return self.handleRequest.apply(this, arguments);
}, true);

return self;

})();
