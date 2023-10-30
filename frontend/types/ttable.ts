import { IObjectString2ObjectString2String, IObjectString2String, IObjectString2StringOrUndefined } from './tgeneral'

export interface ITableDataItem {
  ident: string
  productId?: string
  depotId?: string
  clientId?: string
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
  client_version_outdated: boolean
  depot_version_diff: boolean
  installationStatus: Array<string>
  actionResult: Array<string>
  actionRequest: string,
  _rowVariant?: string
  tooltiptext?: IObjectString2ObjectString2String
}

export interface ITableRow {
  rowSelected: boolean
  toggleDetails: Function,
  item: ITableRowItemProducts|{
    ident: string
    productId?: string
    depotId?: string
    clientId?: string
    _rowVariant?: string
    // depot_version_diff?: boolean
    // client_version_outdated?: boolean
    // depotVersions?: any //list?
    // selectedDepots?: any // list?
  };
}

export interface ITableData {
  pageNumber: number,
  perPage: number,
  sortBy: string,
  sortDesc: boolean,
  filterQuery: string,
  type?: string,
  selected?: string,
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
  stickyColumn?: boolean
  mergeOnMobile?: boolean
}
export interface ITableHeaders {
  [key: string]: ITableHeader
}

export interface ITableInfo {
  sortBy: string,
  sortDesc: boolean,
  filterQuery?: string,
  headerData: ITableHeaders
}

export interface IProperty {
  _showDetails?: boolean // from bootstrap-table
  productId?: string
  propertyId: string
  type: 'UnicodeProductProperty'|'BoolProductProperty'
  version?: string
  description: string
  multiValue: boolean|string
  editable: boolean|string
  default: Array<string|boolean> // combined: product-packageVersion
  allValues: Array<string|boolean> // (all possibleValues concatinated without duplicates)
  details: string

  versionDetails?: { [key:string]: string}
  descriptionDetails?: { [key:string]: string}
  defaultDetails?: { [key:string]: Array<boolean|string>}
  multiValueDetails?: { [key:string]: boolean}
  editableDetails?: { [key:string]: boolean}

  newValue?: string // empty string if editable==true
  newValues?: Array<string> // empty list if editable==true

  allClientValuesEqual?: boolean
  anyDepotDifferentFromDefault?: boolean
  anyClientDifferentFromDepot?: boolean

  depots:{ [key: string]: Array<string|boolean> }
  clients:{ [key: string]: Array<string|boolean> }
}

export interface ITableRowProperty {
  rowSelected: boolean
  toggleDetails: Function,
  item: IProperty
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

export interface IDepend {
  dependencies: Array<IProductDependency>
  productVersions: IObjectString2StringOrUndefined
  productDescription: string
  productDescriptionDetails: IObjectString2String
}

export interface IProp {
  properties: IProperties
  productVersions: IObjectString2StringOrUndefined
  productDescription: string
  productDescriptionDetails: IObjectString2String
}
