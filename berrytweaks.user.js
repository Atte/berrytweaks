// ==UserScript==
// @name         BerryTweaks
// @namespace    https://atte.fi/berrytweaks/
// @version      0.5.6
// @description  A collection of BerryTube tweaks
// @author       Atte
// @icon         https://atte.fi/berrytweaks/favicon.ico
// @icon64       https://atte.fi/berrytweaks/favicon64.png
// @match        http://berrytube.tv/*
// @match        https://berrytube.tv/*
// @match        http://www.berrytube.tv/*
// @match        https://www.berrytube.tv/*
// @downloadURL  https://atte.fi/berrytweaks/berrytweaks.user.js
// @grant        none
// @require      https://cdnjs.cloudflare.com/ajax/libs/raven.js/3.26.2/raven.min.js#md5=9d93fd0b81d26d806fd3bbda88742eea,sha256=4b0353ddb76fd7318ad95d2600420c21d48484847e1db8581cb324991e94ec3f
// @noframes
// ==/UserScript==

(function(){
'use strict';

const script = document.createElement('script');
script.setAttribute('src', 'https://atte.fi/berrytweaks/min/js/init.js');
document.head.appendChild(script);

})();
