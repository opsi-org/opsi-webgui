/**
This file is part of opsi-webgui application.
opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
Copyright (c) uib GmbH <info@uib.de> 2025
All rights reserved.
License: AGPL-3.0
*/
import type { IObjectString2Any, IObjectString2String } from '@/types/tgeneral'
import { useNotification } from './useComponent'
import { storeCache } from '@/store/datacacheStore'
import { _getI18nInComposable } from './helper-i18n'
import type { T_Client2Depot, T_ClientIds, T_DepotIds, T_Opsiserver } from '~/types/APItypes'
import { $t } from '@primevue/themes'

const { notifyError } = useNotification()

export const useConfigserver = async (
  init: boolean = false,
  _store: any = undefined,
  _t: any = undefined
) => {
  let $t = _t
  if (!$t) {
    $t = _getI18nInComposable()
  }
  const storeSelection = storeSelections()

  if (init) await initServer()

  async function initServer() {
    if (storeSelection.selectionDepots.length === 0) {
      const server = (await getOpsiConfigServerWithHeaders()).data
      if (server) {
        if (_store) _store.selectedDepots = [server]
        else storeSelection.setSelectionDepots([server])
      } else {
        console.error('no server selected')
        notifyError({ message: $t('message.noServerSelected') })
      }
    }
  }

  async function getOpsiConfigServerWithHeaders(setServer: boolean = true) {
    const { data, headers, error } = await useApiGET<T_Opsiserver>('/user/opsiserver')
    if (error) return { data: '', headers: {} as IObjectString2Any, error }
    if (!data?.value) {
      const errordata = {
        response: {
          data: {
            class: '',
            details: '',
            message: $t('message.opsiconfdNotAvailable'),
          },
        },
      }
      notifyError({
        title: $t('error'),
        message: notifyError({ message: errordata?.response?.data?.message }),
      })
      return { data: '', headers: {} as IObjectString2Any, error: errordata }
    }
    if (setServer) {
      storeCache().setOpsiconfigserver(data.value.result)
    }
    return { data: data.value.result, headers }
  }
  return { getOpsiConfigServerWithHeaders }
}

export const useDepot = (_t: any = undefined) => {
  let $t = _t
  if (!$t) {
    $t = _getI18nInComposable()
  }
  async function getDepotIdList() {
    const { data, error } = await useApiGET<T_DepotIds>('/opsidata/depot_ids')
    if (error) return []
    if (!data?.value) {
      notifyError({
        title: $t('message.noResponse') + 'Server List',
      })
      return []
    }
    return data.value.sort()
  }

  return { getDepotIdList }
}
export const useClient = () => {
  let fetchedDataClients2Depots: IObjectString2String = {}

  async function getClientIdList(selectedDepots: Array<string>): Promise<T_ClientIds> {
    const { data, error } = await useApiGET<T_ClientIds>(
      `/opsidata/depots/clients?selectedDepots=[${selectedDepots}]`
    )
    if (error) return []
    if (!data?.value) {
      notifyError({
        message: $t('message.noResponse') + 'Client List',
      })
      return []
    }
    return data.value.sort()
  }

  async function getClientToDepot(selectedClients: Array<string>) {
    const { data, error } = await useApiGET<T_Client2Depot>(
      `/opsidata/clientsdepots?selectedClients=[${selectedClients}]`
    )
    if (error || !data?.value) {
      if (error == undefined) {
        notifyError({
          title: $t('message.noResponse') + 'Client to Depot List',
        })
      }
      throw new Error(JSON.stringify(error))
    }
    fetchedDataClients2Depots = data.value
    return data.value
  }
  return { getClientIdList, getClientToDepot, fetchedDataClients2Depots }
}
