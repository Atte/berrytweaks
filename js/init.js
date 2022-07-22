$(function(){
'use strict';

window.BerryTweaks = {
    gapiKey: 'GAPI_KEY',
    releaseBase: 'RELEASE_BASE',
    releaseUrl: suffix => {
        return `${BerryTweaks.releaseBase}/${suffix}`;
    }
};

if (BerryTweaks.gapiKey === 'GAPI_KEY') {
    BerryTweaks.gapiKey = null;
}
if (BerryTweaks.releaseBase === 'RELEASE_BASE') {
    throw new Error('no release base');
}

function loadMain() {
    $.ajax({
        url: BerryTweaks.releaseUrl('js/main.js'),
        dataType: 'script',
        cache: true
    });
}

if (BerryTweaks.gapiKey) {
    loadMain();
} else {
    $.getJSON(BerryTweaks.releaseUrl('gapi.json'), gapi => {
        BerryTweaks.gapiKey = gapi.key;
        loadMain();
    });
}

});
