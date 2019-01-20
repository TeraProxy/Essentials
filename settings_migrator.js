"use strict"

const DefaultSettings = {
	"useNostrum": true,
	"useCCB": true,
	"nostrumTime": 5,
	"CCBTime": 10,
	"dungeonOnly": false,
	"log": false,
	"nostrum": 200999,
	"ccb": 70000
}

module.exports = function MigrateSettings(from_ver, to_ver, settings) {
	if (from_ver === undefined) { // Migrate legacy config file
		return Object.assign(Object.assign({}, DefaultSettings), settings);
	}
	else if (from_ver === null) { // No config file exists, use default settings
		return DefaultSettings;
	}
	else { // Migrate from older version (using the new system) to latest one
		if (from_ver + 1 < to_ver) { // Recursively upgrade in one-version steps
			settings = MigrateSettings(from_ver, from_ver + 1, settings);
			return MigrateSettings(from_ver + 1, to_ver, settings);
		}
		// If we reach this point it's guaranteed that from_ver === to_ver - 1, so we can implement
		// a switch for each version step that upgrades to the next version. This enables us to
		// upgrade from any version to the latest version without additional effort!
		switch(to_ver) {
			default: // keep old settings, add new ones
				let oldsettings = settings;
				settings = Object.assign(DefaultSettings, {});

				for(let option in oldsettings) {
					if(settings[option]) {
						settings[option] = oldsettings[option];
					}
				}

				if(from_ver < to_ver) console.log('[Essentials] Your settings have been updated to version ' + to_ver + '. You can edit the new config file after the next relog.');
				break;
		}
		return settings;
	}
}