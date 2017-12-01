# Essentials
A tera-proxy module that automatically uses the items "Elite Everful Nostrum" and "Complete Crystal Bind" whenever needed.  
  
## Usage  
If you are playing on a non-NA server, you need to replace "ITEMS_NOSTRUM" in "index.js" with the matching item id.  
  
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
* [*] Initial Release
