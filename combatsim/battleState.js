const { produce } = require('immer');

const INITIALSTATE = {
    armies: [],
    units: [],
    location: null
};

function modify(action={}) {
    if(state===false) {
        state = INITIALSTATE;
    }
    const newState = produce(state, draft => {
        switch(action.type) {
            case "OVERRIDE":
                draft = action.data;
                break;
            case "SETLOCATION":
                draft.location = action.data;
                break;

            default:
                break;
        }
    });
    stateHistory.push({type: action.type, action: action, state: newState});
    return newState;
}

module.exports = {
    modify: modify,
    log: showHistory
}

