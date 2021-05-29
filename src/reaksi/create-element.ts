import {VNodeType} from "./types";

export function createElement(type: string, attributes: any = {}, ...children): VNodeType {
    let filteredChildren = filterOutInValidChildren(children);
    return {
        type,
        children: filteredChildren,
        props: {...attributes, children: filteredChildren}
    }
}

function filterOutInValidChildren(children: any[]): any[] {
    return [].concat(...children).reduce(
        (filteredChildren: any[], child: any) => {

            //if is not valid, don't do anything
            if (isNotValidChild(child)) {
                return filteredChildren
            }

            //if it's type of object, just push it to the array
            if (child instanceof Object) {
                filteredChildren.push(child);
            } else if (typeof child == 'boolean') {
                filteredChildren.push(
                    //convert it to element object before pushing to the array
                    createElement("boolean", {
                        textContent: child
                    })
                );
            } else {
                filteredChildren.push(
                    //convert it to element object before pushing to the array
                    createElement("text", {
                        textContent: child
                    })
                );
            }

            return filteredChildren

        }
        , []);
}

function isNotValidChild(child: any) {
    return false;
    // return typeof child === "boolean";
}