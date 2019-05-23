$(function(){
'use strict';

window.BerryTweaks = {
    raven: window.Raven && window.Raven.noConflict(),
    gapi: 'GAPI',
    release: 'RELEASE',
    releaseUrl: suffix => {
        if (BerryTweaks.release) {
            return `https://cdn.atte.fi/berrytweaks/${BerryTweaks.release}/${suffix}`;
        }
        return `https://atte.fi/berrytweaks/${suffix}`;
    }
};

if (BerryTweaks.release === 'RELEASE') {
    BerryTweaks.gapi = null;
    BerryTweaks.release = null;
}

if (BerryTweaks.raven) {
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
} else {
    BerryTweaks.raven = {
        wrap(fn) {
            return fn;
        },
        context(fn) {
            return fn();
        },
        setUserContext() {},
        setExtraContext() {}
    };
}

function loadMain() {
    $.ajax({
        url: BerryTweaks.releaseUrl('js/main.js'),
        dataType: 'script',
        cache: true
    });
}

if (BerryTweaks.gapi) {
    loadMain();
} else {
    $.getJSON(BerryTweaks.releaseUrl('gapi.json'), gapi => {
        BerryTweaks.gapi = gapi;
        loadMain();
    });
}

});
