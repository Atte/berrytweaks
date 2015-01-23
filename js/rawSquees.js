BerryTweaks.modules['rawSquees'] = (function(){
"use strict";

var self = {
	'css': false,
	'window': null,
	'textarea': null,
	'button': null,
	'showWindow': function(){
		self.window = $('body').dialogWindow({
			'title': 'Raw Squee Management',
			'uid': 'rawsqueemanagement',
			'center' :true
		});

		self.textarea = $('<textarea>', {
			'value': HIGHLIGHT_LIST.join('\n'),
			'class': 'berrytweaks-rawsquees-textarea',
			'rows': 10,
			'css': {
				'width': '97%'
			}
		}).appendTo(self.window);

		self.button = $('<div>', {
			'class': 'button',
			'text': 'Save',
			'click': self.onSaveClick
		}).appendTo(self.window);
	},
	'onSaveClick': function(){
		HIGHLIGHT_LIST = self.textarea.val().split('\n').filter(function(str){
			return str.length > 0;
		});
		localStorage.setItem('highlightList', HIGHLIGHT_LIST.join(';'));

		if ( BerryTweaks.modules.sync )
			BerryTweaks.modules.sync.sync();
	}
};

BerryTweaks.patch(window, 'showCustomSqueesWindow', function(data, _to){
	if ( !self.enabled )
		return;

	self.showWindow();
	return false;
}, true);

return self;

})();