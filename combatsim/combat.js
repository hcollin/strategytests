
/**
 * Starts the combat between two sides. Multiple armies can be on each side
 * 
 * @param {*} ARMIES 
 * @param {*} LOCATION 
 * @param {*} CONFIG 
 */
function combat(ARMIES, LOCATION, CONFIG) {
    console.log(`\nCombat Begins!\n  Armies: ${ARMIES.length}\n`);

    const armies = ARMIES.map((army, index) => {
        const units = army.units.map(unit => {
            return Object.assign(
                {
                    damage: 0, 
                    morale: 100
                }, 
                unit, 
                {
                    location: army.side === "A" ? 0 : CONFIG.arenaWidth,
                    commands: [],
                    side: army.side,
                    owner: army.owner
                });
        });
        return Object.assign({}, army, {units: units});
    });


    for(let cRound = 0; cRound < CONFIG.rounds; cRound++) {
        combatRound(cRound, armies, LOCATION);
    }
}


/**
 * Main function for solving a single combat round
 * 
 * @param {*} roundNo 
 * @param {*} armies 
 * @param {*} location 
 */
function combatRound(roundNo, armiesWhenRoundStarts, location) {
    console.log(`\nCOMBAT ROUND ${roundNo + 1}`);


    // Step one: Movement
    console.log(`\n  Movement`);
    const armiesAfterMovement = armiesWhenRoundStarts.map(army => {
        return stepMovement(army, armiesWhenRoundStarts, location);
    });
    
    // Step two: Attack! (Choose targets for each unit etc.)
    console.log(`\n  Attack`);
    const armiesAfterAttack = armiesAfterMovement.map(army => {
        return stepAttack(army, armiesAfterMovement, location);
    });

    // Step four: Resolve
    console.log(`\n  Resolve`);
    const armiesAfterResolve = armiesAfterAttack.map(army => {
        return stepResolve(army, armiesAfterAttack, location);
    });

    return armiesAfterResolve;
    
}

/**
 * Resolve the movement of the units in an army
 * @param {*} army 
 * @param {*} armies 
 * @param {*} location 
 */
function stepMovement(army, armies, location) {
    console.log(`    Army: ${army.owner}`);
    return army;
}


/**
 * Choose targets for unit in an army and assign incoming damage to them accordingly
 * @param {*} army 
 * @param {*} armies 
 * @param {*} location 
 */
function stepAttack(army, armies, location) {
    console.log(`    Army: ${army.owner}`);
    

    const units = army.units.map(unit => {
    
        // Find valid enemy units
        const validTargetUnits = findValidTargetUnits(unit, armies, location);
        
        // Choose valid target
        const target = chooseValidTarget(unit, validTargetUnits, location);

        


        

    });
    


    

    return army;
    
}

function findValidTargetUnits(attacker, armies, location) {
    return armies.reduce((units, targetArmy) => {
        if(targetArmy.side !== attacker.side) {
            return units.concat(targetArmy.units);
        }
        return units;
    }, []);
}

function chooseValidTarget(attacker, targets, location) {
    return targets.find(target => {
        return true;
    });
}


/**
 * Resolve effects of damage to each unit in the army
 * @param {*} army 
 * @param {*} armies 
 * @param {*} location 
 */
function stepResolve(army, armies, location) {
    console.log(`    Army: ${army.owner}`);
    return army;
}









module.exports = combat;

