import {render} from "../render";
import {VNodeType} from "../types";
import {setCurrentEffectId} from "./useEffect";

type ComponentType = {
    id: number,
    factory: Function,
    node?:Node,
    container?:HTMLElement,
    name?:string
}

type state = {
    id: number,
    value: any,
    set: Function,
    component: ComponentType | null
}


let states: state[] = [];

export function resetStates(){
    states = [];
}

let currentStateId = 0;
let currentComponentId = 0;
let currentComponent:ComponentType;
let componentNames:string[] = [];
let oldComponentNames:string[] = [];

export function resetStateId(){
    currentStateId = 0;
}

export function resetComponentId(){
    currentComponentId = 0;
}

export function resetComponentNames() {
    oldComponentNames = [...componentNames];
    componentNames = [];
}

export function getUnMountedComponent():string[] {
    console.log({oldComponentNames, componentNames});
    return oldComponentNames.filter(name => !componentNames.includes(name));
}

export function setCurrentComponent(factory, container:HTMLElement|undefined, name:string='', props:any){
    currentComponentId++;

    /* Check if component name already exist */
    const componentAlreadyExist = isComponentAlreadyExist(name);

    if(props.key) name = name + '_' + props.key;

    if(componentAlreadyExist && !props.key) {
        console.error(`You need to specify a key for "${name}" if you want to use it more than once`);
        name = name + '_' + currentComponentId;

    }else if(componentAlreadyExist){
        name = name + '_' + props.key;
    }

    componentNames.push(name);

    currentComponent = {factory, id: currentComponentId, container, name};
    console.log({component:name});
    return name;
}

function isComponentAlreadyExist(name:string){
   return componentNames.includes(name);
}

export function getCurrentComponent(){
    return currentComponent;
}

export function setCurrentNode(node, currentComponentName){
    // console.log('setCurrentDom');
    const state = states.find(state => state.component?.name == currentComponentName);

    if(state && state.component){
        state.component.node = node;
    }

}

export default function useState(initialSate:any=null){
    currentStateId++;
    return createOrGetState(currentStateId, initialSate);
}

function createOrGetState(id:number, initialState=null){
    const state = states.find((item) => item.id == id);

    if(state){
        return [state.value, state.set];
    }else{
        const newState:state =
            {
                id,
                value: initialState,
                set: (newState) => setState(newState, id),
                component:currentComponent
            };

        states.push(newState);
        return [newState.value, newState.set];
    }
}

function setState(newState, id){
    const state = states.find((item) => item.id == id);

    if(state && state.value != newState){
        state.value = newState;

        const startingId = findStartingId(state.component);
        currentStateId = startingId - 1;

        currentComponentId = state.component ? state.component.id: 0;

        componentNames.push(state.component?.name || '');

        setCurrentEffectId(state.component?.name || '');

        render(state.component?.factory(), state.component?.container, state.component?.node);
    }



}

function findStartingId(component:ComponentType | null):number{
    const state = {...states.find(item => compareComponents(item.component, component))};
    return state?.id || 0;
}

function compareComponents(first:ComponentType|null, second:ComponentType|null){
    if(!first || !second) return false;

    return first.id == second.id;
}

function findByCompId(comp:ComponentType|null, currentComponentId:number){
    if(!comp) return false;

    return comp.id == currentComponentId;
}