BerryTweaks.lib['user'] = (function(){
"use strict";

var self = {
    'callbacks': {},
    'cache': {},
    'cacheData': function(type, callback){
        if ( self.cache[type] ){
            callback(self.cache[type]);
            return;
        }

        if ( self.callbacks[type] )
            self.callbacks[type].push(callback);
        else
            self.callbacks[type] = [callback];

        if ( self.callbacks[type].length == 1 ){
            // yay ugly hacks
            var fname, data;
            if ( type == 'nicks' )
                fname = 'nicks.py';
            else if ( type == 'map' )
                fname = 'map.php';
            else {
                fname = 'time.py';
                data = type;
            }

            $.ajax({
                type: data ? 'POST' : 'GET',
                contentType: data ? 'text/plain' : undefined,
                dataType: 'json',
                url: 'https://atte.fi/berrytweaks/api/' + fname,
                data: data,
                success: function(data){
                    self.cache[type] = data;
                    self.callbacks[type].forEach(function(waiter){
                        waiter(self.cache[type]);
                    });
                    delete self.callbacks[type];
                    if ( fname == 'time.py' )
                        delete self.cache[type];
                }
            });
        }
    },
    'getAliases': function(nick, callback){
        self.cacheData('nicks', function(data){
            if ( data.hasOwnProperty(nick) ){
                callback([nick].concat(data[nick]));
                return;
            }

            for ( var key in data ){
                if ( !data.hasOwnProperty(key) )
                    continue;

                if ( data[key].indexOf(nick) != -1 ){
                    callback([key].concat(data[key]));
                    return;
                }
            }

            callback([nick]);
        });
    },
    'getMap': function(nick, callback){
        self.cacheData('map', function(data){
            self.getAliases(nick, function(keys){
                for ( var i=0; i<keys.length; ++i ){
                    var mapdata = data[keys[i].toLowerCase()];
                    if ( mapdata ){
                        callback(mapdata);
                        return;
                    }
                }
                callback(null);
            });
        });
    },
    'getTimes': function(nicks, callback, finalCallback){
        var datas = {};
        var left = nicks.length;
        nicks.forEach(function(nick){
            self.getMap(nick, function(mapdata){
                if ( mapdata )
                    datas[nick] = mapdata;
                if ( --left == 0 ){
                    nicks = Object.keys(datas);
                    var coords = [];
                    nicks.forEach(function(key){
                        if ( datas[key] )
                            coords.push(datas[key].lat + ' ' + datas[key].lng);
                    });
                    self.cacheData(coords.join('\n'), function(timedata){
                        nicks.forEach(function(key, i){
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
