BerryTweaks.modules['convertUnits'] = (function(){
"use strict";

var self = {
	'units': [
		{
			'names': ['F', 'fahrenheit', 'fahrenheits', 'degrees F', 'degrees fahrenheit'],
			'label': "\u2103",
			'fn': function(num){
				return ((num - 32) / 1.8).toFixed(2);
			}
		},
		{
			'names': ['in', "''", 'inch', 'inches'],
			'label': 'cm',
			'mul': 2.54
		},
		{
			'names': ['ft', 'foot', 'feet'],
			'label': 'm',
			'mul': 0.3048
		},
		{
			'names': ['yd', 'yard', 'yards'],
			'label': 'm',
			'mul': 0.9144
		},
		{
			'names': ['mi', 'mile', 'miles'],
			'label': 'km',
			'mul': 1.609
		},
		{
			'names': ['acre', 'acres'],
			'label': "m\u00B2",
			'mul': 4047
		},
		{
			'names': ['pt', 'pint', 'pints'],
			'label': 'l',
			'mul': 0.4732
		},
		{
			'names': ['gal', 'gallon', 'gallons'],
			'label': 'l',
			'mul': 3.785
		},
		{
			'names': ['oz', 'ounce', 'ounces'],
			'label': 'g',
			'fn': function(num){
				return (num*0.2957).toFixed(2) + ' dl / ' + (num*28.35).toFixed(2);
			}
		},
		{
			'names': ['lb', 'pound', 'pounds'],
			'label': 'kg',
			'mul': 0.4536
		},
		{
			'names': ['stone', 'stones'],
			'label': 'kg',
			'mul': 6.35
		}
	],
	'numbers': ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve'],
	'numbersRegex': null,
	'preprocessUnits': function(){
		self.numbersRegex = new RegExp('\\b(?:' + self.numbers.join('|') + ')\\b', 'gi');

		self.units.forEach(function(unit){
			if ( unit.names )
				unit.regex = new RegExp('(?:^|\\s)(-?(?:[\\d,]*\\.)?\\d+|an?|' + self.numbersRegex.source + ')\\s*(?:' + unit.names.join('|') + ')\\b', 'gi');

			if ( unit.mul ){
				unit.fn = function(num){
					return (parseFloat(num) * unit.mul).toFixed(2);
				};
			}
		});
	},
	'convertAll': function(str){
		self.units.forEach(function(unit){
			str = str.replace(unit.regex, function(m, m1){
				var val = parseFloat(m.replace(self.numbersRegex, function(m){
					if ( m == 'a' || m == 'an' )
						return 1;

					var index = self.numbers.indexOf(m);
					return index < 0 ? m : index;
				}).replace(/,/g, ''));

				if ( !Number.isFinite(val) )
					return m;

				try {
					val = unit.fn(val);
				}
				catch(e) {
					console.warn('error converting unit', m, val);
					return m;
				}
				if ( val == null )
					return m;

				return m + ' (' + val + ' ' + unit.label + ')';
			});
		});

		return str;
	},
	'enable': function(){
		self.preprocessUnits();
	}
};

BerryTweaks.patch(window, 'addChatMsg', function(data, _to){
	if ( !self.enabled )
		return;

	data.msg.msg = self.convertAll(data.msg.msg);
}, true);

return self;

})();
