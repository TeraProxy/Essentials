// Contains code from true-everful-nostrum by Pinkie Pie https://github.com/pinkipi

const ITEMS_NOSTRUM = 184659, // EU 152898, NA 184659, RU 201005
	BUFF_NOSTRUM_TD = 4030,
	BUFF_NOSTRUM_H = 4031,
	BUFF_CCB = 4610,
	RANDOM_MIN_MAX = [600000, 1500000], // Random Nostrum reapplication time between 10 and 25 minutes
	RANDOM_SHORT = [15000, 20000] // Random Nostrum reapplication time after loading screen between 15 and 20 seconds

module.exports = function Essentials(dispatch) {
	let cid = null,
		player = '',
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
		enabled = true

	dispatch.hook('S_LOGIN', 1, event => {
		({cid} = event)
		player = event.name
		nextUse = Date.now() + randomNumber(RANDOM_SHORT)
		setTimeout(ccb, 20000) // check if you have a CCB 20 seconds after login
	})

	dispatch.hook('S_RETURN_TO_LOBBY', 1, event => { nostrum(true) })

	dispatch.hook('S_PCBANGINVENTORY_DATALIST', 1, event => {
		for(let item of event.inventory)
			if(ITEMS_NOSTRUM == item.item) {
				slot = item.slot

				if(item.cooldown) cooldown = Date.now() + item.cooldown

				item.cooldown = 0 // Cooldowns from this packet don't seem to do anything except freeze your client briefly
				return true
			}
	})

	dispatch.hook('S_ABNORMALITY_BEGIN', 1, abnormality.bind(null, 'S_ABNORMALITY_BEGIN'))
	dispatch.hook('S_ABNORMALITY_REFRESH', 1, abnormality.bind(null, 'S_ABNORMALITY_REFRESH'))
	dispatch.hook('S_ABNORMALITY_END', 1, abnormality.bind(null, 'S_ABNORMALITY_END'))

	dispatch.hook('S_BATTLE_FIELD_ENTRANCE_INFO', 1, event => { bgZone = event.zone })

	dispatch.hook('S_LOAD_TOPO', 1, event => {
		nextUse = Date.now() + randomNumber(RANDOM_SHORT)
		mounted = inContract = false
		inBG = event.zone == bgZone

		nostrum(true)
	})
	
	dispatch.hook('S_SPAWN_ME', 1, event => { 
		nostrum(!(alive = event.alive))
	})
	
	dispatch.hook('S_CREATURE_LIFE', 1, event => {
		if(event.target.equals(cid) && alive != event.alive) {
			setTimeout(function () {
				nostrum(!(alive = event.alive))
			}, 2000)
			
			if(!alive) {
				nextUse = 0
				mounted = inContract = false
			}
		}
	})

	dispatch.hook('S_MOUNT_VEHICLE', 1, mount.bind(null, true))
	dispatch.hook('S_UNMOUNT_VEHICLE', 1, mount.bind(null, false))

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
		if(event.target.equals(cid) && (event.id == BUFF_CCB)) {
			if (type == 'S_ABNORMALITY_BEGIN') {
				hasccb = true
			}
			else if (type == 'S_ABNORMALITY_END') {
				hasccb = false
				ccb()
			}
		}
	}

	function mount(enter, event) {
		if(event.target.equals(cid)) nostrum(mounted = enter)
	}

	function contract(enter) {
		nostrum(inContract = enter)
	}

	function nostrum(disable) {
		clearTimeout(timeout)
		if(!disable && alive && !mounted && !inContract && !inBG && slot != -1) {
			timeout = setTimeout(useNostrum, nextUse - Date.now())
		}
	}

	function ccb() {
		clearTimeout(timeoutCCB)
		
		if(!hasccb && alive && !mounted && !inContract && !inBG) useCCB()
		else if(!hasccb) timeoutCCB = setTimeout(ccb, 10000) // retry in 10 seconds if you were busy
	}

	function useNostrum() {
		if(!enabled) return
		
		let time = Date.now()

		if(time >= cooldown) {
			dispatch.toServer('C_PCBANGINVENTORY_USE_SLOT', 1, {slot})
			nextUse = Date.now() + randomNumber(RANDOM_MIN_MAX)
			nostrum()
		}
		else timeout = setTimeout(useNostrum, cooldown - time)
	}
	
	function useCCB() {
		if(!enabled) return
		dispatch.toServer('C_USE_ITEM', 1, {
			ownerId: cid,
			item: 70000,
			id: 0,
			unk1: 0,
			unk2: 0,
			unk3: 0,
			unk4: 1,
			unk5: 0,
			unk6: 0,
			unk7: 0,
			x: 0, 
			y: 0, 
			z: 0, 
			w: 0, 
			unk8: 0,
			unk9: 0,
			unk10: 0,
			unk11: 1
		})
	}
	
	function randomNumber([min, max]) {
		return Math.floor(Math.random() * (max - min + 1) + min)
	}
	
	// ################# //
	// ### Chat Hook ### //
	// ################# //
	
	dispatch.hook('C_WHISPER', 1, (event) => {
		if(event.target.toUpperCase() === "!essentials".toUpperCase()) {
			if (/^<FONT>on?<\/FONT>$/i.test(event.message)) {
				enabled = true
				message('Essentials <font color="#56B4E9">enabled</font>.')
			}
			else if (/^<FONT>off?<\/FONT>$/i.test(event.message)) {
				enabled = false
				message('Essentials <font color="#E69F00">disabled</font>.')
			}
			else message('Commands:<br>'
								+ ' "on" (enable Essentials),<br>'
								+ ' "off" (disable Essentials)'
						)
			return false
		}
	})
	
	function message(msg) {
		dispatch.toClient('S_WHISPER', 1, {
			player: cid,
			unk1: 0,
			gm: 0,
			unk2: 0,
			author: '!Essentials',
			recipient: player,
			message: msg
		})
	}
	
	dispatch.hook('C_CHAT', 1, event => {
		if(/^<FONT>!essentials<\/FONT>$/i.test(event.message)) {
			if(!enabled) {
				enabled = true
				message('Essentials <font color="#56B4E9">enabled</font>.')
				console.log('Essentials enabled.')
			}
			else {
				enabled = false
				message('Essentials <font color="#E69F00">disabled</font>.')
				console.log('Essentials disabled.')
			}
			return false
		}
	})
	
	const command = Command(dispatch)
	command.add('essentials', function() {
		if(!enabled) {
			enabled = true
			message('Essentials <font color="#56B4E9">enabled</font>.')
			console.log('Essentials enabled.')
		}
		else {
			enabled = false
			message('Essentials <font color="#E69F00">disabled</font>.')
			console.log('Essentials disabled.')
		}
	})
}