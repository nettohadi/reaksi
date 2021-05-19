export function removeAllWhiteSpaces(text:string){
    return text.replace(/\s*(?=<)|(?<=>)\s*/g, '')
}