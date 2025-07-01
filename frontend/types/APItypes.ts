/**
This file is part of opsi-webgui application.
opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
Copyright (c) uib GmbH <info@uib.de> 2025
All rights reserved.
License: AGPL-3.0
*/
/** Types which came from backend and some additionally according to them */

/** Type for Response of '/api/user/configuration'
 * @ see {@link https://localhost:4447/docs#/default/user_configuration_addons_webgui_api_user_configuration_get | API documentation}
 */
export interface T_configuration {
  user: string
  configuration: T_configurationResult
}
export interface T_configurationResult {
  read_only: boolean
  depot_access: boolean
  host_group_access: boolean
  product_group_access: boolean
  client_creation: boolean
  server_write_access: boolean
  health: {
    worst_case: 'ok' | 'warning' | 'error'
    counts: { ok: number; warning: number; error: number }
  }
  [key: string]: any // disabled features
}

export type IProductTypes = 'LocalbootProduct' | 'NetbootProduct' | 'Product'

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
  hostId: string
  type: string
  description: string
  notes: string
  hardwareAddress: string | undefined
  ipAddress: string | undefined
  inventoryNumber: string
  systemUUID: string | undefined
  created: string
  lastSeen: string
  opsiHostKey: string
  oneTimePassword: string | undefined
  uefi: boolean
}
export interface T_ServerAttr {
  hostId: string
  type: string
  description: string
  notes: string
  hardwareAddress: string | undefined
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
  masterDepotId: string | undefined
}

export interface T_HostParameter {
  [key: string]: Array<T_HostParameterEntry>
}
export type tconfigtypes = 'BoolConfig' | 'UnicodeConfig' | 'Config'
export interface T_HostParameterEntry {
  configId: string
  description: string
  type: tconfigtypes
  value: string | boolean | Array<string>
  possibleValues: Array<string | boolean | never>
  multiValue: boolean
  editable: boolean
  newValue?: string
  newValues?: Array<string | never>
  [key: string]:
    | string
    | boolean
    | Array<string>
    | Array<string | boolean | never>
    | boolean
    | undefined
}
export interface T_Logout {
  result: string
}

export interface T_Groups {
  id: string
  type: string
  text: string
  parent: string | null
  children: { [key: string]: T_Groups } | null
}

export interface T_GroupsTransformed {
  id: string
  type: string
  text: string
  parent: string | null
  disabled?: boolean
  children?: T_GroupsTransformed[] | null
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

export interface T_ProductRow {
  productId: string
  productType: tproducttypes
  depotId: string
  ident: string
  selected: boolean
  name: string
  description: string
  advice: string
  modificationTime: string
  installationStatusErrorLevel: number
  installationStatus: string
  actionRequest: string
  actionProgress: string
  actionResultErrorLevel: number
  actionResult: string
  client_version_outdated: boolean
  depot_version_diff: boolean
  not_on_all_depots: boolean
  numDepots: number
  actions: Array<string>
  selectedDepots: Array<string>
  selectedClients: Array<string>
  clientVersions: Array<string> | undefined
  depotVersions: Array<string> | undefined
}

interface propdepres {
  productVersions: { [key: string]: string | undefined }
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
  productId: string
  productAction: string | null
  version: string
  requiredProductId: string
  requiredVersion: string | null
  requiredAction: string | null
  requiredInstallationStatus: string | null
  requirementType: string | null
}
