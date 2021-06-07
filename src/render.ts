import type {VNodeType} from "./types";
import {Constants} from "./helpers";
import {
    addUnMountedComponent, getCurrentComponent,
    resetComponentId,
    resetComponentNames,
    setCurrentComponent,
    setCurrentNode, updateNodeRefInStates, updateStateComponent
} from "./hooks/useState";
import {resetEffectId, runAllPendingEffect} from "./hooks/useEffect";
import Reaksi from "./index";
import {camelCaseToKebabCase, isObject} from "./helpers";

/**
 * render virtual node to the dom
 * @param vnode virtual node
 * @param container dom node container
 * @param oldDom old dom node container
 */
export function render(vnode: VNodeType, container: HTMLElement | null | undefined, oldDom?: Node | any | null) {

    /* if vnode or container are null, just bail */
    if (!vnode || !container) return

    oldDom = oldDom || container.firstChild;
    if (!oldDom) {
        /* first render */
        mountElement(vnode, container);
    } else {
        /* subsequent render */
        const next = (oldDom as HTMLElement).nextSibling;
        diff(vnode, oldDom, container)
    }

    runAllPendingEffect();
    cleanUpAfterRender();
}

function diff(vNode: VNodeType, oldNode, container : HTMLElement, childIndex: number | null = null) {
    /* check if it's functional component */
    vNode = isFunctionalComponent(vNode, container, childIndex);

    /* get old vNode */
    const oldVNode: VNodeType = oldNode && oldNode._vNode;
    if (!oldVNode) {
        mountElement(vNode, container);
        return;
    }

    checkForUnMountedComponent(vNode.children, oldVNode.children);

    if(vNode.type === Constants.Fragment) {
        let currentNode:Node = oldNode;
        vNode.children.forEach((child, index) => {
            if(index > 0) {
                currentNode = (oldNode?.nextSibling as HTMLElement) || oldNode.replacedBy?.nextSibling;
            }
            diff(child, currentNode, container, index);
        })
        return;
    }
    else if (vNode.type !== oldVNode.type || (vNode.componentName && vNode.componentName !== oldVNode.componentName)) {
        let newNode: Node = createNode(vNode);

        newNode = updateNode(newNode, vNode, null);
        updateNodeRefInStates(vNode.componentName || '', newNode);

        container.replaceChild(newNode, oldNode);
        /* Keep reference to node which replace the oldNode */
        oldNode.replacedBy = newNode;

        /* if it's a component being replaced, push component name to unmounted list */
        if(oldVNode.componentName) {
            addUnMountedComponent([oldVNode.componentName]);
        }

        /* Do it recursively for children */
        vNode.children.forEach((item, index) => {
            mountElement(item, newNode, index);
        });
    } else {
        oldNode = updateNode(oldNode, vNode, oldVNode);

        /* Do it recursively for children */
        vNode.children.forEach((childVNode, index) => {
            if(childVNode.type !== 'boolean'){
                diff(childVNode, oldNode.childNodes[index], oldNode, index);
            }
        });


    }

    /* Remove unused old childNodes (unused means the old childNode does not exist in new vNode tree ) */
    let oldChildNodes = oldNode.childNodes;
    if (oldChildNodes.length > vNode.children.length) {
        for (let i = oldChildNodes.length - 1; i >= vNode.children.length; i -= 1) {
            oldChildNodes[i].remove();
        }

    }
    else if(oldChildNodes.length === vNode.children.length){
        vNode.children.forEach((child, index) => {
            if(child.type === 'boolean'){

                /* Unmount if it's a component*/
                if(oldChildNodes[index]._vNode.componentName) {
                    addUnMountedComponent([oldChildNodes[index]._vNode.componentName])
                }

                oldChildNodes[index].remove();
            }
        })
    }

}


/**
 check if some components do not exist in the new vNode tree
 if it does not exist, it should be unmounted
*/
function checkForUnMountedComponent(newVNodes: VNodeType[], oldVNodes: VNodeType[]) {
    /**
     * We need to check this way to know which component is being unmounted
     * when new vNode tree has less children then old vNode tree
     */

    const oldChildrenComponentNames = getComponentNames(oldVNodes);
    const newChildrenComponentNames = getComponentNames(newVNodes);

    const unMountedComponents = oldChildrenComponentNames.filter(c => !newChildrenComponentNames.includes(c));
    if (unMountedComponents.length) addUnMountedComponent(unMountedComponents);
}

function getComponentNames(vNodes: VNodeType[]) {
    let componentNames:string[] = [];
    let names: string[] = [];

    vNodes.forEach((node, index) => {
        if (typeof node.type == "function") {
            let name = node.type.name;
            if(componentNames.includes(node.type.name)){
                name += (node.props.key ? '_' + node.props.key : '_' + index);
            }else{
                componentNames.push(name);
            }

            names.push(name);
        }
    });
    return names;
}

function updateNode(node, vNode:VNodeType, oldVNode) {
    if (vNode.type == 'text') {
        node = updateTextNode(node, vNode, oldVNode)
    } else {
        if (!oldVNode) {
            node = setAttributeAndListeners(node, vNode);
        } else {
            node = updateAttributesAndListeners(node, vNode, oldVNode);
        }

    }

    node._vNode = vNode;
    return node;
}


/* @param vdom = virtual dom to render */

/* @param container = HTML Element where the dom will be mounted */
function mountElement(vnode: VNodeType, container: HTMLElement | Node, childIndex: number | null = null) {
    /* check if it's functional component */
    vnode = isFunctionalComponent(vnode, container, childIndex);

    /* mount to container */
    const newNode = vnode.type === Constants.Fragment  ? container : mountNode(vnode, container);

    /* associate current node with the component */
    if (vnode.componentName) {
        setCurrentNode(newNode, vnode.componentName);
    }

    /* Do it recursively for children */
    vnode.children?.forEach((item, index) => {
        mountElement(item, newNode, index);
    });
}

function isFunctionalComponent(vnode: VNodeType, container: HTMLElement | Node, childIndex: number | null = null) {
    if (vnode && typeof vnode.type == 'function') {
        const factory: Function = vnode.type;
        const functionName = vnode.type.name;
        const {props} = vnode;

        /** track current component to be used by hooks */
        const componentName = setCurrentComponent(factory, (container as HTMLElement | undefined), functionName, props, childIndex);

        vnode = factory(vnode.props);

        /* Check again recursively */
        if (vnode && typeof vnode.type == 'function') vnode = isFunctionalComponent(vnode, container);

        /* associate vnode with the component*/
        vnode.componentName = componentName;
    }

    return vnode;
}

function createNode(vNode: VNodeType) {
    let newNode:Node;
    if (vNode.type === "text") {
        newNode = document.createTextNode(vNode.props.textContent);
    } else {
        newNode = document.createElement(vNode.type);
    }

    /*expose dom reference via ref prop if exist*/
    if(vNode.props.hasOwnProperty('ref') && vNode.props.ref.hasOwnProperty('current')) {
        vNode.props.ref.current = newNode;
    }

    return newNode;
}

function mountNode(vNode, container): Node {
    let newNode = createNode(vNode);
    newNode = updateNode(newNode, vNode, null);

    container.appendChild(newNode);

    return newNode;

}

function updateAttributesAndListeners(node, vdom, oldVdom: VNodeType | null = null) {
    const newProps = vdom.props || {};
    const oldProps = oldVdom?.props || {};

    Object.keys(newProps).forEach(propName => {
        const newProp = newProps[propName];
        const oldProp = oldProps[propName];

        if (newProp !== oldProp) {
            doSetAttrAndListeners(node, propName, newProp, oldProp)
        }

    });

    // remove oldProps
    Object.keys(oldProps).forEach(propName => {
        const newProp = newProps[propName];
        const oldProp = oldProps[propName];
        if (!newProp) {
            if (propName.slice(0, 2) === "on") {
                // prop is an event handler
                node.removeEventListener(propName, oldProp, false);
            } else if (propName !== "children") {
                // ignore the 'children' prop
                node.removeAttribute(propName);
            }
        }
    });


    return node;
}

function setAttributeAndListeners(node: HTMLElement, vNode: VNodeType): Node {
    const newProps = vNode.props || {};

    Object.keys(newProps).forEach(propName => {
        doSetAttrAndListeners(node, propName, newProps[propName], null);
    });

    return node;
}

function doSetAttrAndListeners(node: HTMLElement, propName: string, newProp: any, oldProp: any) {
    /* To make sure below condition matched when propName is written in  upper & lower case*/
    propName = propName.toLowerCase();

    if (propName.slice(0, 2) === "on") {
        // prop is an event handler
        const eventName = propName.toLowerCase().slice(2);
        // domElement.setAttribute(eventName, `{${newProp.name}}`);
        node.addEventListener(eventName, newProp, false);

        if (oldProp) {
            node.removeEventListener(eventName, oldProp, false);
        }

    } else if (propName === "value" || propName === "checked") {
        // this are special attributes that cannot be set
        // using setAttribute
        node[propName] = newProp;
    } else if (propName !== "children") {
        // ignore the 'children' prop
        if (propName === "className") {
            node.setAttribute("class", newProp);
        } else if(propName === "style" && isObject(newProp)){
            node.setAttribute(propName, objectToCSS(newProp));
        } else {
            node.setAttribute(propName, newProp);
        }
    }

}

/**
 * This function will transform object to string.
 * Every property  written in camelCase will be converted to kebab-case.
 * If type of property value is number, it will be converted to string and 'px' is appended to the end.
 * ex: {lineHeight: 20} ------> 'line-height : 20px;'
 */
function objectToCSS(objectCSS:Object):string{
    let stringCSS = '';
    for(const property in objectCSS){
        stringCSS += `${camelCaseToKebabCase(property)}:${appendPixelIfTypeIsNumber(objectCSS[property])};`;
    }

    return stringCSS;
}

function appendPixelIfTypeIsNumber(value){
    if(typeof value === 'number'){
        return `${value}px`;
    }
    return value;
}

function updateTextNode(node, vNode, oldVNode) {
    if (!oldVNode) return node;

    if (vNode.props.textContent !== oldVNode.props?.textContent) {
        node.textContent = vNode.props.textContent;
    }

    return node;
}

function cleanUpAfterRender() {
    // resetPendingEffects();
    resetEffectId();
    resetComponentId();
    resetComponentNames();
}


