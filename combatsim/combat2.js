
const write = require('./battleLog.js');
const { modify, log } = require('./battleState.js');


/**
 * This is the main function that starts the battle and returns the results
 * 
 * @param {*} armies 
 * @param {*} location 
 */
function battle(armies, location) {

    const initialState = modify();
    const withLocation = modify(initialState, {type: "SETLOCATION", data: location});
    console.log(withLocation);
    



}

module.exports = battle;