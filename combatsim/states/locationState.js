const { produce } = require('immer');

const INITIALSTATE = {
    location: {}
};


function locationReducer(state=INITIALSTATE, action) {
    return produce(state, draft => {
        switch(action.type) {
            case "SETLOCATION":
                draft.location = action.data;
                break;
        }
    });
}

module.exports.reducer = locationReducer;