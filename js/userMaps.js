BerryTweaks.modules['userMaps'] = (function(){
'use strict';

const key = ['***REMOVED***', '***REMOVED***'].join('-');

const self = {
    libs: [
        'greenlet',
        'geo'
    ],
    addMap() {
        // find window
        const dialogContent = $('#userOps').parents('.dialogContent');
        const nick = $('h1', dialogContent).text();
        if ( !dialogContent || !nick )
            return;

        BerryTweaks.lib.geo.getCoords(nick, coords => {
            if ( !coords )
                return;

            // add map
            $('<iframe>', {
                class: 'berrytweaks-usermap',
                frameborder: 0,
                css: {
                    border: 'none',
                    width: 256,
                    height: 256
                },
                src: `https://www.google.com/maps/embed/v1/place?key=${key}&zoom=5&q=${coords.lat},${coords.lng}`
            }).appendTo(dialogContent);

            BerryTweaks.fixWindowPosition(dialogContent);
        });
    },
    disable() {
        $('.berrytweaks-usermap').remove();
    },
    bind: {
        patchAfter: {
            showUserActions() {
                BerryTweaks.setTimeout(() => {
                    self.addMap();
                }, 200 + 100); // dialog fade-in
            }
        }
    }
};

return self;

})();
