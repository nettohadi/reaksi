import {getCurrentComponent, getUnMountedComponent, resetUnMountedComponents} from "./useState";
import {componentHookIds} from "../shared";
import {ComponentEffectType, TheEffectType} from "../types";

let effects: TheEffectType[] = []
let pendingEffects: ComponentEffectType[] = [];
let unmountingEffects: ComponentEffectType[] = [];


export function resetEffectId(){
    componentHookIds.reset();
}

export function resetEffects(){
    effects = [];
}

export function useEffect(callback: () => void, deps: any[]|null=null){
    const effectId = componentHookIds.getIdByKey('EFFECT');
    //const effect = currentHook('EFFECT')

    const effect = effects.find(effect => effect.id == effectId &&
                                          effect.componentName == getCurrentComponent()?.name);

    if(!effect){
        effects.push({id:effectId, deps, componentName: getCurrentComponent()?.name || ''});
        pendingEffects.push({effect:callback, componentName:getCurrentComponent()?.name || ''});
    }else {
        if(depsChanged(effect.deps, deps)) {
            effect.deps = deps;
            pendingEffects.push({effect:callback, componentName:getCurrentComponent()?.name || ''})
        };
    }
}

/**
 * Used to compare old and new dependencies in useEffect & useMemo hook
 * @param oldDeps : old dependencies
 * @param newDeps : new dependencies
 */

function depsChanged(oldDeps:any[]|null, newDeps:any[]|null){

    const isChanged = (
            !oldDeps ||
            oldDeps.length !== newDeps?.length ||
            newDeps?.some((arg, index) => arg !== oldDeps[index])
    );

    return isChanged;
}

/**
 * run all effects that was determined in useEffect hook
 * Effect may run or not depending on condition ( whether one or more dependencies are changed )
 */
export function runAllPendingEffect(){
    /* run unmounting effects first if there are any */
    runAllUnMountingEffects();
    pendingEffects.forEach((e, index) => {

        /* Critical !!! We need to get rid the effect from the list before invoking it
        *  If not, we'll run into infinite loop hell of rerender when effect contains setState call */
        pendingEffects = pendingEffects.slice(index,index);

        let result = e.effect();
        if(typeof result == 'function') unmountingEffects.push({effect: result, componentName: e.componentName});
    });

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
