$(function(){
'use strict';

window.BerryTweaks = {
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
