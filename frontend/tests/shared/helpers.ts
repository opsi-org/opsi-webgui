/**
This file is part of opsi-webgui application.
opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
Copyright (c) uib GmbH <info@uib.de> 2025
All rights reserved.
License: AGPL-3.0
*/

import type { Host, Depot, Client } from './types'

export const getDepots = (hosts: Host[]): Depot[] => {
  return hosts
    .filter((host) => host.type === 'OpsiDepotserver' || host.type === 'OpsiConfigserver')
    .map((depot) => ({
      depotId: depot.id,
      type: depot.type,
      ip: depot.ipAddress || null,
      description: depot.description || '',
      selected: false,
    }))
}

export const getClients = (hosts: Host[]): Client[] => {
  return hosts
    .filter((host) => host.type === 'OpsiClient')
    .map((client) => ({
      clientId: client.id,
      ident: client.id,
      macAddress: client.hardwareAddress || '',
      ipAddress: client.ipAddress || '',
      description: client.description || '',
      notes: client.notes || '',
      lastSeen: client.lastSeen || null,
      installationStatus_installed: 0,
      installationStatus_unknown: 1,
      actionResult_failed: 0,
      actionResult_successful: 0,
      reachable: null,
      selected: false,
      uefi: false,
      uefi_value: null,
      version_outdated: 0,
      version_outdated_netboot: 1,
    }))
}
