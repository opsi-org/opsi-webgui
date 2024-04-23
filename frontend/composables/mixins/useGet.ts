// import { Component, namespace, Vue } from 'nuxt-property-decorator'
// import { AlertToast } from './component'
import type { IObjectString2String } from '@/types/tgeneral'
import { useNotification } from './useComponent'
import { storeCache } from '@/store/datacacheStore'
import { _getI18nInComposable } from './helper-i18n'
import type { T_Client2Depot, T_ClientIds, T_DepotIds, T_Opsiserver } from '~/types/APItypes'

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
        useNotification($t).error('no server selected') // TODO: i18n
      }
    }
  }

  async function getOpsiConfigServer (alertRef: any = undefined) {
    const { data, error } = await useApiGET<T_Opsiserver>('/user/opsiserver')
    console.log('getOpsiConfigServer', data, error)
    if (error || !data?.value) {
      const errordata = { response: { data: {class: '', details: '', message: $t('message.error.opsiconfd')}} }
      useNotification($t).error(errordata, $t('message.error.login'))
      // useNotification(t).error(error)
      return
    }
    storeCache().setOpsiconfigserver(data.value.result)
    return storeCache().opsiconfigserver
  }

  return { getOpsiConfigServer }
}

export const useDepot = (t:any = undefined) => {
//   showToastError: any // from mixin AlertToast
//   async getDepotIdList () {
//     return await this.$axios.$get('/api/opsidata/depot_ids')
//   }
  async function getDepotIdList () {
    const {data, error} = await useApiGET<T_DepotIds>('/opsidata/depot_ids')
    if (error || !data?.value) {
      useNotification(t).error(error, 'Error fetching server ids') // TODO: i18n
      return []
    }
    return data.value.sort()
    // const { data, error } = await useApiGET('/opsidata/depot_ids')
    // if (error) {
    //   useNotification(t).error(error)
    //   return
    // }
    // return data.value
  }

  return { getDepotIdList }
}
export const useClient = (t:any = undefined) => {
  let fetchedDataClients2Depots: IObjectString2String = {}

  async function getClientIdList (selectedDepots: Array<string>): Promise<T_ClientIds> {
    const { data, error } = await useApiGET<T_ClientIds>(`/opsidata/depots/clients?selectedDepots=[${selectedDepots}]`)
    if (error || !data?.value) {
      useNotification(t).error(error)
      return []
    }
    return data.value.sort()
//   async getClientIdList (selectedDepots: Array<string>) {
//     const result = (await this.$axios.$get(`/api/opsidata/depots/clients?selectedDepots=[${selectedDepots}]`)).sort()
//     return result
  }

  async function getClientToDepot (selectedClients: Array<string>) {
//   async getClientToDepot (selectedClients: Array<string>) {
//     await this.$axios.$get(`/api/opsidata/clientsdepots?selectedClients=[${selectedClients}]`)
//       .then((response) => {
//         this.fetchedDataClients2Depots = response
//       }).catch((error) => {
//         this.fetchedDataClients2Depots = {}
//         throw new Error(error)
//         // this.showToastError(error)
//       })

    const { data, error } = await useApiGET<T_Client2Depot>(`/opsidata/clientsdepots?selectedClients=[${selectedClients}]`)
    if (error || !data?.value) {
      useNotification(t).error(error)
      throw new Error(JSON.stringify(error))
      return {}
    }
    fetchedDataClients2Depots = data.value
    return data.value
    // return data.value.sort()
  }
  return { getClientIdList, getClientToDepot, fetchedDataClients2Depots }
}
