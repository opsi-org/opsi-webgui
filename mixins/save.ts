import { Component, namespace, Vue } from 'nuxt-property-decorator'
import { makeToast } from '../.utils/utils/scomponents'

const changes = namespace('changes')
@Component export class setUEFI extends Vue {
  async setUEFI (clientId: string) {
    await this.$axios.$post(`api/opsidata/clients/${clientId}/uefi`)
      .catch((error) => {
        const detailedError = ((error?.response?.data?.message) ? error.response.data.message : '') + ' ' + ((error?.response?.data?.details) ? error.response.data.details : '')
        // const ref = (this.$refs.hostAttrUpdateAlert as any)
        // ref.alert(this.$t('message.error.uefi') as string, 'danger', detailedError)
        makeToast(this, detailedError, this.$t('message.error.title') as string, 'danger', 8000)
      })
  }
}
@Component export class saveHostParameters extends Vue {
  @changes.Mutation public delFromChangesHostParam!: (s: object) => void
  async saveParameters (url: string, request: any, item:any, tracking:boolean) {
    // const ref = (this.$refs.configViewAlert as any)
    await this.$axios.$post(url, request)
      .then(() => {
        if (tracking) {
          this.delFromChangesHostParam(item)
        }
      }).catch((error) => {
        const detailedError = ((error?.response?.data?.message) ? error.response.data.message : '') + ' ' + ((error?.response?.data?.details) ? error.response.data.details : '')
        // ref.alert(this.$t('message.error.fetch') as string + ' Config', 'danger', detailedError)
        makeToast(this, detailedError, this.$t('message.error.title') as string, 'danger', 8000)
      })
  }
}
