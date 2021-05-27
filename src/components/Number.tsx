import reaksi, {useSelector, useDispatch} from "../reaksi";

const Number = () => {
    const data = useSelector((state) => state.numberReducer);
    const dispatch = useDispatch();
    console.log('render number component');
    return (
        <div>
            <h2>Number is {data.number}</h2>
            <div>
                <button onclick={() => dispatch({type:'number/increment'})}>Increment</button>
            </div>
        </div>
    );
}

export default Number;