
/**
 * Starts the combat between two sides. Multiple armies can be on each side
 * 
 * @param {*} ARMIES 
 * @param {*} LOCATION 
 * @param {*} CONFIG 
 */
function combat(ARMIES, LOCATION, CONFIG) {
    console.log('\x1b[32m%s\x1b[0m',`\n----------------------------------------------------------------------------------\n\nCombat Begins!\n  Armies: ${ARMIES.length}\n`);

    // Separate units from armies
    const units = ARMIES.reduce((allUnits, army, aind) => {
        
        const armyUnits = army.units.map((unit, uind) => {

            const unitId = `${army.side}-${aind}-${uind}`;

            return Object.assign(
                {
                    damage: 0, 
                    morale: 100
                }, 
                unit, 
                {
                    id: unitId,
                    location: army.side === "A" ? 0 : LOCATION.size,
                    direction: army.side === "A" ? 1 : -1,
                    previousTarget: null,
                    side: army.side,
                    analysisHistory: [],
                    currentStrategies: [],
                    troopStates:{
                        dead: 0,
                        injured: Array.isArray(unit.injured) ? unit.injured : []
                    },
                    army: {
                        name: army.name,
                        owner: army.owner,
                        side: army.side
                    },
                    destroyed: false
                });
        });
        return allUnits.concat(armyUnits);
    }, []);

    const unitsAfterCombat = combatRound(CONFIG.rounds, units, LOCATION);

    const armies = ARMIES.map(army => {
        army.units = army.units.map(origUnit => {
            const newUnit = unitsAfterCombat.find(u => u.name === origUnit.name);
            return Object.assign({}, origUnit, {
                amount: newUnit.amount,
                injured: newUnit.troopStates.injured,
                morale: newUnit.morale,
                experience: newUnit.experience
            });
        });
        return army;
    });


    // console.log("\n\nFinal results!\n", unitsAfterCombat);

    return armies;
}


/**
 * Main function for solving a single combat round
 * 
 * @param {*} roundNo 
 * @param {*} armies 
 * @param {*} location 
 */
function combatRound(roundNo, unitsAtTheStartOftheRound, location) {
    
    if(roundNo <= 0) {
        return unitsAtTheStartOftheRound;
    }

    console.log('\x1b[31m%s\x1b[0m', `\nCOMBAT ROUND ${roundNo}`);

    // Step zero: Analyze
    console.log('\x1b[33m%s\x1b[0m', `\n  Analyze`);
    const smartUnits = unitsAtTheStartOftheRound.map(unit => {
        if(unit.destroyed) return unit;
        return stepAnalyze(unit, unitsAtTheStartOftheRound, location);
    })

    // Step one: Movement
    console.log('\x1b[33m%s\x1b[0m',`\n  Movement`);
    const relocatedUnits = smartUnits.map(unit => {
        if(unit.destroyed) return unit;
        return stepMovement(unit, smartUnits, location);
    });


    // Step two: Attack 
    console.log('\x1b[33m%s\x1b[0m',`\n  Attack`);
    const attacks = relocatedUnits.reduce((acc, unit) => {
        if(unit.destroyed) return acc;
        const attack = stepAttack(unit, relocatedUnits, location);
        if(attack) {
            unit.previousTarget = attack.target;
            acc.push(attack);
        }
        return acc;
    }, []);

    // // Step four: Resolve
    console.log('\x1b[33m%s\x1b[0m',`\n  Resolve`);
    const unitsAfterResolve = stepResolve(relocatedUnits, attacks, location);



    return combatRound(roundNo - 1, unitsAfterResolve, location);
    
}


/**
 * Make decisions based on what is happening
 * 
 * @param {*} unit 
 * @param {*} units 
 * @param {*} location 
 */
function stepAnalyze(unit, units, location) {

    const currentAnalysis = {
        health: analyzeHealth(unit),
        morale: analyzeMorale(unit),
        enemy: analyzeEnemy(unit, units),
        location: analyzeSurroundings(unit, location),
        closestEnemy: findClosestEnemy(unit, units)
    };


    console.log(`    ${unit.name} : ${currentAnalysis.health}, ${currentAnalysis.enemy}`);

    // Make the latest analysis first in the history
    unit.analysisHistory.unshift(currentAnalysis);

    



    return unit;
}


function analyzeHealth(unit) {
    
    if(unit.amount === 0) {
        return "DESTROYED";
    }

    const troopsAlive = Math.round(((unit.amount / unit.maxtroops)*100));
    const troopsInjured = unit.troopStates.injured.length === 0 ? 0 : Math.round(((unit.troopStates.injured.length / unit.amount)*100));


    // NEAR DEATH
    if(troopsInjured >= 75 || troopsAlive <= 20) {
        return "NEAR DEATH";
    }

    // PERFECT
    if(troopsInjured <= 1 && troopsAlive >= 99) {
        return "PERFECT";
    }

    // GREAT
    if(troopsInjured <= 10 && troopsAlive >= 90) {
        return "GREAT";
    }

    // GOOD
    if(troopsInjured <= 20 && troopsAlive >= 75) {
        return "GOOD";
    }

    // OK
    if(troopsInjured <= 25 && troopsAlive >= 60) {
        return "OK";
    }

    // IN DANGER
    if(troopsInjured >= 50 || troopsAlive < 40) {
        return "IN DANGER";
    }

    // DAMAGED
    if(troopsInjured >= 25 || troopsAlive <= 60) {
        return "DAMAGED";
    }
    
    return "UNKNOWN";
}

function analyzeMorale(unit) {
    return "INDIFFERENT";
}

function analyzeSurroundings(unit, location) {
    return "OK";
}

function analyzeEnemy(unit, units) {
    
    // No contact to enemy
    if(unit.previousTarget === null) {
        return "SEEKING ENEMY";
    
    // Has been in engagement with the enemy
    } else {

        const prevTarget = units.find(un => un.id === unit.previousTarget.id);

        if(prevTarget.amount === 0) {
            return "ENEMY DESTROYED";
        }

        const InMyRange = isInRange(unit, prevTarget);
        const inEnemysRange = isInRange(prevTarget, unit);

        if(InMyRange && inEnemysRange )  {
            return "ENGAGED";
        }

        if(InMyRange && !inEnemysRange )  {
            return "FREE FIRE";
        }

        if(!InMyRange && inEnemysRange )  {
            return "UNDER FIRE";
        }

        if(!InMyRange && !inEnemysRange )  {
            return "LOST CONTACT";
        }
    }
}

/**
 * Resolve the movement of the unit
 * @param {*} unit 
 * @param {*} units 
 * @param {*} location 
 */
function stepMovement(unit, units, location) {
    // console.log(`    ${unit.name} in ${unit.army.name} of ${unit.army.owner}`);

    // 1. Decide how to move

    // 2. Move



    // Default March
    let movement = unit.speed * unit.direction;
    let MovementIdea = "Marching forward";


    const analysis = unit.analysisHistory[0];

    let command = "MARCH";

    if(analysis.enemy === "FREE FIRE") {
        command = "HOLD";
    }

    if(analysis.enemy === "SEEKING ENEMY") {
        console.log("Closest enemy", analysis.closestEnemy);

        command = "MARCH";
    }

    if(analysis.enemy === "LOST CONTACT") {
        
    }

    if(analysis.enemy === "UNDER FIRE") {
        command = "RETREAT";
    }

    if(analysis.health === "IN DANGER" || analysis.health === "NEAR DEATH") {
        command = "RETREAT";
    }

    


    // // if Previous enemy on range, hold still!
    // if(unit.previousTarget !== null && isInRange(unit, unit.previousTarget)) {
    //     movement = 0;
    //     MovementIdea = `Engaged with ${unit.previousTarget.name}! Hold the line`;
    // }

    // // If cannot target the previous enemy, retreat if taken hit, otherwise onwards!
    // if(unit.previousTarget !== null && !isInRange(unit, unit.previousTarget)) {
    //     if(unit.amount < unit.maxtroops) {
    //         movement = unit.speed * unit.direction * -1;
    //         MovementIdea = "Retreat! We are taking damage!";
    //     } else {
    //         movement = unit.speed * unit.direction;
    //         MovementIdea = "Follow them!";
    //     }
    // }

    // // Move towards closest enemy if no target yet
    // if(unit.previousTarget === null) {
    //     const closestEnemy = findClosestEnemy(unit, units);
    //     if(closestEnemy) {
    //         if(closestEnemy.location > unit.location) {
    //             movement = unit.speed;
    //         } 
    //         if(closestEnemy.location < unit.location) {
    //             movement = unit.speed * -1;
    //         } 
    //         if(closestEnemy.location === unit.location) {
    //             movement = 0;
    //         }
    //     }
    //     MovementIdea = `Seeking out ${closestEnemy.name}!`;
    // }
    
    
    switch(command) {
        case "ADVANCE":
            movement = 1 * unit.direction;
            break;
        case "MARCH":
            movement = unit.speed * unit.direction;
            break;
        case "CHARGE":
            movement = (unit.speed +1) * unit.direction;
            break;
        case "RETREAT":
            movement = unit.speed * unit.direction * -1;
            break;
        case "BACKWARDS":
            movement = 1 * unit.direction * -1;
            break;
        case "HOLD":
            movement = 0;
            break;
    }

    const oldLoc = unit.location;
    unit.location += movement;
    if(unit.location < 0) unit.location = 0;
    if(unit.location >= location.size) unit.location = location.size -1;
    
    console.log(`    ${unit.name} in ${unit.army.name} of ${unit.army.owner}`);
    console.log(`      Starting location: ${oldLoc}`);
    console.log(`      Movement: ${movement}`);
    console.log(`      Idea: ${MovementIdea}`);
    console.log(`      Command: ${command}`);
    console.log(`      Location: ${unit.location}`);
    return unit;
}


/**
 * Choose targets for unit in an army and return relevant attack objects.
 * @param {*} army 
 * @param {*} armies 
 * @param {*} location 
 */
function stepAttack(unit, units, location) {
    console.log(`    ${unit.name} in ${unit.army.name} of ${unit.army.owner}`);
    
    
    // Find valid enemy units
    const validTargetUnits = findValidTargetUnits(unit, units, location);
    
    // Choose valid target
    if(validTargetUnits.length <= 0) {
        console.log(`      No valid targets!`);
        return false;
    }
    const targetUnit = chooseValidTarget(unit, validTargetUnits, location);
    console.log(`      Attacks: ${targetUnit.name} ${targetUnit.id} with ${unit.amount} troops`);


    // Calculate damage that this attack will deal to the target

    return {attacker: unit, target: targetUnit, attackingUnitCount: unit.amount, casualities: calculateCasualities(unit, targetUnit, unit.amount, location)};
}

function findValidTargetUnits(attacker, units, location) {
    return units.reduce((targets, targetUnit) => {
        if(targetUnit.side !== attacker.side && targetUnit.amount > 0 && isInRange(attacker, targetUnit)) {
            targets.push(targetUnit);
            return targets;
        }
        return targets;
    }, []);
}

function chooseValidTarget(attacker, targets, location) {
    return targets.find(target => {
        return true;
    });
}





// Some basic ground rules here
//
// 1.  3 vs 1 max limit for troops of same size (unless other factors are taken account)
function calculateCasualities(attacker, defender, attackerCount, location) {

    
    
    // Max damage inflicted per attacking troop
    const maxDamagePower = attacker.power;


    // Troop sizes not relevant yet, so 3vs1 is hard coded.
    const maxAttackersPerDefender = 3;
    const attackersPerDefender = Math.ceil(defender.health / maxDamagePower) >= maxAttackersPerDefender ? maxAttackersPerDefender : Math.ceil(defender.health / maxDamagePower);

    // Max damage recieved per troop under attack
    const maxIncomingDamage = maxDamagePower * attackersPerDefender;

    // Max number of troops under attack
    const maxNumberOfTroopsUnderAttack = Math.floor(attackerCount / attackersPerDefender);

    const troopsUnderAttack = maxNumberOfTroopsUnderAttack < defender.amount ? maxNumberOfTroopsUnderAttack : defender.amount;

    // console.log(`MaxAttPerDef: ${maxAttackersPerDefender}, AttPerDef: ${attackersPerDefender}, Dmg/AttTrp: ${maxDamagePower}, DmgPerTrp: ${maxIncomingDamage}, Troops: ${maxNumberOfTroopsUnderAttack}`);

    const newCasualities = {
        dead: maxIncomingDamage >= defender.health ? troopsUnderAttack : 0,
        injured: maxIncomingDamage < defender.health ? troopsUnderAttack : 0,
        dmgPerInjured: maxIncomingDamage < defender.health ? maxIncomingDamage : 0
    };
    
    // console.log(newCasualities);

    return newCasualities;
        
}

/**
 * Resolve effects of damage to each unit in the army
 * 
 * @param {*} units 
 * @param {*} attacks 
 * @param {*} location 
 */
function stepResolve(units, attacks, location) {
 
    const unitsResolving = units.map(unit => Object.assign({}, unit));

    // Total up the casualities for each unit
    attacks.forEach(attack => {
        const unit = unitsResolving.find(u => u.id === attack.target.id);
        
        if(attack.casualities.dead > 0) {
            unit.troopStates.dead += attack.casualities.dead;
        }

        if(attack.casualities.injured > 0) {
            let inj = 0;
            for(let inj = 0; inj < attack.casualities.injured; inj++) {
                unit.troopStates.injured[inj] = unit.troopStates.injured[inj] === undefined ? attack.casualities.dmgPerInjured :  unit.troopStates.injured[inj] + attack.casualities.dmgPerInjured;    
            }
        }

        
    });


    // Remove dead people from the units

    return unitsResolving.map(unit => {
        if(unit.destroyed) {
            console.log('\x1b[31m%s\x1b[0m',`    Unit: ${unit.name} DESTROYED`);   
            return unit;
        }

        const stats = {
            injured: 0,
            deathByInjuries: 0,
            dead: 0
        };

        // Remove mortally wounded troops and leave the rest
        unit.troopStates.injured = unit.troopStates.injured.reduce((remaining, injury) => {
            if(injury >= unit.health) {
                unit.amount--;
                stats.deathByInjuries++;
                return remaining;
            }
            remaining.push(injury);
            return remaining;
        }, []);

        stats.injured = unit.troopStates.injured.length;
        stats.dead = unit.troopStates.dead;

        unit.amount -= unit.troopStates.dead;
        unit.troopStates.dead = 0;

        if(unit.amount <= 0) {
            unit.amount = 0;
            unit.destroyed = true;
        }
        
        console.log(`    Unit: ${unit.name} ${unit.amount}/${unit.maxtroops}\n      Dead: ${stats.dead}\n      Death By Injury: ${stats.deathByInjuries}\n      Injured: ${stats.injured}`);
        return unit;
    });
}








/// HELPERS

function isInRange(attacker, defender) {
    const distance = Math.abs(attacker.location - defender.location);
    if(attacker.name === "Archers") {
        // console.log('\x1b[36m%s\x1b[0m', attacker.name, attacker.location, defender.name, defender.location, attacker.range[0], distance, attacker.range[1], (distance >= attacker.range[0] && distance <= attacker.range[1]));
        // console.log('\x1b[36m%s\x1b[0m', `  ${attacker.name}@${attacker.location} vs. ${defender.name}@${defender.location} : Dist: ${distance} Range: ${attacker.range[0]} to ${attacker.range[1]} : in Range? ${(distance >= attacker.range[0] && distance <= attacker.range[1])}`)
    }
    
    return (distance >= attacker.range[0] && distance <= attacker.range[1]);
}

function findClosestEnemy(unit, units) {
    let closestUnit = false;
    let closestDistance = null;
    units.forEach(un => {
        if(un.side !== unit.side) {
            const distanceFromUnit = Math.abs(un.location - unit.location);
            if(closestDistance === null || distanceFromUnit < closestDistance) {
                closestDistance = distanceFromUnit;
                closestUnit = un;
            }
        }
    });
    return closestUnit;
}







module.exports = combat;

