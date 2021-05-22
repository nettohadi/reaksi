import {ComponentHookIdType} from "../types";

let _componentHookIds:ComponentHookIdType[] = [];

export const componentHookIds = {
    get: () => { return _componentHookIds},
    reset: () => {_componentHookIds = []},
    add: (item: ComponentHookIdType) => { _componentHookIds.push(item)}
}
