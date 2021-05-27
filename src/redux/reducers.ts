import {combineReducers} from "redux";

const initialState = {
    count: 99
}

function counterReducer(state= initialState, action){
    switch (action.type){
        case 'count/increment':
            return {count:state.count + 1}
            break;
        default:
            return state;
            break;
    }
}

const initialNumber = {
    number: 88
}

function numberReducer(state= initialNumber, action){
    switch (action.type){
        case 'number/increment':
            return {number:state.number + 1}
            break;
        default:
            return state;
            break;
    }
}

const reducers = combineReducers({counterReducer, numberReducer})

export default reducers;
