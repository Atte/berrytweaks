BerryTweaks.modules['flags'] = (function(){
'use strict';

const self = {
    css: true,
    libs: [
        'greenlet',
        'geo'
    ],
    async handleUser(nick) {
        if (!nick) {
            return;
        }

        const el = $(`#chatlist li[nick="${nick}"]`);
        if ($('.berrytweaks-flag', el).length) {
            return;
        }

        const coords = await BerryTweaks.lib.geo.getCoords(nick);
        if (!coords) {
            return;
        }

        const country = await BerryTweaks.lib.geo.getCountry(coords);
        if (!country) {
            return;
        }

        if (!$('.berrytweaks-flag', el).length){
            $('<div>', {
                class: 'berrytweaks-flag',
                css: {
                    'background-image': `url("https://cdn.atte.fi/famfamfam/flags/1/${country.alpha2.toLowerCase()}.png")`
                }
            }).appendTo(el);
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
