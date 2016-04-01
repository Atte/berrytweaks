BerryTweaks.modules['showLocaltimes'] = (function(){
"use strict";

var self = {
	'css': true,
	'libs': ['user'],
	'clockUpdateInterval': null,
	'todo': [],
	'todoFlusher': null,
	'update': function(){
		var now = BerryTweaks.getServerTime();
		$('#chatlist > ul > li').each(function(){
			var el = $(this);
			var offset = el.data('berrytweaks-localtime_offset');
			if ( offset == null )
				return;

			var time = new Date(now + offset);
			var mins = time.getUTCMinutes();
			$('.berrytweaks-localtime', el).text(time.getUTCHours() + ':' + (mins<10 ? '0'+mins : mins));
		});
	},
	'flushTodo': function(){
		BerryTweaks.lib.user.getTimes(self.todo, function(nick, timedata){
			var el = $('#chatlist > ul > li.' + nick);
			var offset = timedata && timedata.gmtOffset;
			if ( offset == null )
				return;

			if ( !$('.berrytweaks-localtime', el).length ){
				$('<div>', {
					'class': 'berrytweaks-localtime'
				}).appendTo(el);
			}

			el.data('berrytweaks-localtime_offset', (+offset)*1000);
		}, function(){
			self.update();
		});
		self.todoFlusher = null;
	},
	'handleUser': function(nick){
		if ( !nick )
			return;

		self.todo.push(nick);
		if ( !self.todoFlusher ){
			self.todoFlusher = setTimeout(function(){
				self.flushTodo();
			}, 1000);
		}
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

		$('#chatlist > ul > li .berrytweaks-localtime').remove();
	}
};

BerryTweaks.patch(window, 'addUser', function(data){
	if ( !self.enabled )
		return;

	self.handleUser(data && data.nick);
});

return self;

})();
