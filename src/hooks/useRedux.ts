import useState, { getCurrentComponent } from './useState';
import { componentHookIds } from '../shared';
import { Constants } from '../helpers';

let store: any = {};

type SelectorComponentType = {
   id: number;
   componentName: string;
};
let selectors: SelectorComponentType[] = [];

export function useSelector(callback) {
   const result = callback(store.getState());
   const [, setState] = useState(result);

   const selectorId = componentHookIds.getIdByKey('SELECTOR') || 1;
   const component = getCurrentComponent();
   const existingSelector = selectors.find(
      (s) => s.id === selectorId && s.componentName === component?.name
   );

   if (!existingSelector) {
      selectors.push({ id: selectorId, componentName: component?.name || '' });
      store.subscribe(() => {
         setState(callback(store.getState()));
      });
   }

   return result;
}

export function Provider(props: { store; children? }) {
   store = props.store || {};
   const { children } = props;
   return {
      type: 'div',
      children: children,
      props: { children },
   };
}

export function useDispatch() {
   return store.dispatch;
}

export function resetSelectors() {
   selectors = [];
}
