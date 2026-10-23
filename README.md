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
Ending specials:

Jail escape game (continue after getting arrested), or quit run to avoid it:
Choosing to continue after the arrest starts a separate escape challenge instead of returning to the dealership. The player wakes up in a cell with a short number of in-game days before transfer. Each day has a few actions: observe guard routines, talk to inmates, search for useful items, or attempt part of the escape. Actions advance time and can raise suspicion, so repeating the safest option is not enough. Skills are repurposed for the challenge: Stealth lowers suspicion, Handiness turns found objects into tools, Networking reveals inmate help, Charisma can bluff guards, Expertise identifies patrol patterns, and Strength helps with physical obstacles. Getting caught during an escape attempt restarts that attempt from its checkpoint; reaching the outside ends the challenge. Choosing to quit instead abandons the current run as usual. The jail challenge does not use dealership money, cars, shipments, upgrades, or debt.

nothing

Switch game pacing to feel more stressful, add more responsibilities/things to do, change what skills do and change buyables:
This is a harder dealership ruleset, not just faster clock ticks. Shorten the workday and make time advance during more actions, then add a daily checklist alongside the existing one-car sales quota: handle customer appointments, prepare damaged trade-ins, receive scheduled shipments, and pay daily operating costs. Missed appointments lose reputation, unfinished repairs reduce the next day's buyer interest, and unpaid costs add debt. Give each day a clear morning planning phase and a closing-time deadline so the player has to choose what to leave undone. Rework skills to support these new tasks: Expertise speeds appraisal and repairs, Networking improves appointment and shipment quality, Handiness restores more condition, Charisma helps close difficult sales, Stealth creates risky ways to cut costs, and Strength expands capacity but raises operating costs. Replace or supplement the current buyables with staff, advertising, repair equipment, and security; make each cost money over time or take up a limited upgrade slot. Keep the same cars and basic sell/list flow, but make every day a tradeoff between sales, upkeep, and preparation.

Minimize game to be a smaller set of things to do, so it feels like a quick minigame. After all, you left for an easier job:
Replace the long dealership run with a short shift-based task that can be finished in a few minutes. Each shift gives the player a small queue of customer cars and a target: inspect a car, pick a fair price, and either sell it quickly or spend limited time repairing it for a better payout. Customers leave if kept waiting, and a poor price or rushed repair costs points, so the main choice is speed versus value. Remove day-long progression, debt, loans, shipments, stealing, garage expansion, and persistent upgrade shopping from this mode. Convert skills into simple per-shift assists rather than levels to grind: Charisma gives one price negotiation, Expertise shows a useful appraisal hint, Handiness makes one repair faster, Networking adds a customer, Stealth allows one risky shortcut, and Strength lets the player handle a larger vehicle. Score the shift on money earned, customers served, and mistakes; award a medal for meeting the target and let the player immediately start another shift.

nothing
nothing
nothing
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