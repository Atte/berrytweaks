// ==UserScript==
// @name         BerryTweaks
// @namespace    https://atte.fi/berrytweaks/
// @version      0.6.0
// @description  A collection of BerryTube tweaks
// @author       Atte
// @icon         https://atte.fi/berrytweaks/favicon.ico
// @icon64       https://atte.fi/berrytweaks/favicon64.png
// @match        https://berrytube.tv/*
// @downloadURL  https://atte.fi/berrytweaks/berrytweaks.user.js
// @grant        none
// @noframes
// ==/UserScript==

(function(){
'use strict';

const script = document.createElement('script');
script.setAttribute('src', 'https://berrytweaks.app.atte.fi/min/js/init.js');
document.head.appendChild(script);

})();
