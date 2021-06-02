import Reaksi, {createContext, useContext, useState} from "../index";
import {Constants, RouterRegExpType} from "../types";

const RouterContext = createContext(null);


let changePath = (path:string) => {};

export function Router(props) {
    const [path, setPath] = useState(window.location.pathname + window.location.search);
    changePath = setPath;
    props.value = path;
    return RouterContext.Provider(props);
}

let params = {};
export function Route(props) {
    const path = useContext(RouterContext);
    const exact = props.exact || false;
    const regExp = createRegExp(props.path ||  '', exact);

    const isMatched = regExp.value.exec(path);
    params = extractParams(path, props.path, exact);

    return {
        type: Constants.Fragment,
        children: props.path && isMatched ? props.children : [],
        props: {}
    };

}

export function useRouter(){
    return {
        push: (path:string) => {
            window.location.pathname = path;
            changePath(path);
        }
    }
}

export function useParam(){
    return params;
}

function createRegExp(text:string, exact = false): RouterRegExpType{
    let pattern = text.replace(/\//gi,'\\/');
    pattern = pattern.replace(/\?/gi, '\\?');

    pattern = pattern.replace(/\[\w+\]/gi,'(\\[\\w+\\])');
    let value = pattern.replace(/\\\[|\\\]/gi, '');

    return {
        pattern:new RegExp(pattern + (exact ? '$' : ''), 'gi'),
        value:new RegExp(value + (exact ? '$' : ''), 'gi')
    };
}

function extractParams(path:string, pathPattern:string, exact= false){
    const regExp = createRegExp(pathPattern ||  '', exact);

    const matchValues:RegExpMatchArray | null = regExp.value.exec(path);
    const matchPatterns:RegExpMatchArray | null = regExp.pattern.exec(pathPattern);

    let params = {};
    if(matchValues && matchPatterns && matchValues.length && matchPatterns.length){
        matchValues.forEach((item, index) => {
            const key = matchPatterns[index].replace(/\[|\]/gi,'');
            if(index !== 0){
                params[key] = item;
            }
        }) ;
    }

    return params;
}