window.BerryTweaks = (function(){
"use strict";

var self = {
	'configTitles': {
		'convertUnits': "Convert measurements in chat into metric",
		'chatonlyIcons': "Add icons to Chat-Only mode buttons",
		'hideLoggedin': 'Hide extra "Logged in as" label',
		'videoTitle': "Show video title in chat toolbar",
		'userMaps': "Show map in user dialog",
		'showLocaltimes': "Show users' local times",
		'globalFlairs': "Show flairs in user list",
		'smoothenWut': "Smoothen wutColors",
		'hideFloaty': "Hide floaty stuff"
	},
	'modules': {},
	'patch': function(name, callback, before){
		var original = window[name];

		if ( before ){
			window[name] = function(){
				callback.apply(this, arguments);
				return original.apply(this, arguments);
			};
		}
		else{
			window[name] = function(){
				var retu = original.apply(this, arguments);
				callback.apply(this, arguments);
				return retu;
			};
		}
	},
	'loadCSS': function(name){
		var url;
		if ( /^https?:/.test(name) )
			url = name;
		else
			url = 'https://atte.fi/berrytweaks/css/'+name+'.css';


		$('<link>', {
			'data-berrytweaks_module': name,
			'rel': 'stylesheet',
			'href': url
		}).appendTo(document.head);
	},
	'unloadCSS': function(name){
		$('link[data-berrytweaks_module='+name+']').remove();
	},
	'loadSettings': function(){
		return $.extend(true, {
			'enabled': {
				'convertUnits': false,
				'chatonlyIcons': false,
				'hideLoggedin': false,
				'videoTitle': false,
				'userMaps': false,
				'showLocaltimes': false,
				'globalFlairs': false,
				'smoothenWut': false,
				'hideFloaty': false
			}
		}, JSON.parse(localStorage['BerryTweaks'] || '{}'));
	},
	'saveSettings': function(settings){
		localStorage['BerryTweaks'] = JSON.stringify(settings);
		self.applySettings();
	},
	'applySettings': function(){
		var settings = self.loadSettings();

		$.each(settings.enabled, function(key, val){
			if ( val )
				self.enableModule(key);
			else
				self.disableModule(key);
		});
	},
	'enableModule': function(name){
		var mod = self.modules[name];
		if ( mod ){
			if ( mod.enabled )
				return;

			if ( mod.css )
				self.loadCSS(name);

			mod.enabled = true;

			if ( mod.enable )
				mod.enable();

			return;
		}

		$.getScript('https://atte.fi/berrytweaks/js/'+name+'.js', function(){
			if ( self.modules[name] )
				self.enableModule(name);
		});
	},
	'disableModule': function(name){
		var mod = self.modules[name];
		if ( mod ){
			if ( !mod.enabled )
				return;

			mod.enabled = false;

			if ( mod.disable )
				mod.disable();

			if ( mod.css )
				self.unloadCSS(name);
		}
	},
	'init': function(){
		self.patch('showConfigMenu', function(){
			var settings = self.loadSettings();

			$('#settingsGui > ul').append(
				$('<li>').append(
					$('<fieldset>').append(
						 $('<legend>', {
						 	'text': 'BerryTweaks'
						 })
					).append(
						$.map(self.configTitles, function(label, key){
							return $('<div>').append(
								$('<span>', {
									'text': label + ': '
								})
							).append(
								$('<input>', {
									'type': 'checkbox',
									'checked': !!settings.enabled[key]
								}).change(function(){
									var settings = self.loadSettings();
									settings.enabled[key] = !!$(this).prop('checked');
									self.saveSettings(settings);
								})
							);
						})
					)
				)
			);
		});
		self.applySettings();
	}
};

return self;

})();

$(function(){
	BerryTweaks.init();
});
