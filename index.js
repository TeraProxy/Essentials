'use strict'

const ITEMS_NOSTRUM = [152898, 184659, 201005, 201006, 201007, 201008, 201022, 855604], // EU, NA, RU, TW, ?, ?, JP , TH
	BUFF_NOSTRUM = [4020, 4021, 4022, 4023, 4030, 4031, 4032, 4044], // Nostrum abnormalities
	BUFF_CCB = [4610, 4611, 4612, 4613, 4615, 4616, 4950, 5000003, 5020003], // Complete Crystalbind abnormalities
	BUFF_INVINCIBILITY = [1134, 6007] // Invincibility abnormalities on resurrection

module.exports = function Essentials(mod) {

	mod.game.initialize(['me', 'me.abnormalities', 'contract']);

	let item = null,
		interval = null,
		enabled = true,
		counter = 0,
		resetcount = null,
		niceName = mod.proxyAuthor !== 'caali' ? '[Essentials] ' : ''

	// ############# //
	// ### Hooks ### //
	// ############# //

	mod.game.on('enter_game', () => { setTimeout(start, 6000) })
	mod.game.on('leave_game', () => { stop() })

	mod.game.me.on('resurrect', () => { start() })

	mod.hook('S_PREMIUM_SLOT_DATALIST', 2, event => {
		for(let set of event.sets)
			for(let entry of set.inventory)
				if(ITEMS_NOSTRUM.includes(entry.id)) {
					item = {
						set: set.id,
						slot: entry.slot,
						type: entry.type,
						id: entry.id
					}
					entry.cooldown = 0n // Cooldowns from this packet don't seem to do anything except freeze your client briefly
					return true
				}
	})

	if(mod.settings.log) {
		mod.hook('C_USE_ITEM', 3, event => {
			mod.command.message(niceName + 'Used item ID: ' + event.id)
		})
	}

	// ################# //
	// ### Functions ### //
	// ################# //

    function abnormalityDuration(id) {
        const abnormality = mod.game.me.abnormalities[id]
        return abnormality ? abnormality.remaining : 0
    }

	function checkItems() {
		for(let buff of BUFF_INVINCIBILITY) // Do not overwrite invincibility buff
			if(abnormalityDuration(buff) > 0) return

		useNostrum()
		useCCB()
	}

	function useNostrum() {
		for(let buff of BUFF_NOSTRUM) // Use Nostrum only when less than nostrumTime
			if(abnormalityDuration(buff) > mod.settings.nostrumTime * 60000 || !mod.settings.useNostrum) return

		if(!mod.game.isIngame || mod.game.isInLoadingScreen || !mod.game.me.alive || mod.game.me.mounted || mod.game.me.inBattleground || mod.game.contract.active) return
		if(!mod.game.me.inDungeon && mod.settings.dungeonOnly) return

		if(enabled) {
			if(item) mod.send('C_USE_PREMIUM_SLOT', 1, item)
			else useItem(mod.settings.nostrum)
		}
	}

	function useCCB() {
		for(let buff of BUFF_CCB) // Use CCB only when less than CCBTime
			if(abnormalityDuration(buff) > mod.settings.CCBTime * 60000 || !mod.settings.useCCB) return

		if(!mod.game.isIngame || mod.game.isInLoadingScreen || !mod.game.me.alive || mod.game.me.mounted || mod.game.me.inBattleground || mod.game.contract.active) return
		if(!mod.game.me.inDungeon && mod.settings.dungeonOnly) return
		
		if(enabled) useItem(mod.settings.ccb)
	}

	function useItem(item) {
		counter++
		if(counter > 5) {
			let missing = (item == mod.settings.nostrum) ? 'Nostrums' : 'Crystalbinds'
			enabled = false
			mod.command.message(niceName + 'You ran out of ' + missing + ' (ID: ' + item + '). Essentials has been disabled. Please restock and enable the module again by typing "ess" in this chat.')
			console.log('[Essentials] You ran out of ' + missing + ' (ID: ' + item + '). Essentials has been disabled. Please restock and enable the module again by typing "ess" in proxy chat.')
			return
		}
		if(!resetcount) resetcount = setTimeout(() => { counter = 0; resetcount = null }, 15000)
		mod.toServer('C_USE_ITEM', 3, {
			gameId: mod.game.me.gameId,
			id: item,
			dbid: 0,
			target: 0,
			amount: 1,
			dest: {x: 0, y: 0, z: 0},
			loc: {x: 0, y: 0, z: 0},
			w: 0, 
			unk1: 0,
			unk2: 0,
			unk3: 0,
			unk4: 1
		})
	}
	
	function start() {
		stop()
		interval = setInterval(checkItems, 1500)
	}

	function stop() {
		if (interval) {
			clearInterval(interval)
			interval = null
		}
	}

	// ################ //
	// ### Commands ### //
	// ################ //

	mod.command.add(['essentials', 'ess'], (cmd) => {
		if(cmd == null) {
			enabled = !enabled
			mod.command.message(niceName + 'Essentials ' + (enabled ? '<font color="#56B4E9">enabled</font>' : '<font color="#E69F00">disabled</font>'))
			console.log('Essentials ' + (enabled ? 'enabled' : 'disabled'))
		}
		else if(cmd == "dungeon" || cmd == "dungeons" || cmd == "dung") {
			mod.settings.dungeonOnly = !mod.settings.dungeonOnly
			mod.command.message(niceName + 'Items will be used ' + (mod.settings.dungeonOnly ? 'everywhere' : 'in dungeons only'))
		}
		else mod.command.message('Commands:\n'
			+ ' "ess" (enable/disable Essentials),\n'
			+ ' "ess dungeon" (switch between using items everywhere or only in dungeons)'
		)
	})
}