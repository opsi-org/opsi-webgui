import type { IObjectString2String } from '@/types/tgeneral'
import { useNotification } from './useComponent'
import { storeCache } from '@/store/datacacheStore'
import { _getI18nInComposable } from './helper-i18n'
import type { T_Client2Depot, T_ClientIds, T_DepotIds, T_Opsiserver } from '~/types/APItypes'

const { notifyError } = useNotification()

export const useConfigserver = async (init: boolean = false, _store:any=undefined, _t:any=undefined) => {
  let $t = _t
  if (!$t){
    $t = _getI18nInComposable()

  }
  const storeSelection = storeSelections()

  if (init) await initServer()

  async function initServer() {
    if (storeSelection.selectionDepots.length === 0) {
      const server = await getOpsiConfigServer()
      if (server){
        if (_store) _store.selectedDepots = [server]
        else storeSelection.setSelectionDepots([server])
      } else {
        console.error('no server selected')
        notifyError({ message: 'No server selected' }) // TODO: i18n
      }
    }
  }

  async function getOpsiConfigServer (alertRef: any = undefined) {
    const { data, error } = await useApiGET<T_Opsiserver>('/user/opsiserver')
    console.log('getOpsiConfigServer', data, error)
    if (error || !data?.value) {
      const errordata = { response: { data: {class: '', details: '', message: $t('message.error.opsiconfd')}} }
      notifyError({ title:$t('message.error.login'), message: notifyError({ message: error?.response?.data?.message }) })
      return
    }
    storeCache().setOpsiconfigserver(data.value.result)
    return storeCache().opsiconfigserver
  }

  return { getOpsiConfigServer }
}

export const useDepot = (_t:any=undefined) => {
  let $t = _t
  if (!$t){
    $t = _getI18nInComposable()

  }
  async function getDepotIdList () {
    const {data, error} = await useApiGET<T_DepotIds>('/opsidata/depot_ids')
    if (error || !data?.value) {
      notifyError({ title: $t('message.error.fetch')+'Server List', message: error?.response?.data?.message })
      return []
    }
    return data.value.sort()
  }

  return { getDepotIdList }
}
export const useClient = (t:any = undefined) => {
  let fetchedDataClients2Depots: IObjectString2String = {}

  async function getClientIdList (selectedDepots: Array<string>): Promise<T_ClientIds> {
    const { data, error } = await useApiGET<T_ClientIds>(`/opsidata/depots/clients?selectedDepots=[${selectedDepots}]`)
    if (error || !data?.value) {
      notifyError({ message: error?.response?.data?.message })
      return []
    }
    return data.value.sort()
  }

  async function getClientToDepot (selectedClients: Array<string>) {
    const { data, error } = await useApiGET<T_Client2Depot>(`/opsidata/clientsdepots?selectedClients=[${selectedClients}]`)
    if (error || !data?.value) {
      notifyError({ message: error?.response?.data?.message })
      throw new Error(JSON.stringify(error))
      return {}
    }
    fetchedDataClients2Depots = data.value
    return data.value
  }
  return { getClientIdList, getClientToDepot, fetchedDataClients2Depots }
}
