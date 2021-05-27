import reaksi, {useContext, useSelector} from "../reaksi";

const TodoItem = (props) => {
    const state = useSelector((state) => state.counterReducer);
    console.log({state});
    console.log(`rerender todo item ${props.key}`)
    return (
        <div>
            <h3>{state.count}</h3>
            {/*<div><button onclick={() => data.setCount(data.count + 1)}>increment</button></div>*/}
            <span>{props.item.id}</span>|<span><input type="text" value={props.item.desc}/></span>
            <span> <button onclick={() => props.remove(props.item.id)}>X</button> </span>
        </div>
    );
}

export default TodoItem;