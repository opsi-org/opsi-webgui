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
    .filter((host) => host.type === 'OpsiDepotserver' || host.type === 'OpsiConfigserver')
    .map((depot) => ({
      depotId: depot.id,
      type: depot.type,
      ip: depot.ipAddress || null,
      description: depot.description || '',
      selected: false,
    }))
}

export const getDepotList = (hosts: Host[]): string[] => {
  return hosts
    .filter((host) => host.type === 'OpsiDepotserver' || host.type === 'OpsiConfigserver')
    .map((depot) => depot.id)
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
  return hosts.filter((host) => host.type === 'OpsiClient').map((client) => client.id)
}

export const getHostParam = (
  configs: Array<{ [key: string]: unknown }>
): { general: Array<{ [key: string]: unknown }> } => {
  return {
    general: configs.map((config) => ({
      description: config.description || '',
      possibleValues: config.possibleValues || [],
      defaultValues: config.defaultValues || [],
      editable: config.editable || false,
      multiValue: config.multiValue || false,
      id: config.id || '',
      type: config.type || '',
      objects: config.objects || {},
      configId: config.id || '',
      newValue: '',
      newValues: [],
    })),
  }
}

export const getProducts = (products: Array<{ [key: string]: unknown }>): Product[] => {
  return products.map((product) => ({
    productId: product.id as string,
    name: product.name as string,
    priority: (product.priority as number) || 0,
    description: (product.description as string) || '',
    advice: (product.advice as string) || '',
    selectedDepots: (product.selectedDepots as string[]) || [],
    selectedClients: (product.selectedClients as string[]) || null,
    installationStatusErrorLevel: (product.installationStatusErrorLevel as number) || 0,
    installationStatus: (product.installationStatus as string) || 'unknown',
    actionRequest: (product.actionRequest as string) || 'none',
    actionProgress: (product.actionProgress as string) || '',
    actionResultErrorLevel: (product.actionResultErrorLevel as number) || 0,
    actionResult: (product.actionResult as string) || 'none',
    modificationTime: (product.modificationTime as string) || null,
    clientVersions: (product.clientVersions as string) || null,
    client_version_outdated: (product.client_version_outdated as boolean) || false,
    actions: (product.actions as string[]) || [],
    depot_version_diff: (product.depot_version_diff as boolean) || false,
    not_on_all_depots: (product.not_on_all_depots as boolean) || false,
    numDepots: (product.numDepots as number) || 0,
    depotVersions: (product.depotVersions as string[]) || [],
    productType: (product.type as string) || 'unknown',
    selected: (product.selected as number) || 0,
  }))
}

export const getHostGroups = (
  groups: Array<{ [key: string]: unknown }>
): Array<{ [key: string]: unknown }> => {
  const groupMap: Record<string, { [key: string]: unknown }> = {}
  groups.forEach((group) => {
    groupMap[group.id as string] = {
      id: `${group.id};${group.parentGroupId || 'groups'}`,
      type: 'HostGroup',
      text: group.id,
      parent: group.parentGroupId || 'groups',
      children: {},
    }
  })
  groups.forEach((group) => {
    if (group.parentGroupId) {
      if (!groupMap[group.parentGroupId as string].children) {
        groupMap[group.parentGroupId as string].children = {}
      }
      groupMap[group.parentGroupId as string].children[group.id as string] =
        groupMap[group.id as string]
    }
  })
  const rootGroups = Object.values(groupMap).filter((group) => group.parent === 'groups')
  return rootGroups
}
