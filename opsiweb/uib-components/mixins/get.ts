import { Component, namespace, Vue } from 'nuxt-property-decorator'
import { IObjectString2String } from '~/.utils/types/tgeneral'

const cache = namespace('data-cache')

@Component export class Configserver extends Vue {
  @cache.Mutation public setOpsiconfigserver!: (s: string) => void

  async getOpsiConfigServer (alertRef: any) {
    await this.$axios.$get('/api/user/opsiserver')
      .then((response) => {
        this.setOpsiconfigserver(response.result)
      }).catch((error) => {
        const errorMsg = this.$t('message.error.opsiconfd') as string
        const detailedError = ((error?.response?.data?.message) ? error.response.data.message : '') + ' ' + ((error?.response?.data?.detail) ? error.response.data.detail : '')
        alertRef.alert(errorMsg, 'danger', detailedError)
      })
  }
}

@Component export class Depot extends Vue {
  async getDepotIdList () {
    return await this.$axios.$get('/api/opsidata/depot_ids')
  }
}
@Component export class Client extends Vue {
  fetchedDataClients2Depots: IObjectString2String = {}

  async getClientIdList (selectedDepots: Array<string>) {
    const result = (await this.$axios.$get(`/api/opsidata/depots/clients?selectedDepots=[${selectedDepots}]`)).sort()
    return result
  }

  async getClientToDepot (selectedClients: Array<string>) {
    await this.$axios.$get(`/api/opsidata/clientsdepots?selectedClients=[${selectedClients}]`)
      .then((response) => {
        this.fetchedDataClients2Depots = response
      }).catch((error) => {
        this.fetchedDataClients2Depots = {}
        throw new Error(error)
      })
  }
}
