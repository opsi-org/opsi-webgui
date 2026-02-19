/**
This file is part of opsi-webgui application.
opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
Copyright (c) uib GmbH <info@uib.de> 2025
All rights reserved.
License: AGPL-3.0
*/

export interface OpsiServer {
  result: string
}

export interface Server {
  depotId: string
  ident: string
  type: string
  ip: string
  description: string
  selected: boolean | number
}

export type ServerList = Server[]

export type ServerIds = string[]

export interface ServerAttr {
  hostId: string
  type: string
  description: string
  notes: string
  hardwareAddress?: string
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
  masterDepotId?: string
}
