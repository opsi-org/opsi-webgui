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
    productId: string
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
  description: string
  multiValue: boolean
  editable: boolean
  default: Array<string|boolean> // combined: product-packageVersion
  possibleValues: Array<string|boolean> // (all possibleValues concatinated without duplicates)

  descriptionDetails?: { [key:string]: string}
  defaultDetails?: { [key:string]: string}
  multiValueDetails?: { [key:string]: string}
  editableDetails?: { [key:string]: string}

  newValue?: string // empty string if editable==true
  newValues?: Array<string> // empty list if editable==true

  anyDepotDifferentFromDefault?: boolean
  anyClientDifferentFromDepot?: boolean
  depots:{ [key: string]: Array<string|boolean> }
  clients:{ [key: string]: Array<string|boolean> }
}

export interface IProductDependency {
  productId: string
  productAction: string|null
  version: string
  requiredProductId: string
  requiredVersion: string|null
  requiredAction: string|null
  requiredInstallationStatus: string|null
  requirementType: string|null
}

// export interface IProperties {
//   [key: string]: Array<IProperty>|[]
// }
export interface IProductPropertyConfig {
  description?: string
  dependencies?: Array<IProductDependency>
  properties: Array<IProperty>|[]
}

export interface INewPropertyValue {
  [key: string]: {
    newValue: string
    newValues: Array<string>
  }
}
