##### :heavy_exclamation_mark: Status :heavy_exclamation_mark:
Should work on all regions as long as the opcodes are mapped. Works on Caali's and Pinkie Pie's tera-proxy.

##### :heavy_exclamation_mark: Installation :heavy_exclamation_mark:
1) Download Essentials: https://github.com/TeraProxy/Essentials/archive/master.zip
2) Extract the contents of the zip file into "\tera-proxy\mods\"
3) Done! (the module will auto-update on Caali's proxy when a new version is released)
  
Users of Pinkie's proxy also need to install tera-game-state: https://github.com/caali-hackerman/tera-game-state/archive/master.zip  
  
If you enjoy my work and wish to support future development, feel free to drop me a small donation: [![Donate](https://www.paypalobjects.com/webstatic/en_US/i/buttons/PP_logo_h_100x26.png)](https://www.paypal.com/cgi-bin/webscr?cmd=_donations&business=A3KBZUCSEQ5RJ)

# Essentials
A tera-proxy module that automatically uses "Nostrum"/"Battle Solution" and "Complete Crystalbind" items whenever needed.

## Usage
There are several options you can change in the config.json file (Pinkie's proxy: "\settings\Essentials.json"):  
  
* "useNostrum" - Change this to "false" if you do not want the module to use any Nostrums
* "useCCB" - Change this to "false" if you do not want the module to use any CCBs
* "nostrumTime" - When to use Nostrum (in minutes left)
* "CCBTime" - When to use Complete Crystal Bind (in minutes left)
* "dungeonOnly" - Change this to "true" if you want the items to be only used in dungeons
* "log" - If you need to find a specific item ID, change this to "true" and it will log the ID of any item you use in the proxy chat
* "nostrum" - This is the ID of the Nostrum item the module will use.
* "ccb" - This is the ID of the Nostrum item the module will use
  
While in game, open a proxy chat session by typing "/proxy" or "/8" in chat and hitting the space bar.  
This serves as the script's command interface.  
The following commands are supported:  
  
* **essentials** - enable/disable Essentials
* **essentials dungeon** - switch between using items everywhere or only in dungeons

## Safety
Whatever you send to the proxy chat in game is intercepted client-side. The chat is NOT sent to the server.  
The script makes sure that you are not dead, mounted, in a battleground or in a negotiation before using an item.  
The script will disable itself when you run out of items to use.

## Credits
Based on true-everful-nostrum by Pinkie Pie https://github.com/pinkipi  
Based on true-everful-nostrum by Caali https://github.com/caali-hackerman

## Changelog
<details>

### 2.3.0
* [~] Abnormality tracking now handled by tera-game-state
### 2.2.3
* [~] Minor definition update
### 2.2.2
* [-] Removed compatibility for patches <82
### 2.2.1
* [*] Fixed for patch 82
### 2.2.0
* [+] Added "nostrumTime" and "CCBTime" to config settings
### 2.1.1
* [*] Fixed wrong chat message for "dungeon" command
### 2.1.0
* [+] Added "dungeonOnly" option and "dungeon" command
### 2.0.5
* [~] Look and feel will now be the same on Caali's and Pinkie's proxy
### 2.0.4
* [-] Removed support for patch versions < 75
### 2.0.3
* [~] Cross compatibility for Caali's and Pinkie's proxy (no more branch)
### 2.0.2
* [~] Tracking of whether you are Elite/Tera-Club or not is now automated (no more configuration needed)
* [+] Running out of an Essentials item will now send you a notification and disable the module
### 2.0.1
* [*] Fixed CCB always being used on login
* [+] Added a branch for Pinkie Pie's tera-proxy
### 2.0.0
* [*] Fixed Nostrum items being used after every loading screen
* [*] Fixed missing abnormalities for some Crystalbind and Nostrum items
* [~] Changed Nostrum reapplication time from 10-25 minutes to less than 5 minutes
* [~] Code revamp
* [+] Added CCB reapplication time at less than 10 minutes instead of waiting until the buff runs out
* [+] Added "useNostrum" option (see Usage)
* [+] Added "useCCB" option (see Usage)
* [+] Added "log" option (see Usage)
### 1.3.10
* [*] Support for patch versions < 75
### 1.3.9
* [~] Definition update
### 1.3.8
* [*] Fixed a bug where reapplication intervals were not cleared on disconnect
### 1.3.7
* [*] Fixed non-elite Nostrum not properly applying (thx aurelius88)
* [~] Code changes due to Caali's recent tera-proxy updates
* [-] Removed support for Pinkie Pie's tera-proxy
### 1.3.6
* [+] Added option for using different CCB items to config file
* [+] Added option for using different non-elite nostrums to config file ("ELITE" has to be set to false to use these)
* [+] Added Phoenix mount revival invincibility check
* [*] Code optimizations
### 1.3.5
* [*] Fixed trying to use CCB when you are under the influence of the 1h CCB
### 1.3.4
* [+] Added option to use Prime Battle Solution instead of Everful Nostrum
* [*] More code cleanup
### 1.3.3
* [+] Now supports all regions
* [+] Rewrote code to use Caali's "tera-game-state" module in order to reduce overhead
* [+] Now supports auto-updating via Caali's tera-proxy
### 1.3.2
* [*] Updated hook versions for compatibility with the latest tera-proxy
### 1.3.1
* [*] Fixed an issue of Nostrum not being reapplied when ressurecting quickly with Grace/Vow
### 1.3.0
* [+] The random timer for Nostrum now waits for loading to be finished before it starts instead of being hardcoded
* [+] Will now wait until your Goddess Blessing buff ended before it uses Nostrum so you stay immune to damage
### 1.2.3
* [*] Using newer version of S_ABNORMALITY_BEGIN hook
### 1.2.2
* [*] Fixed trying to use CCB when players already have the new Elite CCB running
### 1.2.1
* [*] Full conversion to Pinkie Pie's command module
### 1.2.0
* [+] Added support for Pinkie Pie's command module which is now a requirement
* [+] Added randomized timers
* [-] Removed hiding messages and buff timer functions
### 1.1.0
* [+] Added !essentials command to toggle between "on" and "off" in non-whisper chats
### 1.0.0
* [~] Initial Release

</details>