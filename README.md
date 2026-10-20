// UZD - United Zeke Dollar
// each shipment has a random chance for cars
// you can set any price
// buy chance is based on charisma and car price
// shipments cost money
// when stealing, more expensive cars are more likely to get you caught

/*
STATS:

Charisma - People will buy cars for more expensive
Expertise - Tick rate increased for buying cars
Networking - Increase shipment size (1 Per)
Stealth - You can steal a car instead of buying shipments
Handiness - Buy and repair customer cars
Strength - Fit more cars in the garage (But slightly damage them)
*/

/*
SIDE EFFECTS:

Stealth - None
Handiness - Cars are slightly less damaged when stealing
Strength - Damage them slightly
Networking - Media critiques vehicles - Slightly less sell value
Expertise - None
Charisma - None
no quota d1-3
*/

/*
BUYABLES:
Garage Upgrade
Shipment of Cars
Garage Security
Clear a stealing strike for ℤ1,000
Skills - (Upgrade Stats)
*/

/*
ENDINGS:
You attempt to steal too many cars and get arrested. - Will (Handcuffs)
All your cars get stolen - if security is too low based on garage size - Will (Robber)
You get enough charisma, money, and sell enough cars to open your own dealership. - Will (Nameplate) / (Trophy)
You get enough extra skills to get a new job and quit! - Will (Car)
You get fired for not selling cars. - Zeke (Pink Slip)
Get a loan and don't pay it back. - Zeke (Loan)
Reject the loan. - Zeke (Broken Dollar Bill)
*/

/*
FEATURES:
Quota - for fired ending - 1 car a day 
10 Minute days
Pause when leaving tab (disable in settings)
Autosaves progress in browser storage
Settings menu with pause, Quit Run, and a double-confirmation current-run restart
Quit Run ends the current run without deleting its saved progress; Restart game clears the current run and tutorial status but keeps trophies and achievements
First-open and post-restart spotlight tutorial with a skip option
Achievements panel with persistent unlocks, including finding a Mythic, selling 10 cars in one day, and reaching level 10 in one skill
Version history available from the information button in the header
Top-right button textures can be added at assets/ui/settings.png, assets/ui/trophies.png, assets/ui/achievements.png, and assets/ui/info.png
Hover over skills to see what each one does
Garage sorting supports price, rarity, and durability in either direction
Debt reminder explains how to pay back a loan
Sleep button (end day; debt accrues interest overnight)
Increased chance to get robbed each night based on security and garage size (randomly selected car)
Secret rarity cars can be added to the secret car list with their own image asset
Damage when stealing cars
Buy shipment, next day you get it
Buy 1 a day MAX
*/

// 10 irl minute days
// 24 hour in game day
// 60 minute 
// update every 25 seconds

FAILURE RATES
L-   (0-10%)
L    (10-20%)
L+   (20-30%)
M-   (30-40%)
M    (40-50%)
M+   (50-60%)
H-   (60-70%)
H    (70-80%)
H+   (80-90%)
I    (90-100%)


ADDITIONS
-----------
=1 steal a day base 
=price doubles with rarity
=change skill point cost scaling
=LOAN if out of money
=fix scroll so just garage scrolls
=show shipment expected time (move cupboard up a little) - show "Shipment Done!" when its here; show day number and time when not done; in a black alarm-clock like box
=save system
=fix images (add new also)
=trophy case to show endings
=slow progression (lengthen endings)

tutorial - black circle