$(function(){
'use strict';

$.ajax({
    url: 'https://cdnjs.cloudflare.com/ajax/libs/raven.js/3.23.1/raven.min.js',
    dataType: 'script',
    cache: true,
    success: function() {
        const interval = setInterval(() => {
            if (!window.Raven) {
                return;
            }

            clearInterval(interval);
            window.BerryTweaks = {
                raven: Raven.noConflict(),
                release: 'RELEASE',
                releaseUrl: suffix => {
                    if (BerryTweaks.release) {
                        return `https://cdn.atte.fi/berrytweaks/${BerryTweaks.release}/${suffix}`;
                    }
                    return `https://atte.fi/berrytweaks/${suffix}`;
                }
            };

            if (BerryTweaks.release === 'RELEASE') {
                BerryTweaks.release = null;
            }

            BerryTweaks.raven.config('https://d709b359cd66469a8fdbd1b1e5d4d8c4@sentry.io/236977', {
                environment: BerryTweaks.release ? 'production' : 'development',
                whitelistUrls: [/atte\.fi\/berrytweaks\//],
                instrument: false,
                autoBreadcrumbs: {
                    xhr: true,
                    console: false,
                    dom: true,
                    location: false
                }
            }).install();

            if (BerryTweaks.release) {
                BerryTweaks.raven.setRelease(BerryTweaks.release);
            }

            if (window.NAME) {
                BerryTweaks.raven.setUserContext({
                    id: window.NAME
                });
            }

            $.ajax({
                url: BerryTweaks.releaseUrl('js/main.js'),
                dataType: 'script',
                cache: true
            });
        }, 100);
    }
});

});
