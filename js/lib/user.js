BerryTweaks.lib['user'] = (function(){
'use strict';

const self = {
    callbacks: {},
    cache: {},
    cacheData(apiName, callback, body) {
        const cacheKey = apiName + JSON.stringify(body || null);
        if ( self.cache[cacheKey] ){
            callback(self.cache[cacheKey]);
            return;
        }

        if ( self.callbacks[cacheKey] ){
            self.callbacks[cacheKey].push(callback);
            return;
        }
        else
            self.callbacks[cacheKey] = [callback];

        let url;
        let headers = {};
        headers[[String.fromCharCode(88), 'Api', 'Key'].join('-')] = 'OHG90mF69n88PpkO8fQns94gmfBgKnpa78ojkSX6';
        switch (apiName) {
            case 'nicks':
                url = 'https://atte.fi/berrytweaks/api/nicks.py';
                headers = {};
                break;
            case 'map':
                url = 'https://aws.atte.fi/btmap';
                break;
            case 'geo':
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
                self.callbacks[cacheKey].forEach(waiter => {
                    waiter(data);
                });
                delete self.callbacks[cacheKey];
                if (!body)
                    self.cache[cacheKey] = data;
            }
        });
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
                            coords.push(datas[key]);
                    });
                    self.cacheData('geo', results => {
                        if (!Array.isArray(results))
                            results = [results];
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
