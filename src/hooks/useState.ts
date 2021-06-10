import {reconcile} from "../render";
import {componentHookIds} from "../shared";
import type {ComponentType, State, VNodeType} from "../types";
import {Constants} from "../helpers";

let states: State[] = [];

let __TEST__ = false;

export function resetStates() {
    states = [];
    __TEST__ = true;
}


let currentComponentId = 0;
let currentComponent: ComponentType | null;
let componentNames: string[] = [];

let unMountedComponents: string[] = [];

export function addUnMountedComponent(names: string[], source:string='') {
    if (names.length) unMountedComponents = unMountedComponents.concat(names);
}

export function getUnMountedComponent(): string[] {
    return unMountedComponents;
}

export function resetUnMountedComponents() {
    unMountedComponents = [];
}

export function setCurrentComponentToNull(){
    currentComponent = null;
}


export function resetComponentId() {
    currentComponentId = 0;
}

export function resetComponentNames() {
    componentNames = [];
    currentComponent = null;
}


export function setCurrentComponent(factory,
                                    container: HTMLElement | undefined,
                                    name: string = '',
                                    props: any,
                                    index: number | null = null) {

    currentComponentId++;

    /* Check if component name already exist */
    const componentAlreadyExist = isComponentAlreadyExist(name);

    if (props.key) name = name + '_' + props.key;

    const useContextProvider = 'Provider';

    if (componentAlreadyExist && !props.key && name !== useContextProvider && name !== 'Fragment' && name !== 'Route') {
        if (!__TEST__) {
            console.warn(`You need to specify a key for "${name}" 
                         if you want to use it more than once`);
        }

        name = name + '_' + (index || '');

    } else if (componentAlreadyExist) {
        name = name + '_' + props.key;
    }

    componentNames.push(name);

    currentComponent = {factory, id: currentComponentId, container, name, props};
    return name;
}

function isComponentAlreadyExist(name: string) {
    return componentNames.includes(name);
}

export function getCurrentComponent() {
    return currentComponent;
}

export function setCurrentNode(node, currentComponentName) {
    const state = states.find(state => state.component?.name == currentComponentName);

    if (state && state.component) {
        state.component.node = node;
    }

}

export default function useState(initialSate: any = null) {
    if(!currentComponent)
        throw new Error(`Hook can not be called outside function component, inside condition, loop, or nested function`);

    return createOrGetState(initialSate);
}

export function updateNodeRefInStates(componentName: string, node: Node) {
    const state = states.find(s => s.component?.name === componentName);
    if (state && state.component) state.component.node = node;
}

function createOrGetState(initialState = null) {
    const stateId = componentHookIds.getIdByKey('STATE') || 1;
    const state = states.find((item) => item.id === stateId && item.component?.name === currentComponent?.name);

    if (state) {
        if(state.component) state.component.props = currentComponent?.props;
        return [state.value, state.set];
    } else {
        const {name: componentName} = currentComponent || {name: ''};
        const newState: State =
            {
                id: stateId,
                value: initialState,
                set: (stateOrCallback: any | Function) => {
                    setState(stateOrCallback, stateId, componentName || '')
                },
                component: currentComponent
            };

        states.push(newState);
        return [newState.value, newState.set];
    }
}


function setState(newStateOrCallback: any | Function, id: number, componentName: string) {
    const state = states.find((item) => item.id == id && item.component?.name === componentName);
    if(!state) return;

    let newState: any = newStateOrCallback;
    if (typeof newStateOrCallback === 'function') {
        newState = newStateOrCallback(state.value);
    }

    if (state && state.value !== newState) {
        state.value = newState;

        currentComponentId = state.component ? state.component.id : 0;
        currentComponent = state.component ? {...state.component} : null;

        //reset componentHooks
        componentHookIds.reset();

        componentNames.push(state.component?.name || '');

        /* invoke component*/
        let newVNode:VNodeType = state.component?.factory(state.component?.props);

        newVNode = handleFragment(newVNode, state);

        newVNode.componentName = state.component?.name || '';
        if(state.component?.container) reconcile(newVNode, state.component?.container, state.component?.node);
    }

}

function handleFragment(vNode:VNodeType, state:State){
    let oldVNode = (state.component?.node as any)?._vNode;

    if((vNode.type === Constants.Fragment || vNode.type.name === Constants.Fragment) && oldVNode) {
        const oldChildren = [...oldVNode.children];
        oldChildren?.forEach((item, index) => {
            if(item.type.name === state.component?.name || item.componentName === state.component?.name){
                oldChildren[index] = {...vNode, componentName:state.component?.name};
            }
        })
        oldVNode.children = oldChildren;
        vNode = oldVNode;
    }

    return vNode;
}


