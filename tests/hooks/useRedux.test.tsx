import 'regenerator-runtime/runtime'
import Reaksi, {ReduxProvider as Provider, useDispatch} from "../../src";
import {fireEvent} from "@testing-library/dom";
import {resetStates} from "../../src/hooks/useState";
import {storeMock as store, resetReduxMock} from "../helpers/reduxMock";
import {resetSelectors} from "../../src/hooks/useRedux";


describe(`useRedux hooks`, () => {

    beforeEach(() => {
        resetStates();
        resetReduxMock();
        resetSelectors();
    });

    it(`should be able to pass data / value to deeply nested component`, () => {
        /* Setup */
        const container = document.createElement('div');
        store.setState('Hello');

        const GrandChild1 = () => {
            const state = Reaksi.useSelector((state) => state);
            return (
                <div data-testid="test">{state}</div>
            )
        }

        const GrandChild2 = () => {
            const state = Reaksi.useSelector((state) => state);
            return (
                <div data-testid="test">{state}</div>
            )
        }

        const Child = () => {
            return (
                <div>
                    <GrandChild1/>
                    <GrandChild2/>
                </div>
            );
        }

        const Parent = () => {
            return (
                <Provider store={store}>
                    <Child/>
                </Provider>
            );
        }

        /* Invoke */
        Reaksi.render(<Parent/>, container);
        const test = container.querySelectorAll("[data-testid='test']");

        /* Assert */
        expect(test[0].innerHTML).toBe('Hello');
        expect(test[1].innerHTML).toBe('Hello');
    });

    it(`should only rerender the component if the associated state is changed`, async () => {
        /* Setup */
        const container = document.createElement('div');
        store.setState({
            GrandChild1: {value:1},
            GrandChild2: {value:1}
        });

        const spy1 = jest.fn().mockImplementation(() => '');
        const spy2 = jest.fn().mockImplementation(() => '');

        const GrandChild1 = () => {
            let data = Reaksi.useSelector((state) => state.GrandChild1);
            const dispatch = useDispatch();
            const increment = () => {
                store.getState().GrandChild1 = {value: 2};
                store.setState(store.getState());
                dispatch();
            }
            spy1();


            return (
                <div>
                    <h3 data-testid="test">{data.value}</h3>
                    <button data-testid="button" onclick={increment}></button>
                </div>
            )
        }

        const GrandChild2 = () => {
            let data = Reaksi.useSelector((state) => state.GrandChild2);
            const dispatch = useDispatch();
            const increment = () => {
                store.getState().GrandChild2 = {value: 2};
                store.setState(store.getState());
                dispatch();
            }
            spy2();

            return (
                <div>
                    <h3 data-testid="test">{data.value}</h3>
                    <button data-testid="button" onclick={increment}></button>
                </div>
            )
        }

        const Child = () => {
            return (
                <div>
                    <div>
                        <GrandChild1/>
                        <GrandChild2/>
                    </div>
                </div>
            );
        }

        const Parent = () => {
            return (
                <Provider store={store}>
                    <Child/>
                </Provider>
            );
        }

        /* Invoke */
        Reaksi.render(<Parent/>, container);
        const test = container.querySelectorAll("[data-testid='test']");
        const button = container.querySelectorAll("[data-testid='button']");

        /* Assert */
        /* fire click event on GranChild1 Component*/
        await fireEvent(button[0], new MouseEvent('click'));
        /* Assert the state in GrandChild1 */
        expect(test[0].innerHTML).toBe('2');
        /* Assert that only GrandChild1 component rerender */
        expect(spy1).toBeCalledTimes(2);
        expect(spy2).toBeCalledTimes(1);

        /* fire click event on GranChild2 Component*/
        await fireEvent(button[1], new MouseEvent('click'));
        /* Assert the state in GrandChild1 */
        expect(test[1].innerHTML).toBe('2');
        /* Assert that only GrandChild1 component rerender */
        expect(spy1).toBeCalledTimes(2);
        expect(spy2).toBeCalledTimes(2);

    });
});