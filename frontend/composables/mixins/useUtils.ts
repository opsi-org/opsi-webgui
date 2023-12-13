
export const useUtils = () => {



  const addOrRemoveListItem = (arr:any[], upload:any, by='ident') => {
    const index = arr.findIndex(function(element) { return element[by] === upload[by] });
    if (index > -1) {
        arr.splice(index, 1);
    } else {
        arr.push(upload);
    }
    return arr
  }


  return { addOrRemoveListItem }
}
export const useUtilsEvents = () => {

  function debounce(fn: Function, wait: number) {
  let timer: any;
   return function(...args: any[]){
     if(timer) {
        clearTimeout(timer); // clear any pre-existing timer
     }
     const context = getCurrentInstance()?.appContext; // get the current context
     timer = setTimeout(()=>{
        fn.apply(context, args); // call the function if time expires
     }, wait);
   }
  }
  // function delay(fn:Function, ms:number) {
  //   let timer:any = 0
  //   return function(...args: any[]) {
  //     clearTimeout(timer)
  //     const context = getCurrentInstance()?.appContext
  //     timer = setTimeout(fn.bind(context, ...args), ms || 0)
  //     // timer = setTimeout(fn.bind((this as any), ...args), ms || 0)
  //   }
  // }



  return { debounce }
}


