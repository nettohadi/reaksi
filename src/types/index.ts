/* Constants */

export type ReaksiType = {
   render(
      vNode: VNodeType,
      container: HTMLElement | null | undefined,
      oldDom?: Node | any | null
   );
   createElement(
      type: string,
      attributes: any,
      children: VNodeType[]
   ): VNodeType;
   useState: Function;
   useEffect: Function;
   useContext: Function;
   createContext: Function;
   useSelector: Function;
   useDispatch: Function;
   ReduxProvider: Function;
   useRef: Function;
   Router: Function;
   Route: Function;
   useRouter: Function;
   Fragment: Function;
};

export type VNodeType = {
   type: string | any;
   children: VNodeType[];
   props: any;
   componentName?: string;
};

export type JSXElement = VNodeType | any;

export type HookKeyType = 'STATE' | 'EFFECT' | 'REF' | 'SELECTOR';

export type ComponentHookIdType = {
   componentName: string;
   hookLastId?: any;
   lastStateId?: number;
   lastEffectId?: number;
   lastSelectorId?: number;
};

export type ComponentHookType = {
   name: string;
   props: any | null;
   factory: Function | null;
   parentNode?: HTMLElement | null;
   node?: HTMLElement | null;
   hook: {
      states: StateType[];
      effects: EffectType[];
      refs: RefType[];
      selectors: SelectorType[];
   };
};

export const componentHooks: Map<Node, ComponentHookType> = new Map();

// componentHooks.set(null, {factory, hooks: {state: [{value:1, set:(newState) => {}}]}});

export type TheEffectType = {
   id: number;
   deps: any[] | null;
   componentName: string;
};

export type ComponentEffectType = {
   effect: Function;
   componentName: string;
};

export type ComponentType = {
   id: number;
   factory: Function;
   props: any;
   node?: Node;
   container?: HTMLElement;
   name?: string;
};

export type State<T> = {
   id: number;
   value: T;
   set: Function;
   component: ComponentType | null;
};

export type HistoryType = {
   push: (path: string) => void;
   path: string;
   getParam: (param: string) => string;
};

export type StateType = {
   value: any;
   set: SetStateType;
};

export type SetStateType = (newState: any) => {};

export type EffectType = {
   oldDeps: any[];
};

export type RefType = {
   current: any;
};

export type SelectorType = {
   value: any;
};

export type RouterRegExpType = {
   value: RegExp;
   pattern: RegExp;
};

export type SetterType<T> = (state: T) => void;
export type UseStateType<T> = [value: T, setter: SetterType<T>];
