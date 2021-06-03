import Reaksi, {Router, useRouter} from './reaksi';
import {Routing} from "./components/Routing";
import {Links} from "./components/Links";

export function App(){
    console.log('render app');
    return(
        <div class="App">
            <Links/>
            <Routing/>
        </div>
    );
}