window.BerryTweaks = (function(){
"use strict";

var self = {
	'configTitles': {
		'convertUnits': "Convert measurements in chat into metric",
		'chatonlyIcons': "Add icons to Chat-Only mode buttons",
		'hideLoggedin': 'Hide extra "Logged in as" label',
		'videoTitle': "Show video title in chat toolbar",
		'sync': "Sync squees and PEP alerts",
		'userMaps': "Show map in user dialog",
		'showLocaltimes': "Show users' local times",
		'globalFlairs': "Show flairs in user list",
		'smoothenWut': "Smoothen wutColors",
		'hideFloaty': "Hide floaty stuff"
	},
	'modules': {},
	'lib': {},
	'libWaiters': {},
	'patch': function(container, name, callback, before){
		var original = container[name];

		if ( before ){
			container[name] = function(){
				callback.apply(this, arguments);
				return original.apply(this, arguments);
			};
		}
		else{
			container[name] = function(){
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
			'enabled': {}
		}, JSON.parse(localStorage['BerryTweaks'] || '{}'));
	},
	'saveSettings': function(settings){
		localStorage['BerryTweaks'] = JSON.stringify(settings);
		self.applySettings();
		self.updateSettingsGUI();
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
	'loadLibs': function(names, callback){
		names = names.filter(function(name){
			return !self.lib[name];
		});

		var left = names.length;
		if ( left == 0 ){
			callback();
			return;
		}

		var after = function(){
			if ( --left == 0 )
				callback();
		};

		names.forEach(function(name){
			var first = !self.libWaiters[name];

			if ( first ){
				self.libWaiters[name] = [after];

				$.getScript('https://atte.fi/berrytweaks/js/lib/'+name+'.js', function(){
					self.libWaiters[name].forEach(function(fn){
						fn();
					});
					delete self.libWaiters[name];
				});
			}
			else
				self.libWaiters[name].push(after);
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

			if ( mod.addSettings )
				self.updateSettingsGUI();

			return;
		}

		$.getScript('https://atte.fi/berrytweaks/js/'+name+'.js', function(){
			var mod = self.modules[name];
			if ( !mod )
				return;

			if ( mod.libs ){
				self.loadLibs(mod.libs, function(){
					self.enableModule(name);
				});
			}
			else
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
	'settingsContainer': null,
	'updateSettingsGUI': function(){
		if ( !self.settingsContainer )
			return;

		var settings = self.loadSettings();
		self.settingsContainer.empty();

		// title
		self.settingsContainer.append(
			$('<legend>', {
				'text': 'BerryTweaks'
			})
		);

		// basic toggles
		self.settingsContainer.append(
			$.map(self.configTitles, function(label, key){
				return $('<div>', {
					'class': 'module-toggle',
					'data-key': key
				}).append(
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
		);

		// mod specific
		$.each(self.modules, function(key, mod){
			if ( !mod.enabled || !mod.addSettings )
				return;

			mod.addSettings(
				$('<div>', {
					'class': 'module-settings',
					'data-key': key
				}).insertAfter(
					$('.module-toggle[data-key='+key+']', self.settingsContainer)
				)
			);
		});
	},
	'init': function(){
		self.patch(window, 'showConfigMenu', function(){
			self.settingsContainer = $('<fieldset>');
			$('#settingsGui > ul').append(
				$('<li>').append(
					self.settingsContainer
				)
			);

			self.updateSettingsGUI();
		});

		self.applySettings();
	}
};

return self;

})();

$(function(){
	BerryTweaks.init();
});
