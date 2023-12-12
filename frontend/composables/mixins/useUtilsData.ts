
export const useUtilsData = () => {

  const getVisibleColumnIds = (headers:Array<any>) => {
    return headers
      .filter(v=>
        (v.fixed === undefined || v.fixed === false)
        && (v.hidden === undefined || v.hidden === true)
        && (v._majorKey === undefined)
      )
      .map((_v:any) => _v.dataKey)
  }

  return { getVisibleColumnIds }
}


