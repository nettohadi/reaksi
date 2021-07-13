export function isObject(value:any){
    const type = typeof value;
    return type === 'object'  && !!value;
}

export function camelCaseToKebabCase(word:string){
    return word.replace(/([A-Z])/g, '-$1').toLowerCase();
}

export const Constants = {
    Fragment: 'Fragment'
};

let firstRender = true;
export function isFirstRender(){
    const value = firstRender;
    firstRender = false;
    return value;
}

export function makeTheFirstRender() {
    firstRender = true;
}