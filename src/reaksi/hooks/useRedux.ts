import useState, {getCurrentComponent} from "./useState";
import {componentHookIds} from "../shared";

let store:any = {};

type SelectorComponentType = {
    id:number,
    componentName:string
}
let selectors:SelectorComponentType[] = [];

export function useSelector(callback){
    const result = callback(store.getState());
    const [, setState] = useState(result);

    const selectorId = componentHookIds.getIdByKey('SELECTOR') || 1;
    const component = getCurrentComponent();
    const existingSelector = selectors.find(s => s.id === selectorId && s.componentName === component?.name);

    if(!existingSelector){
        selectors.push({id:selectorId, componentName: component?.name || ''})
        store.subscribe(() => {
            setState(callback(store.getState()));
        });
    }

    return result;
}

// function getSelectorId(){
//     const currentComponent = getCurrentComponent();
//     if(!currentComponent) return 0;
//
//     const componentHook = componentHookIds.get().find(c => c.componentName === currentComponent?.name);
//
//     if(componentHook){
//         componentHook.lastSelectorId ++;
//         return componentHook.lastSelectorId;
//     }else{
//         const {name} = currentComponent;
//         componentHookIds.add({componentName:name || '', lastStateId: 0, lastEffectId: 0, lastSelectorId: 1});
//         return 1;
//     }
// }

export function Provider(props){
    store = props.store || {};
    const {children} = props;
    return {
        type:'div',
        children: children,
        props:{children}
    };
}

export function useDispatch(){
    return store.dispatch;
}

export function resetSelectors(){
    selectors = [];
}