/**
This file is part of opsi-webgui application.
opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
Copyright (c) uib GmbH <info@uib.de> 2026
All rights reserved.
License: AGPL-3.0
*/

/** Client list item returned by /api/opsidata/clients */
export interface ClientListItem {
  clientId: string
  ident: string
  macAddress: string
  ipAddress: string
  description: string
  notes: string
  lastSeen: string
  depotId: string
  uefi: boolean
  reachable?: boolean
  selected?: boolean | number
  version_outdated?: number
  installationStatus_unknown?: number
  installationStatus_installed?: number
  actionResult_failed?: number
  actionResult_successful?: number
}

/** Full client details - used for /api/opsidata/clients response */
export interface Client {
  clientId: string
  ident?: string // Optional - not always returned by API
  description?: string
  notes?: string
  macAddress?: string
  hardwareAddress?: string
  ipAddress?: string
  inventoryNumber?: string
  systemUUID?: string
  lastSeen?: string
  depotId?: string
  uefi?: boolean
  uefiValue?: boolean
  // Statistics columns (snake_case to match API response)
  version_outdated?: number
  version_outdated_netboot?: number
  installationStatus_unknown?: number
  installationStatus_installed?: number
  actionResult_failed?: number
  actionResult_successful?: number
  // CamelCase aliases for backwards compatibility
  versionOutdated?: number
  versionOutdatedNetboot?: number
  installationStatusUnknown?: number
  installationStatusInstalled?: number
  actionResultFailed?: number
  actionResultSuccessful?: number
  selected?: boolean | number
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
