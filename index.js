// Version 1.3.3
// Contains code from true-everful-nostrum by Pinkie Pie https://github.com/pinkipi

'use strict'

const Command = require('command'),
	GameState = require('tera-game-state')

const ITEMS_NOSTRUM = [152898, 184659, 201005, 201006, 201007, 201008, 201022, 855604], // EU, NA, RU, TW, ?, ?, ?, TH
	ITEM_CCB = 70000,
	BUFF_BLESSING = 1134,
	BUFF_NOSTRUM_TD = 4030, // Nostrum abnormality for Tanks and Damage Dealers
	BUFF_NOSTRUM_H = 4031, // Nostrum abnormality for Healers
	BUFF_CCB = 4610, // Complete Crystalbind abnormality
	BUFF_ConCB = 5020003, // Continuous Crystalbind abnormality
	RANDOM_MIN_MAX = [600000, 1500000], // Random Nostrum reapplication time (10 - 25 minutes)
	RANDOM_SHORT = [4000, 8000] // Random Nostrum reapplication time after loading (4 - 8 seconds)

module.exports = function Essentials(dispatch) {
	const command = Command(dispatch),
		game = GameState(dispatch)

	let gameId = null,
		slot = -1,
		timeout = null,
		timeoutCCB = null,
		cooldown = 0,
		nextUse = 0,
		bgZone = -1,
		alive = false,
		mounted = false,
		inContract = false,
		inBG = false,
		hasccb = false,
		enabled = true,
		iAmBlessed = false

	// ############# //
	// ### Hooks ### //
	// ############# //

	game.on('enter_game', () => {
		gameId = game.me.gameId
		dispatch.hookOnce('C_PLAYER_LOCATION', 'raw', () => {
			nextUse = Date.now() + randomNumber(RANDOM_SHORT)
			setTimeout(ccb, randomNumber(RANDOM_SHORT)) // check if you have a CCB shortly after moving for the first time
		})
	})

	game.on('enter_character_lobby', () => { nostrum(true) })
	
	game.on('enter_loading_screen', () => {
		mounted = inContract = false
		inBG = game.me.zone == bgZone

		nostrum(true)
	})

	game.on('leave_loading_screen', () => {
		dispatch.hookOnce('C_PLAYER_LOCATION', 'raw', () => {
			nostrum(!(alive = game.me.alive))
		})
	})

	dispatch.hook('S_PCBANGINVENTORY_DATALIST', 1, event => {
		for(let item of event.inventory)
			if(ITEMS_NOSTRUM.includes(item.item)) {
				slot = item.slot
				if(item.cooldown) cooldown = Date.now() + item.cooldown
				item.cooldown = 0 // Cooldowns from this packet don't seem to do anything except freeze your client briefly
				return true
			}
	})

	dispatch.hook('S_ABNORMALITY_BEGIN', 2, abnormality.bind(null, 'S_ABNORMALITY_BEGIN'))
	dispatch.hook('S_ABNORMALITY_REFRESH', 1, abnormality.bind(null, 'S_ABNORMALITY_REFRESH'))
	dispatch.hook('S_ABNORMALITY_END', 1, abnormality.bind(null, 'S_ABNORMALITY_END'))

	dispatch.hook('S_BATTLE_FIELD_ENTRANCE_INFO', 1, event => { bgZone = event.zone })

	dispatch.hook('S_CREATURE_LIFE', 2, event => {
		if(game.me.is(event.gameId) && alive != event.alive) {
			nostrum(!(alive = event.alive))
			
			if(!alive) {
				nextUse = 0
				mounted = inContract = false
			}
		}
	})

	dispatch.hook('S_MOUNT_VEHICLE', 2, mount.bind(null, true))
	dispatch.hook('S_UNMOUNT_VEHICLE', 2, mount.bind(null, false))

	dispatch.hook('S_REQUEST_CONTRACT', 1, contract.bind(null, true))
	dispatch.hook('S_ACCEPT_CONTRACT', 1, contract.bind(null, false))
	dispatch.hook('S_REJECT_CONTRACT', 1, contract.bind(null, false))
	dispatch.hook('S_CANCEL_CONTRACT', 1, contract.bind(null, false))

	// ################# //
	// ### Functions ### //
	// ################# //

	function abnormality(type, event) {
		if(game.me.is(event.target) && (event.id == BUFF_NOSTRUM_TD || event.id == BUFF_NOSTRUM_H)) {
			if (type == 'S_ABNORMALITY_END') {
				nextUse = 0
				nostrum()
			}
		}
		if(game.me.is(event.target) && (event.id == BUFF_CCB || event.id == BUFF_ConCB)) {
			if (type == 'S_ABNORMALITY_END') {
				hasccb = false
				ccb()
			}
			else hasccb = true
		}
		if(game.me.is(event.target) && event.id == BUFF_BLESSING) {
			if (type == 'S_ABNORMALITY_END') {
				iAmBlessed = false
				nextUse = 0
				nostrum()
			}
			else iAmBlessed = true
		}
	}

	function mount(enter, event) {
		if(game.me.is(event.gameId)) nostrum(mounted = enter)
	}

	function contract(enter) {
		nostrum(inContract = enter)
	}

	function nostrum(disable) {
		clearTimeout(timeout)
		if(!disable && alive && !mounted && !inContract && !inBG && slot != -1 && !iAmBlessed)
			timeout = setTimeout(useNostrum, nextUse - Date.now())
	}

	function ccb() {
		clearTimeout(timeoutCCB)
		
		if(!hasccb && alive && !mounted && !inContract && !inBG) useItem(ITEM_CCB)
		else if(!hasccb) timeoutCCB = setTimeout(ccb, 10000) // retry in 10 seconds if you were busy
	}

	function useNostrum() {
		let time = Date.now()

		if(time >= cooldown) {
			if(enabled) dispatch.toServer('C_PCBANGINVENTORY_USE_SLOT', 1, {slot})
			nextUse = Date.now() + randomNumber(RANDOM_MIN_MAX)
			nostrum()
		}
		else timeout = setTimeout(useNostrum, cooldown - time)
	}
	
	function useItem(item) {
		if(!enabled) return
		dispatch.toServer('C_USE_ITEM', 2, {
			ownerId: gameId,
			id: item,
			uniqueId: 0,
			targetId: 0,
			amount: 1,
			targetX: 0,
			targetY: 0,
			targetZ: 0,
			x: 0, 
			y: 0, 
			z: 0, 
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

	command.add('essentials', () => {
		enabled = !enabled
		command.message('[Essentials] ' + (enabled ? '<font color="#56B4E9">enabled</font>' : '<font color="#E69F00">disabled</font>'))
		console.log('[Essentials] ' + (enabled ? 'enabled' : 'disabled'))
	})
}