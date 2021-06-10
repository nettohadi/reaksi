import 'regenerator-runtime/runtime'
import Reaksi from "../../src";
import {removeAllWhiteSpaces} from "./../helpers";
import {fireEvent} from "@testing-library/dom";
import useState, {resetStates} from "../../src/hooks/useState";

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
                };

                return (
                    <div>
                        <div data-testId="number">{number}</div>
                        <button data-testId="button" onclick={increment}>+</button>
                    </div>
                );
            }

            const container = document.createElement('div');

            /* Invoke */
            Reaksi.render(<Component/>, container);

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
            Reaksi.render(<First/>, container);

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
         Bug #1 : ChildNodes get replaced by component, because it assume the old dom is the first child of the container
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
            Reaksi.render(<First/>, container);
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

        /**
         Bug #2 : When childNode replace another childNode, state changes is not reflected on the dom, because
         virtual childNode did not update it's reference to new node in the dom tree, it still has reference
         to the old node. In this test, we need to make sure that when childNode replace another childNode,
         virtual childNode needs to update it's node reference too.
         */

        it('should update the right node, when there are changes in position, or some nodes being removed from' +
            'the dom tree', async () => {

            /* Setup */
            const Component = () => {
                const [counter, setCounter] = useState(0);
                return (
                    <div>
                        <div data-testid="counter">{counter}</div>
                        <button data-testid="button" onclick={() => setCounter(counter + 1)}>+</button>
                    </div>
                );
            };

            const container = document.createElement('div');

            /* Invoke */
            Reaksi.render(<div><Component key={1}/><Component key={2}/></div>, container);
            const counters = container.querySelectorAll("[data-testid='counter']");
            const buttons = container.querySelectorAll("[data-testid='button']");

            /* Assert */
            await fireEvent(buttons[0], new MouseEvent('click'));
            expect(counters[0].innerHTML).toBe('1')

            await fireEvent(buttons[1], new MouseEvent('click'));
            await fireEvent(buttons[1], new MouseEvent('click'));
            expect(counters[1].innerHTML).toBe('2')

            /* Remove first component*/
            Reaksi.render(<div><Component key={2}/></div>, container);
            const counter = container.querySelector("[data-testid='counter']") as HTMLElement;
            const button = container.querySelector("[data-testid='button']") as Node;

            await fireEvent(button, new MouseEvent('click'));
            expect(counter.innerHTML).toBe('3');

        });

        it(`should associate the state with the correct component when one ore more of the components
        with the same name are unmounted (caused by falsy condition).`,
            async () => {
            /* Setup */
            const container = document.createElement('div');
            const componentButtons: { click: Function }[] = [];
            let appButton: any;

            const Component = () => {
                const [value, setValue] = useState(0);
                componentButtons.push({click: () => setValue((value) => value + 1)})
                return (
                    <Reaksi.Fragment>
                        <h3 data-value>{value}</h3>
                    </Reaksi.Fragment>
                );
            }

            const App = () => {
                const [value, setValue] = useState(1);
                appButton = {click: () => setValue(value => value + 1)}
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

            await componentButtons[0].click();
            await componentButtons[1].click();
            await componentButtons[1].click();
            await componentButtons[2].click();
            await componentButtons[2].click();
            await componentButtons[2].click();
            await appButton.click();


            /* Assert */
            const values = container.querySelectorAll("[data-value]");
            expect(values[0].innerHTML).toBe('1');
            expect(values[1].innerHTML).toBe('3');

        });

        it(`should associate the state with the correct component when components are reordered`, async () => {
            /* Setup */
            const container = document.createElement('div');
            const componentButtons: { click: Function }[] = [];
            let appButton: any;

            const Component = () => {
                const [value, setValue] = useState(0);
                componentButtons.push({click: () => setValue((value) => value + 1)})
                return (
                    <div>
                        <h3 data-value>{value}</h3>
                    </div>
                );
            }

            const App = () => {
                const [list, setList] = useState([
                    {id:1},
                    {id:2},
                    {id:3},
                ]);

                appButton = {click: () => setList(list => [...list.sort((a, b) => b.id - a.id)])}
                return (
                    <div>
                        {list.map(item => <Component key={item.id}/>)}
                    </div>
                );
            }

            /* Invoke */
            Reaksi.render(<App/>, container);

            await componentButtons[0].click();
            await componentButtons[1].click();
            await componentButtons[1].click();
            await componentButtons[2].click();
            await componentButtons[2].click();
            await componentButtons[2].click();
            await appButton.click();


            /* Assert */
            const values = container.querySelectorAll("[data-value]");
            expect(values[0].innerHTML).toBe('3');
            expect(values[1].innerHTML).toBe('2');
            expect(values[2].innerHTML).toBe('1');

        });

        it('updates state correctly, when setState is invoked using function as argument', () => {
            /* Setup */
            const container = document.createElement('div');
            let button;
            let valueBucket = 0;

            const Component = () => {
                const [value, setValue] = useState(1);
                valueBucket = value;
                button = {click: () => setValue(state => state + 1)};
                return (<div></div>);
            }

            /* Invoke */
            Reaksi.render(<Component/>, container);
            button.click();
            button.click();
            button.click();

            /* Assert */
            expect(valueBucket).toBe(4);
        });

        it(`should not rerender if the new state is equal to the old state (object state)`, () => {
            /* Setup */
            const container = document.createElement('div');
            let renderCount = 0;
            let callSetState:Function = () => {};
            const Component = () => {
                const [state, setState] = useState({
                   id: 1,
                   name: 'john doe'
                });

                callSetState = () => setState(state => state);
                renderCount++;

                return (
                    <div date-state>test</div>
                );
            }
            /* Invoke */
            Reaksi.render(<Component/>, container);
            callSetState();

            /* Assert */
            expect(renderCount).toBe(1);

        });

        it('should throw error when hook is called inside nested function', () => {
            /* Setup */
            const container = document.createElement('div');

            let invokeHook;
            const App = () => {
                invokeHook = () => {
                    useState(0);
                }
                return (
                    <div>test</div>
                );
            }

            /* Invoke */
            Reaksi.render(<App/>, container);

            /* Assert */
            expect(invokeHook).toThrowError();
        });

    it('should throw error when hook is called outside function component', () => {
        /* Setup */
        const container = document.createElement('div');

        const App = () => {
            useState(0);
            return (
                <div>test</div>
            );
        }

        /* Invoke */
        const render = () => Reaksi.render(App(), container);

        /* Assert */
        expect(render).toThrowError();
    });
    }
);
