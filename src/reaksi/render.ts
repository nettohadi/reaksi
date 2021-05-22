import {VNodeType} from "./types";
import {
    addUnMountedComponent,
    resetComponentId,
    resetComponentNames,
    setCurrentComponent,
    setCurrentNode, updateNodeRefInStates
} from "./hooks/useState";
import {resetEffectId, resetPendingEffects, runAllPendingEffect} from "./hooks/useEffect";

export function render(vnode: VNodeType, container: HTMLElement | null | undefined, oldDom?:Node | null) {

    /* if vnode or container are null, just bail */
    if (!vnode || !container) return

    oldDom = oldDom || container.firstChild;
    if (!oldDom) {
        /* first render */
        mountElement(vnode, container);
    } else {
        /* subsequent render */
        diff(vnode, oldDom, container)
    }

    runAllPendingEffect();
    cleanUpAfterRender();
}

function diff(vNode: VNodeType, oldNode, container) {
    /* check if it's functional component */
    vNode = isFunctionalComponent(vNode, container);

    /* get old vNode */
    const oldVNode: VNodeType = oldNode && oldNode._vNode;
    if(!oldVNode) {
        mountElement(vNode, container);
        return;
    };

    /*
     check if some components does not exist in the new vNode tree
     if it does not exist, it should be unmounted
    */
    checkForUnMountedComponent(vNode.children, oldVNode.children)

    if (vNode.type !== oldVNode.type || (vNode.componentName && vNode.componentName !== oldVNode.componentName)) {
        let newNode:Node = createNode(vNode);

        newNode = updateNode(newNode, vNode, null);
        updateNodeRefInStates(vNode.componentName || '', newNode);

        container.replaceChild(newNode, oldNode);


        /* Do it recursively for children */
        vNode.children.forEach((item) => {
            mountElement(item, newNode);
        });
    } else {

        oldNode  = updateNode(oldNode, vNode, oldVNode);

        /* Do it recursively for children */
        vNode.children.forEach((childVNode, index) => {
            diff(childVNode, oldNode.childNodes[index], oldNode);
        });

        /* Remove unused old childNodes (unused means the old childNode does not exist in new vNode tree ) */
        let oldChildNodes = oldNode.childNodes;
        if (oldChildNodes.length > vNode.children.length) {
            for (let i = oldChildNodes.length - 1; i >= vNode.children.length; i -= 1) {
                oldChildNodes[i].remove();
            }
        }
    }

}

function getComponentNames(vNodes:VNodeType[]){
    let names:string[] = [];
    vNodes.forEach( node => {
       if(typeof node.type == "function") names.push(node.type.name + (node.props.key ? '_' + node.props.key : ''));
    });

    return names;
}

function checkForUnMountedComponent(newVNodes:VNodeType[], oldVNodes:VNodeType[]){
    /* TODO: How do we know if component is unmounted*/
    const oldChildrenComponentNames = getComponentNames(oldVNodes);
    const newChildrenComponentNames = getComponentNames(newVNodes);
    const unMountedComponents = oldChildrenComponentNames.filter(c => !newChildrenComponentNames.includes(c));

    if(unMountedComponents.length) addUnMountedComponent(unMountedComponents);
}

function updateNode(node, vNode, oldVNode){
    if(vNode.type == 'text'){
        node = updateTextNode(node, vNode,  oldVNode)
    }else{
        if(!oldVNode){
            node = setAttributeAndListeners(node, vNode);
        }else{
            node = updateAttributesAndListeners(node, vNode, oldVNode);
        }

    }

    node._vNode = vNode;
    return node;
}


/* @param vdom = virtual dom to render */
/* @param container = HTML Element where the dom will be mounted */
function mountElement(vnode:VNodeType, container) {
    /* check if it's functional component */
    vnode = isFunctionalComponent(vnode, container);

    /* mount to container */
    const newNode = mountNode(vnode, container);

    /* set current node to associate with the component */
    if (vnode.componentName) {
        setCurrentNode(newNode, vnode.componentName);
    }

    /* Do it recursively for children */
    vnode.children?.forEach((item) => {
        mountElement(item, newNode);
    });
}

function isFunctionalComponent(vnode:VNodeType, container: HTMLElement) {
    if (vnode && typeof vnode.type == 'function') {
        const factory: Function = vnode.type;
        const functionName = vnode.type.name;
        const {props} = vnode;

        /** track current component to be used by hooks */
        const copyProps = {...vnode.props};
        const componentName = setCurrentComponent(() => factory(props), container, functionName, props);

        vnode = factory(vnode.props);
        /* associate vnode with the component*/
        vnode.componentName = componentName;
    }

    return vnode;
}

function createNode(vNode:VNodeType){
    let newNode;
    if (vNode.type === "text") {
        newNode = document.createTextNode(vNode.props.textContent);
    } else {
        newNode = document.createElement(vNode.type);
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

function setAttributeAndListeners(node:HTMLElement, vNode:VNodeType) : Node{
    const newProps = vNode.props || {};

    Object.keys(newProps).forEach(propName => {
        doSetAttrAndListeners(node, propName, newProps[propName], null);
    });

    return node;
}

function doSetAttrAndListeners(node:HTMLElement, propName:string, newProp:any, oldProp:any){
    if (propName.slice(0, 2) === "on") {
        // prop is an event handler
        const eventName = propName.toLowerCase().slice(2);
        // domElement.setAttribute(eventName, `{${newProp.name}}`);
        node.addEventListener(eventName, newProp, false);

        if(oldProp) {
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
        } else {
            node.setAttribute(propName, newProp);
        }
    }

}

function updateTextNode(node, vNode, oldVNode) {
    if(!oldVNode) return node;

    if (vNode.props.textContent !== oldVNode.props?.textContent) {
        node.textContent = vNode.props.textContent;
    }

    return node;
}

function cleanUpAfterRender(){
    // resetPendingEffects();
    resetEffectId();
    resetComponentId();
    resetComponentNames();
}


