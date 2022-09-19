window.BerryTweaks = (function(){
'use strict';

const self = {
    gapi: BerryTweaks.gapi,
    release: BerryTweaks.release,
    releaseUrl: BerryTweaks.releaseUrl,
    categories: [
        {
            title: 'Chat view',
            configs: ['convertUnits', 'smoothenWut', 'ircifyTitles', 'ircify']
        },
        {
            title: 'User list',
            configs: ['userMaps', 'showLocaltimes', 'globalFlairs', 'flags']
        },
        {
            title: 'Video',
            configs: ['autoshowVideo', 'videoTitle']
        },
        {
            title: 'Other',
            configs: ['requestCheck', 'sync', 'linkOpener', 'rawSquees', 'squeeSound']
        },
        {
            title: 'Nitpicking',
            configs: ['reduceCPU', 'stripes', 'squeeVolume', 'hideLoggedin', 'hideTitle']
        },
        {
            title: 'Mod stuff',
            configs: ['tabHighlight', 'hoverNotes', 'altTab', 'ctrlTab', 'ircifyModlog', 'queuePlaylist'],
            minType: 2
        }
    ],
    configTitles: {
        convertUnits: "Convert measurements",
        smoothenWut: "Smoothen wutColors",
        ircifyTitles: "Show video changes",
        ircify: "Show joins/parts",

        userMaps: "Show map in user dialog",
        showLocaltimes: "Show local times",
        globalFlairs: "Show flairs",
        flags: "Show flags",

        autoshowVideo: "Expand MalTweaks video during volatiles",
        videoTitle: "Show video title in chat toolbar",

        requestCheck: "Check requests for country restrictions",
        sync: "Sync squees and PEP stars",
        linkOpener: "Open links automatically",
        rawSquees: "Unlimited squee editor",
        squeeSound: "Custom squee sound",

        reduceCPU: "Reduce CPU usage (but break some things)",
        stripes: "Stripe messages (requires theme support)",
        squeeVolume: "Customize notification volumes",
        hideLoggedin: 'Hide extra "Logged in as" label',
        hideTitle: "Hide tab title",

        tabHighlight: "Highlight chat tabs with new messages",
        hoverNotes: "Only show notes on userlist hover",
        altTab: "Change chat tabs with Alt + 1/2",
        ctrlTab: "Cycle chat tabs with Ctrl + Tab",
        ircifyModlog: "Show mod log in chat",
        queuePlaylist: "Playlist queuing"
    },
    deprecatedModules: ['escClose', 'settingsFix', 'noReferrer', 'esc', 'sortComplete', 'filterDrag', 'resetFlair'],
    modules: {},
    lib: {},
    libWaiters: {},
    whenExists(selector, fn) {
        const interval = setInterval(() => {
            const el = $(selector);
            if ( el && el.length > 0 ){
                clearInterval(interval);
                fn(el);
            }
        }, 100);
    },
    timeDiff: 0,
    getServerTime() {
        return Date.now() + self.timeDiff;
    },
    dialogDOM: null,
    dialog(text) {
        self.dialogDOM.text(text).dialog({
            modal: true,
            buttons: [
                {
                    text: 'Ok',
                    click: function() {
                        $(this).dialog('close');
                    }
                }
            ]
        });
    },
    confirm(text, callback) {
        self.dialogDOM.text(text).dialog({
            modal: true,
            buttons: [
                {
                    text: 'Ok',
                    click: function() {
                        $(this).dialog('close');
                        callback(true);
                    }
                },
                {
                    text: 'Cancel',
                    click: function() {
                        $(this).dialog('close');
                        callback(false);
                    }
                }
            ]
        });
    },
    patch(container, name, callback, before) {
        const original = container[name] || function(){/* noop */};

        if ( before ){
            container[name] = function(){
                if ( callback.apply(this, arguments) !== false )
                    return original.apply(this, arguments);
                return undefined;
            };
        }
        else{
            container[name] = function(){
                const retu = original.apply(this, arguments);
                callback.apply(this, arguments);
                return retu;
            };
        }
    },
    loadCSS(name) {
        $('<link>', {
            'data-berrytweaks_module': name,
            rel: 'stylesheet',
            href: name.indexOf('//') === -1 ?  BerryTweaks.releaseUrl(`css/${name}.css`) : name
        }).appendTo(document.head);
    },
    unloadCSS(name) {
        $(`link[data-berrytweaks_module=${name}]`).remove();
    },
    loadScript(name, callback) {
        $.ajax({
            url: name.indexOf('//') === -1 ? BerryTweaks.releaseUrl(`js/${name}.js`) : name,
            dataType: 'script',
            cache: true,
            success: callback
        });
    },
    loadSettings() {
        return $.extend(true, {
            enabled: {}
        }, JSON.parse(localStorage['BerryTweaks'] || '{}'));
    },
    saveSettings(settings) {
        localStorage['BerryTweaks'] = JSON.stringify(settings);
        self.applySettings();
        self.updateSettingsGUI();
    },
    getSetting(key, defaultValue) {
        const val = self.loadSettings()[key];
        return val === undefined ? defaultValue : val;
    },
    setSetting(key, val) {
        const settings = self.loadSettings();
        settings[key] = val;
        self.saveSettings(settings);
    },
    applyingSettings: false,
    applySettings() {
        $.each(self.loadSettings().enabled, (key, val) => {
            if ( val )
                self.enableModule(key);
            else
                self.disableModule(key);
        });
    },
    bindEvents(mod) {
        if ( !mod || !mod.bind || mod.bound ){
            return;
        }
        $.each(mod.bind.socket || {}, (key, fn) => {
            socket.on(key, function(...args) {
                if (mod.enabled) {
                    fn.call(this, ...args);
                }
            });
        });
        $.each(mod.bind.patchBefore || {}, (key, fn) => {
            self.patch(window, key, function(...args) {
                return mod.enabled ? fn.call(this, ...args) : true;
            }, true);
        });
        $.each(mod.bind.patchAfter || {}, (key, fn) => {
            self.patch(window, key, function(...args) {
                if (mod.enabled) {
                    fn.call(this, ...args);
                }
            }, false);
        });
        mod.bound = true;
    },
    loadLibs(names, callback) {
        names = names.filter(name => !self.lib[name]);
        if ( !callback ){
            callback = function() { /* noop */ };
        }

        let left = names.length;
        if ( left === 0 ){
            callback();
            return;
        }

        const after = function(){
            if ( --left == 0 )
                callback();
        };

        names.forEach(name => {
            if ( !self.libWaiters[name] ){
                self.libWaiters[name] = [after];

                const isAbsolute = name.indexOf('://') !== -1;
                self.loadScript(isAbsolute ? name : BerryTweaks.releaseUrl(`js/lib/${name}.js`), () => {
                    if ( isAbsolute ) {
                        self.lib[name] = true;
                    } else {
                        self.bindEvents(self.lib[name]);
                    }

                    self.libWaiters[name].forEach(fn => {
                        fn();
                    });
                    delete self.libWaiters[name];
                });
            }
            else
                self.libWaiters[name].push(after);
        });
    },
    enableModule(name) {
        if ( !self.configTitles.hasOwnProperty(name) || self.deprecatedModules.indexOf(name) !== -1 )
            return;

        const mod = self.modules[name];
        if ( mod ){
            if ( mod.enabled || mod.enabling )
                return;

            if ( mod.css )
                self.loadCSS(name);

            mod.enabled = true;

            if ( mod.enable )
                mod.enable();

            if ( mod.addSettings )
                self.updateSettingsGUI();

            self.bindEvents(mod);
            return;
        }

        self.modules[name] = { enabling: true };
        self.loadScript(BerryTweaks.releaseUrl(`js/${name}.js`), () => {
            const mod = self.modules[name];
            if ( !mod )
                return;

            if ( mod.libs ){
                mod.enabling = true;
                self.loadLibs(mod.libs, () => {
                    delete mod.enabling;
                    self.enableModule(name);
                });
            }
            else {
                self.enableModule(name);
            }
        });
    },
    disableModule(name) {
        if ( !self.configTitles.hasOwnProperty(name) )
            return;

        const mod = self.modules[name];
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
    reloadModule(name) {
        self.disableModule(name);
        delete self.modules[name];
        self.enableModule(name);
    },
    fixWindowPosition(dialogContent) {
        const uid = dialogContent.parents('.dialogWindow').data('uid');
        for (const win of $('body').data('windows')) {
            if (win.data('uid') === uid) {
                console.log('refreshing', uid);
                win.refreshWindowOffset();
            }
        }
    },
    settingsContainer: null,
    updateSettingsGUI() {
        if ( !self.settingsContainer )
            return;

        const win = self.settingsContainer.parents('.dialogContent');
        if ( !win )
            return;

        const settings = self.loadSettings();
        const scroll = win.scrollTop();
        self.settingsContainer.empty();

        // title
        self.settingsContainer.append(
            $('<legend>', {
                text: 'BerryTweaks'
            })
        );

        // basic toggles
        self.settingsContainer.append.apply(self.settingsContainer,
            self.categories.map(cat => {
                if ( cat.hidden )
                    return null;
                if ( cat.minType !== undefined && window.TYPE < cat.minType )
                    return null;
                return [$('<label>', {
                    class: 'berrytweaks-module-category',
                    text: cat.title
                })].concat(cat.configs.map(function(key){
                    const label = self.configTitles[key];
                    if ( !label )
                        return null;

                    return $('<div>', {
                        class: 'berrytweaks-module-toggle-wrapper',
                        'data-key': key
                    }).append(
                        $('<label>', {
                            for: 'berrytweaks-module-toggle-' + key,
                            text: label + ': '
                        })
                    ).append(
                        $('<input>', {
                            id: 'berrytweaks-module-toggle-' + key,
                            type: 'checkbox',
                            checked: !!settings.enabled[key]
                        }).change(function() {
                            const settings = self.loadSettings();
                            settings.enabled[key] = !!$(this).prop('checked');
                            self.saveSettings(settings);
                        })
                    );
                }));
            })
        );

        // mod specific
        $.each(self.modules, (key, mod) => {
            if ( !mod.addSettings )
                return;

            mod.addSettings(
                $('<div>', {
                    class: 'berrytweaks-module-settings',
                    'data-key': key
                }).insertAfter(
                    $(`.berrytweaks-module-toggle-wrapper[data-key=${key}]`, self.settingsContainer)
                )
            );
        });

        win.scrollTop(scroll);
    },
    init() {
        self.dialogDOM = $('<div>', {
            title: 'BerryTweaks',
            class: 'berrytweaks-dialog'
        }).hide().appendTo(document.body);

        self.patch(window, 'showConfigMenu', () => {
            self.settingsContainer = $('<fieldset>');
            $('#settingsGui > ul').append(
                $('<li>').append(
                    self.settingsContainer
                )
            );

            self.updateSettingsGUI();
        });

        self.patch(window, 'showUserActions', () => {
            setTimeout(() => {
                self.fixWindowPosition($('#userOps').parents('.dialogContent'));
            }, 200 + 100); // dialog fade-in
        });

        setTimeout(() => {
            self.patch(window, 'addChatMsg', data => {
                if ( data && data.msg && data.msg.timestamp )
                    self.timeDiff = new Date(data.msg.timestamp) - new Date();
            });
        }, 5000);

        self.loadCSS('init');
        self.applySettings();
    }
};

return self;

})();

if (!window.SKIP_BERRYTWEAKS) {
    BerryTweaks.init();
}
