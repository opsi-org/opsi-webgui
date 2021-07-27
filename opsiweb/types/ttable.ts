
export interface ITableDataItem {
  ident: string
  productId: string
}

export interface ITableRow {
  rowSelected: boolean
  item: {
    ident: string
    productId: string
    _rowVariant?: string
  };
}

export interface ITableRowItemProducts {
  ident: Array<string>
  selectedDepots: Array<string>
  selectedClients: Array<string>
  request: Array<string>
  actionRequestDetails?: Array<string>
  depotVersions: Array<string>
  clientVersions: Array<string>
  clientVersionOutdated: boolean
  depotVersionDiff: boolean
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
  class?: string,
  variant?: string,
}
export interface ITableHeaders {
  [key: string]: ITableHeader
}
