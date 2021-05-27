import 'regenerator-runtime/runtime'
import reaksi from "../../src/reaksi";
import {removeAllWhiteSpaces} from "./../helpers";
import {fireEvent} from "@testing-library/dom";

describe('useContext()', () => {
    it(`should be able to pass data / value to deeply nested component 
      without passing it via props`, () => {

        /* Setup */
        const container = document.createElement('div');
        const MyContext = reaksi.createContext({test: 1})

        const GrandChild1 = () => {
            const state = reaksi.useContext(MyContext);
            return (
                <div data-testid="test">{state.test}</div>
            )
        }

        const GrandChild2 = () => {
            const state = reaksi.useContext(MyContext);
            return (
                <div data-testid="test">{state.test}</div>
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
            const state = {test: 1};
            return (
                <MyContext.Provider value={state}>
                    <Child/>
                </MyContext.Provider>
            );
        }

        /* Invoke */
        reaksi.render(<Parent/>, container);
        const test = container.querySelectorAll("[data-testid='test']");

        /* Assert */
        expect(test[0].innerHTML).toBe('1');
        expect(test[1].innerHTML).toBe('1');

    });
});