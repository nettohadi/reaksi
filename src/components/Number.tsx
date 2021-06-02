import Reaksi, {useSelector, useDispatch, useState, useEffect} from "../reaksi";

const Number = ({name, key}) => {
    // const data = useSelector((state) => state.numberReducer);
    // const dispatch = useDispatch();
    const [number, setNumber] = useState(1)
    console.log('render number component');
    useEffect(() => {
        return () => console.log('unmounted state ');
    }, [])
    return (
        <div>
            <h3>Name : {name}</h3>
            <h2>Number is {number}</h2>
            <div>
                <input type="text"/>
            </div>
            <div>
                <button onclick={() => setNumber(number+1)}>Increment</button>
            </div>
        </div>
    );
}

export default Number;