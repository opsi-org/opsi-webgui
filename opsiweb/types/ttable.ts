import { IObjectString2ObjectString2String } from './tsettings'

export interface ITableDataItem {
  ident: string
  productId: string
}

export interface ITableRowItemProducts {
  ident: Array<string>
  productId: string
  selectedDepots: Array<string>
  selectedClients: Array<string>
  request: Array<string>
  actionRequestDetails?: Array<string>
  depotVersions: Array<string>
  clientVersions: Array<string>
  clientVersionOutdated: boolean
  depotVersionDiff: boolean
  installationStatus: Array<string>
  actionResult: Array<string>
  _rowVariant?: string
  tooltiptext?: IObjectString2ObjectString2String
}

export interface ITableRow {
  rowSelected: boolean
  toggleDetails: Function,
  item: ITableRowItemProducts|{
      ident: string
      _rowVariant?: string
  };
}
export interface ITableData {
  pageNumber: number,
  setPageNumber: Function,
  perPage: number,
  sortBy: string,
  sortDesc: boolean,
  filterQuery: string,
  type?: string,
  selectedDepots?: string,
  selectedClients?: string
}

export interface ITableHeader {
  label: string,
  key: string,
  visible: boolean,
  sortable?: boolean,
  _fixed?: boolean,
  _isMajor?: boolean,
  disabled?: boolean,
  _majorKey?: string,
  class?: string,
  variant?: string,
}
export interface ITableHeaders {
  [key: string]: ITableHeader
}

export interface IProperty {
  propertyId: string
  propertyType: 'UnicodeProductProperty'|'BoolProductProperty'
  version: string // combined: product-packageVersion
  possibleValues: Array<string|boolean> // (all possibleValues concatinated without duplicates)
  propertyDifferentOnVersions?: boolean
  editable: boolean
  newValue?: string // empty string if editable==true
  newValues?: Array<string> // empty list if editable==true

  multiValue: boolean

  depotsIds: Array<string>
  depotsValues: Array<Array<string|boolean>> //  prodPropState(depots) or defaultValues
  // depotsVersions?: string // combined: product-packageVersion

  clientsIds: Array<string>
  clientsValues: Array<Array<string|boolean>> // prodPropState(clients)
  // clientsVersions?: string // combined: product-packageVersion

  anyClientDifferentFromDepot?: boolean
  allClientValuesEqual?: boolean
  allDepotValuesEqual?: boolean
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
