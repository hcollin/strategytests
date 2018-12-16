const fs = require("fs");
const combat = require('./combat.js');

// Loading armies as json from file, no error handling as this is just for simulating battles. Errors should crash and burn this down.
function loadArmyJson(jsonFileName) {
    const armyJson = fs.readFileSync(jsonFileName, "utf8");
    return JSON.parse(armyJson);
}

// const army1 = loadArmyJson(process.argv[2] !== undefined ? process.argv[2] : "./army1.json");
// const army2 = loadArmyJson(process.argv[3] !== undefined ? process.argv[3] : "./army1.json");


const army1 = {
    "owner": "Rome",
    "name": "Laudanum",
    "side": "A",
    "units":[
        {
            "name": "Rookies",
            "power": 6,
            "range": [0, 1],        
            "health": 40,
            "speed": 2,
            "amount": 80,
            "maxtroops": 80
        },
        {
            "name": "Legion",
            "power": 10,
            "range": [0, 1],        
            "health": 50,
            "speed": 2,
            "amount": 40,
            "maxtroops": 40
            
        }
    ]
};

const army2 = {
    "owner": "Gauls",
    "name": "Invincible Village",
    "side": "B",
    "units":[
        {
            "name": "Mob",
            "power": 20,
            "range": [0, 1],        
            "health": 60,
            "speed": 2,
            "amount": 50,
            "maxtroops": 45
        }
    ]
};

const location = {

};

const CONFIG = {
    rounds: 12,
    arenaWidth: 8
};


combat([army1, army2], location, CONFIG);






