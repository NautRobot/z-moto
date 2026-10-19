// Weight table: higher weight = more common, lower weight = rarer
export const RARITY_WEIGHTS = {
  Common: 100,      // Economy / Mainstream (e.g. Civic, Corolla)
  Uncommon: 45,     // Entry Premium / Upper Mainstream (e.g. Mustang, Acura, Genesis)
  Rare: 15,         // Luxury / High Performance (e.g. BMW M, Porsche, Escalade)
  Epic: 4,          // High-End Exotic / Supercars (e.g. Aston Martin, Bentley, GT-R)
  Legendary: 1,     // Hypercars / Ultra-Luxury (e.g. Ferrari, Lambo, Rolls-Royce)
  Mythic: 0.2       // Multi-million / Elite (e.g. Celestiq, SF90 XX)
};

export const cars = [
  {
    make: "Acura",
    defaultRarity: "Uncommon",
    models: ["Integra", "MDX", "RDX", "TLX", "ZDX"]
  },
  {
    make: "Alfa Romeo",
    defaultRarity: "Uncommon",
    models: ["Giulia", "Stelvio", "Tonale"]
  },
  {
    make: "Aston Martin",
    defaultRarity: "Epic",
    models: ["DB12", "DBS", "DBX", "Vantage"]
  },
  {
    make: "Audi",
    defaultRarity: "Rare",
    models: [
      "A3", "A4", "A5", "A6", "A7", "A8",
      "Q3", "Q4 e-tron", "Q5", "Q6 e-tron", "Q7", "Q8",
      { name: "S3", rarity: "Rare" },
      { name: "S4", rarity: "Rare" },
      { name: "S5", rarity: "Rare" },
      { name: "S6", rarity: "Rare" },
      { name: "S7", rarity: "Rare" },
      { name: "S8", rarity: "Rare" },
      { name: "SQ5", rarity: "Rare" },
      { name: "SQ6 e-tron", rarity: "Rare" },
      { name: "SQ8", rarity: "Rare" },
      { name: "RS 3", rarity: "Epic" },
      { name: "RS 5", rarity: "Epic" },
      { name: "RS 6 Avant", rarity: "Epic" },
      { name: "RS 7", rarity: "Epic" },
      { name: "RS Q8", rarity: "Epic" },
      { name: "e-tron GT", rarity: "Epic" },
      { name: "RS e-tron GT", rarity: "Epic" }
    ]
  },
  {
    make: "Bentley",
    defaultRarity: "Epic",
    models: ["Bentayga", "Continental GT", "Flying Spur"]
  },
  {
    make: "BMW",
    defaultRarity: "Rare",
    models: [
      "2 Series Gran Coupe", "2 Series Coupe", "3 Series", "4 Series Coupe", "4 Series Gran Coupe", "4 Series Convertible",
      "5 Series", "7 Series", "8 Series Coupe", "8 Series Gran Coupe", "8 Series Convertible",
      "i4", "i5", "i7", "iX", "X1", "X2", "X3", "X4", "X5", "X6", "X7", "Z4",
      { name: "M2", rarity: "Epic" },
      { name: "M3", rarity: "Epic" },
      { name: "M4", rarity: "Epic" },
      { name: "M5", rarity: "Epic" },
      { name: "M8", rarity: "Epic" },
      { name: "X3 M", rarity: "Epic" },
      { name: "X4 M", rarity: "Epic" },
      { name: "X5 M", rarity: "Epic" },
      { name: "X6 M", rarity: "Epic" },
      { name: "XM", rarity: "Epic" }
    ]
  },
  {
    make: "Buick",
    defaultRarity: "Common",
    models: ["Enclave", "Encore GX", "Envision", "Envista"]
  },
  {
    make: "Cadillac",
    defaultRarity: "Uncommon",
    models: [
      "CT4", "CT5", "Lyriq", "Optiq", "XT4", "XT5", "XT6",
      { name: "CT4-V", rarity: "Rare" },
      { name: "CT5-V", rarity: "Rare" },
      { name: "Escalade", rarity: "Rare" },
      { name: "Escalade ESV", rarity: "Rare" },
      { name: "Escalade IQ", rarity: "Epic" },
      { name: "Vistiq", rarity: "Rare" },
      { name: "Celestiq", rarity: "Mythic" }
    ]
  },
  {
    make: "Chevrolet",
    defaultRarity: "Common",
    models: [
      "Blazer", "Blazer EV", "Bolt EUV", "Colorado", "Equinox", "Equinox EV",
      "Express 2500", "Express 3500", "Malibu", "Silverado 1500", "Silverado 2500 HD",
      "Silverado 3500 HD", "Silverado EV", "Suburban", "Tahoe", "Trailblazer", "Trax",
      { name: "Corvette Stingray", rarity: "Rare" },
      { name: "Corvette E-Ray", rarity: "Epic" },
      { name: "Corvette ZR1", rarity: "Legendary" }
    ]
  },
  {
    make: "Chrysler",
    defaultRarity: "Common",
    models: ["Pacifica", "Pacifica Plug-In Hybrid", "Voyager"]
  },
  {
    make: "Dodge",
    defaultRarity: "Common",
    models: [
      "Durango", "Hornet",
      { name: "Charger Sixpack", rarity: "Uncommon" },
      { name: "Charger Daytona", rarity: "Rare" }
    ]
  },
  {
    make: "Ferrari",
    defaultRarity: "Legendary",
    models: [
      "12Cilindri", "296 GTB", "296 GTS", "Purosangue", "Roma", "Roma Spider", "SF90 Stradale", "SF90 Spider",
      { name: "SF90 XX", rarity: "Mythic" }
    ]
  },
  {
    make: "Fiat",
    defaultRarity: "Mythic",
    models: ["500e"]
  },
  {
    make: "Ford",
    defaultRarity: "Common",
    models: [
      "Bronco Sport", "Edge", "Escape", "Explorer", "F-150", "F-150 Lightning",
      "F-350 Super Duty", "Maverick", "Mustang",
      "Mustang Mach-E", "Ranger", "Transit Passengercam", "Transit Cargo", "E-Transit",
      { name: "Bronco", rarity: "Uncommon" },
      { name: "Expedition", rarity: "Uncommon" },
      { name: "Expedition MAX", rarity: "Uncommon" }
    ]
  },
  {
    make: "Genesis",
    defaultRarity: "Uncommon",
    models: [
      "G70", "G80", "Electrified G80", "G90", "GV60", "GV70", "Electrified GV70", "GV80", "GV80 Coupe"
    ]
  },
  {
    make: "GMC",
    defaultRarity: "Common",
    models: [
      "Acadia", "Canyon", "Savana 2500", "Savana 3500", "Sierra 1500", "Terrain",
      { name: "Sierra 2500 HD", rarity: "Uncommon" },
      { name: "Sierra 3500 HD", rarity: "Uncommon" },
      { name: "Yukon", rarity: "Uncommon" },
      { name: "Yukon XL", rarity: "Uncommon" },
      { name: "Sierra EV", rarity: "Rare" },
      { name: "Hummer EV Pickup", rarity: "Rare" },
      { name: "Hummer EV SUV", rarity: "Rare" }
    ]
  },
  {
    make: "Honda",
    defaultRarity: "Common",
    models: [
      "Accord", "Accord Hybrid", "Civic Sedan", "Civic Hatchback", "Civic Hybrid",
      "CR-V Hybrid", "HR-V", "Odyssey", "Passport", "Pilot", "Prologue", "Ridgeline",
      { name: "Civic Type R", rarity: "Uncommon" }
    ]
  },
  {
    make: "Hyundai",
    defaultRarity: "Common",
    models: [
      "Elantra", "Elantra Hybrid", "Ioniq 5", "Ioniq 6", "Ioniq 9", "Kona", "Kona Electric",
      "Palisade", "Santa Fe", "Santa Fe Hybrid", "Sonata", "Sonata Hybrid",
      "Tucson", "Tucson Hybrid", "Tucson Plug-in Hybrid", "Venue",
      { name: "Elantra N", rarity: "Uncommon" },
      { name: "Ioniq 5 N", rarity: "Rare" }
    ]
  },
  {
    make: "Infiniti",
    defaultRarity: "Uncommon",
    models: ["Q50", "QX50", "QX55", "QX60", "QX80"]
  },
  {
    make: "Jaguar",
    defaultRarity: "Rare",
    models: ["E-Pace", "F-Pace", "I-Pace", "XF"]
  },
  {
    make: "Jeep",
    models: [
      "Compass", "Gladiator", "Wrangler", "Wrangler 4xe", "Recon",
      { name: "Grand Cherokee", rarity: "Common" },
      { name: "Grand Cherokee L", rarity: "Common" },
      { name: "Grand Cherokee 4xe", rarity: "Uncommon" },
      { name: "Wagoneer", rarity: "Uncommon" },
      { name: "Wagoneer L", rarity: "Uncommon" },
      { name: "Wagoneer S", rarity: "Uncommon" },
      { name: "Grand Wagoneer", rarity: "Rare" },
      { name: "Grand Wagoneer L", rarity: "Rare" }
    ],
    defaultRarity: "Common"
  },
  {
    make: "Kia",
    defaultRarity: "Common",
    models: [
      "Carnival", "EV6", "EV9", "K4", "K5", "Niro", "Niro EV", "Niro Plug-in Hybrid",
      "Sorento", "Sorento Hybrid", "Sorento Plug-in Hybrid", "Soul", "Sportage",
      "Sportage Hybrid", "Sportage Plug-in Hybrid", "Telluride"
    ]
  },
  {
    make: "Lamborghini",
    defaultRarity: "Legendary",
    models: ["Revuelto", "Temerario"]
  },
  {
    make: "Land Rover",
    defaultRarity: "Rare",
    models: [
      "Discovery", "Discovery Sport", "Range Rover Evoque", "Range Rover Velar",
      { name: "Defender 90", rarity: "Rare" },
      { name: "Defender 110", rarity: "Rare" },
      { name: "Defender 130", rarity: "Rare" },
      { name: "Range Rover Sport", rarity: "Epic" },
      { name: "Range Rover", rarity: "Epic" }
    ]
  },
  {
    make: "Lexus",
    defaultRarity: "Uncommon",
    models: [
      "ES", "ES Hybrid", "IS", "NX", "NX Hybrid", "NX Plug-in Hybrid", "RC", "RX",
      "RX Hybrid", "RX Plug-in Hybrid", "RZ", "TX", "TX Hybrid", "TX Plug-in Hybrid", "UX Hybrid",
      { name: "GX", rarity: "Rare" },
      { name: "LX", rarity: "Rare" },
      { name: "LS", rarity: "Rare" },
      { name: "LS Hybrid", rarity: "Rare" },
      { name: "LC", rarity: "Epic" },
      { name: "LC Convertible", rarity: "Epic" },
      { name: "LC Hybrid", rarity: "Epic" },
      { name: "RC F", rarity: "Rare" }
    ]
  },
  {
    make: "Lincoln",
    defaultRarity: "Uncommon",
    models: [
      "Corsair",
      { name: "Navigator", rarity: "Rare" },
      { name: "Navigator L", rarity: "Rare" }
    ]
  },
  {
    make: "Lotus",
    defaultRarity: "Epic",
    models: ["Eletre", "Emira", "Emeya"]
  },
  {
    make: "Lucid",
    defaultRarity: "Epic",
    models: ["Air", "Gravity"]
  },
  {
    make: "Maserati",
    defaultRarity: "Epic",
    models: [
      "Ghibli", "Grecale", "Grecale Folgore", "GranTurismo Folgore", "GranCabrio", "Levante",
      { name: "MC20", rarity: "Legendary" },
      { name: "MC20 Cielo", rarity: "Legendary" }
    ]
  },
  {
    make: "Mazda",
    defaultRarity: "Common",
    models: [
      "CX-30", "CX-5", "CX-50", "CX-50 Hybrid", "CX-70", "CX-70 PHEV", "CX-90",
      "CX-90 PHEV", "Mazda3 Sedan", "Mazda3 Hatchback", "MX-5 Miata", "MX-5 Miata RF"
    ]
  },
  {
    make: "McLaren",
    defaultRarity: "Legendary",
    models: ["750S", "750S Spider", "Artura", "Artura Spider", "GTS"]
  },
  {
    make: "Mercedes-Benz",
    defaultRarity: "Rare",
    models: [
      "C-Class Sedan", "C-Class Coupe", "C-Class Cabriolet", "CLE Coupe", "CLE Cabriolet",
      "E-Class Sedan", "E-Class All-Terrain", "EQB", "EQE Sedan", "EQE SUV", "GLA", "GLB", "GLC", "GLC Coupe", "GLE", "GLE Coupe",
      { name: "S-Class", rarity: "Epic" },
      { name: "EQS Sedan", rarity: "Epic" },
      { name: "EQS SUV", rarity: "Epic" },
      { name: "G-Class", rarity: "Epic" },
      { name: "GLS", rarity: "Epic" },
      { name: "GT Coupe", rarity: "Epic" },
      { name: "Maybach S-Class", rarity: "Legendary" },
      { name: "Maybach EQS SUV", rarity: "Legendary" },
      { name: "Maybach GLS", rarity: "Legendary" }
    ]
  },
  {
    make: "Mini",
    defaultRarity: "Common",
    models: ["Hardtop 2-Door", "Hardtop 4-Door", "Convertible", "Countryman", "Countryman SE ALL4", "Aceman"]
  },
  {
    make: "Mitsubishi",
    defaultRarity: "Common",
    models: ["Eclipse Cross", "Mirage", "Mirage G4", "Outlander", "Outlander PHEV"]
  },
  {
    make: "Nissan",
    defaultRarity: "Common",
    models: [
      "Altima", "Ariya", "Armada", "Frontier", "Kicks", "Leaf", "Murano", "Pathfinder",
      "Rogue", "Sentra", "Titan", "Titan XD", "Versa",
      { name: "Z", rarity: "Uncommon" },
      { name: "GT-R", rarity: "Epic" }
    ]
  },
  {
    make: "Polestar",
    defaultRarity: "Rare",
    models: ["Polestar 2", "Polestar 3", "Polestar 4"]
  },
  {
    make: "Porsche",
    defaultRarity: "Epic",
    models: [
      "718 Cayman", "718 Boxster", "Macan", "Macan EV", "Cayenne Coupe", "Panamera", "Taycan", "Taycan Cross Turismo", "Taycan Sport Turismo",
      { name: "911 Cabriolet", rarity: "Epic" },
      { name: "911 Targa", rarity: "Epic" },
      { name: "718 Spyder RS", rarity: "Legendary" }
    ]
  },
  {
    make: "Ram",
    defaultRarity: "Common",
    models: ["1500", "1500 Classic", "2500", "3500", "ProMaster", { name: "1500 REV", rarity: "Uncommon" }, { name: "1500 Ramcharger", rarity: "Uncommon" }]
  },
  {
    make: "Rivian",
    defaultRarity: "Rare",
    models: ["R1S", "R1T"]
  },
  {
    make: "Rolls-Royce",
    defaultRarity: "Legendary",
    models: ["Cullinan", "Ghost", "Phantom", "Spectre"]
  },
  {
    make: "Subaru",
    defaultRarity: "Common",
    models: ["Ascent", "BRZ", "Crosstrek", "Forester", "Impreza", "Legacy", "Outback", "Solterra", "WRX"]
  },
  {
    make: "Tesla",
    defaultRarity: "Uncommon",
    models: [
      "Model 3", "Model Y",
      { name: "Model S", rarity: "Rare" },
      { name: "Model X", rarity: "Rare" },
      { name: "Cybertruck", rarity: "Rare" }
    ]
  },
  {
    make: "Toyota",
    defaultRarity: "Common",
    models: [
      "4Runner", "bZ4X", "Camry", "Corolla", "Corolla Hatchback", "Corolla Hybrid", "Corolla Cross",
      "Corolla Cross Hybrid", "Crown", "GR86", "Grand Highlander", "Grand Highlander Hybrid",
      "Highlander", "Highlander Hybrid", "Land Cruiser", "Prius", "Prius Prime", "RAV4", "RAV4 Hybrid",
      "RAV4 Plug-in Hybrid", "Sequoia", "Sienna", "Tacoma", "Tundra", "Venza",
    ]
  },
  {
    make: "Volkswagen",
    defaultRarity: "Common",
    models: ["Atlas", "Atlas Cross Sport", "Golf GTI", "Golf R", "ID.4", "ID.Buzz", "Jetta", "Jetta GLI", "Taos", "Tiguan"]
  },
  {
    make: "Volvo",
    defaultRarity: "Uncommon",
    models: ["EX30", "S60", "S90", "V60 Cross Country", "V90 Cross Country", "XC40", "XC60", "XC60 Plug-in Hybrid", "XC90"]
  }
];