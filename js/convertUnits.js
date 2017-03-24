BerryTweaks.modules['convertUnits'] = (function(){
"use strict";

var self = {
    'libs': [
        'https://dl.atte.fi/lib/quantities.min.js',
        'https://dl.atte.fi/lib/compromise.min.js'
    ],
    'preferred': {},
    'rates': null,
    'loadRates': function(){
        $.getJSON('https://api.fixer.io/latest?base=USD', function(data){
            self.rates = data.rates;
        });
    },
    'convertAll': function(str){
        if ( !str || str[0] === '<' )
            return str;

        let matched = false;
        let phrase = nlp(str);
        let terms = phrase.terms();
        phrase.values().list.forEach(function(value){
            let qty = Qty.parse(value.data()[0].normal);
            let unit = null;
            if ( !qty || !qty.units() ){
                unit = terms.get(value.index() + 1).data()[0];
                if ( !unit )
                    return;

                try{
                    qty = new Qty(value.number(), unit.normal);
                }
                catch(e){
                    return;
                }
            }

            let preferred = self.preferred[qty.kind()];
            if ( !preferred || preferred === qty.units() )
                return;

            phrase.insertAt(
                value.index() + (unit ? 2 : 1),
                '(' + qty.to(preferred).format() + ')'
            );
            matched = true;
        });

        return matched ? phrase.out() : str;
    },
    'enable': function(){
        self.preferred = BerryTweaks.getSetting('preferredUnits', {});
    },
    'showUnitsDialog': function(){
        let win = $('body').dialogWindow({
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
                                }
                            }
                        }).append(
                            $('<option>', {
                                'value': '',
                                'text': '<ignore>',
                                'selected': !self.preferred[kind]
                            })
                        ).append(
                            Qty.getUnits(kind).map(function(unit){
                                return $('<option>', {
                                    'value': unit,
                                    'text': unit,
                                    'selected': self.preferred[kind] === unit
                                });
                            })
                        )
                    )
                )
            }).filter(function(row){
                return row.find('select').children('option').length > 2;
            })
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
    if ( !self.enabled )
        return;

    data.msg.msg = self.convertAll(data.msg.msg);
}, true);

return self;

})();
