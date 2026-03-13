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
  ident?: string
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
  uefi_value?: boolean | null    // API returns snake_case
  // Statistics columns (snake_case to match API response)
  version_outdated?: number
  version_outdated_netboot?: number
  installationStatus_unknown?: number
  installationStatus_installed?: number
  actionResult_failed?: number
  actionResult_successful?: number
  selected?: boolean | number
  reachable?: boolean | null
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
