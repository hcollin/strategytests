
const Unit = require('./Unit.js');

class Army {

    constructor(data) {
        this.owner = data.owner;
        
        this.name = data.name;

        this.units = [];
        if(Array.isArray(data.units)) {
            data.units.forEach(unitData => {
                this.addUnit(unitData);
            });
        }
    }

    addUnit(unitData) {
        const u = new Unit(unitData);
        u.assignToArmy(this);
        this.units.push(u);
    }
}


module.exports = Army;