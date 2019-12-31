BerryTweaks.modules['showLocaltimes'] = (function(){
'use strict';

const self = {
    css: true,
    libs: [
        'greenlet',
        'geo'
    ],
    coordsToOffsetWorker: null,
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
    async handleUser(nick) {
        if ( !nick )
            return;

        const coords = await BerryTweaks.lib.geo.getCoords(nick);
        const offset = coords && await self.coordsToOffsetWorker(coords);
        if (!offset) {
            return;
        }

        const el = $('#chatlist > ul > li.' + nick);
        if ( !$('.berrytweaks-localtime', el).length ){
            $('<div>', {
                class: 'berrytweaks-localtime'
            }).appendTo(el);
        }

        el.data('berrytweaks-localtime_offset', offset);
        self.updateSingle(el);
    },
    enable() {
        if (!self.coordsToOffsetWorker) {
            self.coordsToOffsetWorker = BerryTweaks.lib.greenlet(async coords => {
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

                return -zone.utcOffset(moment().valueOf()) * 60 * 1000;
            }, () => {
                importScripts(
                    'https://cdn.atte.fi/tz-lookup/6.1.25/tz.js',
                    'https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.24.0/moment.min.js',
                    'https://cdnjs.cloudflare.com/ajax/libs/moment-timezone/0.5.27/moment-timezone-with-data-2012-2022.min.js'
                );
            });
        }

        BerryTweaks.whenExists('#chatlist > ul > li', users => {
            users.each(function() {
                self.handleUser($(this).data('nick'));
            });
        });
        self.clockUpdateInterval = setInterval(self.update, 1000*60);
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
