import {VNodeType} from "./types";

export function createElement(type: string, attributes: any = {}, ...children): VNodeType {
    const normalizedChildren = normalizeChildren(children);
    return {
        type,
        children: normalizedChildren,
        props: {...attributes, children: normalizedChildren}
    }
}


function normalizeChildren(children: any[]): any[] {
    //flatten children array
    children = [].concat(...children);

    return children.reduce(
        (normalizedChildren: any[], child: any) => {

            //if it's type of object (VNode), just push it to the array
            if (child instanceof Object) {
                normalizedChildren.push(child);
            } else if (typeof child == 'boolean') {
                //if it is type of boolean
                normalizedChildren.push(
                    //convert it to VNode with type boolean
                    createElement("boolean", {
                        textContent: child
                    })
                );
            } else {
                //if it is type of text
                normalizedChildren.push(
                    //convert it to VNode with type text
                    createElement("text", {
                        textContent: child
                    })
                );
            }

            return normalizedChildren

        }
        , []);
}
