import { Component, namespace, Vue } from 'nuxt-property-decorator'

const changes = namespace('changes')
@Component export class SetUEFI extends Vue {
  async setUEFI (clientId: string) {
    await this.$axios.$post(`api/opsidata/clients/${clientId}/uefi`)
      .catch((error) => {
        const detailedError = ((error?.response?.data?.message) ? error.response.data.message : '') + ' ' + ((error?.response?.data?.details) ? error.response.data.details : '')
        const ref = (this.$refs.uefiAlert as any)
        ref.alert(this.$t('message.error.uefi') as string, 'danger', detailedError)
      })
  }
}
@Component export class SaveHostParameters extends Vue {
  @changes.Mutation public delFromChangesHostParam!: (s: object) => void
  async saveParameters (url: string, request: any, item:any, tracking:boolean) {
    const ref = (this.$refs.configViewAlert as any)
    await this.$axios.$post(url, request)
      .then(() => {
        if (tracking) {
          this.delFromChangesHostParam(item)
        }
      }).catch((error) => {
        const detailedError = ((error?.response?.data?.message) ? error.response.data.message : '') + ' ' + ((error?.response?.data?.details) ? error.response.data.details : '')
        ref.alert(this.$t('message.error.fetch') as string + ' Config', 'danger', detailedError)
      })
  }
}
