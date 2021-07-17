import { componentHookIds } from '../shared';
import { getCurrentComponent } from './useState';

type RefHookType = {
   id: number;
   componentName: string;
   value: { current: any };
};

let refs: RefHookType[] = [];

type RefType<T> = {
   current: T;
};

/* TODO: edit diffing function to reuse node based on key and not replacing it */

export function resetRefs() {
   refs = [];
}

export function useRef<T>(value: T | any = null): RefType<T | any> {
   const refId = componentHookIds.getIdByKey('REF');
   const currentComponentName = getCurrentComponent()?.name;
   const ref = refs.find(
      (ref) => ref.id === refId && ref.componentName === currentComponentName
   );

   if (!currentComponentName) {
      throw new Error('useRef cannot be used outside Component');
   }

   if (!ref) {
      const newRef = {
         id: refId,
         componentName: currentComponentName,
         value: { current: value },
      };
      refs.push(newRef);
      return newRef.value;
   }

   return ref.value;
}
