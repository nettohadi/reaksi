export type VNodeType = {
    type:string | any,
    children: VNodeType[],
    props: any,
    componentName?: string
}

export type ComponentHookIdType = {
    componentName:string,
    hookLastId?:any,
    lastStateId?:number,
    lastEffectId?:number,
    lastSelectorId?:number
}

export type ComponentHookType = {
    factory: Function,
    parentNode?:HTMLElement,
    hooks: {
        states: StateType[],
        effects : EffectType[],
        refs: RefType[],
        selectors: SelectorType[]
    }

}

export const componentHooks:Map<Node, ComponentHookType> = new Map();

// componentHooks.set(null, {factory, hooks: {state: [{value:1, set:(newState) => {}}]}});

type TheEffectType = {
    id: number,
    deps: any[]|null,
    componentName:string
}

type ComponentEffectType = {
    effect:Function,
    componentName:string
}

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

type StateType = {
    value:any,
    set:SetStateType
}

type SetStateType = (newState:any) => {}

type EffectType = {
    oldDeps:any[]
}

type RefType = {
    current:any
}

type SelectorType = {
    value:any
}