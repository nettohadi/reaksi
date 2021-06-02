import 'regenerator-runtime/runtime'
import Reaksi, {render} from "../../src/reaksi";
import {fireEvent} from "@testing-library/dom";
import useState, {resetStates} from "../../src/reaksi/hooks/useState";
import {resetEffects, useEffect} from "../../src/reaksi/hooks/useEffect";

describe('useEffect()', () => {

    beforeEach(() => {
        resetStates();
        resetEffects();
    });

    it('should run effect on every render when no dependency array is not provided', () => {
        /* Setup */
        const sideEffect = jest.fn().mockImplementation(() => '');

        const Component = () => {
            useEffect(sideEffect);
            return (<div></div>);
        };

        const container = document.createElement('div');

        /* Invoke */
        Reaksi.render(<Component/>, container);
        Reaksi.render(<Component/>, container);
        Reaksi.render(<Component/>, container);

        /* Assert */
        expect(sideEffect).toBeCalledTimes(3);

    })

    it('should run effect only on initial render when dependency array is empty', () => {
        /* Setup */
        const sideEffect = jest.fn().mockImplementation(() => '');

        const Component = () => {
            useEffect(sideEffect, []);
            return (<div></div>);
        };

        const container = document.createElement('div');

        /* Invoke */
        Reaksi.render(<Component/>, container);
        Reaksi.render(<Component/>, container);
        Reaksi.render(<Component/>, container);

        /* Assert */
        expect(sideEffect).toBeCalledTimes(1);

    })

    it('should run effect only when any data in dependency array changed', async () => {
        /* Setup */
        const sideEffect = jest.fn().mockImplementation(() => '');
        const Component = () => {
            const [a, setA] = useState(0);
            const [b, setB] = useState(0);

            useEffect(sideEffect, [a]);

            return (
                <div>
                    <h2>A:{a}</h2>
            <h2>B:{b}</h2>
            <button data-testid='button_a' onclick={() => setA(a + 1)}>increment A</button>
            <button data-testid='button_b' onclick={() => setB(b + 1)}>increment B</button>
            </div>
        );
        }

        const container = document.createElement('div');

        /* Invoke */
        Reaksi.render(<Component/>, container);
        const buttonA = container.querySelector("[data-testid='button_a']") as Node;
        const buttonB = container.querySelector("[data-testid='button_b']") as Node;
        await fireEvent(buttonA, new MouseEvent('click'));
        await fireEvent(buttonB, new MouseEvent('click'));

        /* Assert */
        expect(sideEffect).toBeCalledTimes(2);

    });

    it('should run unmounting effect if supplied when the associated component is removed', () => {
        /* Setup */
        const unMountingEffect1 = jest.fn().mockImplementation(() => '');
        const unMountingEffect2 = jest.fn().mockImplementation(() => '');

        const Component1 = () => {
            useEffect(() => unMountingEffect1, []);
            return (<div></div>);
        };

        const Component2 = () => {
            useEffect(() => unMountingEffect2, []);
            return (<div></div>);
        };


        const container = document.createElement('div');

        /* Invoke */
        Reaksi.render(<div><Component1/><Component2/></div>, container);
        Reaksi.render(<div><Component2/></div>, container);

        /* Assert */
        expect(unMountingEffect1).toBeCalledTimes(1);
        expect(unMountingEffect2).toBeCalledTimes(0);

    })

    it('should run unmounting effect 2 times when associated component is unmounted 2 times', () => {
        /* Setup */
        const unMountingEffect = jest.fn().mockImplementation(() => '');

        const Component1 = () => {
            useEffect(() => unMountingEffect, []);
            return (<div></div>);
        };

        const container = document.createElement('div');

        /* Invoke & assert*/
        Reaksi.render(<div><Component1/></div>, container);
        Reaksi.render(<div></div>, container);
        expect(unMountingEffect).toBeCalledTimes(1);

        Reaksi.render(<div><Component1/></div>, container);
        Reaksi.render(<div></div>, container);
        expect(unMountingEffect).toBeCalledTimes(2);

    });

    it(`should run unmounting effect  when associated component is unmounted 
        (same component is used more than once).`, () => {
        /* Setup */
        const unMountingEffect = jest.fn().mockImplementation(() => '');

        const Component = () => {
            useEffect(() => unMountingEffect, []);
            return (<div></div>);
        };

        const container = document.createElement('div');

        /* Invoke & assert*/
        Reaksi.render(<div><Component/><Component/><Component/></div>, container);
        Reaksi.render(<div><Component/><Component/></div>, container);
        expect(unMountingEffect).toBeCalledTimes(1);

    });

    it(`should  run unmounted effect when a component is unmounted 
        (caused by falsy condition).`, async () => {
        /* Setup */
        const container = document.createElement('div');
        let appButton: any;
        const unMountedEffect = jest.fn().mockImplementation(() => {});

        const Component = () => {
            useEffect(() => {return unMountedEffect},[]);

            return (
                <div>
                    <h3 data-value>test</h3>
                </div>
            );
        }

        const App = () => {
            const [value, setValue] = useState(1);
            appButton = {click: () => setValue(value => value + 1)};

            return (
                <div>
                    <Component/>
                    {value == 1 && <Component/>}
                    <Component/>
                </div>
            );
        }

        /* Invoke */
        Reaksi.render(<App/>, container);
        await appButton.click();


        /* Assert */
        expect(unMountedEffect).toBeCalledTimes(1);

    });

    it(`should not caused infinite render loop when setState is called inside useEffect hook`, () => {
        /* Setup */
        const container = document.createElement('div');
        let appButton: any;
        let renderCount = 0;

        const App = () => {
            const [value, setValue] = useState(1);
            appButton = {click: () => setValue(value => value + 1)};

            /* Track how many times App being rendered */
            renderCount ++;

            useEffect(() => {
                if(value == 2) setValue(value => value + 1)
            }, [value]);


            return (
                <div>
                    <h1>Test</h1>
                </div>
            );
        }
        /* Invoke */
        Reaksi.render(<App/>, container);
        appButton.click();
        expect(renderCount).toBe(3);
        /* Assert */
    });

});