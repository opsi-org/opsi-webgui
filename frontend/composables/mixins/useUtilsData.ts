export const useUtilsData = () => {
  function getVisibleColumnIdsInSelect(headers: Array<any>) {
    return Object.values(getVisibleColumnsInSelect(headers)).map(
      (_v: any) => _v.dataKey
    );
  }
  function getVisibleColumnsInSelect(headers: Array<any>) {
    const _visibleMajorKeys = _getMajorKeys(headers);
    const _visibleColumns = _getEntries(headers).filter(
      (v) =>
        v._majorKey === undefined || _visibleMajorKeys.indexOf(v._majorKey) >= 0
    );
    return { ..._visibleColumns };
  }

  function _getMajorKeys(headers: Array<any>) {
    return headers
      .filter(
        (v) =>
          v._majorKey !== undefined &&
          (v.hidden === undefined || v.hidden === false)
      )
      .map((v) => v._majorKey) // ids of majors
      .filter((v, i, a) => a.indexOf(v) === i);
  }
  function _getMajorChildren(headers: Array<any>, majorKey: string) {
    return headers.filter(
      (v) => v._majorKey !== undefined && v._majorKey === majorKey
    );
  }
  function _getEntries(headers: Array<any>) {
    return headers.filter(
      (v) =>
        ((v.title !== undefined && v.title !== "") ||
          (v.tooltip !== undefined &&
            v.tooltip !== "" &&
            v._majorKey == undefined)) &&
        (v.hidden === undefined || v.hidden === false)
      // || (v.icon !== undefined && v.icon !== '' && v.tooltip !== undefined && v.tooltip !== '')
      // || (v.icons !== undefined && v.icons !== '' && v.tooltip !== undefined && v.tooltip !== '')
    );
  }

  // function getVisibleColumnIdsInTable (headers:Array<any>) {
  //   return Object.values(getVisibleColumnsInTable(headers)).map((_v:any) => _v.dataKey)
  // }
  function getVisibleColumnsInTable(headers: Array<any>) {
    // const _majorsVisible = _getMajorKeys(headers)
    const _defaults = _getEntries(headers);
    // // const _defaults = headers
    //   // .filter(v=>
    //   //   !((v.fixed === undefined || v.fixed === false)
    //   //     && (v.hidden === undefined || v.hidden === true)
    //   //     && (v._majorKey === undefined ||
    //   //       (v._majorKey !== undefined && v.hidden === true)
    //   //       || _majorsVisible.indexOf(v.dataKey) >= 0)
    //   //     )
    //   // )
    return { ..._defaults };
  }
  return {
    getVisibleColumnIdsInSelect,
    // getVisibleColumnIdsInTable,
    // getVisibleColumnsInSelect,
    getVisibleColumnsInTable,
  };
};
