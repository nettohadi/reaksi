import {Constants} from "../types";

export function Fragment(props){
    return {
        type: Constants.Fragment,
        children: props.children,
        props:props
    };
}