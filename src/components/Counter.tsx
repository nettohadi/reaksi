import reaksi, {useSelector, useDispatch} from "../reaksi";

const Counter = () => {
    const state = useSelector((state) => state.counterReducer);
    const dispatch = useDispatch();
    console.log('render counter component');
    return (
        <div>
            <h2>Count is {state.count}</h2>
            <div>
                <button onclick={() => dispatch({type:'count/increment'})}>Increment</button>
            </div>
        </div>
    );
}

export default Counter;