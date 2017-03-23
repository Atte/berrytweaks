BerryTweaks.modules['flags'] = (function(){
"use strict";

var self = {
    'css': true,
    'libs': ['user'],
    'urlPrefix': 'https://dl.atte.fi/flags/',
    'todo': [],
    'flushTodo': function(){
        BerryTweaks.lib.user.getTimes(self.todo, function(nick, timedata){
            var el = $('#chatlist > ul > li.' + nick);
            if ( timedata.countryCode && !$('.berrytweaks-flag', el).length ){
                $('<div>', {
                    'class': 'berrytweaks-flag',
                    'css': {
                        'background-image': 'url("' + self.urlPrefix + timedata.countryCode + '.png")'
                    }
                }).appendTo(el);
            }
        });
        self.todo = [];
    },
    'handleUser': function(nick){
        if ( !nick )
            return;

        self.todo.push(nick);
        if ( !self.todoFlusher ){
            self.todoFlusher = setTimeout(function(){
                self.todoFlusher = null;
                self.flushTodo();
            }, 1000);
        }
    },
    'enable': function(){
        $('#chatlist > ul > li').each(function(){
            self.handleUser($(this).data('nick'));
        });
    },
    'disable': function(){
        $('#chatlist > ul > li .berrytweaks-flag').remove();
    }
};

BerryTweaks.patch(window, 'addUser', function(data){
    if ( !self.enabled )
        return;

    self.handleUser(data && data.nick);
});

return self;

})();
