
export interface ITableDataItem {
  ident: string
  productId: string
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

export interface IProperty {
  propertyId: string
  // proptertyType: EPropertyType
  propertyType: 'UnicodeProductProperty'|'BoolProductProperty'
  version: string // combined: product-packageVersion
  possibleValues: Array<string|boolean> // (all possibleValues concatinated without duplicates)
  editable: boolean
  multiValue: boolean

  depotsIds: Array<string>
  depotsValues: Array<Array<string|boolean>> //  prodPropState(depots) or defaultValues
  depotsVersions?: string // combined: product-packageVersion

  clientsIds: Array<string>
  clientsValues: Array<Array<string|boolean>> // prodPropState(clients)
  clientsVersions?: string // combined: product-packageVersion

  // clientValuesDiff: boolean
  // depotVersionDiff: boolean
  newValue?: string
  newValues?: Array<string>
}

export interface IProductDependency {
  productId: string
  required?: string
  'pre-required'?: string
  'post-required'?: string
  'on deinstall'?:string
}

export interface IProperties {
  [key: string]: IProperty
}
export interface IProductPropertyConfig {
  description?: string
  dependencies?: Array<IProductDependency>
  properties: IProperties
}

export interface INewPropertyValue {
  [key: string]: {
    newValue: string
    newValues: Array<string>
  }
}
