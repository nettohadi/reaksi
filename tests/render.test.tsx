import reaksi from "../src/reaksi";
import {removeAllWhiteSpaces} from "./helpers";
import {fireEvent} from "@testing-library/dom";


/* Mock event handler*/
import handler from "./handlers";
import {resetStates} from "../src/reaksi/hooks/useState";
jest.mock("./handlers", () => {
    return jest.fn().mockImplementation(() => '');
});

describe('render()', () => {

    beforeEach(() => {
        resetStates();
    });

    it('should render every element to the dom container correctly', () => {

        /* Setup */
        const Component = () => {
          return (
            <div>
                <h1 class="testClass">h1</h1>
                <span>span</span>
                <p>p</p>
                <img src="testSrc"/>
                simple test case_1
                <div>
                    <div>
                        <p custom-attr="custom">
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
        reaksi.render(<Component/>, container);

        /* Assert */
        expect(container.innerHTML).toEqual(removeAllWhiteSpaces(expectedHtml));
    });

    it('should register event listener correctly', () => {
        /* Setup */
        const Component = () => <button onclick={handler}></button>
        const container = document.createElement('div');


        /* Invoke */
        reaksi.render(<Component/>, container);
        const button = container.firstChild as Node;
        fireEvent(button, new MouseEvent('click'))

        /* Assert */
        expect(handler).toBeCalled();
    });

    it('should update element (diff) when render is called more than once', () => {
        /* Setup */
        const Component_1 = () => <div class="first"><span><p>p</p></span></div>
        const Component_2 = () => <div class="second"><span><h3>second</h3></span></div>
        const container = document.createElement('div');

        /* Invoke */
        reaksi.render(<Component_1/>, container);
        /* Assert */
        expect(container.innerHTML).toEqual(removeAllWhiteSpaces(`<div class="first"><span><p>p</p></span></div>`));

        /* Invoke */
        reaksi.render(<Component_2/>, container);
        /* Assert */
        expect(container.innerHTML).toEqual(removeAllWhiteSpaces(`<div class="second"><span><h3>second</h3></span></div>`));
    });

    it('should update element (diff) when some children are removed', () => {
        /* Setup */
        const Component_1 = () => <div class="first" test="second"><div><p class="p">1</p><p>2</p><p>3</p></div></div>
        const Component_2 = () => <div class="first"><div><p class="new">1</p><p>2</p></div></div>
        const container = document.createElement('div');

        /* Invoke */
        reaksi.render(<Component_1/>, container);
        /* Assert */
        expect(container.innerHTML).toEqual(removeAllWhiteSpaces(`<div class="first" test="second"><div><p class="p">1</p><p>2</p><p>3</p></div></div>`));

        /* Invoke */
        reaksi.render(<Component_2/>, container);
        /* Assert */
        expect(container.innerHTML).toEqual(removeAllWhiteSpaces(`<div class="first"><div><p class="new">1</p><p>2</p></div></div>`));
    });

    it('should render children component (slot) correctly', () => {
        /* Setup */
        const Component = (props) => {
            return (
                <div class="first">first-{props?.children}</div>
            )
        }

        const container = document.createElement('div');

        /* Invoke */
        reaksi.render(<Component><span>slot</span></Component>, container);

        /* Assert */
        expect(container.innerHTML).toEqual(removeAllWhiteSpaces(`
            <div class="first">first-<span>slot</span></div>
        `));
    });

    // it('should render children component (slot) correctly', () => {
    //     /* Setup */
    //     const Component_1 = (props?) => {
    //         console.log({children: props?.children})
    //         return (
    //             <div class="first">first</div>
    //         )
    //     }
    //
    //     const Component_2 = () => <div class="second"><span>second</span></div>
    //     const Component_3 = () => <div class="third"><Component_1><span>test span</span></Component_1></div>
    //     const container = document.createElement('div');
    //     console.log({componenent_3: Component_3()})
    //     /* Invoke */
    //     reactClone.render(<Component_3/>, container);
    //     /* Assert */
    //     expect(container.innerHTML).toEqual(removeAllWhiteSpaces(`
    //         <div class="third"><div class="first">first<span>test span</span></div></div>
    //     `));
    // });

    // it(' should register event listener correctly', () => {
    //     /* Setup */
    //     /* Invoke */
    //     /* Assert */
    // });
});