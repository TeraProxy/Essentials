// Version 1.3.4
// Contains code from true-everful-nostrum by Pinkie Pie https://github.com/pinkipi

'use strict'

const Command = require('command'),
	GameState = require('tera-game-state'),
	elite = require('./config.json').elite

const ITEMS_NOSTRUM = [152898, 184659, 201005, 201006, 201007, 201008, 201022, 855604], // EU, NA, RU, TW, ?, ?, ?, TH
	ITEMS_PLEB_NOSTRUM = 200999,
	ITEM_CCB = 70000,
	BUFF_BLESSING = [1134,1136,6006,6016],
	BUFF_NOSTRUM_TD = [4020, 4030], // Nostrum abnormality for Tanks and Damage Dealers (pleb, elite)
	BUFF_NOSTRUM_H = [4021, 4031], // Nostrum abnormality for Healers (pleb, elite)
	BUFF_CCB = 4610, // Complete Crystalbind abnormality
	BUFF_ConCB = 5020003, // Continuous Crystalbind abnormality
	RANDOM_MIN_MAX = [600000, 1500000], // Random Nostrum reapplication time (10 - 25 minutes)
	RANDOM_SHORT = [4000, 8000] // Random Nostrum reapplication time after loading (4 - 8 seconds)

module.exports = function essentials(dispatch) {
	const command = Command(dispatch),
		game = GameState(dispatch)

	let slot = -1,
		timeout = null,
		timeoutCCB = null,
		cooldown = 0,
		nextUse = 0,
		bgZone = -1,
		inContract = false,
		inBG = false,
		hasccb = false,
		enabled = true,
		iAmBlessed = false

	// ############# //
	// ### Hooks ### //
	// ############# //

	game.on('enter_game', () => {
		dispatch.hookOnce('C_PLAYER_LOCATION', 'raw', () => {
			nextUse = Date.now() + randomNumber(RANDOM_SHORT)
			setTimeout(ccb, randomNumber(RANDOM_SHORT)) // check if you have a CCB shortly after moving for the first time
		})
	})
	game.on('leave_game', () => { nostrum(true) })

	game.on('enter_loading_screen', () => {
		inContract = false
		inBG = game.me.zone == bgZone
		nostrum(true)
	})
	game.on('leave_loading_screen', () => {
		dispatch.hookOnce('C_PLAYER_LOCATION', 'raw', () => { nostrum() })
	})
	
	game.me.on('die', () => {
		inContract = false
		nextUse = 0
		nostrum()
	})
	game.me.on('resurrect', () => { nostrum() })
	
	game.me.on('mount', () => { nostrum() })
	game.me.on('dismount', () => { nostrum() })

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

	dispatch.hook('S_REQUEST_CONTRACT', 1, contract.bind(null, true))
	dispatch.hook('S_ACCEPT_CONTRACT', 1, contract.bind(null, false))
	dispatch.hook('S_REJECT_CONTRACT', 1, contract.bind(null, false))
	dispatch.hook('S_CANCEL_CONTRACT', 1, contract.bind(null, false))

	// ################# //
	// ### Functions ### //
	// ################# //

	function abnormality(type, event) {
		if(game.me.is(event.target)) {
			if(BUFF_NOSTRUM_TD.includes(event.id) || BUFF_NOSTRUM_H.includes(event.id)) {
				if(type == 'S_ABNORMALITY_END') {
					nextUse = 0
					nostrum()
				}
			}
			if(event.id == BUFF_CCB || event.id == BUFF_ConCB) {
				hasccb = type != 'S_ABNORMALITY_END'
				if(!hasccb) ccb()
			}
			if(BUFF_BLESSING.includes(event.id)) {
				iAmBlessed = type != 'S_ABNORMALITY_END'
				if(!iAmBlessed) {
					nextUse = 0
					nostrum()
				}
			}
		}
	}

	function contract(enter) {
		nostrum(inContract = enter)
	}

	function nostrum(disable) {
		clearTimeout(timeout)
		if(!disable && game.me.alive && !game.me.mounted && !inContract && !inBG && slot != -1 && !iAmBlessed)
			timeout = setTimeout(useNostrum, nextUse - Date.now())
	}

	function ccb() {
		clearTimeout(timeoutCCB)
		
		if(!hasccb && game.me.alive && !game.me.mounted && !inContract && !inBG) useItem(ITEM_CCB)
		else if(!hasccb) timeoutCCB = setTimeout(ccb, 10000) // retry in 10 seconds if you were busy
	}

	function useNostrum() {
		let time = Date.now()

		if(time >= cooldown) {
			if(enabled) {
				if(elite) dispatch.toServer('C_PCBANGINVENTORY_USE_SLOT', 1, {slot})
				else useItem(ITEMS_PLEB_NOSTRUM)
			}
			nextUse = Date.now() + randomNumber(RANDOM_MIN_MAX)
			nostrum()
		}
		else timeout = setTimeout(useNostrum, cooldown - time)
	}
	
	function useItem(item) {
		if(!enabled) return
		dispatch.toServer('C_USE_ITEM', 2, {
			ownerId: game.me.gameId,
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
