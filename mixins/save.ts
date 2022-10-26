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
@Component export class SaveParameters extends Vue {
  @changes.Mutation public delFromChangesHostParam!: (s: object) => void
  async saveParameters (url: string, request: any, deleteitem:any) {
    const ref = (this.$refs.saveParam as any)
    await this.$axios.$post(url, request)
      .then(() => {
        if (deleteitem) {
          this.delFromChangesHostParam(deleteitem)
        } else {
          ref.alert(this.$t('message.success.trackChanges.save'), 'success')
        }
      }).catch((error) => {
        const detailedError = ((error?.response?.data?.message) ? error.response.data.message : '') + ' ' + ((error?.response?.data?.details) ? error.response.data.details : '')
        ref.alert(this.$t('message.error.fetch') as string + ' Config', 'danger', detailedError)
      })
  }
}
