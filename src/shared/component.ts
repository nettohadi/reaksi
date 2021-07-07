import {ComponentHookType, HookKeyType} from "../types";

const _componentHook  = {};
export const componentHook = {
    get(componentName:string):ComponentHookType | null{
        if(componentName.trim() === '') return null;
        if(!_componentHook.hasOwnProperty(componentName)){
            const c = _componentHook[componentName] =  {
                name: componentName,
                node: null,
                props: null,
                factory: null,
                parentNode: null,
                hook: {
                    states: [],
                    effects: [],
                    selectors: [],
                    refs: []
                }

            } as ComponentHookType

        }
        return _componentHook[componentName];
    }
};