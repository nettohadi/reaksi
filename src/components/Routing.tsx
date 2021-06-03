import Reaksi, {Router, useState} from "../reaksi";
import {Route} from "../reaksi/hooks/useRouter";
import {Index} from "./Index";
import Todo from "./Todo";
import SecondComponent from "./SecondComponent";

export function Routing(){
    console.log('render routing');
    const [value, setValue] = useState(1);
    return (
        <div class="container">
            <div><button onclick={() => setValue(value => value + 1)}>Hide About {value}</button></div>
            <Router>
                <Route path="/" exact>
                    <Index/>
                </Route>
                <Route path="/home/[test]" exact>
                    <Todo/>
                </Route>
                {value == 1 && <Route path="/about/[key]" exact><SecondComponent/></Route>}
                {value != 1 && <Route path="/about/[key]" exact><div></div></Route>}
            </Router>
        </div>
    );
}