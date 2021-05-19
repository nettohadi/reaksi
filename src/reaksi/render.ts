import {VNodeType} from "./types";
import {
    resetComponentId,
    resetComponentNames,
    resetStateId,
    setCurrentComponent,
    setCurrentNode
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

    /* get old vdom */
    const oldVNode: VNodeType = oldNode && oldNode._vNode;
    if(!oldVNode) {
        mountElement(vNode, container);
        return;
    };

    /* TODO: How do we know if component is unmounted*/


    if (vNode.type !== oldVNode.type) {
        let newNode:any = createNode(vNode);

        container.replaceChild(newNode, oldNode);
        newNode = updateNode(newNode, vNode, oldVNode);

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

        // Remove old  nodes
        let oldChildNodes = oldNode.childNodes;
        if (oldChildNodes.length > vNode.children.length) {
            for (let i = oldChildNodes.length - 1; i >= vNode.children.length; i -= 1) {
                oldChildNodes[i].remove();
            }
        }
    }

}

function updateNode(node, vNode, oldVNode){
    if(vNode.type == 'text'){
        node = updateTextNode(node, vNode,  oldVNode)
    }else{
        node = setAttributesAndListeners(node, vNode, oldVNode);
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
        const componentName = setCurrentComponent(() => factory(vnode.props), container, functionName, props);

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

function setAttributesAndListeners(node, vdom, oldVdom: VNodeType | null = null) {
    const newProps = vdom.props || {};
    const oldProps = oldVdom?.props || {};

    Object.keys(newProps).forEach(propName => {
        const newProp = newProps[propName];
        const oldProp = oldProps[propName];
        if (newProp !== oldProp) {
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
                    node.setAttribute("class", newProps[propName]);
                } else {
                    node.setAttribute(propName, newProps[propName]);
                }
            }
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
    resetStateId();
}

/*export function diff(vdom, oldDom, container: HTMLElement | undefined) {
    //get old vdom if exist
    const oldvdom: VNodeType = oldDom && oldDom._virtualElement;

    vdom = checkIfFunctionalComponent(vdom, container);

    //if oldvdom does not exist, create new one
    if (!oldvdom) {
        // console.log('new element needs to be added',{urutan:urutan++, vdom, container});
        mountSimpleNode(vdom, container || null, oldDom);
        return;
    }

    //if oldvdom type does not macth vdom type, create new one
    if (oldvdom.type !== vdom.type) {
        // console.log(' oldvdom type & vdom type does  ot match', {oldvdom, vdom, oldDom})
        mountSimpleNode(vdom, container || null, oldDom);
        // return;
    } else {
        if (oldvdom.type === "text") {
            updateTextNode(oldDom, vdom, oldvdom);
        } else {
            updateDomElement(oldDom, vdom, oldvdom);
            // console.log('update dom',{urutan:urutan++}, {oldDom:oldDom, vdom})
        }
    }


    // Set a reference to updated vdom
    oldDom._virtualElement = vdom;
    // console.log('after update',{urutan:urutan++}, {oldDomType:oldDom.nodeName, text:oldDom.textContent, oldDom});

    // Recursively diff children..
    // Doing an index by index diffing (because we don't have keys yet)
    vdom.children.forEach((child, i) => {
        /!* diff (vdom, oldDom, container)*!/
        //console.log('diff children', {child, oldvdom:oldDom.childNodes[i]._virtualElement, container:oldDom})
        diff(child, oldDom.childNodes[i], oldDom);

    });

    // Remove old dom nodes
    let oldNodes = oldDom.childNodes;
    if (oldNodes.length > vdom.children.length) {
        for (let i = oldNodes.length - 1; i >= vdom.children.length; i -= 1) {
            let nodeToBeRemoved = oldNodes[i];
            unMountNode(nodeToBeRemoved);
        }
    }
}

function unMountNode(dom) {
    //remove
    dom.remove();
}

function checkIfFunctionalComponent(vdom: VNodeType, container: HTMLElement | undefined) {

    if (vdom && typeof vdom.type == 'function') {
        const factory: Function = vdom.type;

        /!*******!/
        const componentId = setCurrentComponent(() => factory(vdom.props), container);
        /!*********!/

        vdom = factory(vdom.props);

        /!*********!/
        vdom.compId = componentId;
        /!*********!/
    }

    return vdom;
}

const mountElement = function (vdom: VNodeType, container) {
    vdom = checkIfFunctionalComponent(vdom, container);
    // console.log(vdom);
    // Native DOM elements as well as functions.
    return mountSimpleNode(vdom, container, container.firstChild);
}

const mountSimpleNode = function (vdom: VNodeType, container: HTMLElement | null, oldDom: HTMLElement | null = null) {
    let newDomElement: any = null;
    // const nextSibling = oldDomElement && oldDomElement.nextSibling;

    if (vdom.type === "text") {
        newDomElement = document.createTextNode(vdom.props.textContent);
    } else {
        newDomElement = document.createElement(vdom.type);
        updateDomElement(newDomElement, vdom);
    }

    // Setting reference to vdom to dom
    newDomElement._virtualElement = vdom;
    container?.appendChild(newDomElement);
    // if (oldDom) {
    //     // console.log('replace with',{urutan:urutan++}, {oldDom, newDomElement, container});
    //     container?.replaceChild(newDomElement, oldDom);
    //     // console.log('after replace',{oldDom: container?.firstChild});
    //
    // } else if (container) {
    //     // if(container.nodeName == '#text') {
    //     //     console.log('text container', {oldDom, newDom:newDomElement, vdom, container})
    //     // }
    //
    //     container.appendChild(newDomElement);
    //     console.log('append child', {newDomElement, container: container.lastChild, text: container.lastChild?.textContent});
    // }
    const newContainer = newDomElement;
    // if(newDomElement instanceof HTMLSpanElement){
    //     console.log({newContainer, newDomElement, oldDom, container});
    // }

    // if(newDomElement instanceof HTMLDivElement){
    //     console.log({newContainer, newDomElement, oldDom, container});
    // }


    // console.log('vdom.children',vdom)
    vdom.children.forEach(child => {
        mountElement(child, newContainer);
    });


}

function replaceNode() {

}


function updateDomElement(domElement, newVirtualElement, oldVirtualElement: any = {}) {
    const newProps = newVirtualElement.props || {};
    const oldProps = oldVirtualElement.props || {};
    Object.keys(newProps).forEach(propName => {
        const newProp = newProps[propName];
        const oldProp = oldProps[propName];
        if (newProp !== oldProp) {
            if (propName.slice(0, 2) === "on") {
                // prop is an event handler
                const eventName = propName.toLowerCase().slice(2);
                // domElement.setAttribute(eventName, `{${newProp.name}}`);
                domElement.addEventListener(eventName, newProp, false);
                if (oldProp) {
                    domElement.removeEventListener(eventName, oldProp, false);
                }
            } else if (propName === "value" || propName === "checked") {
                // this are special attributes that cannot be set
                // using setAttribute
                domElement[propName] = newProp;
            } else if (propName !== "children") {
                // ignore the 'children' prop
                if (propName === "className") {
                    domElement.setAttribute("class", newProps[propName]);
                } else {
                    domElement.setAttribute(propName, newProps[propName]);
                }
            }
        }
    });
    // remove oldProps
    Object.keys(oldProps).forEach(propName => {
        const newProp = newProps[propName];
        const oldProp = oldProps[propName];
        if (!newProp) {
            if (propName.slice(0, 2) === "on") {
                // prop is an event handler
                domElement.removeEventListener(propName, oldProp, false);
            } else if (propName !== "children") {
                // ignore the 'children' prop
                domElement.removeAttribute(propName);
            }
        }
    });

    // set component id
    if (newVirtualElement.compId) {
        setCurrentDom(domElement, newVirtualElement.compId)
        // domElement.setAttribute('data-comp', newVirtualElement.compId);
    }
}

function updateTextNode(node, vNode, oldVNode) {
    if(!oldVNode) return node;
    if (vNode.props.textContent !== oldVNode.props?.textContent) {
        node.textContent = vNode.props.textContent;
    }

    return node;
    // // Set a reference to the newvddom in oldDom
    // dom._virtualElement = newvdom;
}*/
