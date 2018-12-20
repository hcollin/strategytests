const { createStore, combineReducers } = require('redux');

const { reducer: unitReducer } = require('unitState');
const { reducer: locationReducer } = require('locationState');

const rootReducer = combineReducers({
    units: unitReducer,
    location: locationState
});

const BATTLESTATE = createStore(rootReducer);


module.exports = BATTLESTATE;





