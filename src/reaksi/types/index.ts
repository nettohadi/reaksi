export type VNodeType = {
    type:string | any,
    children: VNodeType[],
    props: any,
    componentName?: string
}

export type ComponentHookIdType = {
    componentName:string,
    lastStateId:number,
    lastEffectId:number
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