
/**
 * Starts the combat between two sides. Multiple armies can be on each side
 * 
 * @param {*} ARMIES 
 * @param {*} LOCATION 
 * @param {*} CONFIG 
 */
function combat(ARMIES, LOCATION, CONFIG) {
    console.log(`\nCombat Begins!\n  Armies: ${ARMIES.length}\n`);



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
                    location: army.side === "A" ? 0 : CONFIG.arenaWidth,
                    targetting: [],
                    side: army.side,
                    troopStates:{
                        dead: 0,
                        injured: []
                    },
                    army: {
                        name: army.name,
                        owner: army.owner,
                        side: army.side
                    }
                });
        });
        return allUnits.concat(armyUnits);
    }, []);


    // Make combat rounds recursive


    const unitsAfterCombat = combatRound(CONFIG.rounds, units, LOCATION);

    // const unitStateHistory = [];
    // unitStateHistory.push(units);

    // for(let cRound = 0; cRound < CONFIG.rounds; cRound++) {
    //     const unitsAfterRound = combatRound(cRound, unitStateHistory[cRound], LOCATION);
    //     unitStateHistory.push(unitsAfterRound);
    // }


    console.log("\n\nFinal results!\n", unitsAfterCombat);
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

    console.log(`\nCOMBAT ROUND ${roundNo}`);


    // Step one: Movement
    console.log(`\n  Movement`);
    const relocatedUnits = unitsAtTheStartOftheRound.map(unit => {
        return stepMovement(unit, unitsAtTheStartOftheRound, location);
    });


    // Step two: Attack 
    console.log(`\n  Attack`);
    const attacks = relocatedUnits.reduce((acc, unit) => {
        const attack = stepAttack(unit, relocatedUnits, location);
        if(attack) {
            acc.push(attack);
        }
        return acc;
    }, []);

    // // Step four: Resolve
    console.log(`\n  Resolve`);
    const unitsAfterResolve = stepResolve(relocatedUnits, attacks, location);



    return combatRound(roundNo - 1, unitsAfterResolve, location);
    
}

/**
 * Resolve the movement of the unit
 * @param {*} unit 
 * @param {*} units 
 * @param {*} location 
 */
function stepMovement(unit, units, location) {
    // console.log(`    ${unit.name} in ${unit.army.name} of ${unit.army.owner}`);
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
        if(targetUnit.side !== attacker.side && targetUnit.amount > 0) {
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

    console.log(`MaxAttPerDef: ${maxAttackersPerDefender}, AttPerDef: ${attackersPerDefender}, Dmg/AttTrp: ${maxDamagePower}, DmgPerTrp: ${maxIncomingDamage}, Troops: ${maxNumberOfTroopsUnderAttack}`);

    const newCasualities = {
        dead: maxIncomingDamage >= defender.health ? troopsUnderAttack : 0,
        injured: maxIncomingDamage < defender.health ? troopsUnderAttack : 0,
        dmgPerInjured: maxIncomingDamage < defender.health ? maxIncomingDamage : 0
    };
    
    console.log(newCasualities);

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
        
        console.log(`    Unit: ${unit.name} ${unit.amount}/${unit.maxtroops}\n      Dead: ${stats.dead}\n      Death By Injury: ${stats.deathByInjuries}\n      Injured: ${stats.injured}`);
        return unit;
    });
}



function calculateDamage(attack) {
    return attack.attacker.amount * attack.attacker.power;
}








module.exports = combat;

