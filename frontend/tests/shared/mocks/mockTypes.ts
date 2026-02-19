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

export interface Product {
  productId: string
  name: string
  priority: number
  description: string
  advice: string
  selectedDepots: string[]
  selectedClients: string[] | null
  installationStatusErrorLevel: number
  installationStatus: string
  actionRequest: string
  actionProgress: string
  actionResultErrorLevel: number
  actionResult: string
  modificationTime: string | null
  clientVersions: string | null
  client_version_outdated: boolean
  actions: string[]
  depot_version_diff: boolean
  not_on_all_depots: boolean
  numDepots: number
  depotVersions: string[]
  productType: string
  selected: number
}
