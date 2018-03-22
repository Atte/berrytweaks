// ==UserScript==
// @name         BerryTweaks
// @namespace    https://atte.fi/berrytweaks/
// @version      0.5.4
// @description  A collection of BerryTube tweaks
// @author       Atte
// @icon         https://dl.atte.fi/bt_favicon.ico
// @match        http://berrytube.tv/*
// @match        http://www.berrytube.tv/*
// @match        http://btc.berrytube.tv:8000/*
// @downloadURL  https://atte.fi/berrytweaks/berrytweaks.user.js
// @grant        none
// @require      https://cdnjs.cloudflare.com/ajax/libs/raven.js/3.23.3/raven.min.js#md5=faa0565b124106ce0b4577dbff19ddb0,sha256=7ce91eeae533c4e84634e99babb27d83820ec40084db3a7924be0c6a49db844f
// @noframes
// ==/UserScript==

(function(){
'use strict';

const script = document.createElement('script');
script.setAttribute('src', 'https://atte.fi/berrytweaks/min/js/init.js');
document.head.appendChild(script);

})();
