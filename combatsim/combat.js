
const write = require('./Utils.js');

class Combat {

    constructor(location, options) {
        this.round = 0;
        this.location = location;
        this.sideCodes = options.sides ? options.sides : ["A", "B"];
        this.sides = this.sideCodes.reduce((sides, side) => {
            sides[side] = {
                armies: []
            };
            return sides;
        }, {})
    }

    addArmy(army, toSide) {
        this.sides[toSide].armies.push(army);
    }


    start() {
        write('Combat begins', 0, "Green",2,1);
    }

}


module.exports = Combat;