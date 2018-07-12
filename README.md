##### :heavy_exclamation_mark: Status :heavy_exclamation_mark:
Should work on all regions as long as the opcodes are mapped but I personally only test modules on NA with Caali's tera-proxy: https://discord.gg/maqBmJV  

##### :heavy_exclamation_mark: Installation for Caali's tera-proxy :heavy_exclamation_mark:
1) Download Essentials: https://github.com/TeraProxy/Essentials/archive/master.zip
2) Extract the contents of the zip file into "\tera-proxy\bin\node_modules\"
3) Done! (the module will auto-update when a new version is released)

##### :heavy_exclamation_mark: Installation for PinkiePie's tera-proxy :heavy_exclamation_mark:
1) Update your tera-data: https://github.com/meishuu/tera-data
2) Download Essentials: https://github.com/TeraProxy/Essentials/archive/master.zip
3) Download tera-game-state: https://github.com/hackerman-caali/tera-game-state/archive/master.zip
4) Extract the contents of both zip files into "\tera-proxy\bin\node_modules\"
5) Done!
6) Check back here once in a while for updates

If you enjoy my work and wish to support future development, feel free to drop me a small donation: [![Donate](https://www.paypalobjects.com/webstatic/en_US/i/buttons/PP_logo_h_100x26.png)](https://www.paypal.com/cgi-bin/webscr?cmd=_donations&business=A3KBZUCSEQ5RJ&lc=US&item_name=TeraProxy&curency_code=USD&no_note=1&no_shipping=1&currency_code=USD&bn=PP%2dDonationsBF%3abtn_donate_SM%2egif%3aNonHosted)

# Essentials
A tera-proxy module that automatically uses the items "Elite Everful Nostrum" and "Complete Crystal Bind" whenever needed.  

## Usage
If you don't have Elite/Club status, you can open up "config.json" and change "elite" from true to false in order to use Prime Battle Solution instead of Everful Nostrum.  
  
While in game, open a proxy chat session by typing "/proxy" or "/8" in chat and hitting the space bar.  
This serves as the script's command interface.  
The following commands are supported:  
  
* essentials - enable/disable Essentials

## Safety
Whatever you send to the proxy chat in game is intercepted client-side. The chat is NOT sent to the server.  
The script makes sure that you are not dead, mounted, in a battleground or in a negotiation before using an item.

## Credits
Contains code from true-everful-nostrum by Pinkie Pie https://github.com/pinkipi

## Changelog
<details>

### 1.3.5
* [*] Fixed trying to use CCB when you are under the influence of the 1h CCB
### 1.3.4
* [+] Added option to use Prime Battle Solution instead of Everful Nostrum
* [*] Fixed a weird case-sensitivity issue
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