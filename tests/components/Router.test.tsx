import 'regenerator-runtime/runtime'
import Reaksi, {Router} from '../../src/reaksi';
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
        const container = document.createElement('div');
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
});



