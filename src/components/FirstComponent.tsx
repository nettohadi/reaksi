import Reaksi from "../reaksi";
import SecondComponent from "./SecondComponent";
import ThirdComponent from "./ThirdComponent";
import useState from "../reaksi/hooks/useState";
import {useEffect} from "../reaksi/hooks/useEffect";
import {logDOM} from "@testing-library/dom";

export default function FirstComponent(){
    console.log('render first component');
    const [counter, setCounter] = useState(1);

    const same = 0;

    useEffect(() => {
        console.log('first effect');
    });

    return (
        <div class="hadi">
            <SecondComponent/>
            <h1>counter : {counter}</h1>
            {(counter <= 5) && <h2>counter is less  than or equal to 5</h2>}
            <button onclick={() => {setCounter(counter + 1)}}>+ counter</button>
            <button onclick={() => {setCounter(counter - 1)}}>- counter</button>
            <button onclick={() => {setCounter(counter)}}>same counter</button>
            {(counter > 5) && <h2>counter is greater than 5</h2>}
        </div>
    );
}
