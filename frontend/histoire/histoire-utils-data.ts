/**
This file is part of opsi-webgui application.
opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
Copyright (c) uib GmbH <info@uib.de> 2025
All rights reserved.
License: AGPL-3.0
*/
export const generateColumns = (length = 10, prefix = 'column-', props?: any) => {
  const cols: any = {}
  Array.from({ length }).map((_, columnIndex) => {
    const _key: string = `${prefix}${columnIndex}`

    const c = {
      ...props,
      key: _key,
      id: _key,
      parentId: null,
      dataKey: _key,
      title: `Column ${columnIndex}`,
      width: 200,
    }
    cols[_key] = c
  })
  return cols
}

export const generateData = (
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
        } else rowData[column.dataKey] = `Row ${startIndex}${rowIndex} - Col ${columnIndex}`
        return rowData
      },
      {
        id: `${prefix}${startIndex}${rowIndex}`,
        parentId: null,
      }
    )
  })

export const generateNumbers = (length = 200) => {
  const l2: Array<number> = []
  Array.from({ length }).map(() => l2.push(Math.floor(Math.random() * 101)))
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
    filterColumns: [rowKey],
  }
}
