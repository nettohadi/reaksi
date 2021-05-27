import 'regenerator-runtime/runtime'
import reaksi from "../../src/reaksi";
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
        reaksi.render(<Component/>, container);
        reaksi.render(<Component/>, container);
        reaksi.render(<Component/>, container);

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
        reaksi.render(<Component/>, container);
        reaksi.render(<Component/>, container);
        reaksi.render(<Component/>, container);

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
        reaksi.render(<Component/>, container);
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
        reaksi.render(<div><Component1/><Component2/></div>, container);
        reaksi.render(<div><Component2/></div>, container);

        /* Assert */
        expect(unMountingEffect1).toBeCalledTimes(1);
        expect(unMountingEffect2).toBeCalledTimes(0);

    })

    it('should run unmounting effect 2 times when associated component is removed 2 times', () => {
        /* Setup */
        const unMountingEffect = jest.fn().mockImplementation(() => '');

        const Component1 = () => {
            useEffect(() => unMountingEffect, []);
            return (<div></div>);
        };

        const container = document.createElement('div');

        /* Invoke & assert*/
        reaksi.render(<div><Component1/></div>, container);
        reaksi.render(<div></div>, container);
        expect(unMountingEffect).toBeCalledTimes(1);

        reaksi.render(<div><Component1/></div>, container);
        reaksi.render(<div></div>, container);
        expect(unMountingEffect).toBeCalledTimes(2);

    })

});