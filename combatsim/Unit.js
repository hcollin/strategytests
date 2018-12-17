
class Unit {

    constructor(data) {

        this.id = data.id ? data.id : `${data.name}-${Math.random(100000)}`;

        this.armyId = data.armyId ? data.armyId : null;

        this.name = data.name;
        this.health = data.health;
        this.power = data.power;
        
        this.morale = data.morale ? data.morele : 100;
        
        this.speed = data.speed ? data.speed : 2;
        this.minRange = data.range[0];
        this.maxRange = data.range[1];


        this.troops = [];
        for(let i = 0; i < data.troops; i++) {
            const troop = new Troop(data, `${data.name}-${i}`);
            this.troops.push(troop)
        }
    }

    assignToArmy(army) {
        this.army = army;
    }

}


class Troop {

    constructor(id, data) {
        this.health = data.health;
        this.morale = data.morale ? data.morale : 100;
        this.alive = true;
    }

}


module.exports = Unit;