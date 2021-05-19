import reaksi from "../reaksi";
import useState from "../reaksi/hooks/useState";
import {useEffect} from "../reaksi/hooks/useEffect";

export default function ThirdComponent({key}){
    console.log('render third component');
    const [x, setX] = useState(2);
    const [order, setOrder] = useState(1);

    useEffect(() => {
        // setOrder(x);
        return () => console.log('running unmounting effect of thirdComponent with key ' + key);
    }, []);

    return (
        <div class="blue">
            <h3>counter : {x}</h3>
            <h3>order : {order}</h3>
            <button onclick={() => setX(x + 1)}>+</button>
            <button onclick={() => {setOrder(order + 1)}}>increment order</button>
        </div>
    );
}