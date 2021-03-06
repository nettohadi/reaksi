import Reaksi from '../src';
import { removeAllWhiteSpaces } from './helpers';
import { fireEvent } from '@testing-library/dom';

/* Mock event handler*/
import handler from './handlers';
import useState, { resetStates } from '../src/hooks/useState';
import { setAsFirstRender } from '../src/helpers';

jest.mock('./handlers', () => {
   return jest.fn().mockImplementation(() => '');
});

describe('render()', () => {
   beforeEach(() => {
      resetStates();
      setAsFirstRender();
   });

   it('should render every element to the dom container correctly', () => {
      /* Setup */
      const Component = () => {
         return (
            <div>
               <h1 class='testClass'>h1</h1>
               <span>span</span>
               <p>p</p>
               <img src='testSrc' />
               simple test case_1
               <div>
                  <div>
                     <p custom-attr='custom'>
                        <span>deep span</span>
                     </p>
                  </div>
               </div>
            </div>
         );
      };
      const container = document.createElement('div');
      const expectedHtml = `
             <div>
                <h1 class="testClass">h1</h1>
                <span>span</span>
                <p>p</p>
                <img src="testSrc">
                    simple test case_1
                <div>
                    <div>
                        <p custom-attr="custom">
                            <span>deep span</span>
                        </p>
                    </div>
                </div>
            </div>
        `;

      /* Invoke */
      Reaksi.render(<Component />, container);

      /* Assert */
      expect(container.innerHTML).toEqual(removeAllWhiteSpaces(expectedHtml));
   });

   it('should register event listener correctly', () => {
      /* Setup */
      const Component = () => <button onclick={handler}></button>;
      const container = document.createElement('div');

      /* Invoke */
      Reaksi.render(<Component />, container);
      const button = container.firstChild as Node;
      fireEvent(button, new MouseEvent('click'));

      /* Assert */
      expect(handler).toBeCalled();
   });

   it('should update element (diff) when render is called more than once', () => {
      /* Setup */
      const Component_1 = () => (
         <div class='first'>
            <span>
               <p>p</p>
            </span>
         </div>
      );
      const Component_2 = () => (
         <div class='second'>
            <span>
               <h3>second</h3>
            </span>
         </div>
      );
      const container = document.createElement('div');

      /* Invoke */
      Reaksi.render(<Component_1 />, container);
      /* Assert */
      expect(container.innerHTML).toEqual(
         removeAllWhiteSpaces(`<div class="first"><span><p>p</p></span></div>`)
      );

      /* Invoke */
      Reaksi.render(<Component_2 />, container);
      /* Assert */
      expect(container.innerHTML).toEqual(
         removeAllWhiteSpaces(
            `<div class="second"><span><h3>second</h3></span></div>`
         )
      );
   });

   it('should update element (diff) when some children are removed', () => {
      /* Setup */
      const Component_1 = () => (
         <div class='first' test='second'>
            <div>
               <p class='p'>1</p>
               <p>2</p>
               <p>3</p>
            </div>
         </div>
      );
      const Component_2 = () => (
         <div class='first'>
            <div>
               <p class='new'>1</p>
               <p>2</p>
            </div>
         </div>
      );
      const container = document.createElement('div');

      /* Invoke */
      Reaksi.render(<Component_1 />, container);
      /* Assert */
      let expected = `<div class="first" test="second">
                              <div><p class="p">1</p><p>2</p><p>3</p></div>
                         </div>`;

      expect(container.innerHTML).toEqual(removeAllWhiteSpaces(expected));

      /* Invoke */
      Reaksi.render(<Component_2 />, container);

      /* Assert */
      expected = `<div class="first">
                        <div>
                            <p class="new">1</p>
                            <p>2</p>
                        </div>
                    </div>`;

      expect(container.innerHTML).toEqual(removeAllWhiteSpaces(expected));
   });

   it('should render children component (slot) correctly', () => {
      /* Setup */
      const Component = (props) => {
         return <div class='first'>first-{props?.children}</div>;
      };

      const container = document.createElement('div');

      /* Invoke */
      Reaksi.render(
         <Component>
            <span>slot</span>
         </Component>,
         container
      );

      /* Assert */
      expect(container.innerHTML).toEqual(
         removeAllWhiteSpaces(`
            <div class="first">first-<span>slot</span></div>
        `)
      );
   });

   /* Bug #3 : Can not render Component without root html element*/
   it(`should be able to render Component without specifying native Html element as root`, () => {
      /* Setup */
      const container = document.createElement('div');
      const GrandChild = () => <div>test</div>;
      const Child = () => <GrandChild />;
      const App = () => <Child />;

      /* Invoke */
      Reaksi.render(<App />, container);

      /* Assert*/
      expect(container.innerHTML).toBe('<div>test</div>');
   });

   it(`should expose dom node reference via ref prop`, () => {
      /* Setup */
      const container = document.createElement('div');

      let domRef: { current: any } = { current: '' };

      const Component = () => {
         return (
            <div>
               <h1 ref={domRef}>test h1</h1>
            </div>
         );
      };

      /* Invoke */
      Reaksi.render(<Component />, container);

      /* Assert */
      expect(domRef.current.nodeName).toBe('H1');
   });

   it('should invoke the callback which passed via ref prop with the dom node as the first arg', () => {
      /* Setup */
      const container = document.createElement('div');

      let domRef: { current: any } = { current: '' };

      const Component = () => {
         return (
            <div>
               <h1 ref={(ref) => (domRef.current = ref)}>test h1</h1>
            </div>
         );
      };

      /* Invoke */
      Reaksi.render(<Component />, container);

      /* Assert */
      expect(domRef.current.nodeName).toBe('H1');
   });

   it('should set dom node style when vNode style props is set to object', () => {
      /* Setup */
      const container = document.createElement('div');
      const style = {
         color: 'red',
         textAlign: 'center',
         lineHeight: 20,
      };

      const App = () => {
         return (
            <div data-test style={style}>
               Test
            </div>
         );
      };

      /* Invoke */
      Reaksi.render(<App />, container);

      /* Assert */
      const div = container.querySelector('[data-test]') as HTMLDivElement;
      expect(div.style.color).toBe('red');
      expect(div.style.textAlign).toBe('center');
      expect(div.style.lineHeight).toBe('20px');
   });

   it('it should set class attribute when props is set to className', () => {
      /* Setup */
      const container = document.createElement('div');
      const Component = () => <div className='test'></div>;

      /* Invoke */
      Reaksi.render(<Component />, container);

      /* Assert */
      expect(container.innerHTML).toBe('<div class="test"></div>');
   });

   it('it should not render element with type of boolean as a result of falsy condition', () => {
      /* Setup */
      const container = document.createElement('div');
      const Component = () => (
         <div>
            {false}
            <h1>Test</h1>
         </div>
      );

      /* Invoke */
      Reaksi.render(<Component />, container);

      /* Assert */
      expect(container.innerHTML).toBe('<div><h1>Test</h1></div>');
   });

   it('it should remove the element which rendered as falsy after diffing process', () => {
      /* Setup */
      const container = document.createElement('div');

      const Component1 = () => {
         return <div>Component 1</div>;
      };

      const Component2 = () => {
         return <div>Component 2</div>;
      };

      let condition = true;
      const App = () => {
         return (
            <div>
               {condition && <Component1 />}
               <h1>app</h1>
               {condition && <Component2 />}
            </div>
         );
      };

      /* Invoke */
      Reaksi.render(<App />, container);

      /* Assert */
      let expected = `
            <div>
                <div>Component 1</div>
                <h1>app</h1>
                <div>Component 2</div>
            </div>
        `;
      expect(container.innerHTML).toBe(removeAllWhiteSpaces(expected));

      /* Invoke */
      condition = false;
      Reaksi.render(<App />, container);

      /* Assert */
      expected = `
            <div>                
                <h1>app</h1>                
            </div>
        `;
      expect(container.innerHTML).toBe(removeAllWhiteSpaces(expected));
   });

   it('should clean up the container before render', () => {
      /* Setup */
      const container = document.createElement('div');
      container.innerHTML = '<div>test</div><h1>test</h1>';

      const Component = () => <h2>test</h2>;

      /* Invoke */
      Reaksi.render(<Component />, container);

      /* Assert */
      expect(container.innerHTML).toBe('<h2>test</h2>');
   });

   it('it should not render "ref" as attribute', () => {
      /* Setup */
      const container = document.createElement('div');

      const Component = () => <div ref={null}>Test</div>;

      /* Invoke */
      Reaksi.render(<Component />, container);

      /* Assert */
      expect(container.innerHTML).toBe('<div>Test</div>');
   });
});
