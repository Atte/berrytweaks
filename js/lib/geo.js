BerryTweaks.lib['geo'] = (function(){
'use strict';

const makeCaching = function(loader){
    let cache = undefined;
    let waiters = null;
    return function(callback){
        if (cache !== undefined) {
            callback(cache);
            return;
        }

        if (waiters == null) {
            waiters = [callback];
        } else {
            waiters.push(callback);
            return;
        }

        loader(data => {
            cache = data;
            for (const waiter of waiters) {
                waiter(cache);
            }
            waiters = null;
        });
    };
};

const self = {
    geoWorker: null,
    loadNicks: makeCaching(callback => {
        BerryTweaks.ajax({
            url: 'https://atte.fi/berrytweaks/api/nicks.py',
            dataType: 'json',
            success: callback
        });
    }),
    loadMap: makeCaching(callback => {
        BerryTweaks.ajax({
            url: 'https://s3.amazonaws.com/btmap/latest.json',
            dataType: 'json',
            success: callback
        });
    }),
    getAliases(nick, callback) {
        self.loadNicks(nicks => {
            if (nicks.hasOwnProperty(nick)) {
                callback([nick].concat(nicks[nick]));
                return;
            }

            for (const key of Object.keys(nicks)) {
                if (nicks[key].includes(nick)) {
                    callback([key].concat(nicks[key]));
                    return;
                }
            }

            callback([nick]);
        });
    },
    getCoords(nick, callback) {
        self.loadMap(map => {
            self.getAliases(nick, nicks => {
                for (const nick of nicks) {
                    const data = map[nick.toLowerCase()];
                    if (data) {
                        callback(data);
                        return;
                    }
                }
                callback(null);
            });
        });
    },
    getCountry(coords, callback) {
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
        return self.geoWorker(coords).then(callback || (x=>x));
    }
};

return self;

})();
