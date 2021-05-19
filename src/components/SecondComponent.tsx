import reaksi from "../reaksi";
import ThirdComponent from "./ThirdComponent";
import useState from "../reaksi/hooks/useState";
import {useEffect} from "../reaksi/hooks/useEffect";
type Props = {
    number:number
}

export default function SecondComponent(){
    console.log('render second component');
    const [number, setNumber] = useState(5);
    useEffect(() => {
        console.log('second effect');
    });
    return (
        <div>
            <h2>number : {number}</h2>
            <button onclick={() => {setNumber(number + 1)}}>+ number</button>
            <button onclick={() => {setNumber(number - 1)}}>- number</button>
            {number < 10 && <ThirdComponent key={2}/>}
            <ThirdComponent key={1}/>
        </div>

    );
}