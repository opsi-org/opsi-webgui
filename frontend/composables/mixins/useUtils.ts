
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


