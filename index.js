// Version 2.0.2
// Based on true-everful-nostrum by Pinkie Pie https://github.com/pinkipi
// Based on true-everful-nostrum by Caali https://github.com/caali-hackerman

'use strict'

const ITEMS_NOSTRUM = [152898, 184659, 201005, 201006, 201007, 201008, 201022, 855604], // EU, NA, RU, TW, ?, ?, JP , TH
	BUFF_NOSTRUM = [4020, 4021, 4022, 4023, 4030, 4031, 4032, 4044], // Nostrum abnormalities
	BUFF_CCB = [4610, 4611, 4612, 4613, 4615, 4616, 4950, 5000003, 5020003], // Complete Crystalbind abnormalities
	BUFF_INVINCIBILITY = [1134, 6007] // Invincibility abnormalities on resurrection

module.exports = function Essentials(mod) {

	mod.game.initialize("contract")

	let slot = null,
		interval = null,
		enabled = true,
		abnormalities = {},
		counter = 0

	// ############# //
	// ### Hooks ### //
	// ############# //

	mod.game.on('enter_game', () => { setTimeout(start, 5000) })
	mod.game.on('leave_game', () => {
		stop()
		abnormalities = {}
	})

	mod.game.me.on('resurrect', () => {
		abnormalities = {}
		start()
	})

	mod.hook('S_PCBANGINVENTORY_DATALIST', 1, event => {
		for(let item of event.inventory)
			if(ITEMS_NOSTRUM.includes(item.item)) {
				slot = item.slot
				item.cooldown = 0 // Cooldowns from this packet don't seem to do anything except freeze your client briefly
				return true
			}
	})

	mod.hook('S_ABNORMALITY_BEGIN', mod.base.majorPatchVersion >= 75 ? 3:2, abnormality.bind(null, 'S_ABNORMALITY_BEGIN'))
	mod.hook('S_ABNORMALITY_REFRESH', 1, abnormality.bind(null, 'S_ABNORMALITY_REFRESH'))
	mod.hook('S_ABNORMALITY_END', 1, abnormality.bind(null, 'S_ABNORMALITY_END'))

	if(mod.settings.log) {
		mod.hook('C_USE_ITEM', 3, event => {
			mod.command.message('Used item ID: ' + event.id)
		})
	}

	// ################# //
	// ### Functions ### //
	// ################# //

	function abnormality(type, event) {
		if(mod.game.me.is(event.target)) {
			if(type === 'S_ABNORMALITY_END')
				delete abnormalities[event.id]
			else abnormalities[event.id] = Date.now() + event.duration
		}
	}

	function abnormalityDuration(id) {
		if(!abnormalities[id]) return 0
		return abnormalities[id] - Date.now()
	}

	function checkItems() {
		for(let buff of BUFF_INVINCIBILITY) // Do not overwrite invincibility buff
			if(abnormalityDuration(buff) > 0) return

		useNostrum()
		useCCB()
	}

	function useNostrum() {
		for(let buff of BUFF_NOSTRUM) // Use Nostrum only when less than 5 minutes remaining
			if(abnormalityDuration(buff) > 300000 || !mod.settings.useNostrum) return

		if(!mod.game.isIngame || mod.game.isInLoadingScreen || !mod.game.me.alive || mod.game.me.mounted || mod.game.me.inBattleground || mod.game.contract.active) return

		if(enabled) {
			if(slot) mod.toServer('C_PCBANGINVENTORY_USE_SLOT', 1, {slot})
			else useItem(mod.settings.nostrum)
		}
	}

	function useCCB() {
		for(let buff of BUFF_CCB) // Use CCB only when less than 10 minutes remaining
			if(abnormalityDuration(buff) > 600000 || !mod.settings.useCCB) return

		if(!mod.game.isIngame || mod.game.isInLoadingScreen || !mod.game.me.alive || mod.game.me.mounted || mod.game.me.inBattleground || mod.game.contract.active) return

		if(enabled) useItem(mod.settings.ccb)
	}

	function useItem(item) {
		counter++
		if(counter > 3) {
			let missing = (item == mod.settings.nostrum) ? 'Nostrums' : 'Crystalbinds'
			enabled = false
			mod.command.message('You ran out of ' + missing + ' (ID: ' + item + '). Essentials has been disabled. Please restock and enable the module again by typing "essentials" in this chat.')
			console.log('You ran out of ' + missing + ' (ID: ' + item + '). Essentials has been disabled. Please restock and enable the module again by typing "essentials" in proxy chat.')
			setTimeout(() => { counter = 0 }, 6000)
			return
		}
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
		interval = setInterval(checkItems, 1000)
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

	mod.command.add('essentials', () => {
		enabled = !enabled
		mod.command.message('Essentials ' + (enabled ? '<font color="#56B4E9">enabled</font>' : '<font color="#E69F00">disabled</font>'))
		console.log('Essentials ' + (enabled ? 'enabled' : 'disabled'))
	})
}