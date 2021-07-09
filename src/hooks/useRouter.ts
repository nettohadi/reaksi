//TODO:
//1. Router does not work correctly, if Route component is not a direct child

import Reaksi, {HistoryType, useEffect, useState} from "../index";
import type {RouterRegExpType, VNodeType} from "../types";
import {Constants} from "../helpers";

const history:HistoryType = {
    push : (path:string) => {
        window.history.pushState({},'',path);
        changePath(path);
    },
    path : '',
    getParam: (param:string) => params[param]
}


let changePath:(path:string) => {};
let pathFromRouter;

function handleBackButton() {
    useEffect(() => {
        window.onpopstate = function () {
            changePath(window.location.pathname + window.location.search)
        };
        return () => window.onpopstate = null;
    }, []);
}

export function Router(props) {
    const [path, setPath] = useState(window.location.pathname + window.location.search);
    pathFromRouter = path;
    history.path = path;
    changePath = setPath;

    handleBackButton();

    const children = props.children;

    const filteredChildren:VNodeType[] = [];
    children.forEach(child => {
        if(typeof child.type === 'function' && child.type.name === 'Route'){
            const invokedChild = child.type(child.props);
            if(invokedChild.type !== 'empty'){
                filteredChildren.push(invokedChild);
            }
        }else{
            filteredChildren.push(child);
        }
    });

    const newProps = {...props, children:filteredChildren};

    return {
        type: Constants.Fragment,
        children: newProps.children,
        props: newProps
    };
}

let params = {};
export function Route(props) {
    const path = pathFromRouter;
    const exact = props.exact || false;
    const regExp = createRegExp(props.path ||  '', exact);

    const isMatched = regExp.value.exec(path);
    // console.log({isMatched, path, route: props.path});
    params = {...params, ...extractParams(path, props.path, exact)};

    checkForNestedRoute(props.children);

    return {
        type: isMatched ? Constants.Fragment : 'empty',
        children: props.children,
        props: {}
    };

}

function checkForNestedRoute(children:VNodeType[]){
    children.forEach(child => {
        /* Check for nested Route (Route inside Route)*/
        if(typeof child.type === 'function' && child.type.name === 'Route'){
            throw new Error('Route can not be nested inside Route');
        }
    });
}



export function useRouter():HistoryType{
    return history
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