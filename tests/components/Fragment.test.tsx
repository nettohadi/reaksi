import Reaksi from "../../src";
import {removeAllWhiteSpaces} from "../helpers";

describe('<Reaksi.Fragment/>', () => {
    it('should render nothing when component is Reaksi.Fragment', () => {
        /* Setup */
        const container = document.createElement('div');
        const App1 = () => {
            return (
                <Reaksi.Fragment>
                    <h1>H1</h1>
                    <Reaksi.Fragment>
                        <div>
                            <Reaksi.Fragment>
                                <p>P</p>
                            </Reaksi.Fragment>
                            <Reaksi.Fragment>
                                <h3>H3</h3>
                            </Reaksi.Fragment>
                        </div>
                    </Reaksi.Fragment>
                </Reaksi.Fragment>
            );
        }

        const App2 = () => {
            return (
                <Reaksi.Fragment>
                    <h1>H1</h1>
                    <Reaksi.Fragment>
                        <div>
                            <Reaksi.Fragment>
                                <p>P</p>
                            </Reaksi.Fragment>
                            <Reaksi.Fragment>
                                <h2>H2</h2>
                            </Reaksi.Fragment>
                        </div>
                    </Reaksi.Fragment>
                </Reaksi.Fragment>
            );
        }

        /* Invoke */
        Reaksi.render(<App1/>, container);


        /* Assert */
        let expected = `            
            <h1>H1</h1>
            <div>
                <p>P</p>
                <h3>H3</h3>
            </div>            
        `;
        expect(container.innerHTML).toBe(removeAllWhiteSpaces(expected));

        /* Invoke */
        Reaksi.render(<App2/>, container);

        /* Assert */
        expected = `
            <h1>H1</h1>
            <div>
                <p>P</p>
                <h2>H2</h2>
            </div>
        `;

        expect(container.innerHTML).toBe(removeAllWhiteSpaces(expected));
    });
});