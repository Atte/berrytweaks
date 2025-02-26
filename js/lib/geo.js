BerryTweaks.lib['geo'] = (function(){
'use strict';

const self = {
    workers: {
        getCoords: null,
        getCountry: null
    },
    loadTime: new Date().getTime(),
    getCoords(nick) {
        if (!self.workers.getCoords) {
            self.workers.getCoords = BerryTweaks.lib.greenlet(async (nick, time) => {
                if (time > self.refreshTime) {
                    self.refreshTime = time;
                    self.refreshPromise = new Promise(resolve => {
                        Promise.all([
                            fetch('https://atte.fi/berrytweaks/api/nicks.py').then(r => r.json()),
                            fetch('https://atte.fi/berrytweaks/api/map.php').then(r => r.json())
                        ]).then(([aliases, map]) => {
                            self.aliases = aliases;
                            self.map = map;
                            resolve();
                        });
                    });
                }
                if (self.refreshPromise) {
                    await self.refreshPromise;
                }

                let aliases = [nick];
                if (self.aliases.hasOwnProperty(nick)) {
                    aliases = [nick].concat(self.aliases[nick]);
                } else {
                    for (const key of Object.keys(self.aliases)) {
                        if (self.aliases[key].includes(nick)) {
                            aliases = [key].concat(self.aliases[key]);
                            break;
                        }
                    }
                }

                for (const alias of aliases) {
                    const data = self.map[alias.toLowerCase()];
                    if (data) {
                        return data;
                    }
                }

                return null;
            }, () => {
                self.refreshTime = 0;
            });
        }
        return self.workers.getCoords(nick, self.loadTime);
    },
    getCountry(coords) {
        if (!self.workers.getCountry) {
            self.workers.getCountry = BerryTweaks.lib.greenlet(async coords => {
                const alpha3 = whichCountry([coords.lng, coords.lat]);
                return alpha3 && iso31661.whereAlpha3(alpha3) || null;
            }, () => {
                importScripts(
                    'https://cdn.atte.fi/browserify/which-country-1.0.0.js',
                    'https://cdn.atte.fi/browserify/iso-3166-1-1.1.0.js'
                );
            });
        }
        return self.workers.getCountry(coords);
    }
};

return self;

})();
