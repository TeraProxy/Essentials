// based on true-everful-nostrum by https://github.com/pinkipi

const HIDE_DURATION = false,
	HIDE_MESSAGE = false

const ITEMS_NOSTRUM = [184659], // EU 152898, NA 184659, RU 201005
	BUFF_NOSTRUM_TD = 4030,
	BUFF_NOSTRUM_H = 4031,
	BUFF_CCB = 4610

const sysmsg = require('tera-data-parser').sysmsg

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
		nextUse = 0
		setTimeout(ccb, 20000) // check if you have a CCB 20 seconds after login
	})

	dispatch.hook('S_RETURN_TO_LOBBY', 1, event => { nostrum(true) })

	if(HIDE_MESSAGE)
		dispatch.hook('S_SYSTEM_MESSAGE', 1, event => {
			let msg = event.message.split('\x0b'),
				type = msg[0].startsWith('@') ? sysmsg.map.code[msg[0].slice(1)] : ''

			if(type == 'SMT_ITEM_USED' || type == 'SMT_CANT_USE_ITEM_COOLTIME') {
				let obj = {}

				for(let i = 2; i < msg.length; i += 2) obj[msg[i - 1]] = msg[i]

				for(let item of ITEMS_NOSTRUM)
					if(obj.ItemName == '@item:' + item) return false
			}
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

	dispatch.hook('S_ABNORMALITY_BEGIN', 1, abnormality.bind(null, 'S_ABNORMALITY_BEGIN'))
	dispatch.hook('S_ABNORMALITY_REFRESH', 1, abnormality.bind(null, 'S_ABNORMALITY_REFRESH'))
	dispatch.hook('S_ABNORMALITY_END', 1, abnormality.bind(null, 'S_ABNORMALITY_END'))

	dispatch.hook('S_BATTLE_FIELD_ENTRANCE_INFO', 1, event => { bgZone = event.zone })

	dispatch.hook('S_LOAD_TOPO', 1, event => {
		nextUse = 0
		mounted = inContract = false
		inBG = event.zone == bgZone

		nostrum(true)
	})
	dispatch.hook('S_SPAWN_ME', 1, event => { nostrum(!(alive = event.alive)) })
	dispatch.hook('S_CREATURE_LIFE', 1, event => {
		if(event.target.equals(cid) && alive != event.alive) {
			nostrum(!(alive = event.alive))

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
			nextUse = type == 'S_ABNORMALITY_END' ? 0 : Date.now() + Math.floor(event.duration / 2)
			nostrum()

			if(HIDE_DURATION) {
				if(type == 'S_ABNORMALITY_BEGIN') {
					event.duration = 0
					return true
				}
				if(type == 'S_ABNORMALITY_REFRESH') return false
			}
		}
		if(event.target.equals(cid) && (event.id == BUFF_CCB)) {
			if (type == 'S_ABNORMALITY_BEGIN') {
				hasccb = true
			}
			if (type == 'S_ABNORMALITY_END') {
				hasccb = false
				ccb()
			}
			if(HIDE_DURATION) {
				if(type == 'S_ABNORMALITY_BEGIN') {
					event.duration = 0
					return true
				}
				if(type == 'S_ABNORMALITY_REFRESH') return false
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

		if(!disable && alive && !mounted && !inContract && !inBG && slot != -1) timeout = setTimeout(useNostrum, nextUse - Date.now())
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
			nextUse = Date.now() + 1000
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
	
	// ################# //
	// ### Chat Hook ### //
	// ################# //
	
	dispatch.hook('C_WHISPER', 1, (event) => {
		if(event.target.toUpperCase() === "!essentials".toUpperCase()) {
			if (/^<FONT>on?<\/FONT>$/i.test(event.message)) {
				enabled = true
				message('Essentials <font color="#00EE00">enabled</font>.')
			}
			else if (/^<FONT>off?<\/FONT>$/i.test(event.message)) {
				enabled = false
				message('Essentials <font color="#DC143C">disabled</font>.')
			}
			else message('Commands: "on" (enable Essentials),'
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
}