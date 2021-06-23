
export interface ITableDataItem {
  ident: string
}

export interface ITableRow {
  rowSelected: boolean
  item: {
      ident: string
      _rowVariant?: string
  };
}

export interface ITableRowItemProducts {
  ident: Array<string>
  request: Array<string>
  selectedDepots?: Array<string>
  selectedClients?: Array<string>
}
export interface ITableData {
  pageNumber: number,
  setPageNumber: Function,
  perPage: number,
  sortBy: string,
  sortDesc: boolean,
  filterQuery: string,
  type?: string,
  selectedDepots?: Array<string>,
  selectedClients?: Array<string>
}

export interface ITableHeader {
  label: string,
  key: string,
  visible: boolean,
  sortable?: boolean,
  _fixed?: boolean,
  _isMajor?: boolean,
  _majorKey?: string,
}
export interface ITableHeaders {
  [key: string]: ITableHeader
}
