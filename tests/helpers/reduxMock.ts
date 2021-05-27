type StoreType = {
    getState:Function,
    setState:Function,
    subscribe:Function,
    dispatch:Function,
}

let state:any = {};
let callbacks:Function[] = [];

export const storeMock:StoreType = {
    getState(){
        return state;
    },
    setState(newState){
        state = newState;
    },
    subscribe(callback:Function){
        callbacks.push(callback);
    },
    dispatch(){
        callbacks.forEach(callback => callback());
    }
}

export function resetReduxMock(){
    state = {};
    callbacks = [];
}

