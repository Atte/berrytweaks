BerryTweaks.lib['user'] = (function(){
'use strict';

const self = {
    callbacks: {},
    cache: {},
    cacheData(cacheKey, apiName, callback, body) {
        if (cacheKey) {
            if ( self.cache[cacheKey] ){
                callback(self.cache[cacheKey]);
                return;
            }

            if ( self.callbacks[cacheKey] )
                self.callbacks[cacheKey].push(callback);
            else
                self.callbacks[cacheKey] = [callback];
        }

        if ( !cacheKey || self.callbacks[cacheKey].length === 1 ){
            let url;
            const headers = {};
            switch (apiName) {
                case 'nicks':
                    url = 'https://atte.fi/berrytweaks/api/nicks.py';
                    break;
                case 'map':
                    url = 'https://atte.fi/berrytweaks/api/map.php';
                    break;
                case 'geo':
                    headers[[
                        String.fromCharCode(88),
                        'Api',
                        'Key'
                    ].join('-')] = 'OHG90mF69n88PpkO8fQns94gmfBgKnpa78ojkSX6';
                    if (body.length === 1) {
                        url = 'https://aws.atte.fi/geo?lat=' + body[0].lat + '&lng=' + body[0].lng;
                        body = undefined;
                    } else {
                        url = 'https://aws.atte.fi/geo';
                    }
                    break;
                default:
                    console.warn('Unknown API:', apiName);
                    return;
            }

            BerryTweaks.ajax({
                type: body ? 'POST' : 'GET',
                contentType: body ? 'application/json' : false,
                dataType: 'json',
                data: body && JSON.stringify(body),
                url: url,
                headers: headers,
                success(data) {
                    if (cacheKey) {
                        self.cache[cacheKey] = data;
                        self.callbacks[cacheKey].forEach(waiter => {
                            waiter(self.cache[cacheKey]);
                        });
                        delete self.callbacks[cacheKey];
                    } else {
                        callback(data);
                    }
                }
            });
        }
    },
    getAliases(nick, callback) {
        self.cacheData('nicks', 'nicks', data => {
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
        self.cacheData('map', 'map', data => {
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
    getGeo(nicks, callback, finalCallback) {
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
                            coords.push({ lat: datas[key].lat, lng: datas[key].lng });
                    });
                    self.cacheData(null, 'geo', results => {
                        nicks.forEach((key, i) => {
                            if ( datas[key] )
                                callback(key, results[i]);
                        });
                        if ( finalCallback )
                            finalCallback();
                    }, coords);
                }
            });
        });
    }
};

return self;

})();
