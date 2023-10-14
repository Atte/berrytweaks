BerryTweaks.modules['userMaps'] = (function(){
'use strict';

const self = {
    libs: [
        'greenlet',
        'geo'
    ],
    async addMap() {
        // find window
        const dialogContent = $('#userOps').parents('.dialogContent');
        const nick = $('h1', dialogContent).text();
        if ( !dialogContent || !nick )
            return;

        const coords = await BerryTweaks.lib.geo.getCoords(nick);
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
            src: `https://www.google.com/maps/embed/v1/place?key=${BerryTweaks.gapiKey}&zoom=5&q=${coords.lat},${coords.lng}`
        }).appendTo(dialogContent);

        BerryTweaks.fixWindowPosition(dialogContent);
    },
    disable() {
        $('.berrytweaks-usermap').remove();
    },
    bind: {
        patchAfter: {
            showUserActions() {
                setTimeout(() => {
                    self.addMap();
                }, 200 + 100); // dialog fade-in
            }
        }
    }
};

return self;

})();
