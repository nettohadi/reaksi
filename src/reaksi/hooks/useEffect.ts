/* TODO : create onUnMounted lifecycle*/


import {getCurrentComponent, getUnMountedComponent, resetUnMountedComponents} from "./useState";
import {componentHookIds} from "../shared";

type EffectType = {
    id: number,
    deps: any[]|null,
    componentName:string
}

type ComponentEffectType = {
    effect:Function,
    componentName:string
}

let effects: EffectType[] = []
let pendingEffects: ComponentEffectType[] = [];
let unmountingEffects: ComponentEffectType[] = [];


export function resetEffectId(){
    componentHookIds.reset();
}

export function resetEffects(){
    effects = [];
}

export function resetPendingEffects(){
    pendingEffects = [];
}

export function useEffect(callBack, deps:any[]|null=null){
    const effectId = getEffectId();
    const effect = effects.find(effect => effect.id == effectId &&
                                          effect.componentName == getCurrentComponent()?.name);

    if(!effect){
        effects.push({id:effectId, deps, componentName: getCurrentComponent()?.name || ''});
        pendingEffects.push({effect:callBack, componentName:getCurrentComponent()?.name || ''});
    }else {
        if(depsChanged(effect.deps, deps)) {
            effect.deps = deps;
            pendingEffects.push({effect:callBack, componentName:getCurrentComponent()?.name || ''})
        };
    }
}

function getEffectId(){
    const currentComponent = getCurrentComponent();
    if(!currentComponent) return 0;

    const componentHook = componentHookIds.get().find(c => c.componentName === currentComponent?.name);

    if(componentHook){
        componentHook.lastEffectId ++;
        return componentHook.lastEffectId;
    }else{
        const {name} = currentComponent;
        componentHookIds.add({componentName:name || '', lastStateId: 0, lastEffectId: 1});
        return 1;
    }
}

function depsChanged(oldDeps:any[]|null, newDeps:any[]|null){
    if(oldDeps === null || newDeps === null) return true;

    if(oldDeps.length == 0 && newDeps.length == 0) return false;

    for (let index=0;index <= oldDeps.length-1; index++){
        if(oldDeps[index] !== newDeps[index]){
            return true;
        }
    }

    return false;
}

export function runAllPendingEffect(){
    runAllUnMountingEffects();
    pendingEffects.forEach(e => {
        let result = e.effect();
        if(typeof result == 'function') unmountingEffects.push({effect: result, componentName: e.componentName});
    });

    pendingEffects = [];
}

function runAllUnMountingEffects(){
    const unMountedComponents = getUnMountedComponent();
    const effectsToRun = unmountingEffects.filter(e => unMountedComponents.includes(e.componentName));


    effectsToRun.forEach(e => {
        e.effect();
    });

    unmountingEffects = unmountingEffects.filter(e => !unMountedComponents.includes(e.componentName));

    //remove effect
    effects = effects.filter(e => !unMountedComponents.includes(e.componentName));
    resetUnMountedComponents();
}
