# Essentials
A tera-proxy module that automatically uses the items "Elite Everful Nostrum" and "Complete Crystal Bind" whenever needed.  
  
## Usage  
While ingame, open a whisper chat session with "!Essentials" by typing "/w !essentials" in chat and hitting the space bar.
This serves as the script's command interface. 
The following commands are supported:  
  
* on - Enables the script (default)  
* off - Disables the script  
  
Any other input returns a summary of above commands in the game.  
  
Alternative commands in all other chats:  
* !essentials - Toggles between "on" and "off" state  
  
Support for Pinkie Pie's command module:  
* /proxy afk - Toggles between "on" and "off" state  
  
## Safety
Whatever you send to "!Essentials" ingame is intercepted client-side. The chat is NOT sent to the server.  
The script makes sure that you are not dead, mounted, in a battleground or in a negotiation before using an item.  
  
## Credits  
Contains code from true-everful-nostrum by Pinkie Pie https://github.com/pinkipi  
  
## Changelog
### 1.2.0
* [+] Added support for Pinkie Pie's command module which is now a requirement
* [+] Added randomized timers
* [-] Removed hiding messages and buff timer functions
### 1.1.0
* [+] Added !essentials command to toggle between "on" and "off" in non-whisper chats
### 1.0.0
* [*] Initial Release