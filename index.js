// Version 1.3.10
// Based on true-everful-nostrum by Pinkie Pie https://github.com/pinkipi

'use strict'

const ITEMS_NOSTRUM = [152898, 184659, 201005, 201006, 201007, 201008, 201022, 855604], // EU, NA, RU, TW, ?, ?, ?, TH
	BUFF_INVINCIBILITY = [1134, 6007], // Invincibility abnormality (Goddess Blessing, Phoenix)
	BUFF_NOSTRUM_TD = [4020, 4030], // Nostrum abnormality for Tanks and Damage Dealers (pleb, elite)
	BUFF_NOSTRUM_H = [4021, 4031], // Nostrum abnormality for Healers (pleb, elite)
	BUFF_CCB = [4610, 4612, 5020003], // Complete Crystalbind abnormality (12h, 1h, elite)
	RANDOM_MIN_MAX = [600000, 1500000], // Random Nostrum reapplication time (10 - 25 minutes)
	RANDOM_SHORT = [4000, 8000] // Random Nostrum reapplication time after loading (4 - 8 seconds)

module.exports = function Essentials(mod) {

	const ELITE = mod.settings.elite,
		ITEM_PLEB_NOSTRUM = mod.settings.nostrum,
		ITEM_CCB = mod.settings.ccb

	mod.game.initialize("contract")

	let slot = null,
		timeoutNostrum = null,
		timeoutCCB = null,
		cooldown = 0,
		nextUse = 0,
		hasccb = false,
		enabled = true,
		iAmInvincible = false

	// ############# //
	// ### Hooks ### //
	// ############# //

	mod.game.on('enter_game', () => {
		hasccb = false

		mod.hookOnce('C_PLAYER_LOCATION', 'raw', () => {
			nextUse = Date.now() + randomNumber(RANDOM_SHORT)
			setTimeout(ccb, randomNumber(RANDOM_SHORT)) // check if you have a CCB shortly after moving for the first time
		})
	})
	mod.game.on('leave_game', () => {
		if (timeoutNostrum) {
			clearInterval(timeoutNostrum)
			timeoutNostrum = null
		}
		if (timeoutCCB) {
			clearInterval(timeoutCCB)
			timeoutCCB = null
		}
	})

	mod.game.on('leave_loading_screen', () => {
		mod.hookOnce('C_PLAYER_LOCATION', 'raw', () => { nostrum() })
	})

	mod.game.me.on('die', () => { 
		nextUse = 0
		nostrum()
	})
	mod.game.me.on('resurrect', () => { nostrum() })

	mod.hook('S_PCBANGINVENTORY_DATALIST', 1, event => {
		for(let item of event.inventory)
			if(ITEMS_NOSTRUM.includes(item.item)) {
				slot = item.slot
				if(item.cooldown) cooldown = Date.now() + item.cooldown
				item.cooldown = 0 // Cooldowns from this packet don't seem to do anything except freeze your client briefly
				return true
			}
	})

	mod.hook('S_ABNORMALITY_BEGIN', mod.base.majorPatchVersion >= 75 ? 3:2, abnormality.bind(null, 'S_ABNORMALITY_BEGIN'))
	mod.hook('S_ABNORMALITY_REFRESH', 1, abnormality.bind(null, 'S_ABNORMALITY_REFRESH'))
	mod.hook('S_ABNORMALITY_END', 1, abnormality.bind(null, 'S_ABNORMALITY_END'))

	// ################# //
	// ### Functions ### //
	// ################# //

	function abnormality(type, event) {
		if(mod.game.me.is(event.target)) {
			if(BUFF_NOSTRUM_TD.includes(event.id) || BUFF_NOSTRUM_H.includes(event.id)) {
				if(type === 'S_ABNORMALITY_END') {
					nextUse = 0
					nostrum()
				}
			}
			else if(BUFF_CCB.includes(event.id)) {
				hasccb = type !== 'S_ABNORMALITY_END'
				if(!hasccb) ccb()
			}
			else if(BUFF_INVINCIBILITY.includes(event.id)) {
				iAmInvincible = type !== 'S_ABNORMALITY_END'
				if(!iAmInvincible) {
					nextUse = 0
					nostrum()
				}
			}
		}
	}

	function nostrum() {
		clearTimeout(timeoutNostrum)
		
		if(mod.game.isIngame && mod.game.me.alive && !mod.game.isInLoadingScreen && !mod.game.me.mounted && !mod.game.contract.active && !mod.game.me.inBattleground && (slot || !ELITE) && !iAmInvincible)
			timeoutNostrum = setTimeout(useNostrum, nextUse - Date.now())
	}

	function ccb() {
		clearTimeout(timeoutCCB)
		
		if(!hasccb && mod.game.isIngame && mod.game.me.alive && !mod.game.isInLoadingScreen && !mod.game.me.mounted && !mod.game.contract.active && !mod.game.me.inBattleground) useItem(ITEM_CCB)
		else if(!hasccb) timeoutCCB = setTimeout(ccb, 10000) // retry in 10 seconds if we were busy
	}

	function useNostrum() {
		let time = Date.now()

		if(time >= cooldown) {
			if(enabled) {
				if(ELITE) mod.toServer('C_PCBANGINVENTORY_USE_SLOT', 1, {slot})
				else useItem(ITEM_PLEB_NOSTRUM)
			}
			nextUse = Date.now() + randomNumber(RANDOM_MIN_MAX)
			nostrum()
		}
		else timeoutNostrum = setTimeout(useNostrum, cooldown - time)
	}
	
	function useItem(item) {
		if(!enabled) return
		
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

	function randomNumber([min, max]) {
		return Math.floor(Math.random() * (max - min + 1) + min)
	}

	// ################ //
	// ### Commands ### //
	// ################ //

	mod.command.add('essentials', () => {
		enabled = !enabled
		mod.command.message((enabled ? '<font color="#56B4E9">enabled</font>' : '<font color="#E69F00">disabled</font>'))
		console.log('[Essentials] ' + (enabled ? 'enabled' : 'disabled'))
	})
}