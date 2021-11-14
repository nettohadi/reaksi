import 'regenerator-runtime/runtime';
import Reaksi, { Router, useState } from '../../src';
import { Link, Route, useParam } from '../../src';
import { removeAllWhiteSpaces, wait } from '../helpers';
import { resetStates } from '../../src/hooks/useState';
import { fireEvent } from '@testing-library/dom';

describe('Router & Route component', () => {
   beforeEach(() => {
      resetStates();

      const path = 'https://test.com/xxx';

      Object.defineProperty(window, 'location', {
         value: new URL(path),
      });

      window.location.search = '';
   });

   it('render component based on url', () => {
      /* Setup */
      window.location.pathname = '/home';
      const container = document.createElement('div');
      const Home = () => {
         return <div>Home</div>;
      };
      const About = () => {
         return <div>About</div>;
      };

      const App = () => {
         return (
            <Router>
               <Route path='/home'>
                  <Home />
               </Route>
               <Route path='/about'>
                  <About />
               </Route>
            </Router>
         );
      };

      /* Invoke */
      Reaksi.render(<App />, container);

      /* Assert */
      let expected = `${wrapExpectedInnerHtml('<div>Home</div>')}`;

      expect(container.innerHTML).toBe(removeAllWhiteSpaces(expected));
   });

   it('rerender the Router component when new path is pushed', async () => {
      window.location.pathname = '/home';
      const container = document.createElement('p');

      const Home = () => {
         return <div>Home</div>;
      };
      const About = () => {
         return <div>About</div>;
      };

      let pushPath;
      const App = () => {
         const router = Reaksi.useRouter();
         pushPath = router.push;
         return (
            <Router>
               <Route path='/home'>
                  <Home />
               </Route>
               <Route path='/about'>
                  <About />
               </Route>
               <div>Hei</div>
            </Router>
         );
      };

      /* Invoke */
      Reaksi.render(<App />, container);

      /* Assert */
      let expected = `<div>${wrapExpectedInnerHtml(
         '<div>Home</div>',
         false
      )}<div>Hei</div></div>`;

      expect(container.innerHTML).toBe(removeAllWhiteSpaces(expected));

      await pushPath('/about');

      expected = `<div>${wrapExpectedInnerHtml(
         '<div>About</div>',
         false
      )}<div>Hei</div></div>`;

      expect(container.innerHTML).toBe(removeAllWhiteSpaces(expected));
   });

   it('Route regex matching', async () => {
      window.location.pathname = '/home/123';
      window.location.search = 'q=222&b=123';
      const container = document.createElement('div');

      const Index = () => {
         homeParam = useParam();
         return <div>Index</div>;
      };

      let homeParam;
      const Home = () => {
         homeParam = useParam();
         return <div>Home</div>;
      };

      let aboutParam;
      const About = () => {
         aboutParam = useParam();
         return <div>About</div>;
      };

      let pushPath;
      const App = () => {
         const router = Reaksi.useRouter();
         pushPath = router.push;
         return (
            <Router>
               <Route path='/' exact>
                  <Index />
               </Route>
               <Route path='/home/[test]'>
                  <Home />
               </Route>
               <Route path='/about/[key]'>
                  <About />
               </Route>
            </Router>
         );
      };

      /* Invoke */
      Reaksi.render(<App />, container);

      /* Assert */
      let expected = `${wrapExpectedInnerHtml('<div>Home</div>')}`;
      expect(container.innerHTML).toBe(expected);
      expect(homeParam.test).toBe('123');

      await pushPath('/about/111');

      expected = `${wrapExpectedInnerHtml('<div>About</div>')}`;
      expect(container.innerHTML).toBe(expected);
      expect(aboutParam.key).toBe('111');
   });

   it('rerender the Router component when new path is pushed (with sibling node)', async () => {
      window.location.pathname = '/home';
      const container = document.createElement('p');
      const Home = () => {
         return <div>Home</div>;
      };
      const About = () => {
         return <div>About</div>;
      };

      let pushPath;
      const App = () => {
         const router = Reaksi.useRouter();
         pushPath = router.push;
         return (
            <div>
               <p>Title</p>
               <Router>
                  <Route path='/home'>
                     <Home />
                  </Route>
                  <Route path='/about'>
                     <About />
                  </Route>
               </Router>
               <div>
                  <h2>heading</h2>
               </div>
            </div>
         );
      };

      /* Invoke */
      Reaksi.render(<App />, container);

      /* Assert */
      let expected = `
         <div><p>Title</p>${wrapExpectedInnerHtml(
            '<div>Home</div>'
         )}<div><h2>heading</h2></div></div>
      `;

      expect(container.innerHTML).toBe(removeAllWhiteSpaces(expected));

      await pushPath('/about');

      expected = `<div><p>Title</p>${wrapExpectedInnerHtml(
         '<div>About</div>'
      )}<div><h2>heading</h2></div></div>`;

      expect(container.innerHTML).toBe(removeAllWhiteSpaces(expected));
   });

   it(`rerender the Router component when new path is pushed (check if state is correctly associated)`, async () => {
      window.location.pathname = '/home';
      const container = document.createElement('p');
      let homeSetState;
      const Home = () => {
         const [state, setState] = useState(1);
         homeSetState = setState;
         return <div>Home : {state}</div>;
      };

      let aboutSetState;
      const About = () => {
         const [state, setState] = useState(2);
         aboutSetState = setState;
         return <div>About : {state}</div>;
      };

      let pushPath;
      const App = () => {
         const router = Reaksi.useRouter();
         pushPath = router.push;
         return (
            <div>
               <p>Title</p>
               <Router>
                  <Route path='/home'>
                     <Home />
                  </Route>
                  <Route path='/about'>
                     <About />
                  </Route>
               </Router>
            </div>
         );
      };

      /* Invoke */
      Reaksi.render(<App />, container);

      /* Assert */
      let expected = `<div><p>Title</p>${wrapExpectedInnerHtml(
         '<div>Home : 1</div>'
      )}</div>`;

      expect(container.innerHTML).toBe(removeAllWhiteSpaces(expected));

      homeSetState(2);

      expected = `<div><p>Title</p>${wrapExpectedInnerHtml(
         '<div>Home : 2</div>'
      )}</div>`;

      expect(container.innerHTML).toBe(removeAllWhiteSpaces(expected));

      await pushPath('/about');

      expected = `<div><p>Title</p>${wrapExpectedInnerHtml(
         '<div>About : 2</div>'
      )}</div>`;

      expect(container.innerHTML).toBe(removeAllWhiteSpaces(expected));

      aboutSetState(10);
      expected = `<div><p>Title</p>${wrapExpectedInnerHtml(
         '<div>About : 10</div>'
      )}</div>`;

      expect(container.innerHTML).toBe(removeAllWhiteSpaces(expected));
   });

   it('should throw error when Route component is nested inside another Route', () => {
      /* Setup */
      const container = document.createElement('div');
      const App = () => {
         return (
            <Router>
               <Route>
                  <Route>
                     <Route>
                        <div>Home</div>
                     </Route>
                  </Route>
               </Route>
            </Router>
         );
      };

      /* Invoke */
      const render = () => Reaksi.render(<App />, container);
      expect(render).toThrowError('Route can not be nested inside Route');

      /* Assert */
   });

   it('should rerender when user go back to previous page using browser back button', async () => {
      /* Setup */
      window.location.pathname = '/';
      const container = document.createElement('div');
      const Home = () => {
         return <div>Home</div>;
      };
      const About = () => {
         return <div>About</div>;
      };

      let pushPath;
      const App = () => {
         const router = Reaksi.useRouter();
         pushPath = router.push;
         return (
            <div>
               <Router>
                  <Route path='/' exact>
                     <Home />
                  </Route>
                  <Route path='/about' exact>
                     <About />
                  </Route>
               </Router>
            </div>
         );
      };

      /* Invoke */
      Reaksi.render(<App />, container);

      /* Assert */
      expect(container.innerHTML).toBe(
         `<div>${wrapExpectedInnerHtml('<div>Home</div>')}</div>`
      );

      await pushPath('/about');

      /* Assert */
      wait(() =>
         expect(container.innerHTML).toBe(`
            <div>
               ${wrapExpectedInnerHtml('<div>About</div>')}
            </div>
         `)
      );

      /* Invoke */
      //Go back in history
      const popStateEvent = new PopStateEvent('popstate', {
         bubbles: false,
         cancelable: false,
         state: window.history.state,
      });
      await dispatchEvent(popStateEvent);

      /* Assert */
      expect(container.innerHTML).toBe(
         `<div>${wrapExpectedInnerHtml('<div>Home</div>')}</div>`
      );
   });

   it('render an anchor tag', async () => {
      /* Setup */
      window.location.pathname = '/home';
      const container = document.createElement('div');

      const Nav = () => {
         return (
            <ul>
               <li>
                  <Link to='/'>Home</Link>
               </li>
               <li>
                  <Link to='/about'>About</Link>
               </li>
            </ul>
         );
      };

      const App = () => {
         return <Nav />;
      };

      /* Invoke */
      Reaksi.render(<App />, container);

      /* Assert */
      let expected = `<ul>
               <li>
                  <a href=\"/"\>
                     Home
                  </a>
               </li>
               <li>
                  <a href=\"/about"\>
                     About
                  </a>
               </li>
            </ul>`;

      expect(container.innerHTML).toBe(removeAllWhiteSpaces(expected));
   });

   it('rerender the component when Link component is clicked', async () => {
      window.location.pathname = '/';
      const container = document.createElement('div');

      const Nav = () => {
         return (
            <div>
               <Link to='/about'>Go to About</Link>
            </div>
         );
      };
      const About = () => {
         return <div>About</div>;
      };

      const App = () => {
         return (
            <Router>
               <Nav />
               <Route path='/about'>
                  <About />
               </Route>
               <div>Hei</div>
            </Router>
         );
      };

      /* Invoke */
      Reaksi.render(<App />, container);

      /* Assert */
      let expected = `<div>
            <div>
               <a href=\"/about"\>
                  Go to About
               </a>
            </div>
            <div>Hei</div>
          </div>`;

      expect(container.innerHTML).toBe(removeAllWhiteSpaces(expected));

      const link = container.querySelector('a') as Element;

      await fireEvent(link, new MouseEvent('click'));

      expected = `<div><div><a href=\"/about"\>Go to About</a></div>`;
      expected += wrapExpectedInnerHtml('<div>About</div>', false);
      expected += `<div>Hei</div></div>`;

      expect(container.innerHTML).toBe(removeAllWhiteSpaces(expected));
   });
});

/* This function was created when fragment was still buggy*/
function wrapExpectedInnerHtml(innerHtml: string, withTwoDivs = true) {
   return `${withTwoDivs ? '<div>' : ''}<div>${innerHtml}</div>${
      withTwoDivs ? '</div>' : ''
   }`;
}
