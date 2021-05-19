/* TODO : create onmounted lifecycle*/
/* TODO : create onUnMounted lifecycle*/
/* TODO : create useEffect with dependencies*/

import {getCurrentComponent, getUnMountedComponent} from "./useState";

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

let currentEffectId = 0;

export function resetEffectId(){
    currentEffectId = 0;
}

export function resetEffects(){
    effects = [];
}

export function resetPendingEffects(){
    pendingEffects = [];
}

export function useEffect(callBack, deps:any[]|null=null){
    currentEffectId++;
    const effect = effects.find(effect => effect.id == currentEffectId);

    if(!effect){
        console.log('on mount effect');
        effects.push({id:currentEffectId, deps, componentName: getCurrentComponent().name || ''});
        pendingEffects.push({effect:callBack, componentName:getCurrentComponent().name || ''});
    }else {
        if(depsChanged(effect.deps, deps)) {
            effect.deps = deps;
            pendingEffects.push({effect:callBack, componentName:getCurrentComponent().name || ''})
        };
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
    console.log('unmounted component', getUnMountedComponent());
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
    console.log('unmounting ...', {unMountedComponents, effects, unmountingEffects})
}

export function setCurrentEffectId(currentComponentName:string){
    const effectId = effects.find(effect => effect.componentName == currentComponentName)?.id || 1;
    currentEffectId = effectId  - 1;
}