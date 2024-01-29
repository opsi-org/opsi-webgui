

/** Types which cam efrom backend and some additionally according to them */


export interface T_configuration {
  user: string,
  configuration: {
    read_only: boolean,
    depot_access: boolean,
    host_group_access: boolean,
    product_group_access: boolean,
    client_creation: boolean
  }
}


export interface T_Opsiserver {
  result: string
}
export interface T_ClientLog {
  result: Array<string>
}
export type T_DisaledFeatures = Array<string>
export type T_DepotIds = Array<string>
export type T_ClientIds = Array<string>
export type T_ProductIds = Array<string>
export interface T_Client2Depot {
  [key: string]: string
}

export interface T_ClientAttr {
  // {"hostId":"nb-00013.acme.corp","type":"OpsiClient","description":"Snow White","notes":"","hardwareAddress":"5f:67:b9:28:8a:f6","ipAddress":"10.1.3.116","inventoryNumber":"0115nb00012","systemUUID":null,"created":"2023-11-24T11:27:16","lastSeen":"2023-11-24T11:27:16","opsiHostKey":"b9b520f0992b6b8d0819caf69393d116","oneTimePassword":null,"uefi":false}
  hostId: string
  type: string
  description: string
  notes: string
  hardwareAddress: string | null
  ipAddress: string | null
  inventoryNumber: string
  systemUUID: string | null
  created: string
  lastSeen: string
  opsiHostKey: string
  oneTimePassword: string | null
  uefi: boolean
}
export interface T_ServerAttr {
  hostId: string
  type: string
  description: string
  notes: string
  hardwareAddress: string | null
  ipAddress: string
  inventoryNumber: string
  systemUUID: string
  opsiHostKey: string
  depotLocalUrl: string
  depotRemoteUrl: string
  depotWebdavUrl: string
  repositoryLocalUrl: string
  repositoryRemoteUrl: string
  workbenchLocalUrl: string
  workbenchRemoteUrl: string
  networkAddress: string
  maxBandwidth: number
  isMasterDepot: boolean
  masterDepotId: string | null
}

export interface T_HostParameter {
  [key: string]: Array<T_HostParameterEntry>
  // general: Array<T_HostParameterEntry>
  // clientconfig: Array<T_HostParameterEntry>
  // opsiclientd: Array<T_HostParameterEntry>
  // softwareondemand: Array<T_HostParameterEntry>
  // licensing: Array<T_HostParameterEntry>
  // opsi_script: Array<T_HostParameterEntry>
}
export type tconfigtypes = 'BoolConfig' | 'UnicodeConfig' | 'Config'
export interface T_HostParameterEntry {
  configId: string
  description: string
  type:  tconfigtypes
  value: string | boolean | Array<string>
  possibleValues: Array<string | boolean | never>
  multiValue: boolean
  editable: boolean
  newValue?: string
  newValues?: Array<string|never>
}
export interface T_Logout {
  result: string
}

export interface T_PGroups {
  groups: T_Groups
}
export interface T_Groups {
  [key: string]: T_Group
}
export interface T_Group {
  id: string
  text: string
  type?: string
  parent: string
  children: null | T_Groups
}


export type T_ServerList = Array<T_Server>
export interface T_Server {
  depotId: string
  ident: string
  type: string
  ip: string
  description: string
  selected: boolean | number
}

export type T_ClientsList = Array<T_Client>
export interface T_Client {
  clientId: string
  ident: string
  description: string
  notes: string
  hardwareAddress: string
  ipAddress: string
  inventoryNumber: string
  systemUUID: string
  // created: string
  lastSeen: string
  uefi: boolean
  uefi_value: boolean | undefined
  version_outdated: number
  version_outdated_netboot: number
  installationStatus_unknown: number
  installationStatus_installed: number
  actionResult_failed: number
  actionResult_successful: number
  selected: boolean | number
  reachable: boolean | undefined

}



// export interface T_Products {
//   [key: string]: T_Product
// }
export type tproducttypes = 'LocalbootProduct' | 'NetbootProduct'
export interface T_Product {
  locked: boolean
  productId: string
  productVersion: string
  packageVersion: string
  productType: tproducttypes
  depotId: string
  type: 'ProductOnDepot'
  ident: string
}

interface propdepres {
  productVersions: {[key: string]: string|undefined}
  productDescription: string
  productDescriptionDetails: { [key: string]: string }
  productAdvice: string
  productAdviceDetails: { [key: string]: string }
}

export interface T_ProductPropertiesDependenciesResult {
  dependencies: T_ProductDependenciesResult
  properties: T_ProductPropertiesResult
}

export interface T_ProductPropertiesResult extends propdepres {
  properties: T_ProductProperties
}
export interface T_ProductProperties {
  [key: string]: T_ProductProperty
}
export type tproductpropertytypes = 'UnicodeProductProperty' | 'BoolProductProperty'
type propvalue = string | boolean
export interface T_ProductProperty {
  productId: string
  propertyId: string
  type: tproductpropertytypes
  version: string
  description: string
  multiValue: boolean
  editable: boolean
  default: Array<propvalue>
  possibleValues: { [key: string]: Array<propvalue> }
  allValues: Array<propvalue>

  depots: { [key: string]: Array<propvalue> }
  clients: { [key: string]: Array<propvalue> }

  defaultDetails?: { [key: string]: Array<propvalue> }
  versionDetails?: { [key: string]: string }
  descriptionDetails?: { [key: string]: string }
  multiValueDetails?: { [key: string]: boolean }
  editableDetails?: { [key: string]: boolean }

  allClientValuesEqual: boolean
  anyDepotDifferentFromDefault: boolean
  anyClientDifferentFromDepot: boolean

  _showDetails?: boolean
  newValue?: string // empty string if editable==true
  newValues?: Array<string> // empty list if editable==true

}


export interface T_ProductDependenciesResult extends propdepres {
  dependencies: Array<T_ProductDependencies>
}
export interface T_ProductDependencies {
//   productId	"l-desktop"
// productAction	"setup"
// version	"4.2.0.4-1"
// requiredProductId	"l-system-update"
// requiredVersion	null
// requiredAction	"setup"
// requiredInstallationStatus	null
// requirementType	"before"
  productId: string
  productAction: string|null
  version: string
  requiredProductId: string
  requiredVersion: string | null
  requiredAction: string | null
  requiredInstallationStatus: string | null
  requirementType: string|null

}