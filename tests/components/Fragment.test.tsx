import Reaksi from "../../src/reaksi";
import {removeAllWhiteSpaces} from "../helpers";

describe('<Reaksi.Fragment/>', () => {
    it('should render nothing when component is Reaksi.Fragment', () => {
        /* Setup */
        const container = document.createElement('div');
        const App = () => {
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

        /* Invoke */
        Reaksi.render(<App/>, container);


        /* Assert */
        const expected = `            
            <h1>H1</h1>
            <div>
                <p>P</p>
                <h3>H3</h3>
            </div>            
        `;
        expect(container.innerHTML).toBe(removeAllWhiteSpaces(expected));
    });
});