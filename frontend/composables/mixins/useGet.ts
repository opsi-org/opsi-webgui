// import { Component, namespace, Vue } from 'nuxt-property-decorator'
// import { AlertToast } from './component'
import type { IObjectString2String } from '@/types/tgeneral'
import { useNotification } from './useComponent'
import { storeCache } from '@/store/datacacheStore'

export const useConfigserver = () => {
  const { t } = useI18n()

  async function getOpsiConfigServer (alertRef: any) {
    const { data, error } = await useApiGET('/user/opsiserver')
    if (error) {
      const errordata = { response: { data: {class: '', details: '', message: t('message.error.opsiconfd')}} }
      useNotification().error(errordata, t('message.error.login'))
      return
    }
    storeCache().setOpsiconfigserver(data.value.result)
    return storeCache().opsiconfigserver
  }

  return { getOpsiConfigServer }
}

export const useDepot = () => {
//   showToastError: any // from mixin AlertToast
//   async getDepotIdList () {
//     return await this.$axios.$get('/api/opsidata/depot_ids')
//   }
  async function getDepotIdList () {
    return await useApiGET('/opsidata/depot_ids')
    // const { data, error } = await useApiGET('/opsidata/depot_ids')
    // if (error) {
    //   useNotification().error(error)
    //   return
    // }
    // return data.value
  }

  return { getDepotIdList }
}
export const useClient = () => {
  let fetchedDataClients2Depots: IObjectString2String = {}

  async function getClientIdList (selectedDepots: Array<string>) {
    const { data, error } = await useApiGET(`/opsidata/depots/clients?selectedDepots=[${selectedDepots}]`)
    if (error) {
      useNotification().error(error)
      return
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

    const { data, error } = await useApiGET(`/api/opsidata/clientsdepots?selectedClients=[${selectedClients}]`)
    if (error) {
      useNotification().error(error)
      throw new Error(error)
      return
    }
    fetchedDataClients2Depots = data.value
    // return data.value.sort()
  }
}
