BerryTweaks.modules['linkOpener'] = (function(){
"use strict";

var self = {
	'css': false,
	'win': null,
	'handleMessage': function(msg){
		if ( !self.win || self.win.closed || msg.emote )
			return;

		var m = msg.msg.match(/\bhttps?:\/\/[^\s]+/i);
		if ( m )
			self.win.location.href = m[0];
	},
	'addSettings': function(container){
		$('<a>', {
			'href': 'javascript:void(0)',
			'click': function(){
				self.win = window.open('about:blank', 'linkOpener', 'menubar=no,toolbar=no,personalbar=no,location=yes');
			},
			'text': 'Open link opener window'
		}).appendTo(container);
	}
};

BerryTweaks.patch(window, 'addChatMsg', function(data, _to){
	if ( !self.enabled )
		return;

	self.handleMessage(data.msg);
});

return self;

})();
