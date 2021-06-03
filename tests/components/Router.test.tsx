import 'regenerator-runtime/runtime'
import Reaksi, {Router, useState} from '../../src/reaksi';
import {Route, useParam} from "../../src/reaksi/hooks/useRouter";
import {removeAllWhiteSpaces} from "../helpers";
import {resetStates} from "../../src/reaksi/hooks/useState";

describe('Router & Route component', () => {

    beforeEach(() => {
        resetStates();

        const path = 'https://test.com/xxx';

        Object.defineProperty(window, "location", {
            value: new URL(path)
        } );
    })

    it('render component based on url', () => {
        /* Setup */
        window.location.pathname = '/home';
        const container = document.createElement('div');
        const Home = () => {
            return (<div>Home</div>);
        }
        const About = () => {
            return (<div>About</div>);
        }

        const App = () => {
            return (
                <Router>
                    <Route path="/home">
                        <Home/>
                    </Route>
                    <Route path="/about">
                        <About/>
                    </Route>
                </Router>
            );
        }

        /* Invoke */
        Reaksi.render(<App/>, container);

        /* Assert */
        let expected = `<div>Home</div>`;

        expect(container.innerHTML).toBe(removeAllWhiteSpaces(expected));
    });

    it('rerender the Router component when new path is pushed', async () => {
        window.location.pathname = '/home'
        const container = document.createElement('p');
        const Home = () => {
            return (<div>Home</div>);
        }
        const About = () => {
            return (<div>About</div>);
        }

        let pushPath;
        const App = () => {
            const router = Reaksi.useRouter();
            pushPath = router.push;
            return (
                <Router>
                    <Route path="/home">
                        <Home/>
                    </Route>
                    <Route path="/about">
                        <About/>
                    </Route>
                </Router>
            );
        }

        /* Invoke */
        Reaksi.render(<App/>, container);

        /* Assert */
        let expected = `<div>Home</div>`;
        expect(container.innerHTML).toBe(removeAllWhiteSpaces(expected));

        await pushPath('/about');

        expected = `<div>About</div>`;
        expect(container.innerHTML).toBe(removeAllWhiteSpaces(expected));

    });

    it('Route regex matching', async () => {
        window.location.pathname = '/home/123';
        window.location.search = 'q=222&b=123';
        const container = document.createElement('div');


        const Index = () => {
            homeParam = useParam();
            return (<div>Index</div>);
        }

        let homeParam;
        const Home = () => {
            homeParam = useParam();
            return (<div>Home</div>);
        }

        let aboutParam;
        const About = () => {
            aboutParam = useParam();
            return (<div>About</div>);
        }

        let pushPath;
        const App = () => {
            const router = Reaksi.useRouter();
            pushPath = router.push;
            return (
                <Router>
                    <Route path="/" exact>
                        <Index/>
                    </Route>
                    <Route path="/home/[test]">
                        <Home/>
                    </Route>
                    <Route path="/about/[key]">
                        <About/>
                    </Route>
                </Router>
            );
        }

        /* Invoke */
        Reaksi.render(<App/>, container);

        /* Assert */
        let expected = `<div>Home</div>`;
        expect(container.innerHTML).toBe(expected);
        expect(homeParam.test).toBe('123');

        await pushPath('/about/111');

        expected = `<div>About</div>`;
        expect(container.innerHTML).toBe(expected);
        expect(aboutParam.key).toBe('111');

    });

    it('rerender the Router component when new path is pushed (with sibling node)', async () => {
        window.location.pathname = '/home'
        const container = document.createElement('p');
        const Home = () => {
            return (<div>Home</div>);
        }
        const About = () => {
            return (<div>About</div>);
        }

        let pushPath;
        const App = () => {
            const router = Reaksi.useRouter();
            pushPath = router.push;
            return (
                <div>
                    <p>Title</p>
                    <Router>
                        <Route path="/home">
                            <Home/>
                        </Route>
                        <Route path="/about">
                            <About/>
                        </Route>
                    </Router>
                </div>
            );
        }

        /* Invoke */
        Reaksi.render(<App/>, container);

        /* Assert */
        let expected = `<div><p>Title</p><div>Home</div></div>`;
        expect(container.innerHTML).toBe(removeAllWhiteSpaces(expected));

        await pushPath('/about');

        expected = `<div><p>Title</p><div>About</div></div>`;
        expect(container.innerHTML).toBe(removeAllWhiteSpaces(expected));

    });

    it(`rerender the Router component when new path is pushed 
        (check if state is correctly assiciated)`, async () => {
        window.location.pathname = '/home'
        const container = document.createElement('p');
        let homeSetState;
        const Home = () => {
            const [state, setState] = useState(1);
            homeSetState = setState;
            return (<div>Home : {state}</div>);
        }

        let aboutSetState;
        const About = () => {
            const [state, setState] = useState(2);
            aboutSetState = setState;
            return (<div>About : {state}</div>);
        }

        let pushPath;
        const App = () => {
            const router = Reaksi.useRouter();
            pushPath = router.push;
            return (
                <div>
                    <p>Title</p>
                    <Router>
                        <Route path="/home">
                            <Home/>
                        </Route>
                        <Route path="/about">
                            <About/>
                        </Route>
                    </Router>
                </div>
            );
        }

        /* Invoke */
        Reaksi.render(<App/>, container);

        /* Assert */
        let expected = `<div><p>Title</p><div>Home : 1</div></div>`;
        expect(container.innerHTML).toBe(removeAllWhiteSpaces(expected));

        homeSetState(2);
        expected = `<div><p>Title</p><div>Home : 2</div></div>`;
        expect(container.innerHTML).toBe(removeAllWhiteSpaces(expected));

        await pushPath('/about');

        expected = `<div><p>Title</p><div>About : 2</div></div>`;
        expect(container.innerHTML).toBe(removeAllWhiteSpaces(expected));

        aboutSetState(10);
        expected = `<div><p>Title</p><div>About : 10</div></div>`;
        expect(container.innerHTML).toBe(removeAllWhiteSpaces(expected));

    });
});



