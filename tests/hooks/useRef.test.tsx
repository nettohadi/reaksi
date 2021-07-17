import 'regenerator-runtime/runtime';
import Reaksi, { useRef } from '../../src';
import {
   resetStates,
   setCurrentComponentToNull,
} from '../../src/hooks/useState';
import { resetRefs } from '../../src/hooks/useRef';

describe('useRef', () => {
   beforeEach(() => resetRefs());

   it(`should preserve the value between renders`, () => {
      /* Setup */
      let _ref1, _ref2;
      const container = document.createElement('div');
      const Component = () => {
         const ref1 = (_ref1 = useRef(0));
         const ref2 = (_ref2 = useRef(1));

         ref1.current !== null && ref1.current++;
         ref2.current !== null && ref2.current++;
         return <div></div>;
      };

      /* Invoke */
      Reaksi.render(<Component />, container);

      /* Assert */
      Reaksi.render(<Component />, container);
      expect(_ref1.current).toBe(2);
      expect(_ref2.current).toBe(3);
   });

   it(`initial value will be null if not supplied`, () => {
      /* Setup */
      let _ref1;
      const container = document.createElement('div');
      const Component = () => {
         _ref1 = useRef();
         return <div></div>;
      };

      /* Invoke */
      Reaksi.render(<Component />, container);

      /* Assert */
      expect(_ref1.current).toBe(null);
   });

   it(`will throw error if used outside of a component`, () => {
      setCurrentComponentToNull();
      expect(() => {
         useRef(0);
      }).toThrowError();
   });
});
