const fs = require("fs");
const combat = require('./combatFunc.js');

const Army = require('./Army.js');
const Location = require('./Location.js');
const Combat = require('./Combat.js');

// Loading armies as json from file, no error handling as this is just for simulating battles. Errors should crash and burn this down.
function loadArmyJson(jsonFileName) {
    const armyJson = fs.readFileSync(jsonFileName, "utf8");
    return JSON.parse(armyJson);
}

// const army1 = loadArmyJson(process.argv[2] !== undefined ? process.argv[2] : "./army1.json");
// const army2 = loadArmyJson(process.argv[3] !== undefined ? process.argv[3] : "./army1.json");


const armyData1 = {
    "owner": "Rome",
    "name": "Laudanum",
    "side": "A",
    "id": "rome",
    "units":[
        {
            "id": "inf001",
            "name": "Legion",
            "power": 10,
            "range": [0, 1],        
            "health": 50,
            "speed": 2,
            "amount": 50,
            "maxtroops": 50,
            "injured": [],
            "morale": 100,
            "experience": 0
        },
        {
            "id": "arch001",
            "name": "Archers",
            "power": 8,
            "range": [2, 4],        
            "health": 30,
            "speed": 1,
            "amount": 50,
            "maxtroops": 50,
            "injured": [],
            "morale": 100,
            "experience": 0
        }
        
    ]
};

const armyData2 = {
    "owner": "Gauls",
    "name": "Invincible Village",
    "side": "B",
    "id": "gauls",
    "units":[
        {
            "id": "mob001",
            "name": "Mob",
            "power": 20,
            "range": [0, 1],        
            "health": 60,
            "speed": 2,
            "amount": 50,
            "maxtroops": 50,
            "injured": [],
            "morale": 100,
            "experience": 0
        }
    ]
};

// const location = {
//     size: 8
// };

// const CONFIG = {
//     rounds: 12
// };

const loc = new Location();

const army1 = new Army(armyData1);
const army2 = new Army(armyData2);

const battle = new Combat(loc,{sides: ["Red", "Blue"]});

battle.addArmy(army1, "Red");
battle.addArmy(army2, "Blue");

battle.start();




// const armies = combat([army1, army2], location, CONFIG);
// console.log(armies);




