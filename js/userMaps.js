BerryTweaks.modules['userMaps'] = (function(){
'use strict';

const self = {
    libs: ['user'],
    addMap() {
        // find window
        const dialogContent = $('#userOps').parents('.dialogContent');
        const dialogWindow = dialogContent.parents('.dialogWindow');
        const nick = $('h1', dialogContent).text();
        if ( !dialogContent || !dialogWindow || !nick )
            return;

        BerryTweaks.lib.user.getMap(nick, mapdata => {
            if ( !mapdata )
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
                src: `https://www.google.com/maps/embed/v1/place?key=***REMOVED***&zoom=5&q=${mapdata.lat},${mapdata.lng}`
            }).appendTo(dialogContent);

            // fix dialog position if it went outside the window
            const diaMargin = 8;
            const offset = dialogWindow.offset();
            const diaSize = {
                height: dialogWindow.height() + diaMargin,
                width: dialogWindow.width() + diaMargin
            };

            const win = $(window);
            const scroll = {
                top: win.scrollTop(),
                left: win.scrollLeft()
            };
            const winSize = {
                height: win.height(),
                width: win.width()
            };

            if ( offset.top + diaSize.height > scroll.top + winSize.height )
                offset.top = scroll.top + winSize.height - diaSize.height;

            if ( offset.left + diaSize.width > scroll.left + winSize.width )
                offset.left = scroll.left + winSize.width - diaSize.width;

            dialogWindow.offset(offset);
        });
    },
    disable() {
        $('.berrytweaks-usermap').remove();
    }
};

BerryTweaks.patch(window, 'showUserActions', () => {
    if ( !self.enabled )
        return;

    setTimeout(() => {
        self.addMap();
    }, 200 + 100); // dialog fade-in
});


return self;

})();
