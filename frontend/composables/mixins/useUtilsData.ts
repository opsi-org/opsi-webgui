
export const useUtilsData = () => {

  function getVisibleColumnIds (headers:Array<any>) {
    return headers
      .filter(v=>
        v.title !== undefined && v.title !== ''
        && !((v.fixed === undefined || v.fixed === false)
        && (v.hidden === undefined || v.hidden === true)
        && (v._majorKey === undefined))
      )
      .map((_v:any) => _v.dataKey)
  }
  function getVisibleColumns (headers:Array<any>) {
    const _majors = []
    const _defaults = headers
      .filter(v=>
        ((v.title !== undefined && v.title !== '')
          || (v.icon !== undefined && v.icon !== '' && v.tooltip !== undefined && v.tooltip !== '')
          || (v.icons !== undefined && v.icons !== '' && v.tooltip !== undefined && v.tooltip !== ''))
        && !((v.fixed === undefined || v.fixed === false)
        && (v.hidden === undefined || v.hidden === true)
        && (v._majorKey === undefined))
      )
      // .map((_v:any) => {
      //   if (_v._isMajor) {

      //     _majors.push(_v.dataKey)
      //   }
      //   const v = { ..._v }
      // })
    return {..._defaults}
  }
  return { getVisibleColumnIds, getVisibleColumns }
}

