const { produce } = require('immer');


const INITIALSTATE = {
    units: []
};

function unitReducer(state=INITIALSTATE, action) {
    return produce(state, draft => {

    });
}

module.exports.reducer = unitReducer;