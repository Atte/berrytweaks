BerryTweaks.lib['geo'] = (function(){
'use strict';

const makeCaching = function(loader) {
    let cache = undefined;
    let waiters = null;
    return () => new Promise(resolve => {
        if (cache !== undefined) {
            resolve(cache);
            return;
        }

        if (waiters == null) {
            waiters = [resolve];
        } else {
            waiters.push(resolve);
            return;
        }

        loader().then(data => {
            cache = data;
            for (const waiter of waiters) {
                waiter(cache);
            }
            waiters = null;
        });
    });
};

const self = {
    geoWorker: null,
    loadNicks: makeCaching(() => $.ajax({
        url: 'https://atte.fi/berrytweaks/api/nicks.py',
        dataType: 'json',
        cache: true
    }).promise()),
    loadMap: makeCaching(() => $.ajax({
        url: 'https://s3.amazonaws.com/btmap/latest.json',
        dataType: 'json',
        cache: true
    }).promise()),
    async getAliases(nick) {
        const nicks = await self.loadNicks();
        if (nicks.hasOwnProperty(nick)) {
            return [nick].concat(nicks[nick]);
        }

        for (const key of Object.keys(nicks)) {
            if (nicks[key].includes(nick)) {
                return [key].concat(nicks[key]);
            }
        }

        return [nick];
    },
    async getCoords(nick) {
        const [map, aliases] = await Promise.all([
            self.loadMap(),
            self.getAliases(nick)
        ]);

        for (const alias of aliases) {
            const data = map[alias.toLowerCase()];
            if (data) {
                return data;
            }
        }
        return null;
    },
    getCountry(coords) {
        if (!self.geoWorker) {
            self.geoWorker = BerryTweaks.lib.greenlet(async coords => {
                const alpha3 = whichCountry([coords.lng, coords.lat]);
                return alpha3 && iso31661.whereAlpha3(alpha3) || null;
            }, () => {
                importScripts(
                    'https://cdn.atte.fi/browserify/which-country-1.0.0.js',
                    'https://cdn.atte.fi/browserify/iso-3166-1-1.1.0.js'
                );
            });
        }

        return self.geoWorker(coords);
    }
};

return self;

})();
