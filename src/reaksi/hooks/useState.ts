import {render} from "../render";
import { componentHookIds} from "../shared";

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

let currentComponentId = 0;
let currentComponent:ComponentType | null;
let componentNames:string[] = [];

let unMountedComponents:string[] = [];
export function addUnMountedComponent(names:string[]){
    if(names.length) unMountedComponents = unMountedComponents.concat(names);
}

export function getUnMountedComponent():string[] {
    return unMountedComponents;
}

export function resetUnMountedComponents(){
    unMountedComponents = [];
}


export function resetComponentId(){
    currentComponentId = 0;
}

export function resetComponentNames() {
    componentNames = [];
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
    return name;
}

function isComponentAlreadyExist(name:string){
   return componentNames.includes(name);
}

export function getCurrentComponent(){
    return currentComponent;
}

export function setCurrentNode(node, currentComponentName){
    const state = states.find(state => state.component?.name == currentComponentName);

    if(state && state.component){
        state.component.node = node;
    }

}

export default function useState(initialSate:any=null){
    return createOrGetState(initialSate);
}

function getStateId(){
    if(!currentComponent) return 0;

    const componentHook = componentHookIds.get().find(c => c.componentName === currentComponent?.name);

    if(componentHook){
        componentHook.lastStateId ++;
        return componentHook.lastStateId;
    }else{
        const {name} = currentComponent;
        componentHookIds.add({componentName:name || '', lastStateId: 1, lastEffectId: 0});
        return 1;
    }
}

export function updateNodeRefInStates(componentName:string, node:Node){
    const state = states.find( s => s.component?.name === componentName);
    if(state && state.component) state.component.node = node;
}

function createOrGetState(initialState=null){
    const stateId = getStateId();
    const state = states.find((item) => item.id === stateId && item.component?.name === currentComponent?.name);

    if(state){
        return [state.value, state.set];
    }else{
        const {name : componentName} = currentComponent || {name:''};
        const newState:state =
            {
                id:stateId,
                value: initialState,
                set: (newState) => setState(newState, stateId, componentName || ''),
                component: currentComponent
            };

        states.push(newState);
        return [newState.value, newState.set];
    }
}

function setState(newState, id, componentName:string){
    const state = states.find((item) => item.id == id && item.component?.name === componentName);

    if(state && state.value != newState){
        state.value = newState;


        currentComponentId = state.component ? state.component.id: 0;

        componentNames.push(state.component?.name || '');

        currentComponent = state.component ? {...state.component} : null;

        //reset componentHooks
        componentHookIds.reset();

        const newNode = state.component?.factory();
        render(newNode, state.component?.container, state.component?.node);
    }



}
