import {componentHookIds} from "../shared";
import {getCurrentComponent} from "./useState";

type RefType = {
    id:number,
    componentName:string,
    value: { current:any }
}

let refs:RefType[] = [];

export function useRef(value:any|null = null){
    const refId = componentHookIds.getIdByKey('REF') || 1;
    const currentComponentName = getCurrentComponent()?.name || '';
    const ref = refs.find(ref => ref.id === refId && ref.componentName === getCurrentComponent()?.name);

    if(!ref) {
        const newRef = {id: refId, componentName: currentComponentName, value:{current:value}};
        refs.push(newRef);
        return newRef.value;
    }

    return ref.value;
}