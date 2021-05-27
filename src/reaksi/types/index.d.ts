export type VNodeType = {
    type:string | any,
    children: VNodeType[],
    props: any,
    componentName?: string
}

export type ComponentHookIdType = {
    componentName:string,
    lastStateId:number,
    lastEffectId:number,
    lastSelectorId:number
}

export type ComponentHookType = {
    id: number,
    factory: Function,
    node?:Node,
    container?:HTMLElement,
    name?:string,
    hooks: {
        states: [
            {id, value, set},
            {id, value, set}
        ],
        effects : [
            {id, deps},
            {id, deps}
        ]
    }

}

type EffectType = {
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