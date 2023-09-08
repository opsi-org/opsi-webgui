import { Component, namespace, Vue } from 'nuxt-property-decorator'

const changes = namespace('changes')
const errors = namespace('errors')
@Component export class SaveParameters extends Vue {
  @changes.Mutation public delFromChangesHostParam!: (s: object) => void
  @errors.Mutation public pushToErrorsHostParam!: (s: object) => void
  async saveParameters (url: string, request: any, deleteitem:any, showalert:boolean) {
    const ref = (this.$root.$children[1].$refs.statusAlert as any) || (this.$root.$children[2].$refs.statusAlert as any)
    await this.$axios.$post(url, request)
      .then(() => {
        if (deleteitem) {
          this.delFromChangesHostParam(deleteitem)
        } else {
          ref.alert(this.$t('message.success.trackChanges.save'), 'success')
        }
      }).catch((error) => {
        if (showalert) {
          ref.alert(this.$t('message.error.title'), 'danger', error.response.data)
        } else {
          const errorObj = deleteitem
          errorObj.error = error.response.data
          this.pushToErrorsHostParam(errorObj)
        }
      })
  }
}

@Component export class SaveProductActionRequest extends Vue {
  @changes.Mutation public delFromChangesProducts!: (s: object) => void
  @errors.Mutation public pushToErrorsProducts!: (s: object) => void
  async saveProdActionRequest (change : object, deleteitem:any, showalert:boolean) {
    const ref = (this.$root.$children[1].$refs.statusAlert as any) || (this.$root.$children[2].$refs.statusAlert as any)
    await this.$axios.$post('/api/opsidata/clients/products', change)
      .then(async () => {
        if (deleteitem) {
          this.delFromChangesProducts(deleteitem)
        } else {
          ref.alert(this.$t('message.success.save.prodActionRequest'), 'success')
          await this.$nuxt.refresh()
        }
      }).catch((error) => {
        if (showalert) {
          ref.alert(this.$t('message.error.title'), 'danger', error.response.data)
        } else {
          const errorObj = deleteitem
          errorObj.error = error.response.data
          this.pushToErrorsProducts(errorObj)
        }
      })
  }
}

@Component export class SaveProductProperties extends Vue {
  @changes.Mutation public delFromChangesProducts!: (s: object) => void
  @errors.Mutation public pushToErrorsProducts!: (s: object) => void

  async saveProdProperties (id: string, change: object, deleteitem:any, showalert:boolean) {
    const ref = (this.$root.$children[1].$refs.statusAlert as any) || (this.$root.$children[2].$refs.statusAlert as any)
    await this.$axios.$post(`/api/opsidata/products/${id}/properties`, change)
      .then(() => {
        if (deleteitem) {
          this.delFromChangesProducts(deleteitem)
        } else {
          // ref.alert(this.$t('message.success.trackChanges.save') + ' (' + id + ': ' + JSON.stringify(change) + ')', 'success')
          ref.alert(this.$t('message.success.trackChanges.save'), 'success')
          this.$emit('refetch', true)
          // this.$nuxt.refresh()
        }
      }).catch((error) => {
        if (showalert) {
          ref.alert(this.$t('message.error.title'), 'danger', error.response.data)
        } else {
          const errorObj = deleteitem
          errorObj.error = error.response.data
          this.pushToErrorsProducts(errorObj)
        }
      })
  }
}
