import {
    ComponentHookIdType,
    ComponentHookType,
    EffectType,
    HookKeyType,
    RefType,
    SelectorType,
    StateType
} from "../types";
import {getCurrentComponent} from "../hooks/useState";
import {componentHook} from "./component";

let _componentHookIds: ComponentHookIdType[] = [];

export const componentHookIds = {
    get: () => {
        return _componentHookIds
    },
    getIdByKey: function (key: HookKeyType): number {
        const currentComponent = getCurrentComponent();
        if (!currentComponent) return 0;

        const componentHook = componentHookIds.get().find(c => c.componentName === currentComponent?.name);

        if (componentHook && componentHook.hookLastId.hasOwnProperty(key)) {
            return ++componentHook.hookLastId[key];
        }

        if (!componentHook) {
            const hookLastId = {[key]: 1};
            componentHookIds.add({componentName: currentComponent.name || '', hookLastId});
            return 1
        }

        if (!componentHook.hookLastId.hasOwnProperty(key)) {
            componentHook.hookLastId[key] = 1;
            return 1;
        }

        return 1;

    },
    reset: () => {
        _componentHookIds = []
    },
    add: (item: ComponentHookIdType) => {
        _componentHookIds.push(item)
    }
}



export function currentHook (hookName:HookKeyType) : StateType | EffectType | SelectorType | RefType | null{
    const hookId = componentHookIds.getIdByKey(hookName);
    const c = componentHook.get(getCurrentComponent()?.name || '');
    return c?.hook[hookName][hookId];
}
