import { cars, RARITY_WEIGHTS } from './cars.js';

let balance = 100;
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

const skills = {
    charisma: 0,
    expertise: 0,
    networking: 0,
    stealth: 0,
    handiness: 0,
    strength: 0
};

const SKILL_DETAILS = [
    ["charisma", "Charisma", "Raises recommended prices and buyer interest. Side effect: none."],
    ["expertise", "Expertise", "Makes game hours pass faster. Side effect: none."],
    ["networking", "Networking", "Adds one car to each shipment; media critiques reduce sale payouts by 2% per level."],
    ["stealth", "Stealth", "Reduces theft risk and adds one daily attempt per level. Side effect: none."],
    ["handiness", "Handiness", "Repairs more durability for less and reduces theft damage."],
    ["strength", "Strength", "Adds one garage space per level; stored or stolen cars lose 2% durability per level."]
];

const RISK_LEVELS = ["L-", "L", "L+", "M-", "M", "M+", "H-", "H", "H+", "I"];
const BASE_GARAGE_CAPACITY = 3;
const GOOD_ENDING_SALES = 16;
const GOOD_ENDING_FUNDS = 1000;
const QUIT_ENDING_SKILL_LEVELS = 10;
const ARREST_ENDING_CAUGHT = 3;
const DAILY_SALES_QUOTA = 1;
const SLEEP_COOLDOWN_MS = 30_000;
const GAME_HOUR_INTERVAL_MS = 10_000;
const EXPERTISE_INTERVAL_REDUCTION_MS = 2_000;
const MIN_GAME_HOUR_INTERVAL_MS = 5_000;
const SALE_CHECK_INTERVAL_MS = 3_000;
const SALE_TICK_CHANCE_FACTOR = 0.12;

const RECOMMENDED_PRICES = {
    Common: 100,
    Uncommon: 200,
    Rare: 400,
    Epic: 800,
    Legendary: 1600,
    Mythic: 3200
};

const RARITY_BUYER_FACTORS = {
    Common: 1.15,
    Uncommon: 1.05,
    Rare: 0.95,
    Epic: 0.85,
    Legendary: 0.75,
    Mythic: 0.65
};

const flatCarsList = cars.flatMap(car => {
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
});

const TOTAL_WEIGHT = flatCarsList.reduce((sum, item) => sum + item.weight, 0);

function getConditionMultiplier(durability) {
    return 0.4 + 0.6 * Math.max(0, Math.min(100, durability)) / 100;
}

function calculateRecommendedPrice(car) {
    const basePrice = RECOMMENDED_PRICES[car.rarity] || RECOMMENDED_PRICES.Common;
    return Math.round(basePrice * (1 + skills.charisma * 0.1) * getConditionMultiplier(car.durability));
}

function createCar(make, model, rarity) {
    const car = { make, model, rarity, durability: 100 };
    const recommendedPrice = calculateRecommendedPrice(car);

    return {
        id: nextCarId++,
        ...car,
        recommendedPrice,
        price: recommendedPrice
    };
}

let garage = [];

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
    return Math.min(75, Math.max(0, 10 + garage.length * 5 - securityLevel * 5));
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
    const priceRatio = car.recommendedPrice / Math.max(1, car.price);
    const priceChance = 0.32 + skills.charisma * 0.04 + (priceRatio - 1) * 0.3;
    const conditionChance = getConditionMultiplier(car.durability);
    const rarityChance = RARITY_BUYER_FACTORS[car.rarity] || 0.75;
    const chancePerSecond = priceChance * conditionChance * rarityChance * SALE_TICK_CHANCE_FACTOR;
    return Math.max(0.005, Math.min(0.25, chancePerSecond));
}

function getRandomCar() {
    let randomNumber = Math.random() * TOTAL_WEIGHT;

    for (const car of flatCarsList) {
        if (randomNumber < car.weight) {
            return createCar(car.make, car.model, car.rarity);
        }
        randomNumber -= car.weight;
    }

    const fallbackCar = flatCarsList[0];
    return createCar(fallbackCar.make, fallbackCar.model, fallbackCar.rarity);
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
}

function endGame(key, title, message) {
    if (gameEnded) {
        return;
    }

    gameEnded = true;
    activeEndingKey = key;
    clearInterval(clockTimer);
    clearInterval(sleepCooldownTimer);
    clearInterval(saleTimer);
    document.getElementById("ending-title").textContent = title;
    document.getElementById("ending-message").textContent = message;
    document.getElementById("ending-dialog").showModal();
    updateSleepButton();
    updateStealButton();
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
    window.location.reload();
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
        if (Math.random() < getBuyerChance(car)) {
            garage.splice(i, 1);
            const payout = getSalePayout(car);
            balance += payout;
            dailySales++;
            totalSales++;
            soldAny = true;
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
    document.getElementById("dayCount").textContent = day;
    document.getElementById("hours").textContent = String(hour).padStart(2, "0");
    document.getElementById("z-dols").textContent = balance;
    document.getElementById("quota-status").textContent = day <= 3
        ? "None (Days 1-3)"
        : `${dailySales}/${DAILY_SALES_QUOTA}`;
    updateSleepButton();
    renderBuyables();

    for (let i = pendingShipments.length - 1; i >= 0; i--) {
        let shipment = pendingShipments[i];

        if (day > shipment.arrivalDay || (day === shipment.arrivalDay && hour >= shipment.arrivalHour)) {
            if (currentShipment.length + shipment.cars.length <= 5 * getShipmentSize()) {
                currentShipment.push(...shipment.cars);
                pendingShipments.splice(i, 1);
                recordHistory(`Shipment arrived. ${shipment.cars.length} cars are ready in the cupboard.`);
            }
        }
    }
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
        arrivalHour: hour,
        cars: orderedCars
    });

    recordHistory(`Shipment ordered. Expected Day ${day + 1} [${formatClock(hour)}].`);
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
    updateCarDurability(car, Math.max(30, car.durability - skills.strength * 2));
    garage.push(car);
    recordHistory(`${car.make} ${car.model} was added to the garage.`);
    renderGarage();
}

function getRepairPlan(car) {
    const amount = Math.min(100 - car.durability, 10 + skills.handiness * 5);
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
        label.title = description;

        const upgradeButton = document.createElement("button");
        upgradeButton.className = "skill-upgrade";
        upgradeButton.type = "button";
        upgradeButton.textContent = "+";
        upgradeButton.title = `Upgrade ${name}`;
        upgradeButton.setAttribute("aria-label", `Upgrade ${name}`);
        upgradeButton.disabled = skillPoints < 1;
        upgradeButton.addEventListener("click", () => upgradeSkill(key, name));

        const downgradeButton = document.createElement("button");
        downgradeButton.className = "skill-upgrade";
        downgradeButton.type = "button";
        downgradeButton.textContent = "-";
        downgradeButton.title = `Downgrade ${name}`;
        downgradeButton.setAttribute("aria-label", `Downgrade ${name}`);
        downgradeButton.disabled = skills[key] === 0;
        downgradeButton.addEventListener("click", () => downgradeSkill(key, name));

        const controls = document.createElement("div");
        controls.className = "skill-controls";
        controls.append(downgradeButton, upgradeButton);
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
    updateRecommendedPrices();
    renderSkills();
    renderGarage();
    updateStealButton();
    resetClockTimer();
    recordHistory(`${name} increased to level ${skills[key]}.`);
    checkProgressEndings();
}

function downgradeSkill(key, name) {
    if (skills[key] === 0) {
        return;
    }

    skills[key]--;
    skillPoints++;
    updateRecommendedPrices();
    renderSkills();
    renderGarage();
    updateStealButton();
    resetClockTimer();
    recordHistory(`${name} decreased to level ${skills[key]}; 1 skill point was returned.`);
}

function getSkillPointCost() {
    return Math.round(50 * Math.pow(1.8017, skillPointPurchases));
}

function getGarageExpansionCost() {
    return Math.round(100 * Math.pow(2.5, garageExpansion / 2));
}

function getSecurityUpgradeCost() {
    return Math.round(50 * Math.pow(2.5, securityLevel));
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

    list.replaceChildren(
        createBuyable("Skill point", `${skillPoints} available`, getSkillPointCost(), buySkillPoint),
        createBuyable("Garage expansion", `+2 spaces · ${getGarageCapacity()} total`, getGarageExpansionCost(), buyGarageExpansion),
        securityBuyable
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
    const chance = Math.max(1, Math.min(95, Math.round(priceRisk - skills.stealth * 8)));
    const bandIndex = Math.min(9, Math.floor(chance / 10));

    return {
        chance,
        level: RISK_LEVELS[bandIndex],
        range: `${bandIndex * 10}-${(bandIndex + 1) * 10}%`
    };
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
        candidates.push(createCar(selected.make, selected.model, selected.rarity));
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

    const baseDamage = 15 + Math.floor(Math.random() * 16);
    const strengthDamage = skills.strength * 2;
    const handinessRepair = skills.handiness * 5;
    updateCarDurability(car, Math.max(30, 100 - baseDamage - strengthDamage + handinessRepair));
    garage.push(car);
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
    clearInterval(saleTimer);
    saleTimer = setInterval(processCarSales, SALE_CHECK_INTERVAL_MS);
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

document.getElementById("sleepButton").addEventListener("click", sleepUntilMorning);
document.getElementById("stealButton").addEventListener("click", openTheftPicker);
document.getElementById("close-theft-dialog").addEventListener("click", () => {
    document.getElementById("theft-dialog").close();
});
document.getElementById("fine-dismiss").addEventListener("click", () => {
    document.getElementById("fine-dialog").close();
    if (pendingArrestEnding) {
        pendingArrestEnding = false;
        endGame("arrest", "Arrested", "After repeated thefts, the police caught up with you. Your dealership run is over.");
    }
});
document.getElementById("ending-continue").addEventListener("click", continueAfterEnding);
document.getElementById("ending-restart").addEventListener("click", restartGame);
document.getElementById("ending-dialog").addEventListener("cancel", event => event.preventDefault());
const pauseSetting = document.getElementById("pause-when-hidden");
pauseWhenHidden = pauseSetting.checked;
pauseSetting.addEventListener("change", () => {
    pauseWhenHidden = pauseSetting.checked;
    updateVisibilityPause();
});
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
startGameTimers();
sleepCooldownTimer = setInterval(updateSleepButton, 1000);

window.populateShipment = populateShipment;
window.unpackCar = unpackCar;
window.skipTime = skipTime;