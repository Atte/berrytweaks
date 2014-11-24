BerryTweaks.modules['convertUnits'] = (function(){
"use strict";

var self = {
	'css': false,
	'units': [
		{
			'names': ['F', 'fahrenheit', 'fahrenheits'],
			'label': 'C',
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
			'label': 'm²',
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
			'names': ['st', 'stone', 'stones'],
			'label': 'kg',
			'mul': 6.35
		}
	],
	'preprocessUnits': function(){
		self.units.forEach(function(unit){
			if ( unit.names )
				unit.regex = new RegExp('(?:^|\\s)((?:\\d*\\.)?\\d+)\\s*(?:' + unit.names.join('|') + ')\\b', 'gi');

			if ( unit.mul ){
				unit.fn = function(num){
					return (num * unit.mul).toFixed(2);
				};
			}
		});
	},
	'convertAll': function(str){
		var settings = BerryTweaks.loadSettings();

		self.units.forEach(function(unit){
			if ( settings.convertUnits && settings.convertUnits.indexOf(unit.names[unit.names.length-1]) == -1 )
				return;

			str = str.replace(unit.regex, function(m, m1){
				return m + ' (' + unit.fn(+m1) + ' ' + unit.label + ')';
			});
		});

		return str;
	},
	'enable': function(){
		self.preprocessUnits();
	},
	'addSettings': function(container){
		
	}
};

BerryTweaks.patch('addChatMsg', function(data, _to){
	if ( !self.enabled )
		return;

	data.msg.msg = self.convertAll(data.msg.msg);
}, true);

return self;

})();