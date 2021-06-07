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