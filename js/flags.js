BerryTweaks.modules['flags'] = (function(){
'use strict';

const self = {
    css: true,
    libs: ['user'],
    todo: [],
    flushTodo() {
        BerryTweaks.lib.user.getGeo(self.todo, (nick, data) => {
            const el = $('#chatlist > ul > li.' + nick);
            if ( data.country && data.country.alpha2 && !$('.berrytweaks-flag', el).length ){
                $('<div>', {
                    class: 'berrytweaks-flag',
                    css: {
                        'background-image': `url("https://cdn.atte.fi/famfamfam/flags/1/${data.country.alpha2.toLowerCase()}.png")`
                    }
                }).appendTo(el);
            }
        });
        self.todo = [];
    },
    handleUser(nick) {
        if ( !nick )
            return;

        self.todo.push(nick);
        if ( !self.todoFlusher ){
            self.todoFlusher = BerryTweaks.setTimeout(() => {
                self.todoFlusher = null;
                self.flushTodo();
            }, 1000);
        }
    },
    enable() {
        BerryTweaks.whenExists('#chatlist > ul > li', users => {
            users.each(function() {
                self.handleUser($(this).data('nick'));
            });
        });
    },
    disable() {
        $('#chatlist > ul > li .berrytweaks-flag').remove();
    },
    bind: {
        patchAfter: {
            addUser(data) {
                self.handleUser(data && data.nick);
            }
        }
    }
};

return self;

})();
