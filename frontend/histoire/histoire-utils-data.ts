
export const generateColumns = (length = 10, prefix = 'column-', props?: any) => {
  const cols = {}
  Array.from({ length }).map((_, columnIndex) => {
    const c = {
      ...props,
      key: `${prefix}${columnIndex}`,
      id: `${prefix}${columnIndex}`,
      parentId: null,
      dataKey: `${prefix}${columnIndex}`,
      title: `Column ${columnIndex}`,
      width: 200
    }
    cols[c.key] = c
  })
  return cols
}


export  const generateData = (
  columns: ReturnType<typeof generateColumns>,
  length = 200,
  prefix = 'row-',
  startIndex = 0
) =>
  Array.from({ length }).map((_, rowIndex) => {
    return Object.values(columns).reduce(
      (rowData: any, column: any, columnIndex: number) => {
        if (column.dataKey === 'selected') {
          rowData[column.dataKey] = false
        } else if (column.itemOf !== undefined) {
          rowData[column.dataKey] = column.itemOf[rowIndex]
        } else
          rowData[column.dataKey] = `Row ${startIndex}${rowIndex} - Col ${columnIndex}`
        return rowData
      },
      {
        id: `${prefix}${startIndex}${rowIndex}`,
        parentId: null,
      }
    )
  })

export const generateNumbers = (length = 200) => {
  const l2:Array<Number> = [];
  Array.from({ length }).map((x,i) => l2.push(Math.floor(Math.random() * 101)));
  return l2
}

export const generateTableData = (rowKey: string) => {
  return {
    type: 'LocalbootProduct', // optional
    pageNumber: 1,
    perPage: 25,
    sortBy: rowKey, // this.getKeyCookie('sorting_' + id, 'sortBy', 'depotId'),
    sortDesc: false, // this.getKeyCookie('sorting_' + id, 'sortDesc', false),
    filterQuery: '',
    filterColumns: [rowKey]
  }
}