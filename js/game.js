import { cars, RARITY_WEIGHTS } from './cars.js';

let balance = 10;

let day = 0;
let hour = 0;

let shipmentSize = 2;
let shipmentPrice = 5; // UZD - United Zeke Dollar

let currentShipment = [];
let pendingShipments = [];

setInterval(() => {
    if (hour < 24) {
        hour++;
    } else {
        day++;
        hour = 1;
    }
}, 25000);

setInterval(() => {
    updateAll();
}, 10);

let garageSize = 3;
let garage = [
    /*
        {
            make: "Nissan",
            model: "Altima",
            damage: 1.0 // broken
        }
    */
];

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

function getRandomCar() {
    let randomNumber = Math.random() * TOTAL_WEIGHT;

    for (const car of flatCarsList) {
        if (randomNumber < car.weight) {
            let retObject = {
                make: car.make,
                model: car.model
            };
            return retObject;
        }
        randomNumber -= car.weight;
    }

    let retObject = {
        make: flatCarsList[0].make,
        model: flatCarsList[0].model
    };
    return retObject;
}

function updateAll() {
    document.getElementById("dayCount").innerHTML = day;
    document.getElementById("hours").innerHTML = hour;
    document.getElementById("z-dols").innerHTML = balance;

    for (let i = pendingShipments.length - 1; i >= 0; i--) {
        let shipment = pendingShipments[i];

        if (day > shipment.arrivalDay || (day === shipment.arrivalDay && hour >= shipment.arrivalHour)) {
            
            if (currentShipment.length + shipment.cars.length <= 5 * shipmentSize) {
                currentShipment.push(...shipment.cars);
                
                pendingShipments.splice(i, 1); 
                
                alert("Boss, the shipment just arrived!");
            }
        }
    }
}

function populateShipment() {
    if (currentShipment.length >= 5 * shipmentSize) {
        alert("Where do I put it boss? (Store cars in the garage to make room.)");
        return;
    }

    if (balance < shipmentPrice) {
        alert("You're a little short, Boss.. (Get more money!)");
        return;
    }

    balance -= shipmentPrice;

    const orderedCars = [getRandomCar(), getRandomCar()];

    pendingShipments.push({
        arrivalDay: day + 1,
        arrivalHour: hour,
        cars: orderedCars
    });

    updateAll();
}

window.populateShipment = populateShipment;