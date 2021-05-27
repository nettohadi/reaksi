import reaksi, {useState} from "../reaksi";
import TodoItem from "./TodoItem";
import store from "../redux/store";
import {Provider} from "../reaksi/hooks/useRedux";
import Counter from "./Counter";
import Number from "./Number";

const initialValue = [
    {id:1, desc:'washing hair', done:false},
    {id:2, desc:'shopping', done:false}
];

let lastId = 2;

const Todo = () => {
    const [todos, setTodos] = useState(initialValue);
    const [text, setText] = useState('');
    // const [count, setCount] = useState(0);

    console.log({state:store.getState()});

    const addToDo = (e) => {
        e.preventDefault();
        const newTodos = [...todos, {id:++lastId, desc:text, done:false}];
        setTodos(newTodos);
    }

    const removeToDo = (id) => {
        const newTodo = todos.filter(item => item.id !== id);
        setTodos(newTodo);
    }

    return (
        <div style={styles.container}>
            <Provider store={store}>
                <div>
                    <form onsubmit={addToDo}>
                        <input type="text" placeholder="type something" value={text} onchange={(e) => setText(e.target.value)}/>
                        <button onclick={addToDo}>Add Todo</button>
                    </form>
                </div>
                <Counter/>
                <Number/>
            </Provider>
        </div>
    )
}

export default Todo;

const styles = {
    container: 'border: 2px solid;background-color:lightgreen'
}