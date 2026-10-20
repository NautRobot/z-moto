import { cars, RARITY_WEIGHTS, secretCars } from './cars.js';

let balance = 100;
let owedBalance = 0;
let debtDay = -1;
let lastDebtReminderDay = -1;
let restartingGame = false;

let day = 1;
let hour = 8;
let baseShipmentSize = 2;
let shipmentPrice = 100; // UZD - United Zeke Dollar
let currentShipment = [];
let pendingShipments = [];
let nextCarId = 1;
let skillPoints = 0;
let sortBy = "price-asc";
let clockTimer;
let selectedRepairCar = null;
let theftsToday = 0;
let securityLevel = 0;
let garageExpansion = 0;
let skillPointPurchases = 0;
let skillResetPurchases = 0;
let sleepAvailableAt = 0;
let gameEnded = false;
let activeEndingKey = null;
let pagePaused = false;
let pauseWhenHidden = true;
let dailySales = 0;
let totalSales = 0;
let totalCaughtThefts = 0;
let pendingArrestEnding = false;
let sleepCooldownTimer;
let saleTimer;
let shipmentOrderedDay = null;
const seenEndings = new Set();
const unlockedTrophies = new Set();
const unlockedAchievements = new Set();
let tutorialStep = 0;

const skills = {
    charisma: 0,
    expertise: 0,
    networking: 0,
    stealth: 0,
    handiness: 0,
    strength: 0
};

const SKILL_DETAILS = [
    ["charisma", "Charisma", "Raises recommended prices and buyer willingness to pay."],
    ["expertise", "Expertise", "Makes time move faster. People attempt to buy more often."],
    ["networking", "Networking", "Adds one car to each shipment."],
    ["stealth", "Stealth", "Reduces theft risk and adds one daily attempt per level."],
    ["handiness", "Handiness", "Repairs more durability per level at a lower cost and reduces damage when stealing."],
    ["strength", "Strength", "Adds one garage space per level."]
];

const RISK_LEVELS = ["L-", "L", "L+", "M-", "M", "M+", "H-", "H", "H+", "I"];
const BASE_GARAGE_CAPACITY = 3;
const GOOD_ENDING_SALES = 16;
const GOOD_ENDING_FUNDS = 10000;
const QUIT_ENDING_SKILL_LEVELS = 10;
const ARREST_ENDING_CAUGHT = 3;
const DAILY_SALES_QUOTA = 1;
const SLEEP_COOLDOWN_MS = 30_000;
const GAME_HOUR_INTERVAL_MS = 10_000;
const EXPERTISE_INTERVAL_REDUCTION_MS = 2_000;
const MIN_GAME_HOUR_INTERVAL_MS = 5_000;
const SALE_CHECK_INTERVAL_MS = 3_000;
const EXPERTISE_SALE_INTERVAL_REDUCTION_MS = 500;
const MIN_SALE_CHECK_INTERVAL_MS = 1_000;
const SALE_TICK_CHANCE_FACTOR = 0.12;
const CAR_SALE_COOLDOWN_MS = 10_000;
const SAVE_KEY = "z-moto-save";
const TROPHY_KEY = "z-moto-trophies";
const ACHIEVEMENT_KEY = "z-moto-achievements";
const TUTORIAL_KEY = "z-moto-tutorial-complete";
const TROPHY_ENDINGS = new Set(["arrest", "bankrupt", "dealership", "fired", "quit", "robbed", "taxes"]);
const SAVE_VERSION = 1;
const TUTORIAL_STEPS = [
    {
        target: ".topBanner",
        title: "Your dashboard",
        description: "Keep an eye on the day, time, cash, and daily sales quota here. Click the gear for settings, the trophy for endings, the medal for achievements, or the info button to see version history."
    },
    {
        target: ".skills",
        title: "Train your skills",
        description: "Spend skill points to improve your abilities. Hover over a skill to see what it does."
    },
    {
        target: ".upgrades",
        title: "Buy upgrades",
        description: "Spend cash on skill points, garage space, security, and other buyables. Scroll this panel to see every option."
    },
    {
        target: ".actions",
        title: "Take action",
        description: "Order shipments for cars, unpack deliveries from the cupboard, or try stealing. Sleep to start the next day; nights can bring robberies and debt interest."
    },
    {
        target: ".garage",
        title: "Manage your garage",
        description: "Set car prices and wait for buyers. Click a car's image to repair it, and use the filters and sort menu to find cars."
    }
];
const ACHIEVEMENTS = [
    { id: "first-car", title: "First Wheels", description: "Get your first car into the garage.", condition: () => garage.length > 0 },
    { id: "mythic-car", title: "Get a Mythic", description: "Find and obtain a Mythic car.", condition: () => getOwnedCars().some(car => car.rarity === "Mythic") },
    { id: "secret-car", title: "The Secret Ride", description: "Get a Secret car.", condition: () => getOwnedCars().some(car => car.rarity === "Secret") },
    { id: "first-sale", title: "Closing Time", description: "Sell your first car.", condition: () => totalSales >= 1 },
    { id: "ten-sales", title: "Car Mogul", description: "Sell 10 cars.", condition: () => totalSales >= 10 },
    { id: "ten-daily-sales", title: "Sales Streak", description: "Sell 10 cars in one day.", condition: () => dailySales >= 10 },
    { id: "single-skill-ten", title: "Master of One", description: "Reach level 10 in a single skill.", condition: () => Object.values(skills).some(level => level >= 10) },
    { id: "skilled-dealer", title: "Skilled Dealer", description: "Reach level 5 in any skill.", condition: () => Object.values(skills).some(level => level >= 5) }
];

const RECOMMENDED_PRICES = {
    Common: 100,
    Uncommon: 200,
    Rare: 400,
    Epic: 800,
    Legendary: 1600,
    Mythic: 3200,
    Secret: 6400
};

const RARITY_BUYER_FACTORS = {
    Common: 1.15,
    Uncommon: 1.05,
    Rare: 0.95,
    Epic: 0.85,
    Legendary: 0.75,
    Mythic: 0.65,
    Secret: 0.55
};

const flatCarsList = [
    ...cars.flatMap(car => {
        return car.models.map(model => {
            let modelName = typeof model === "string" ? model : model.name;
            let rarityTier = (typeof model === "object" && model.rarity)
                ? model.rarity
                : car.defaultRarity;

            return {
                make: car.make,
                model: modelName,
                rarity: rarityTier,
                weight: RARITY_WEIGHTS[rarityTier] || 100
            };
        });
    }),
    ...secretCars.map(car => ({
        ...car,
        rarity: "Secret",
        weight: RARITY_WEIGHTS.Secret
    }))
];

const TOTAL_WEIGHT = flatCarsList.reduce((sum, item) => sum + item.weight, 0);

function getConditionMultiplier(durability) {
    const condition = Math.max(0, Math.min(100, durability)) / 100;
    return Math.max(1 / 64, Math.pow(condition, 2));
}

function calculateRecommendedPrice(car) {
    const basePrice = RECOMMENDED_PRICES[car.rarity] || RECOMMENDED_PRICES.Common;
    return Math.round(basePrice * (1 + skills.charisma * 0.1) * getConditionMultiplier(car.durability));
}

function createCar(make, model, rarity, image) {
    const car = { make, model, rarity, durability: 100, ...(image ? { image } : {}) };
    const recommendedPrice = calculateRecommendedPrice(car);

    return {
        id: nextCarId++,
        ...car,
        recommendedPrice,
        price: recommendedPrice
    };
}

let garage = [];

function addCarToGarage(car) {
    car.saleEligibleAt = Date.now() + CAR_SALE_COOLDOWN_MS;
    garage.push(car);
    checkAchievements();
}

function getOwnedCars() {
    return [
        ...garage,
        ...currentShipment,
        ...pendingShipments.flatMap(shipment => shipment.cars)
    ];
}

function getShipmentSize() {
    return baseShipmentSize + skills.networking;
}

function getGarageCapacity() {
    return BASE_GARAGE_CAPACITY + skills.strength + garageExpansion;
}

function getNightlyRobberyChance() {
    if (garage.length === 0) {
        return 0;
    }
    return Math.min(90, Math.max(0, 20 + garage.length * 10 - securityLevel * 5));
}

function getMaxSecurityLevel() {
    return 2 + getGarageCapacity();
}

function updateRecommendedPrices() {
    const allCars = [...garage, ...currentShipment, ...pendingShipments.flatMap(shipment => shipment.cars)];
    for (const car of allCars) {
        car.recommendedPrice = calculateRecommendedPrice(car);
    }
}

function updateCarDurability(car, durability) {
    const listingMarkup = car.price / Math.max(1, car.recommendedPrice);
    car.durability = Math.max(0, Math.min(100, durability));
    car.recommendedPrice = calculateRecommendedPrice(car);
    car.price = Math.max(0, Math.round(car.recommendedPrice * listingMarkup));
}

function getBuyerChance(car) {
    const listedPriceRatio = car.price / Math.max(1, car.recommendedPrice);
    if (listedPriceRatio > 3) {
        return 0;
    }

    const buyerPriceRatio = (1 + skills.charisma * 0.1) / Math.max(0.01, listedPriceRatio);
    const priceChance = 0.32 + skills.charisma * 0.04 + (buyerPriceRatio - 1) * 0.3;
    const conditionChance = getConditionMultiplier(car.durability);
    const rarityChance = RARITY_BUYER_FACTORS[car.rarity] || 0.75;
    const chancePerCheck = priceChance * conditionChance * rarityChance * SALE_TICK_CHANCE_FACTOR;
    return Math.max(0.005, Math.min(0.25, chancePerCheck));
}

function getRandomCar() {
    let randomNumber = Math.random() * TOTAL_WEIGHT;

    for (const car of flatCarsList) {
        if (randomNumber < car.weight) {
            return createCar(car.make, car.model, car.rarity, car.image);
        }
        randomNumber -= car.weight;
    }

    const fallbackCar = flatCarsList[0];
    return createCar(fallbackCar.make, fallbackCar.model, fallbackCar.rarity, fallbackCar.image);
}

function formatClock(time) {
    return `${String(time).padStart(2, "0")}:00`;
}

function formatMoney(amount) {
    return `ℤ${Math.round(amount).toLocaleString("en-US")}`;
}

function recordHistory(message) {
    const history = document.getElementById("history");
    const entry = document.createElement("p");
    entry.className = "history-entry";
    entry.textContent = `Day ${day} [${formatClock(hour)}] ${message}`;
    history.append(entry);
    history.scrollTop = history.scrollHeight;
    saveGame();
}

function getSaveState() {
    return {
        version: SAVE_VERSION,
        balance,
        owedBalance,
        debtDay,
        lastDebtReminderDay,
        day,
        hour,
        baseShipmentSize,
        shipmentPrice,
        currentShipment,
        pendingShipments,
        nextCarId,
        skillPoints,
        sortBy,
        theftsToday,
        securityLevel,
        garageExpansion,
        skillPointPurchases,
        skillResetPurchases,
        sleepAvailableAt,
        gameEnded,
        activeEndingKey,
        endingTitle: document.getElementById("ending-title").textContent,
        endingMessage: document.getElementById("ending-message").textContent,
        pauseWhenHidden,
        dailySales,
        totalSales,
        totalCaughtThefts,
        pendingArrestEnding,
        shipmentOrderedDay,
        garage,
        skills,
        seenEndings: [...seenEndings],
        history: [...document.querySelectorAll("#history .history-entry")].map(entry => entry.textContent)
    };
}

function setSaveStatus(message) {
    const status = document.getElementById("save-status");
    if (status) {
        status.textContent = message;
    }
}

function saveGame() {
    if (restartingGame) {
        return;
    }

    try {
        localStorage.setItem(SAVE_KEY, JSON.stringify(getSaveState()));
        setSaveStatus("Game saved automatically.");
    } catch (error) {
        setSaveStatus(`Could not save the game: ${error.message}`);
    }
}

function saveTrophies() {
    try {
        localStorage.setItem(TROPHY_KEY, JSON.stringify([...unlockedTrophies]));
    } catch (error) {
        setSaveStatus(`Could not save trophies: ${error.message}`);
    }
}

function loadTrophies() {
    try {
        const savedTrophies = localStorage.getItem(TROPHY_KEY);
        if (!savedTrophies) {
            return;
        }

        const parsedTrophies = JSON.parse(savedTrophies);
        if (Array.isArray(parsedTrophies)) {
            for (const ending of parsedTrophies) {
                if (TROPHY_ENDINGS.has(ending)) {
                    unlockedTrophies.add(ending);
                }
            }
        }
    } catch (error) {
        setSaveStatus(`Could not load trophies: ${error.message}`);
    }
}

function saveAchievements() {
    try {
        localStorage.setItem(ACHIEVEMENT_KEY, JSON.stringify([...unlockedAchievements]));
    } catch (error) {
        setSaveStatus(`Could not save achievements: ${error.message}`);
    }
}

function loadAchievements() {
    try {
        const savedAchievements = localStorage.getItem(ACHIEVEMENT_KEY);
        if (!savedAchievements) {
            return;
        }

        const parsedAchievements = JSON.parse(savedAchievements);
        if (Array.isArray(parsedAchievements)) {
            for (const achievement of parsedAchievements) {
                if (ACHIEVEMENTS.some(item => item.id === achievement)) {
                    unlockedAchievements.add(achievement);
                }
            }
        }
    } catch (error) {
        setSaveStatus(`Could not load achievements: ${error.message}`);
    }
}

function loadGame() {
    let savedState;
    try {
        const savedGame = localStorage.getItem(SAVE_KEY);
        if (!savedGame) {
            setSaveStatus("Autosave is on. No previous save found.");
            return;
        }

        savedState = JSON.parse(savedGame);
    } catch (error) {
        setSaveStatus(`Could not load the saved game: ${error.message}`);
        return;
    }

    const numericFields = [
        "balance", "owedBalance", "debtDay", "lastDebtReminderDay", "day", "hour",
        "baseShipmentSize", "shipmentPrice", "nextCarId", "skillPoints", "theftsToday",
        "securityLevel", "garageExpansion", "skillPointPurchases", "sleepAvailableAt",
        "dailySales", "totalSales", "totalCaughtThefts"
    ];
    if (!savedState || typeof savedState !== "object" || savedState.version !== SAVE_VERSION ||
        numericFields.some(field => !Number.isFinite(savedState[field])) ||
        typeof savedState.gameEnded !== "boolean" ||
        typeof savedState.pauseWhenHidden !== "boolean" ||
        typeof savedState.pendingArrestEnding !== "boolean" ||
        (savedState.activeEndingKey !== null && typeof savedState.activeEndingKey !== "string") ||
        typeof savedState.endingTitle !== "string" ||
        typeof savedState.endingMessage !== "string" ||
        (savedState.skillResetPurchases !== undefined && !Number.isFinite(savedState.skillResetPurchases)) ||
        (savedState.premiumSkillPointPurchases !== undefined && !Number.isFinite(savedState.premiumSkillPointPurchases)) ||
        (savedState.shipmentOrderedDay !== null && !Number.isFinite(savedState.shipmentOrderedDay)) ||
        !["price-asc", "price-desc", "name-asc", "name-desc"].includes(savedState.sortBy) ||
        !Array.isArray(savedState.garage) ||
        !Array.isArray(savedState.currentShipment) ||
        !Array.isArray(savedState.pendingShipments) ||
        !Array.isArray(savedState.seenEndings) ||
        !savedState.skills || typeof savedState.skills !== "object" ||
        !Object.keys(skills).every(key => Number.isFinite(savedState.skills[key])) ||
        !Array.isArray(savedState.history) ||
        !savedState.history.every(entry => typeof entry === "string") ||
        !savedState.seenEndings.every(ending => typeof ending === "string") ||
        !savedState.garage.every(isSavedCar) ||
        !savedState.currentShipment.every(isSavedCar) ||
        !savedState.pendingShipments.every(shipment =>
            shipment && Number.isFinite(shipment.arrivalDay) &&
            Number.isFinite(shipment.arrivalHour) &&
            Array.isArray(shipment.cars) && shipment.cars.every(isSavedCar))) {
        setSaveStatus("The saved game is invalid or from an unsupported version.");
        return;
    }

    balance = savedState.balance;
    owedBalance = savedState.owedBalance;
    debtDay = savedState.debtDay;
    lastDebtReminderDay = savedState.lastDebtReminderDay;
    day = savedState.day;
    hour = savedState.hour;
    baseShipmentSize = savedState.baseShipmentSize;
    shipmentPrice = savedState.shipmentPrice;
    currentShipment = savedState.currentShipment;
    pendingShipments = savedState.pendingShipments;
    nextCarId = savedState.nextCarId;
    skillPoints = savedState.skillPoints;
    sortBy = savedState.sortBy;
    theftsToday = savedState.theftsToday;
    securityLevel = savedState.securityLevel;
    garageExpansion = savedState.garageExpansion;
    skillPointPurchases = savedState.skillPointPurchases;
    skillResetPurchases = savedState.skillResetPurchases ?? savedState.premiumSkillPointPurchases ?? 0;
    sleepAvailableAt = savedState.sleepAvailableAt;
    gameEnded = savedState.gameEnded;
    activeEndingKey = savedState.activeEndingKey;
    document.getElementById("ending-title").textContent = savedState.endingTitle || "";
    document.getElementById("ending-message").textContent = savedState.endingMessage || "";
    pauseWhenHidden = savedState.pauseWhenHidden;
    dailySales = savedState.dailySales;
    totalSales = savedState.totalSales;
    totalCaughtThefts = savedState.totalCaughtThefts;
    pendingArrestEnding = savedState.pendingArrestEnding;
    shipmentOrderedDay = savedState.shipmentOrderedDay;
    garage = savedState.garage;
    for (const key of Object.keys(skills)) {
        skills[key] = savedState.skills[key];
    }
    seenEndings.clear();
    for (const ending of savedState.seenEndings) {
        seenEndings.add(ending);
    }
    let migratedTrophy = false;
    for (const ending of seenEndings) {
        if (TROPHY_ENDINGS.has(ending) && !unlockedTrophies.has(ending)) {
            unlockedTrophies.add(ending);
            migratedTrophy = true;
        }
    }
    if (migratedTrophy) {
        saveTrophies();
    }

    const history = document.getElementById("history");
    history.replaceChildren();
    for (const entryText of savedState.history) {
        const entry = document.createElement("p");
        entry.className = "history-entry";
        entry.textContent = entryText;
        history.append(entry);
    }
    setSaveStatus("Saved game loaded.");
}

function isSavedCar(car) {
    return car && typeof car === "object" &&
        typeof car.make === "string" &&
        typeof car.model === "string" &&
        typeof car.rarity === "string" &&
        Number.isFinite(car.durability) &&
        (car.saleEligibleAt === undefined || Number.isFinite(car.saleEligibleAt)) &&
        Number.isFinite(car.recommendedPrice) &&
        Number.isFinite(car.price) &&
        Number.isFinite(car.id);
}

function updateTrophyDisplay() {
    for (const trophy of document.querySelectorAll(".trophy-card")) {
        const unlocked = unlockedTrophies.has(trophy.dataset.ending);
        trophy.classList.toggle("unlocked", unlocked);
        trophy.querySelector("h3").textContent = unlocked ? trophy.querySelector("h3").dataset.title : "???";
        trophy.querySelector(".trophy-item").hidden = !unlocked;
        trophy.querySelector(".trophy-status").textContent = unlocked ? "Unlocked" : "Locked";
    }
}

function checkAchievements() {
    let unlockedNewAchievement = false;
    for (const achievement of ACHIEVEMENTS) {
        if (!unlockedAchievements.has(achievement.id) && achievement.condition()) {
            unlockedAchievements.add(achievement.id);
            unlockedNewAchievement = true;
        }
    }

    if (unlockedNewAchievement) {
        saveAchievements();
    }
    if (document.getElementById("achievements-dialog").open) {
        renderAchievements();
    }
}

function renderAchievements() {
    const list = document.getElementById("achievement-list");
    list.replaceChildren();
    for (const achievement of ACHIEVEMENTS) {
        const unlocked = unlockedAchievements.has(achievement.id);
        const card = document.createElement("article");
        card.className = `achievement-card${unlocked ? " unlocked" : ""}`;

        const title = document.createElement("h3");
        title.textContent = achievement.title;
        const description = document.createElement("p");
        description.textContent = achievement.description;
        const status = document.createElement("span");
        status.className = "achievement-status";
        status.textContent = unlocked ? "Unlocked" : "Locked";
        card.append(title, description, status);
        list.append(card);
    }
}

function openAchievements() {
    checkAchievements();
    renderAchievements();
    document.getElementById("achievements-dialog").showModal();
}

function openTrophyCase() {
    updateTrophyDisplay();
    document.getElementById("trophy-dialog").showModal();
}

function endGame(key, title, message) {
    if (gameEnded) {
        return;
    }

    if(key == "taxes") {
        document.getElementById("ending-continue").style = "display: none;";
    }

    gameEnded = true;
    activeEndingKey = key;
    seenEndings.add(key);
    if (TROPHY_ENDINGS.has(key)) {
        unlockedTrophies.add(key);
        saveTrophies();
    }
    updateTrophyDisplay();
    clearInterval(clockTimer);
    clearInterval(sleepCooldownTimer);
    clearInterval(saleTimer);
    document.getElementById("ending-title").textContent = title;
    document.getElementById("ending-message").textContent = message;
    document.getElementById("ending-dialog").showModal();
    updateSleepButton();
    updateStealButton();
    saveGame();
}

function continueAfterEnding() {
    if (!activeEndingKey) {
        return;
    }

    seenEndings.add(activeEndingKey);
    if (activeEndingKey === "fired") {
        day++;
        hour = 8;
        dailySales = 0;
        theftsToday = 0;
        recordHistory("You chose to continue after being fired.");
    }

    activeEndingKey = null;
    gameEnded = false;
    document.getElementById("ending-dialog").close();
    startGameTimers();
    updateAll();
    updateStealButton();
    updateSleepButton();
}

function restartGame() {
    if (!window.confirm("Restart the game and delete your saved progress?")) {
        return;
    }

    restartingGame = true;
    try {
        localStorage.removeItem(TUTORIAL_KEY);
        localStorage.removeItem(SAVE_KEY);
    } catch (error) {
        restartingGame = false;
        setSaveStatus(`Could not restart the game: ${error.message}`);
        return;
    }
    window.location.reload();
}

function bankruptEnding() {
    endGame("bankrupt", "Bankrupt!", "After rejecting the IRS, the police found you. Your dealership has been seized.");
}

function acceptLoan() {
    document.getElementById("excl").style = "display: block; color: red;";
    recordHistory(`Went bankrupt.`);
    document.getElementById("bankrupt-title").textContent = "";
    document.getElementById("bankrupt-message").textContent = ``;
    document.getElementById("bankrupt-dialog").close();
    balance = 100;
    owedBalance = 200;
    debtDay = day;
    lastDebtReminderDay = -1;
    window.debtDay = debtDay;
    updateAll();
}

function clearStealingStrike() {
    const cost = 1000;
    if (balance < cost || totalCaughtThefts <= 0) {
        return;
    }

    balance -= cost;
    totalCaughtThefts--;
    recordHistory(`Paid ${formatMoney(cost)} to remove one caught theft from your record.`);
    updateAll();
}

function checkProgressEndings() {
    const skillLevels = Object.values(skills).reduce((total, level) => total + level, 0);
    if (!seenEndings.has("quit") && skillLevels >= QUIT_ENDING_SKILL_LEVELS) {
        endGame("quit", "A fresh start", "Your skills opened the door to a better job. You leave the dealership behind.");
        return true;
    }

    if (!seenEndings.has("dealership") && totalSales >= GOOD_ENDING_SALES && balance >= GOOD_ENDING_FUNDS) {
        endGame("dealership", "Your own dealership", `You sold ${totalSales} cars and saved ${formatMoney(balance)}. The dealership is yours.`);
        return true;
    }

    return false;
}

function getSalePayout(car) {
    const mediaPenalty = Math.max(0.5, 1 - skills.networking * 0.02);
    return Math.round(car.price * mediaPenalty);
}

function processCarSales() {
    if (gameEnded || document.querySelector("dialog[open]")) {
        return;
    }

    let soldAny = false;

    for (let i = garage.length - 1; i >= 0; i--) {
        const car = garage[i];
        if (Date.now() < (car.saleEligibleAt ?? 0)) {
            continue;
        }

        if (Math.random() < getBuyerChance(car)) {
            garage.splice(i, 1);
            const payout = getSalePayout(car);
            balance += payout;
            dailySales++;
            totalSales++;
            soldAny = true;
            checkAchievements();
            recordHistory(`Sold ${car.make} ${car.model} for ${formatMoney(payout)}.`);

            if (checkProgressEndings()) {
                break;
            }
        }
    }

    if (soldAny) {
        renderGarage();
        updateAll();
    }
}

function updateAll() {
    balance = Math.round(balance);
    checkAchievements();
    document.getElementById("dayCount").textContent = day;
    document.getElementById("hours").textContent = String(hour).padStart(2, "0");
    document.getElementById("z-dols").textContent = balance;
    document.getElementById("quota-status").textContent = day <= 3
        ? "None (Days 1-3)"
        : `${dailySales}/${DAILY_SALES_QUOTA}`;
    if (owedBalance > 0) {
        document.getElementById("debt").style = "display: block; color: red;";
        document.getElementById("debt").textContent = "Debt: " + formatMoney(owedBalance);
    } else {
        document.getElementById("debt").style.display = "none";
        document.getElementById("excl").style.display = "none";
    }
    updateSleepButton();
    renderBuyables();
    updateDebtStatus();
    checkBankruptcy();
    for (let i = pendingShipments.length - 1; i >= 0; i--) {
        let shipment = pendingShipments[i];

        if (day > shipment.arrivalDay || (day === shipment.arrivalDay && hour >= shipment.arrivalHour)) {
            if (currentShipment.length + shipment.cars.length <= 5 * getShipmentSize()) {
                for (const car of shipment.cars) {
                    const deliveryDamage = Math.floor(Math.random() * 21);
                    updateCarDurability(car, car.durability - deliveryDamage);
                }
                currentShipment.push(...shipment.cars);
                pendingShipments.splice(i, 1);
                recordHistory(`Shipment arrived. ${shipment.cars.length} cars are ready in the cupboard; delivery damage may be up to 20%.`);
            }
        }
    }

    updateShipTime();
    saveGame();
}

function updateShipTime() {
    const shipmentTime = document.getElementById("shipmentTime");
    const nextShipment = pendingShipments[0];
    shipmentTime.textContent = nextShipment
        ? `Day: ${nextShipment.arrivalDay}; Time: ${formatClock(nextShipment.arrivalHour)}`
        : currentShipment.length > 0
            ? "Shipment Done."
            : "No Shipment.";
}

function checkBankruptcy() {
    if (balance < shipmentPrice && garage.length <= 0 
            && pendingShipments.length <= 0 && currentShipment.length <= 0
                && theftsToday >= (1 + skills.stealth) && owedBalance == 0) {
        recordHistory(`Went bankrupt.`);
        document.getElementById("bankrupt-title").textContent = "Bankrupt!";
        document.getElementById("bankrupt-message").textContent = `You're out of money!`;
        document.getElementById("bankrupt-dialog").showModal();
    }

}

function updateDebtStatus() {
    if (owedBalance <= 0 || debtDay < 0) {
        return;
    }

    if (day >= debtDay + 7) {
        endGame("taxes", "IRS!", "The IRS caught you. You had a week.");
        return;
    }

    if (lastDebtReminderDay === day || document.querySelector("dialog[open]")) {
        return;
    }

    lastDebtReminderDay = day;
    document.getElementById("debt-reminder-message").textContent =
        `You owe ${formatMoney(owedBalance)}. Click the red Debt button in the top bar when you have enough cash to pay it off. If you cannot afford the full amount, the debt increases. Pay it within 7 days to avoid the IRS getting you.`;
    document.getElementById("debt-reminder-dialog").showModal();
}

function populateShipment() {
    const shipmentCount = getShipmentSize();
    const shipmentCapacity = 5 * shipmentCount;

    if (shipmentOrderedDay === day) {
        recordHistory("You have already ordered a shipment today.");
        return;
    }

    if (currentShipment.length + shipmentCount > shipmentCapacity) {
        alert("Where do I put it Zeke? (Store cars in the garage to make room.)");
        return;
    }

    if (balance < shipmentPrice) {
        alert("You're a little short, Zeke.. (Get more money!)");
        return;
    }

    if (pendingShipments.length > 0) {
        alert("Hey Zeke, you can't order more yet.");
        return;
    }

    balance -= shipmentPrice;
    shipmentOrderedDay = day;

    const orderedCars = Array.from({ length: shipmentCount }, () => getRandomCar());

    pendingShipments.push({
        arrivalDay: day + 1,
        arrivalHour: 8,
        cars: orderedCars
    });

    recordHistory(`Shipment ordered. Expected Day ${day + 1} [08:00].`);
    updateAll();
}

function unpackCar() {
    if (currentShipment.length === 0) {
        recordHistory(pendingShipments.length > 0
            ? "The shipment is still on its way."
            : "The cupboard is empty.");
        return;
    }

    if (garage.length >= getGarageCapacity()) {
        recordHistory("The garage is full. Upgrade Strength to make room.");
        return;
    }

    const randomIndex = Math.floor(Math.random() * currentShipment.length);
    const [car] = currentShipment.splice(randomIndex, 1);
    updateShipTime();
    updateCarDurability(car, 10 + Math.max(30, car.durability - skills.strength * 2));
    addCarToGarage(car);
    recordHistory(`${car.make} ${car.model} was added to the garage.`);
    renderGarage();
}

function getRepairPlan(car) {
    const amount = Math.min(100 - car.durability, 10 + skills.handiness * 7.5);
    const baseCost = Math.ceil(amount / 10) * 5;
    return {
        amount,
        cost: Math.max(1, Math.ceil(baseCost * Math.pow(0.85, skills.handiness)))
    };
}

function openRepairDialog(car) {
    selectedRepairCar = car;
    const repair = getRepairPlan(car);
    const message = document.getElementById("repair-message");
    const confirmButton = document.getElementById("repair-confirm");

    if (repair.amount === 0) {
        message.textContent = `${car.make} ${car.model} is already fully repaired.`;
        confirmButton.disabled = true;
    } else {
        message.textContent = `Repair ${car.make} ${car.model}? Cost: ${formatMoney(repair.cost)}. Restores ${repair.amount}% durability.`;
        confirmButton.disabled = balance < repair.cost;
        if (balance < repair.cost) {
            message.textContent += ` You have ${formatMoney(balance)}.`;
        }
    }

    document.getElementById("repair-dialog").showModal();
}

function confirmRepair() {
    if (!selectedRepairCar) {
        return;
    }

    const repair = getRepairPlan(selectedRepairCar);
    if (repair.amount === 0 || balance < repair.cost) {
        return;
    }

    balance -= repair.cost;
    updateCarDurability(selectedRepairCar, selectedRepairCar.durability + repair.amount);
    recordHistory(`${selectedRepairCar.make} ${selectedRepairCar.model} repaired by ${repair.amount}% for ${formatMoney(repair.cost)}.`);
    document.getElementById("repair-dialog").close();
    selectedRepairCar = null;
    updateAll();
    renderGarage();
}

function closeRepairDialog() {
    document.getElementById("repair-dialog").close();
    selectedRepairCar = null;
}

function getCarImagePath(car) {
    if (car.image) {
        return `assets/raw_cars/${car.image}`;
    }

    const imageName = `${car.make} ${car.model}`
        .toLowerCase()
        .replace(/[^a-z0-9.]+/g, "_")
        .replace(/^_|_$/g, "");
    return `assets/raw_cars/${imageName}.jpg`;
}

function updateGarageFilters() {
    const makeFilter = document.getElementById("garage-make-filter");
    const modelFilter = document.getElementById("garage-model-filter");
    const selectedMake = makeFilter.value;
    const selectedModel = modelFilter.value;
    const makes = [...new Set(garage.map(car => car.make))].sort((a, b) => a.localeCompare(b));

    makeFilter.replaceChildren(new Option("All makes", ""));
    for (const make of makes) {
        makeFilter.add(new Option(make, make));
    }
    makeFilter.value = makes.includes(selectedMake) ? selectedMake : "";

    const models = [...new Set(garage
        .filter(car => !makeFilter.value || car.make === makeFilter.value)
        .map(car => car.model))]
        .sort((a, b) => a.localeCompare(b));

    modelFilter.replaceChildren(new Option("All models", ""));
    for (const model of models) {
        modelFilter.add(new Option(model, model));
    }
    modelFilter.value = models.includes(selectedModel) ? selectedModel : "";
}

function renderGarage() {
    updateGarageFilters();

    const garageList = document.getElementById("garage-list");
    const template = document.getElementById("car-template");
    const make = document.getElementById("garage-make-filter").value;
    const model = document.getElementById("garage-model-filter").value;
    const visibleCars = garage.filter(car =>
        (!make || car.make === make) && (!model || car.model === model)
    );
    const compareNames = (first, second) =>
        `${first.make} ${first.model}`.localeCompare(`${second.make} ${second.model}`, undefined, { sensitivity: "base" });

    if (sortBy === "price-asc") {
        visibleCars.sort((first, second) => first.price - second.price || compareNames(first, second));
    } else if (sortBy === "price-desc") {
        visibleCars.sort((first, second) => second.price - first.price || compareNames(first, second));
    } else if (sortBy === "name-asc") {
        visibleCars.sort(compareNames);
    } else if (sortBy === "name-desc") {
        visibleCars.sort((first, second) => compareNames(second, first));
    }

    garageList.replaceChildren();

    if (visibleCars.length === 0) {
        const emptyMessage = document.createElement("p");
        emptyMessage.className = "garage-empty";
        emptyMessage.textContent = garage.length === 0
            ? "No cars in the garage yet."
            : "No cars match these filters.";
        garageList.append(emptyMessage);
        return;
    }

    for (const car of visibleCars) {
        const carDisplay = template.content.firstElementChild.cloneNode(true);
        const image = carDisplay.querySelector(".car-image");
        const imageButton = carDisplay.querySelector(".car-image-action");
        const repairHint = carDisplay.querySelector(".repair-hint");
        const priceInput = carDisplay.querySelector(".car-price-input");

        image.src = getCarImagePath(car);
        image.alt = `${car.make} ${car.model}`;
        image.addEventListener("error", () => {
            image.hidden = true;
        }, { once: true });
        carDisplay.querySelector(".car-name").textContent = `${car.make} ${car.model}`;
        carDisplay.querySelector(".car-rarity").textContent = car.rarity;
        carDisplay.querySelector(".car-stat span").textContent = `${car.durability}%`;
        carDisplay.querySelector(".car-price span").textContent = formatMoney(car.price);
        carDisplay.querySelector(".car-recommended-price span").textContent = formatMoney(car.recommendedPrice);
        const repair = getRepairPlan(car);
        repairHint.textContent = repair.amount > 0
            ? `Click image to repair · ${formatMoney(repair.cost)} · +${repair.amount}%`
            : "Fully repaired";
        imageButton.addEventListener("click", () => openRepairDialog(car));
        priceInput.value = car.price;
        carDisplay.querySelector(".car-pricing button").addEventListener("click", () => {
            if (!priceInput.value || !priceInput.reportValidity()) {
                priceInput.focus();
                return;
            }

            car.price = Number(priceInput.value);
            recordHistory(`${car.make} ${car.model} listed for ${formatMoney(car.price)}.`);
            renderGarage();
        });
        garageList.append(carDisplay);
    }
}

function advanceTime() {
    if (gameEnded || document.querySelector("dialog[open]")) {
        return;
    }

    if (hour === 7) {
        advanceToMorning();
    } else {
        hour = (hour + 1) % 24;
    }
    updateAll();
}

function sleepUntilMorning() {
    if (gameEnded || Date.now() < sleepAvailableAt) {
        updateSleepButton();
        return;
    }

    sleepAvailableAt = Date.now() + SLEEP_COOLDOWN_MS;
    advanceToMorning();
    updateSleepButton();
    updateAll();
}

function advanceToMorning() {
    if (gameEnded) {
        return;
    }

    if (owedBalance > 0) {
        owedBalance *= 1.1;
    }

    resolveNightRobbery();
    if (gameEnded) {
        return;
    }

    if (day >= 4 && dailySales < DAILY_SALES_QUOTA) {
        endGame("fired", "You were fired", `You missed the daily quota of ${DAILY_SALES_QUOTA} car. The dealership let you go.`);
        return;
    }

    day++;
    hour = 8;
    theftsToday = 0;
    dailySales = 0;
    recordHistory("A new day begins at 08:00.");
    updateStealButton();
    updateAll();
}

function updateSleepButton() {
    const sleepButton = document.getElementById("sleepButton");
    if (!sleepButton) {
        return;
    }

    const secondsRemaining = Math.max(0, Math.ceil((sleepAvailableAt - Date.now()) / 1000));
    sleepButton.disabled = gameEnded || secondsRemaining > 0;
    sleepButton.textContent = secondsRemaining > 0 ? `Sleep (${secondsRemaining}s)` : "Sleep";
}

function resolveNightRobbery() {
    if (garage.length === 0 || Math.random() * 100 >= getNightlyRobberyChance()) {
        return;
    }

    const stolenIndex = Math.floor(Math.random() * garage.length);
    const [stolenCar] = garage.splice(stolenIndex, 1);
    recordHistory(`Overnight robbery! Your ${stolenCar.make} ${stolenCar.model} was stolen.`);
    renderGarage();
    if (garage.length === 0 && !seenEndings.has("robbed")) {
        endGame("robbed", "Your cars were stolen", "A thief took the last car in your garage. There is nothing left to sell.");
    }
}

function skipTime() {
    advanceTime();
}

function skipDay() {
    day++;
}

function renderSkills() {
    const skillList = document.getElementById("skill-list");
    document.getElementById("skillPoints").textContent = skillPoints;
    skillList.replaceChildren();

    for (const [key, name, description] of SKILL_DETAILS) {
        const row = document.createElement("div");
        row.className = "skill-row";

        const label = document.createElement("span");
        label.className = "skill-name";
        label.textContent = `${name} ${skills[key]}`;
        row.title = description;

        const upgradeButton = document.createElement("button");
        upgradeButton.className = "skill-upgrade";
        upgradeButton.type = "button";
        upgradeButton.textContent = "+";
        upgradeButton.title = `Upgrade ${name}`;
        upgradeButton.setAttribute("aria-label", `Upgrade ${name}`);
        upgradeButton.disabled = skillPoints < 1;
        upgradeButton.addEventListener("click", () => upgradeSkill(key, name));

        const controls = document.createElement("div");
        controls.className = "skill-controls";
        controls.append(upgradeButton);
        row.append(label, controls);
        skillList.append(row);
    }
}

function upgradeSkill(key, name) {
    if (skillPoints < 1) {
        return;
    }

    skillPoints--;
    skills[key]++;
    checkAchievements();
    updateRecommendedPrices();
    renderSkills();
    renderGarage();
    updateStealButton();
    resetClockTimer();
    resetSaleTimer();
    recordHistory(`${name} increased to level ${skills[key]}.`);
    checkProgressEndings();
}

function getSkillPointCost() {
    return Math.round(50 * Math.pow(1.32, skillPointPurchases));
}

function getSkillResetCost() {
    return 1000 * Math.pow(2, skillResetPurchases);
}

function getAllocatedSkillPoints() {
    return Object.values(skills).reduce((total, level) => total + level, 0);
}

function getGarageExpansionCost() {
    return Math.round(100 * Math.pow(4.3, garageExpansion / 2));
}

function getSecurityUpgradeCost() {
    return Math.round(50 * Math.pow(2.63, securityLevel));
}

function createBuyable(name, description, cost, action) {
    const row = document.createElement("div");
    row.className = "buyable-row";

    const details = document.createElement("div");
    details.className = "buyable-details";
    const title = document.createElement("strong");
    title.textContent = name;
    const detail = document.createElement("span");
    detail.textContent = description;
    details.append(title, detail);

    const button = document.createElement("button");
    button.type = "button";
    button.textContent = formatMoney(cost);
    button.disabled = balance < cost;
    button.addEventListener("click", action);
    row.append(details, button);
    return row;
}

function renderBuyables() {
    const list = document.getElementById("buyables-list");
    if (!list) {
        return;
    }

    const securityChance = getNightlyRobberyChance();
    document.getElementById("security-status").textContent =
        `Security level ${securityLevel} · ${securityChance}% nightly robbery chance`;
    const securityCost = getSecurityUpgradeCost();
    const securityBuyable = createBuyable(
        "Security upgrade",
        `Level ${securityLevel} · lowers robbery risk`,
        securityCost,
        buySecurity
    );
    securityBuyable.querySelector("button").disabled = balance < securityCost || securityLevel >= getMaxSecurityLevel();
    const clearStrikeBuyable = createBuyable(
        "Clear a stealing strike",
        `Remove one caught theft from your record · ${totalCaughtThefts} on record`,
        1000,
        clearStealingStrike
    );
    clearStrikeBuyable.querySelector("button").disabled = balance < 1000 || totalCaughtThefts === 0;
    const skillResetCost = getSkillResetCost();
    const skillResetBuyable = createBuyable(
        "Reset skill points",
        "Refund spent points to reallocate; cost doubles each reset",
        skillResetCost,
        resetSkillPoints
    );
    skillResetBuyable.querySelector("button").disabled = balance < skillResetCost || getAllocatedSkillPoints() === 0;

    list.replaceChildren(
        createBuyable("Skill point", `${skillPoints} available`, getSkillPointCost(), buySkillPoint),
        skillResetBuyable,
        createBuyable("Garage expansion", `+2 spaces · ${getGarageCapacity()} total`, getGarageExpansionCost(), buyGarageExpansion),
        securityBuyable,
        clearStrikeBuyable
    );
}

function buySkillPoint() {
    const cost = getSkillPointCost();
    if (balance < cost) {
        return;
    }

    balance -= cost;
    skillPoints++;
    skillPointPurchases++;
    recordHistory(`Bought 1 skill point for ${formatMoney(cost)}.`);
    renderSkills();
    updateAll();
}

function resetSkillPoints() {
    const cost = getSkillResetCost();
    const refundedPoints = getAllocatedSkillPoints();
    if (balance < cost || refundedPoints === 0) {
        return;
    }

    balance -= cost;
    skillPoints += refundedPoints;
    for (const key of Object.keys(skills)) {
        skills[key] = 0;
    }
    skillResetPurchases++;
    updateRecommendedPrices();
    renderSkills();
    renderGarage();
    updateStealButton();
    resetClockTimer();
    resetSaleTimer();
    recordHistory(`Reset skills and refunded ${refundedPoints} skill points for ${formatMoney(cost)}.`);
    updateAll();
}

function buyGarageExpansion() {
    const cost = getGarageExpansionCost();
    if (balance < cost) {
        return;
    }

    balance -= cost;
    garageExpansion += 2;
    recordHistory(`Garage expanded. Capacity is now ${getGarageCapacity()}.`);
    updateAll();
}

function buySecurity() {
    const cost = getSecurityUpgradeCost();
    if (balance < cost || securityLevel >= getMaxSecurityLevel()) {
        return;
    }

    balance -= cost;
    securityLevel++;
    recordHistory(`Security upgraded to level ${securityLevel}. Nightly robbery chance is now ${getNightlyRobberyChance()}%.`);
    updateAll();
}

function getRiskDetails(car) {
    const priceRisk = 12 + Math.log2(Math.max(1, car.recommendedPrice / 100)) * 16;
    const chance = Math.floor(Math.max(8, priceRisk * Math.pow(3/4, skills.stealth)));//Math.max(1, Math.min(95, Math.round(priceRisk - skills.stealth * 8)));
    const bandIndex = Math.min(9, Math.floor(chance / 10));

    return {
        chance,
        level: RISK_LEVELS[bandIndex],
        range: `${bandIndex * 10}-${(bandIndex + 1) * 10}%`
    };
}

function payDebt() {
    if (owedBalance > 0 && balance >= owedBalance) {
        balance -= owedBalance;
        owedBalance = 0;
        debtDay = -1;
        window.debtDay = debtDay;
    } else if (owedBalance > 0) {
        alert("Not enough money!");
        owedBalance *= 1.5;
    }

    updateAll();
}

function getRandomTheftCandidates(count) {
    const availableCars = [...flatCarsList];
    const candidates = [];

    while (candidates.length < count && availableCars.length > 0) {
        const totalWeight = availableCars.reduce((total, car) => total + car.weight, 0);
        let randomNumber = Math.random() * totalWeight;
        let selectedIndex = availableCars.length - 1;

        for (let i = 0; i < availableCars.length; i++) {
            if (randomNumber < availableCars[i].weight) {
                selectedIndex = i;
                break;
            }
            randomNumber -= availableCars[i].weight;
        }

        const [selected] = availableCars.splice(selectedIndex, 1);
        candidates.push(createCar(selected.make, selected.model, selected.rarity, selected.image));
    }

    return candidates;
}

function getDailyTheftLimit() {
    return 1 + skills.stealth;
}

function updateStealButton() {
    const stealButton = document.getElementById("stealButton");
    const attemptsLeft = Math.max(0, getDailyTheftLimit() - theftsToday);
    stealButton.textContent = `Steal (${attemptsLeft} left)`;
    stealButton.disabled = attemptsLeft === 0;
}

function openTheftPicker() {
    if (theftsToday >= getDailyTheftLimit()) {
        recordHistory("You have used all your theft attempts for today.");
        return;
    }

    if (garage.length >= getGarageCapacity()) {
        recordHistory("The garage is full. Upgrade Strength to make room.");
        return;
    }

    const theftOptions = document.getElementById("theft-options");
    const theftDialog = document.getElementById("theft-dialog");
    theftOptions.replaceChildren();

    for (const car of getRandomTheftCandidates(3)) {
        const risk = getRiskDetails(car);
        const option = document.createElement("button");
        option.className = "steal-option";
        option.type = "button";

        const name = document.createElement("strong");
        name.textContent = `${car.make} ${car.model}`;
        const rarity = document.createElement("span");
        rarity.textContent = car.rarity;
        const riskLabel = document.createElement("span");
        riskLabel.className = "risk-label";
        riskLabel.textContent = `Risk ${risk.level} (${risk.range})`;
        const exactRisk = document.createElement("span");
        exactRisk.className = "risk-percent";
        exactRisk.textContent = `${risk.chance}% chance of getting caught`;

        option.append(name, rarity, riskLabel, exactRisk);
        option.addEventListener("click", () => attemptTheft(car, risk));
        theftOptions.append(option);
    }

    theftDialog.showModal();
}

function attemptTheft(car, risk) {
    document.getElementById("theft-dialog").close();
    if (theftsToday >= getDailyTheftLimit()) {
        updateStealButton();
        return;
    }

    theftsToday++;
    updateStealButton();

    if (Math.random() * 100 < risk.chance) {
        totalCaughtThefts++;
        const baseFine = Math.max(10, Math.round(car.recommendedPrice * 0.2));
        const fine = Math.max(1, Math.round(baseFine * Math.max(0.25, 1 - securityLevel * 0.1)));
        balance = Math.max(0, balance - fine);
        pendingArrestEnding = totalCaughtThefts >= ARREST_ENDING_CAUGHT && !seenEndings.has("arrest");
        recordHistory(`Caught stealing the ${car.make} ${car.model}; fined ${formatMoney(fine)}.`);
        document.getElementById("fine-title").textContent = "Caught stealing";
        document.getElementById("fine-message").textContent = `You were fined ${formatMoney(fine)}. Balance: ${formatMoney(balance)}.`;
        document.getElementById("fine-dialog").showModal();
        updateAll();
        return;
    }

    const baseDamage = 30 + Math.floor(Math.random() * 30);
    const strengthDamage = skills.strength * 2;
    const handinessRepair = skills.handiness * 5;
    updateCarDurability(car, Math.max(30, 100 - baseDamage - strengthDamage + handinessRepair));
    addCarToGarage(car);
    recordHistory(`You stole a ${car.make} ${car.model} (${car.durability}% durability).`);
    renderGarage();
}

function toggleSortMenu() {
    const button = document.getElementById("sort-menu-button");
    const menu = document.getElementById("sort-menu");
    const isOpen = menu.hidden;
    menu.hidden = !isOpen;
    button.setAttribute("aria-expanded", String(isOpen));
}

function setSortOrder(value) {
    sortBy = value;
    for (const option of document.querySelectorAll(".sort-option")) {
        option.setAttribute("aria-pressed", String(option.dataset.sort === sortBy));
    }
    document.getElementById("sort-menu").hidden = true;
    document.getElementById("sort-menu-button").setAttribute("aria-expanded", "false");
    renderGarage();
}

function resetClockTimer() {
    clearInterval(clockTimer);
    if (gameEnded || pagePaused || (pauseWhenHidden && document.hidden)) {
        clockTimer = null;
        return;
    }

    const interval = Math.max(
        MIN_GAME_HOUR_INTERVAL_MS,
        GAME_HOUR_INTERVAL_MS - skills.expertise * EXPERTISE_INTERVAL_REDUCTION_MS
    );
    clockTimer = setInterval(advanceTime, interval);
}

function resetSaleTimer() {
    clearInterval(saleTimer);
    if (gameEnded || pagePaused || (pauseWhenHidden && document.hidden)) {
        saleTimer = null;
        return;
    }

    const interval = Math.max(
        MIN_SALE_CHECK_INTERVAL_MS,
        SALE_CHECK_INTERVAL_MS - skills.expertise * EXPERTISE_SALE_INTERVAL_REDUCTION_MS
    );
    saleTimer = setInterval(processCarSales, interval);
}

function stopGameTimers() {
    clearInterval(clockTimer);
    clearInterval(saleTimer);
    clockTimer = null;
    saleTimer = null;
}

function startGameTimers() {
    if (gameEnded) {
        return;
    }

    if (pauseWhenHidden && document.hidden) {
        pagePaused = true;
        stopGameTimers();
        return;
    }

    pagePaused = false;
    resetClockTimer();
    resetSaleTimer();
}

function updateVisibilityPause() {
    if (pauseWhenHidden && document.hidden) {
        pagePaused = true;
        stopGameTimers();
    } else if (pagePaused) {
        pagePaused = false;
        startGameTimers();
    }
}

function updateTutorialSpotlight() {
    if (document.getElementById("tutorial-overlay").hidden) {
        return;
    }

    const target = document.querySelector(TUTORIAL_STEPS[tutorialStep].target);
    if (!target) {
        throw new Error(`Tutorial target not found: ${TUTORIAL_STEPS[tutorialStep].target}`);
    }

    const bounds = target.getBoundingClientRect();
    const padding = 6;
    const left = Math.max(0, bounds.left - padding);
    const top = Math.max(0, bounds.top - padding);
    const right = Math.min(window.innerWidth, bounds.right + padding);
    const bottom = Math.min(window.innerHeight, bounds.bottom + padding);
    const shades = {
        "tutorial-shade-top": [0, 0, window.innerWidth, top],
        "tutorial-shade-bottom": [0, bottom, window.innerWidth, window.innerHeight - bottom],
        "tutorial-shade-left": [0, top, left, bottom - top],
        "tutorial-shade-right": [right, top, window.innerWidth - right, bottom - top]
    };

    for (const [id, [x, y, width, height]] of Object.entries(shades)) {
        const shade = document.getElementById(id);
        shade.style.left = `${x}px`;
        shade.style.top = `${y}px`;
        shade.style.width = `${Math.max(0, width)}px`;
        shade.style.height = `${Math.max(0, height)}px`;
    }

    const spotlight = document.getElementById("tutorial-spotlight");
    spotlight.style.left = `${left}px`;
    spotlight.style.top = `${top}px`;
    spotlight.style.width = `${right - left}px`;
    spotlight.style.height = `${bottom - top}px`;

    const card = document.querySelector(".tutorial-card");
    card.style.top = bounds.top + bounds.height / 2 > window.innerHeight / 2 ? "16px" : "";
    card.style.bottom = bounds.top + bounds.height / 2 <= window.innerHeight / 2 ? "16px" : "";
}

function renderTutorialStep() {
    const step = TUTORIAL_STEPS[tutorialStep];
    document.getElementById("tutorial-progress").textContent =
        `Step ${tutorialStep + 1} of ${TUTORIAL_STEPS.length}`;
    document.getElementById("tutorial-title").textContent = step.title;
    document.getElementById("tutorial-description").textContent = step.description;
    document.getElementById("tutorial-next").textContent =
        tutorialStep === TUTORIAL_STEPS.length - 1 ? "Finish" : "Next";
    updateTutorialSpotlight();
}

function startTutorial() {
    stopGameTimers();
    tutorialStep = 0;
    document.getElementById("tutorial-overlay").hidden = false;
    renderTutorialStep();
}

function finishTutorial() {
    document.getElementById("tutorial-overlay").hidden = true;
    try {
        localStorage.setItem(TUTORIAL_KEY, "completed");
    } catch (error) {
        setSaveStatus(`Could not save tutorial progress: ${error.message}`);
    }
    if (!gameEnded) {
        startGameTimers();
    }
}

document.getElementById("sleepButton").addEventListener("click", sleepUntilMorning);
document.getElementById("stealButton").addEventListener("click", openTheftPicker);
document.getElementById("debt").addEventListener("click", payDebt);
document.getElementById("tutorial-skip").addEventListener("click", finishTutorial);
document.getElementById("tutorial-next").addEventListener("click", () => {
    if (tutorialStep === TUTORIAL_STEPS.length - 1) {
        finishTutorial();
        return;
    }

    tutorialStep++;
    renderTutorialStep();
});
window.addEventListener("resize", updateTutorialSpotlight);
document.getElementById("close-theft-dialog").addEventListener("click", () => {
    document.getElementById("theft-dialog").close();
});
document.getElementById("fine-dismiss").addEventListener("click", () => {
    document.getElementById("fine-dialog").close();
    if (pendingArrestEnding) {
        pendingArrestEnding = false;
        endGame("arrest", "Arrested", "After repeated thefts, the police caught up with you. Your dealership run is over.");
        document.getElementById("ending-continue").style = "display: none;";
    }
});
document.getElementById("ending-continue").addEventListener("click", continueAfterEnding);
document.getElementById("ending-restart").addEventListener("click", restartGame);
document.getElementById("bankrupt-loan").addEventListener("click", acceptLoan);
document.getElementById("bankrupt-restart").addEventListener("click", bankruptEnding);
document.getElementById("debt-reminder-dismiss").addEventListener("click", () => {
    document.getElementById("debt-reminder-dialog").close();
    updateDebtStatus();
});
document.getElementById("ending-dialog").addEventListener("cancel", event => event.preventDefault());
const pauseSetting = document.getElementById("pause-when-hidden");
loadTrophies();
loadAchievements();
loadGame();
updateTrophyDisplay();
checkAchievements();
pauseSetting.checked = pauseWhenHidden;
pauseSetting.addEventListener("change", () => {
    pauseWhenHidden = pauseSetting.checked;
    updateVisibilityPause();
    saveGame();
});
document.getElementById("settings-button").addEventListener("click", () => {
    document.getElementById("settings-dialog").showModal();
});
document.getElementById("trophy-button").addEventListener("click", () => {
    openTrophyCase();
});
document.getElementById("achievements-button").addEventListener("click", openAchievements);
document.getElementById("achievements-close").addEventListener("click", () => {
    document.getElementById("achievements-dialog").close();
});
document.getElementById("info-button").addEventListener("click", () => {
    document.getElementById("version-dialog").showModal();
});
document.getElementById("version-close").addEventListener("click", () => {
    document.getElementById("version-dialog").close();
});
document.getElementById("ending-trophies").addEventListener("click", () => {
    openTrophyCase();
});
document.getElementById("trophy-close").addEventListener("click", () => {
    document.getElementById("trophy-dialog").close();
});
document.getElementById("settings-close").addEventListener("click", () => {
    document.getElementById("settings-dialog").close();
});
document.getElementById("restart-button").addEventListener("click", restartGame);
document.addEventListener("visibilitychange", updateVisibilityPause);
document.getElementById("repair-confirm").addEventListener("click", confirmRepair);
document.getElementById("repair-cancel").addEventListener("click", closeRepairDialog);
document.getElementById("sort-menu-button").addEventListener("click", toggleSortMenu);
for (const option of document.querySelectorAll(".sort-option")) {
    option.addEventListener("click", () => setSortOrder(option.dataset.sort));
}
document.getElementById("garage-make-filter").addEventListener("change", renderGarage);
document.getElementById("garage-model-filter").addEventListener("change", renderGarage);

renderSkills();
renderGarage();
updateAll();
updateStealButton();
updateSleepButton();
if (gameEnded && activeEndingKey) {
    if (activeEndingKey === "taxes") {
        document.getElementById("ending-continue").hidden = true;
    }
    if (!document.getElementById("ending-dialog").open) {
        document.getElementById("ending-dialog").showModal();
    }
} else {
    let tutorialComplete = false;
    try {
        tutorialComplete = localStorage.getItem(TUTORIAL_KEY) === "completed";
    } catch (error) {
        setSaveStatus(`Could not load tutorial progress: ${error.message}`);
    }
    if (!tutorialComplete) {
        startTutorial();
    } else {
        startGameTimers();
    }
}
sleepCooldownTimer = setInterval(updateSleepButton, 1000);
window.addEventListener("beforeunload", saveGame);

window.populateShipment = populateShipment;
window.unpackCar = unpackCar;
window.skipTime = skipTime;
window.payDebt = payDebt;
window.skipDay = skipDay;
window.debtDay = debtDay;