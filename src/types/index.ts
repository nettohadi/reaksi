/* Constants */
export const Constants = {
  Fragment: 'Fragment'
};

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

export type TheEffectType = {
    id: number,
    deps: any[]|null,
    componentName:string
}

export type ComponentEffectType = {
    effect:Function,
    componentName:string
}

export type ComponentType = {
    id: number,
    factory: Function,
    props: any,
    node?:Node,
    container?:HTMLElement,
    name?:string
}

export type State = {
    id: number,
    value: any,
    set: Function,
    component: ComponentType | null
}

export type StateType = {
    value:any,
    set:SetStateType
}

export type SetStateType = (newState:any) => {}

export type EffectType = {
    oldDeps:any[]
}

export type RefType = {
    current:any
}

export type SelectorType = {
    value:any
}

export type RouterRegExpType = {
    value: RegExp,
    pattern: RegExp
}