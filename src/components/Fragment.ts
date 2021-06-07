import {Constants} from "../helpers";

export function Fragment(props){
    return {
        type: Constants.Fragment,
        children: props.children,
        props:props
    };
}