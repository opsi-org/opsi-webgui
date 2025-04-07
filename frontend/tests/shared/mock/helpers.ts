/**
This file is part of opsi-webgui application.
opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
Copyright (c) uib GmbH <info@uib.de> 2025
All rights reserved.
License: AGPL-3.0
*/

import type { Host, Depot, Client, Product } from './types'

export const getDepots = (hosts: Host[]): Depot[] => {
  return hosts
    .filter(
      (host) =>
        host.type === 'OpsiDepotserver' || host.type === 'OpsiConfigserver',
    )
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

export const getClientsList = (hosts: Host[]): string[] => {
  return hosts
    .filter((host) => host.type === 'OpsiClient')
    .map((client) => client.id)
}

export const getProducts = (products: any[]): Product[] => {
  return products.map((product) => ({
    productId: product.id,
    name: product.name,
    priority: product.priority || 0,
    description: product.description || '',
    advice: product.advice || '',
    selectedDepots: product.selectedDepots || [],
    selectedClients: product.selectedClients || null,
    installationStatusErrorLevel: product.installationStatusErrorLevel || 0,
    installationStatus: product.installationStatus || 'unknown',
    actionRequest: product.actionRequest || 'none',
    actionProgress: product.actionProgress || '',
    actionResultErrorLevel: product.actionResultErrorLevel || 0,
    actionResult: product.actionResult || 'none',
    modificationTime: product.modificationTime || null,
    clientVersions: product.clientVersions || null,
    client_version_outdated: product.client_version_outdated || false,
    actions: product.actions || [],
    depot_version_diff: product.depot_version_diff || false,
    not_on_all_depots: product.not_on_all_depots || false,
    numDepots: product.numDepots || 0,
    depotVersions: product.depotVersions || [],
    productType: product.type || 'unknown',
    selected: product.selected || 0,
  }))
}

export const getHostGroups = (groups: any[]): any => {
  const groupMap: Record<string, any> = {}
  groups.forEach((group) => {
    groupMap[group.id] = {
      id: `${group.id};${group.parentGroupId || 'groups'}`,
      type: 'HostGroup',
      text: group.id,
      parent: group.parentGroupId || 'groups',
      children: {},
    }
  })
  groups.forEach((group) => {
    if (group.parentGroupId) {
      if (!groupMap[group.parentGroupId].children) {
        groupMap[group.parentGroupId].children = {}
      }
      groupMap[group.parentGroupId].children[group.id] = groupMap[group.id]
    }
  })
  const rootGroups = Object.values(groupMap).filter(
    (group) => group.parent === 'groups',
  )
  return rootGroups
}
