BerryTweaks.modules['convertUnits'] = (function(){
"use strict";

var self = {
    'libs': [
        'https://dl.atte.fi/lib/quantities.min.js',
        'https://dl.atte.fi/lib/compromise.min.js'
    ],
    'symbols': {
        '€': 'EUR',
        '£': 'GBP',
        '$': 'USD'
    },
    'preferred': null,
    'currencyRegex': null,
    'prefixRegex': /^[kdcm]/,
    'rates': null,
    'loadRates': function(){
        self.rates = null;
        $.getJSON('https://api.fixer.io/latest', {
            'base': self.preferred.currency || undefined
        }, function(data){
            data.rates[data.base] = 1;
            self.rates = data.rates;
            self.currencyRegex = new RegExp(
                '(?:\b|\d)(?:' +
                Object.keys(self.rates).concat(
                    '[' + Object.keys(self.symbols).join('') + ']'
                ).join('|') +
                ')(?:\b|\d)'
            , 'i');
        });
    },
    'convertAll': function(str){
        if ( !str || str[0] === '<' )
            return str;

        let matched = false;
        const phrase = nlp(str);
        const terms = phrase.terms().list;

        // convert measurements
        phrase.values().list.forEach(function(value){
            let qty = Qty.parse(terms[value.index()].data().normal);
            let twoParter = false;
            if ( !qty || !qty.units() ){
                let unit = terms[value.index() + 1];
                unit = unit && unit.data();
                if ( !unit )
                    return;

                try{
                    qty = new Qty(value.number(), unit.normal);
                    twoParter = true;
                }
                catch(e){
                    return;
                }
            }

            let unit = qty.units();
            if ( unit === 'USD' || unit === 'cents' )
                return;
            unit = unit.replace(self.prefixRegex, '');

            let preferred = self.preferred[qty.kind()];
            preferred = preferred && Qty.parse(preferred);
            if ( !preferred || preferred.units() === unit )
                return;

            phrase.insertAt(
                value.index() + (twoParter ? 2 : 1),
                '(' + qty.to(preferred).toPrec(0.01).format() + ')'
            );
            matched = true;
        });

        // convert currencies
        if ( self.currencyRegex ){
            terms.forEach(function(term){
                let text = term.data().normal;
                let unit = self.currencyRegex.exec(text);
                unit = unit && unit[0];
                if ( !unit )
                    return;

                text = text.replace(unit, '');
                unit = (self.symbols[unit] || unit).toUpperCase();
                if ( unit === self.preferred.currency || !self.rates[unit] )
                    return;

                let trailingNumber = false;
                let qty = Qty.parse(text);
                if ( !qty ){
                    const qtyTerm = terms[term.index() - 1];
                    qty = qtyTerm && Qty.parse(qtyTerm.data().normal);
                }
                if ( !qty ){
                    const qtyTerm = terms[term.index() + 1];
                    qty = qtyTerm && Qty.parse(qtyTerm.data().normal);
                    trailingNumber = true;
                }
                if ( !qty )
                    return;

                phrase.insertAt(
                    term.index() + (trailingNumber ? 2 : 1),
                    '(' + qty.div(self.rates[unit]).toPrec(0.01).format() + ' ' + self.preferred.currency + ')'
                )
                matched = true;
            });
        }

        return matched ? phrase.out() : str;
    },
    'enable': function(){
        self.preferred = BerryTweaks.getSetting('preferredUnits', {});
        self.loadRates();
    },
    'showUnitsDialog': function(){
        const win = $('body').dialogWindow({
            'title': 'Preferred Units',
            'uid': 'preferredunits',
            'center': true
        });
        $('<table>').append(
            Qty.getKinds().sort().map(function(kind){
                return $('<tr>').append(
                    $('<td>', {
                        'text': kind.replace('_', ' ')
                    })
                ).append(
                    $('<td>').append(
                        $('<select>', {
                            'on': {
                                'change': function(){
                                    self.preferred[kind] = $(this).val();
                                    BerryTweaks.setSetting('preferredUnits', self.preferred);
                                    if ( kind === 'currency' )
                                        self.loadRates();
                                }
                            }
                        }).append(
                            $('<option>', {
                                'value': '',
                                'text': '<ignore>',
                                'selected': !self.preferred[kind]
                            })
                        ).append(
                            (
                                kind === 'currency' ?
                                Object.keys(self.rates || {}).sort() :
                                Qty.getUnits(kind).filter(unit => !unit.startsWith('temp-'))
                            ).map(function(unit){
                                return $('<option>', {
                                    'value': unit,
                                    'text': unit,
                                    'selected': self.preferred[kind] === unit
                                });
                            })
                        )
                    )
                )
            }).filter(row => row.find('select').children('option').length > 2)
        ).appendTo(win);
        BerryTweaks.fixWindowHeight(win);
    },
    'addSettings': function(container){
        $('<a>', {
            'href': 'javascript:void(0)',
            'click': self.showUnitsDialog,
            'text': 'Set preferred units'
        }).appendTo(container);
    }
};

BerryTweaks.patch(window, 'addChatMsg', function(data){
    if ( !self.enabled || !self.preferred )
        return;

    data.msg.msg = self.convertAll(data.msg.msg);
}, true);

return self;

})();
