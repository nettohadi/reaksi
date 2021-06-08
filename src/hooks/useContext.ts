import Reaksi from "../index";
import {Constants} from "../helpers";

let contexts: ContextType[] = [];
let contextId = 0;

type ContextType = {
    Provider: Function,
    id: number,
    value:any
}

function provider(id, props){
    const context = contexts.find(c => c.id == id);
    if(context) context.value = props.value;
    return {
        type: 'div',
        children: props.children,
        props:props
    };
}

export function createContext(initialValue:any|null=null){
    contextId++;
    const id = contextId;
    const newContext:ContextType = {Provider: (props) => provider(id, props), id: contextId, value:initialValue};

    contexts.push(newContext);
    return newContext;
}

export function useContext(context:ContextType){
    return contexts.find(c => c.id == context.id)?.value || null;
}