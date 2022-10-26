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
        ref.alert(this.$t('message.error.title'), 'danger', detailedError)
      })
  }
}

@Component export class SaveProductActionRequest extends Vue {
  async saveProdActionRequest (change : object) {
    await this.$axios.$post('/api/opsidata/clients/products', change)
      .then(() => {
        const ref = (this.$refs.productsAlert as any)
        ref.alert(this.$t('message.success.trackChanges.save'), 'success')
      }).catch((error) => {
        const ref = (this.$refs.productsAlert as any)
        const detailedError = ((error?.response?.data?.message) ? error.response.data.message : '') + ' ' + ((error?.response?.data?.details) ? error.response.data.details : '')
        ref.alert(this.$t('message.error.title'), 'danger', detailedError)
      })
  }
}

@Component export class SaveProductProperties extends Vue {
  @changes.Mutation public delFromChangesProducts!: (s: object) => void
  async saveProdProperties (id: string, change: object, deleteitem:any) {
    const ref = (this.$refs.saveProduct as any)
    await this.$axios.$post(`/api/opsidata/products/${id}/properties`, change)
      .then(() => {
        if (deleteitem) {
          this.delFromChangesProducts(deleteitem)
          this.$nuxt.refresh()
        } else {
          ref.alert(this.$t('message.success.trackChanges.save'), 'success')
          this.$emit('refetch', true)
        }
      }).catch((error) => {
        const detailedError = ((error?.response?.data?.message) ? error.response.data.message : '') + ' ' + ((error?.response?.data?.details) ? error.response.data.details : '')
        ref.alert(this.$t('message.error.title'), 'danger', detailedError)
      })
  }
}
