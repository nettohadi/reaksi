import 'regenerator-runtime/runtime'
import reaksi from "../src/reaksi";
import {removeAllWhiteSpaces} from "./helpers";
import {fireEvent} from "@testing-library/dom";
import useState, {resetStates} from "../src/reaksi/hooks/useState";
import {resetEffects, useEffect} from "../src/reaksi/hooks/useEffect";

describe('useState()', () => {

    beforeEach(() => {
       resetStates();
    });

    it('should update dom when state is modified (calling setState)', async () => {
        /* Setup */
        const Component = () => {
            const [number, setNumber] = useState(0);
            const increment = () => {
                setNumber(number + 1);
            }

            return (
                <div>
                    <div data-testId="number">{number}</div>
                    <button data-testId="button" onclick={increment}>+</button>
                </div>
            );
        }

        const container = document.createElement('div');

        /* Invoke */
        reaksi.render(<Component/>, container);

        /* Assert */
        const button = container.querySelector("[data-testId='button']") as Node;
        const number = container.querySelector("[data-testId='number']");

        await fireEvent(button, new MouseEvent('click'));
        expect(number?.innerHTML).toBe('1');

        await fireEvent(button, new MouseEvent('click'));
        expect(number?.innerHTML).toBe('2');

    });

    it('should only update from the component which trigger the rerender and not from the root componnet', async () => {
        /* Setup */
        const funcThird = jest.fn().mockImplementation(() => '');
        const funcSecond = jest.fn().mockImplementation(() => '');
        const funcFirst = jest.fn().mockImplementation(() => '');

        const Third = () => {
            funcThird();
            const [number, setNumber] = useState(0);
            return (
                <div>
                    <h2 data-testId="number">{number}</h2>
                    <button data-testId="button" onclick={() => setNumber(number + 1)}></button>
                </div>
            );
        }

        const Second = () => {
            funcSecond();
            return (<div><Third/></div>);
        }

        const First = () => {
            funcFirst();
            return (<div><Second/></div>);
        }

        const container = document.createElement('div');

        /* Invoke */
        reaksi.render(<First/>, container);

        /* Assert */
        const button = container.querySelector("[data-testId='button']") as Node;
        const number = container.querySelector("[data-testId='number']");

        await fireEvent(button, new MouseEvent('click'));
        expect(number?.innerHTML).toBe('1');

        expect(funcFirst).toBeCalledTimes(1);
        expect(funcSecond).toBeCalledTimes(1);
        expect(funcThird).toBeCalledTimes(2);

    });

    /**
    Bug #1 : Childnodes get replaced by component, because it assume the old dom is the first child of the container
    */
    it('should not replace all childNodes of the container, when component has sibling', async () => {
        /* Setup */
        const Second = () => {
            const [number, setNumber] = useState(0);
            return (
                <div>
                    <h2 data-testid="number">number is {number}</h2>
                    <button data-testid="button" onclick={() => setNumber(number + 1)}>increment</button>
                </div>
            );
        }

        const First = () => {
            return (
                <div>
                    <h2>h2</h2>
                    <p>p</p>
                    <Second/>
                </div>
            );
        }

        const container = document.createElement('div');

        /* Invoke */
        reaksi.render(<First/>,container);
        const button = container.querySelector("[data-testid='button']") as Node;
        await fireEvent(button, new MouseEvent('click'));

        /* Assert */
        const expected = `<div>
            <h2>h2</h2>
            <p>p</p>
            <div>
                <h2 data-testid="number">number is 1</h2>
                <button data-testid="button">increment</button>
            </div>
        </div>`;

        expect(container.innerHTML).toEqual(removeAllWhiteSpaces(expected));
    })
});

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



})