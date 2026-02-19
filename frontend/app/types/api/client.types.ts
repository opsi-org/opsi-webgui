/**
This file is part of opsi-webgui application.
opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
Copyright (c) uib GmbH <info@uib.de> 2025
All rights reserved.
License: AGPL-3.0
*/

export interface Client {
  clientId: string
  ident: string
  description: string
  notes: string
  hardwareAddress: string
  ipAddress: string
  inventoryNumber: string
  systemUUID: string
  lastSeen: string
  uefi: boolean
  uefiValue?: boolean
  versionOutdated: number
  versionOutdatedNetboot: number
  installationStatusUnknown: number
  installationStatusInstalled: number
  actionResultFailed: number
  actionResultSuccessful: number
  selected: boolean | number
  reachable?: boolean
}

export type ClientList = Client[]

export type ClientIds = string[]

export interface Client2DepotMap {
  [key: string]: string
}

export interface ClientLog {
  result: Array<string>
}

export interface ClientAttr {
  hostId: string
  type: string
  description: string
  notes: string
  hardwareAddress?: string
  ipAddress?: string
  inventoryNumber: string
  systemUUID?: string
  created: string
  lastSeen: string
  opsiHostKey: string
  oneTimePassword?: string
  uefi: boolean
}
