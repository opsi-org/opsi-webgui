import { Component, namespace, Vue } from 'nuxt-property-decorator'
import { AlertToast } from './component'
import { IObjectString2String } from '~/.utils/types/tgeneral'

const cache = namespace('data-cache')

@Component({ mixins: [AlertToast] }) export class Configserver extends Vue {
  showToastError: any // from mixin AlertToast
  @cache.Mutation public setOpsiconfigserver!: (s: string) => void

  async getOpsiConfigServer (alertRef: any) {
    await this.$axios.$get('/api/user/opsiserver')
      .then((response) => {
        this.setOpsiconfigserver(response.result)
      }).catch((error) => {
        this.showToastError(error)
      })
  }
}

@Component({ mixins: [AlertToast] }) export class Depot extends Vue {
  showToastError: any // from mixin AlertToast
  async getDepotIdList () {
    return await this.$axios.$get('/api/opsidata/depot_ids')
  }
}
@Component({ mixins: [AlertToast] }) export class Client extends Vue {
  showToastError: any // from mixin AlertToast
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
        // this.showToastError(error)
      })
  }
}
