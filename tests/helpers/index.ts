export function removeAllWhiteSpaces(text:string){
    return text.replace(/\s*(?=<)|(?<=>)\s*/g, '')
}

export function wait(callback,numberInMiliSeconds:number = 0){
    /* This function was created because of the race problem I faced when testing router.
    *  You use This function to delay the assertion until the dom is ready */
    setTimeout(callback, numberInMiliSeconds);
}