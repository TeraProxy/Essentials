// Version 1.3.2
// Contains code from true-everful-nostrum by Pinkie Pie https://github.com/pinkipi

const Command = require('command')

const ITEMS_NOSTRUM = [152898, 184659, 201005], // EU 152898, NA 184659, RU 201005
	BUFF_BLESSING = 1134,
	BUFF_NOSTRUM_TD = 4030, // Nostrum abnormality for Tanks and Damage Dealers
	BUFF_NOSTRUM_H = 4031, // Nostrum abnormality for Healers
	BUFF_CCB = 4610, // Complete Crystalbind abnormality
	BUFF_ConCB = 5020003, // Continuous Crystalbind abnormality
	RANDOM_MIN_MAX = [600000, 1500000], // Random Nostrum reapplication time (10 - 25 minutes)
	RANDOM_SHORT = [4000, 8000] // Random Nostrum reapplication time after loading (4 - 8 seconds)

module.exports = function Essentials(dispatch) {
	let cid = null,
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

	dispatch.hook('S_LOGIN', 10, event => {
		cid = event.gameId
		dispatch.hookOnce('C_PLAYER_LOCATION', 1, () => {
			nextUse = Date.now() + randomNumber(RANDOM_SHORT)
			setTimeout(ccb, randomNumber(RANDOM_SHORT)) // check if you have a CCB shortly after moving for the first time
		})
	})

	dispatch.hook('S_RETURN_TO_LOBBY', 'raw', () => { nostrum(true) })

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

	dispatch.hook('S_LOAD_TOPO', 3, event => {
		nextUse = Date.now() + randomNumber(RANDOM_SHORT)
		
		mounted = inContract = false
		inBG = event.zone == bgZone

		nostrum(true)
	})
	
	dispatch.hook('S_SPAWN_ME', 2, event => { 
		dispatch.hookOnce('C_PLAYER_LOCATION', 'raw', () => {
			nostrum(!(alive = event.alive))
		})
	})
	
	dispatch.hook('S_CREATURE_LIFE', 2, event => {
		if(event.gameId.equals(cid) && alive != event.alive) {
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

	function abnormality(type, event) {
		if(event.target.equals(cid) && (event.id == BUFF_NOSTRUM_TD || event.id == BUFF_NOSTRUM_H)) {
			if (type == 'S_ABNORMALITY_END') {
				nextUse = 0
				nostrum()
			}
		}
		if(event.target.equals(cid) && (event.id == BUFF_CCB || event.id == BUFF_ConCB)) {
			if (type == 'S_ABNORMALITY_END') {
				hasccb = false
				ccb()
			}
			else hasccb = true
		}
		if(event.target.equals(cid) && (event.id == BUFF_BLESSING)) {
			if (type == 'S_ABNORMALITY_END') {
				iAmBlessed = false
				nextUse = 0
				nostrum()
			}
			else {
				iAmBlessed = true
			}
		}
	}

	function mount(enter, event) {
		if(event.gameId.equals(cid)) nostrum(mounted = enter)
	}

	function contract(enter) {
		nostrum(inContract = enter)
	}

	function nostrum(disable) {
		clearTimeout(timeout)
		if(!disable && alive && !mounted && !inContract && !inBG && slot != -1 && !iAmBlessed) {
			timeout = setTimeout(useNostrum, nextUse - Date.now())
		}
	}

	function ccb() {
		clearTimeout(timeoutCCB)
		
		if(!hasccb && alive && !mounted && !inContract && !inBG) useCCB()
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
	
	function useCCB() {
		if(!enabled) return
		dispatch.toServer('C_USE_ITEM', 2, {
			ownerId: cid,
			id: 70000,
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
	
	// ################# //
	// ### Chat Hook ### //
	// ################# //
	
	const command = Command(dispatch)
	command.add('essentials', () => {
		enabled = !enabled
		command.message('[Essentials] ' + (enabled ? '<font color="#56B4E9">enabled</font>' : '<font color="#E69F00">disabled</font>'))
		console.log('[Essentials] ' + (enabled ? 'enabled' : 'disabled'))
	})
}