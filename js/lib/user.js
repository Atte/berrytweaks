BerryTweaks.lib['user'] = (function(){
'use strict';

const self = {
    callbacks: {},
    cache: {},
    cacheData(type, callback) {
        if ( self.cache[type] ){
            callback(self.cache[type]);
            return;
        }

        if ( self.callbacks[type] )
            self.callbacks[type].push(callback);
        else
            self.callbacks[type] = [callback];

        if ( self.callbacks[type].length === 1 ){
            // yay ugly hacks
            let url, data;
            let dontCache = false;
            if ( type === 'nicks' ) {
                url = 'https://atte.fi/berrytweaks/api/nicks.py';
            }
            else if ( type === 'map' ) {
                url = 'https://atte.fi/berrytweaks/api/map.php';
            }
            else {
                url = 'https://aws.atte.fi/berrytweaks/findTimezone.js';
                if ( !type ){
                    self.callbacks[type][0]();
                    delete self.callbacks[type];
                    return;
                }

                if ( type.indexOf('\n') === -1 ) {
                    url += '?coords=' + type;
                } else {
                    data = type;
                    dontCache = true;
                }
            }

            BerryTweaks.ajax({
                type: data ? 'POST' : 'GET',
                contentType: data ? 'text/plain' : undefined,
                dataType: 'json',
                data: data,
                url: url,
                success(data) {
                    self.cache[type] = data;
                    self.callbacks[type].forEach(waiter => {
                        waiter(self.cache[type]);
                    });
                    delete self.callbacks[type];
                    if ( dontCache )
                        delete self.cache[type];
                }
            });
        }
    },
    getAliases(nick, callback) {
        self.cacheData('nicks', data => {
            if ( data.hasOwnProperty(nick) ){
                callback([nick].concat(data[nick]));
                return;
            }

            for ( const key in data ){
                if ( !data.hasOwnProperty(key) )
                    continue;

                if ( data[key].indexOf(nick) !== -1 ){
                    callback([key].concat(data[key]));
                    return;
                }
            }

            callback([nick]);
        });
    },
    getMap(nick, callback) {
        self.cacheData('map', data => {
            self.getAliases(nick, keys => {
                for ( let i=0; i<keys.length; ++i ){
                    const mapdata = data[keys[i].toLowerCase()];
                    if ( mapdata ){
                        callback(mapdata);
                        return;
                    }
                }
                callback(null);
            });
        });
    },
    getTimes(nicks, callback, finalCallback) {
        const datas = {};
        let left = nicks.length;
        nicks.forEach(nick => {
            self.getMap(nick, mapdata => {
                if ( mapdata )
                    datas[nick] = mapdata;
                if ( --left === 0 ){
                    nicks = Object.keys(datas);
                    const coords = [];
                    nicks.forEach(key => {
                        if ( datas[key] )
                            coords.push(datas[key].lat + ' ' + datas[key].lng);
                    });
                    self.cacheData(coords.join('\n'), timedata => {
                        nicks.forEach((key, i) => {
                            if ( datas[key] )
                                callback(key, timedata.results[i]);
                        });
                        if ( finalCallback )
                            finalCallback();
                    });
                }
            });
        });
    }
};

return self;

})();
