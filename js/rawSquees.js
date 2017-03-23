BerryTweaks.modules['rawSquees'] = (function(){
"use strict";

var self = {
    'window': null,
    'textarea': null,
    'button': null,
    'error': null,
    /** @suppress {uselessCode} */
    'getRegexError': function(re){
        try{
            new RegExp(re);
        }
        catch(e){
            return e;
        }
    },
    'showWindow': function(){
        self.window = $('body').dialogWindow({
            'title': 'Raw Squee Management',
            'uid': 'rawsqueemanagement',
            'center': true
        }).append(
            $('<span>', {
                'text': 'Enter regular expressions to squee on. One per line.'
            })
        );

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

        self.error = $('<pre>', {

        }).appendTo(self.window);
    },
    'onSaveClick': function(){
        var lines = self.textarea.val().split('\n');

        var errors = [];
        lines.forEach(function(line, i){
            if ( line.length <= 0 )
                return;

            var err = self.getRegexError(line);
            if ( err )
                errors.push('line ' + (i+1) + ': ' + err);

            if ( line.indexOf(';') != -1 )
                errors.push('semicolons are not allowed in squees');
        });

        self.error.text('');
        if ( errors.length > 0 ){
            self.error.text('NOT SAVED, FIX ERRORS:\n' + errors.join('\n'));
            return;
        }

        HIGHLIGHT_LIST = lines;
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
