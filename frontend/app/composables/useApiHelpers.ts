/*
This file is part of opsi-webgui application.
opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
Copyright (c) uib GmbH <info@uib.de> 2025
All rights reserved.
License: AGPL-3.0
*/
export function useApiHelpers() {
  const { $customFetch } = useNuxtApp() as unknown as {
    $customFetch: (url: string, opts?: Record<string, unknown>) => Promise<unknown>
  }

  const getConfigServer = () => $customFetch('/user/opsiserver')
  const getDepotIds = () => $customFetch('/opsidata/depot_ids')
  const getClientIds = (depots: string[]) =>
    $customFetch(`/opsidata/depots/clients?selectedDepots=[${depots}]`)
  const getClientToDepot = (clients: string[]) =>
    $customFetch(`/opsidata/clientsdepots?selectedClients=[${clients}]`)
  const callLogout = () => $customFetch('/auth/logout', { method: 'POST' })
  const addClientToGroups = (client: string, groups: string[]) =>
    $customFetch(`/opsidata/clients/${client}/groups`, { method: 'POST', body: groups })
  const setUEFI = (clientId: string, uefi: string) =>
    $customFetch(`/api/opsidata/clients/${clientId}/uefi`, { method: 'POST', body: uefi })
  const saveParameters = (url: string, req: Record<string, unknown>) =>
    $customFetch(url, { method: 'POST', body: req })
  const saveProductAction = (change: object) =>
    $customFetch('/opsidata/clients/products', { method: 'POST', body: change })
  const saveProductProperties = (id: string, change: Record<string, unknown>) =>
    $customFetch(`/opsidata/products/${id}/properties`, { method: 'POST', body: change })

  return {
    getConfigServer,
    getDepotIds,
    getClientIds,
    getClientToDepot,
    callLogout,
    addClientToGroups,
    setUEFI,
    saveParameters,
    saveProductAction,
    saveProductProperties,
  }
}
