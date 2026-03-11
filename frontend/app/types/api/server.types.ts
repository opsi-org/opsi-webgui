/**
This file is part of opsi-webgui application.
opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
Copyright (c) uib GmbH <info@uib.de> 2026
All rights reserved.
License: AGPL-3.0
*/

export interface OpsiServer {
  result: string
}

/** Server/Depot returned by /api/opsidata/depots */
export interface Server {
  depotId: string
  ident?: string  // Optional - not always returned by API
  type?: string   // OpsiConfigserver | OpsiDepotserver
  ip?: string
  description?: string
  depotRemoteUrl?: string
  depotWebdavUrl?: string
  repositoryRemoteUrl?: string
  workbenchRemoteUrl?: string
  selected?: boolean | number
}

export type ServerList = Server[]

export type ServerIds = string[]

/** Full server attributes */
export interface ServerAttr {
  hostId: string
  type: 'OpsiConfigserver' | 'OpsiDepotserver'
  description: string
  notes: string
  hardwareAddress?: string
  ipAddress: string
  inventoryNumber?: string
  systemUUID?: string
  opsiHostKey?: string
  depotLocalUrl?: string
  depotRemoteUrl?: string
  depotWebdavUrl?: string
  repositoryLocalUrl?: string
  repositoryRemoteUrl?: string
  workbenchLocalUrl?: string
  workbenchRemoteUrl?: string
  networkAddress?: string
  maxBandwidth?: number
  isMasterDepot?: boolean
  masterDepotId?: string
}

/** Server configuration item */
export interface ServerConfig {
  configId: string
  type: 'BoolConfig' | 'UnicodeConfig' | 'Config'
  value: string | boolean | string[]
  description?: string
  possibleValues?: Array<string | boolean>
  multiValue?: boolean
  editable?: boolean
}

export type ServerConfigList = ServerConfig[]
