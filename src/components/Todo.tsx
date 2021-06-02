import Reaksi, {useEffect, useState} from "../reaksi";
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

    const [value, setValue] = useState(1);
    const [angka, setAngka] = useState(1);

    const [list, setList] = useState([
        {id:1, name:'hadi'},
        {id:2, name:'susan'},
        {id:3, name:'humaira'},
    ])

    // if(value == 2) {
    //     console.log('run effect');
    //     const newList = list.filter(item => item.id !== 1);
    //     setList([...newList]);
    // }

    useEffect(() => {

        if(value == 2) {
            console.log('run effect value');
            const newList = list.filter(item => item.id !== 1);
            setList([...newList]);
        }
    }, [value]);

    useEffect(() => {

        if(angka == 2) {
            console.log('run effect value');
            const newList = list.filter(item => item.id !== 2);
            setList([...newList]);
        }
    }, [angka]);

    return (
        <div style={styles.container}>
                <div>
                    <h2>value : {value}</h2>
                    <h2>angka : {angka}</h2>
                    <div>
                        <button onclick={() => setValue(value + 1)}>+</button>
                        <button onclick={() => setAngka(angka + 1)}>-</button>
                    </div>
                </div>
            {list.map(item => <Number name={item.name} key={item.id}/>)}
        </div>
    )
}

export default Todo;

const styles = {
    container: 'border: 2px solid;background-color:lightgreen'
}