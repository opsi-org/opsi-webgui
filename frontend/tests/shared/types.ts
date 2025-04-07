/**
This file is part of opsi-webgui application.
opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
Copyright (c) uib GmbH <info@uib.de> 2025
All rights reserved.
License: AGPL-3.0
*/

export interface Host {
  id: string
  type: string
  ipAddress?: string
  hardwareAddress?: string
  description?: string
  notes?: string
  lastSeen?: string
}

export interface Depot {
  depotId: string
  type: string
  ip: string | null
  description: string
  selected: boolean
}

export interface Client {
  clientId: string
  ident: string
  macAddress: string
  ipAddress: string
  description: string
  notes: string
  lastSeen: string | null
  installationStatus_installed: number
  installationStatus_unknown: number
  actionResult_failed: number
  actionResult_successful: number
  reachable: null
  selected: boolean
  uefi: boolean
  uefi_value: null
  version_outdated: number
  version_outdated_netboot: number
}
