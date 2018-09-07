BerryTweaks.modules['showLocaltimes'] = (function(){
'use strict';

const self = {
    css: true,
    libs: [
        'https://cdn.atte.fi/tz-lookup/6.1.9/tz.js',
        'https://cdnjs.cloudflare.com/ajax/libs/moment-timezone/0.5.21/moment-timezone-with-data-2012-2022.min.js',
        'geo'
    ],
    clockUpdateInterval: null,
    updateSingle(el, now) {
        const offset = el.data('berrytweaks-localtime_offset');
        if ( offset == null )
            return;

        if (!now) {
            now = BerryTweaks.getServerTime();
        }

        const time = new Date(now + offset);
        const mins = time.getUTCMinutes();
        $('.berrytweaks-localtime', el).text(time.getUTCHours() + ':' + (mins<10 ? '0'+mins : mins));
    },
    update() {
        const now = BerryTweaks.getServerTime();
        $('#chatlist > ul > li').each(function() {
            self.updateSingle($(this), now);
        });
    },
    handleUser(nick) {
        if ( !nick )
            return;

        BerryTweaks.lib.geo.getCoords(nick, coords => {
            if (!coords) {
                return;
            }

            let zoneName = null;
            try {
                zoneName = tzlookup(coords.lat, coords.lng);
            } catch(ex) {}
            if (!zoneName) {
                return;
            }

            const zone = moment.tz.zone(zoneName);
            if (!zone) {
                return;
            }

            const el = $('#chatlist > ul > li.' + nick);
            if ( !$('.berrytweaks-localtime', el).length ){
                $('<div>', {
                    class: 'berrytweaks-localtime'
                }).appendTo(el);
            }

            const offset = -zone.utcOffset(moment().valueOf());
            el.data('berrytweaks-localtime_offset', offset * 60 * 1000);
            self.updateSingle(el);
        });
    },
    enable() {
        BerryTweaks.whenExists('#chatlist > ul > li', users => {
            users.each(function() {
                self.handleUser($(this).data('nick'));
            });
        });
        self.clockUpdateInterval = BerryTweaks.setInterval(self.update, 1000*60);
    },
    disable() {
        if ( self.clockUpdateInterval ){
            clearInterval(self.clockUpdateInterval);
            self.clockUpdateInterval = null;
        }

        $('#chatlist > ul > li .berrytweaks-localtime').remove();
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
