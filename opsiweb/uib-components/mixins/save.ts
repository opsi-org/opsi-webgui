import { Component, namespace, Vue } from 'nuxt-property-decorator'
import { AlertToast } from './component'

const changes = namespace('changes')
const errors = namespace('errors')
@Component({ mixins: [AlertToast] }) export class SaveParameters extends Vue {
  showToastSuccess: any // from mixin AlertToast
  showToastError: any // from mixin AlertToast
  @changes.Mutation public delFromChangesHostParam!: (s: object) => void
  @errors.Mutation public pushToErrorsHostParam!: (s: object) => void
  async saveParameters (url: string, request: any, deleteitem:any, showalert:boolean) {
    await this.$axios.$post(url, request)
      .then(() => {
        if (deleteitem) {
          this.delFromChangesHostParam(deleteitem)
        } else {
          this.showToastSuccess(this.$t('message.success.save.parameters'))
        }
      }).catch((error) => {
        if (showalert) {
          this.showToastError(error)
        } else {
          const errorObj = deleteitem
          errorObj.error = error?.response?.data
          this.pushToErrorsHostParam(errorObj)
        }
      })
  }
}

@Component({ mixins: [AlertToast] }) export class SaveProductActionRequest extends Vue {
  showToastSuccess: any // from mixin AlertToast
  showToastError: any // from mixin AlertToast
  @changes.Mutation public delFromChangesProducts!: (s: object) => void
  @errors.Mutation public pushToErrorsProducts!: (s: object) => void
  async saveProdActionRequest (change : object, deleteitem:any, showalert:boolean) {
    await this.$axios.$post('/api/opsidata/clients/products', change)
      .then(async () => {
        if (deleteitem) {
          this.delFromChangesProducts(deleteitem)
        } else {
          this.showToastSuccess(this.$t('message.success.save.prodActionRequest'))
          await this.$nuxt.refresh()
        }
      }).catch((error) => {
        if (showalert) {
          this.showToastError(error)
        } else {
          const errorObj = deleteitem
          errorObj.error = error?.response?.data
          this.pushToErrorsProducts(errorObj)
        }
      })
  }
}

@Component({ mixins: [AlertToast] }) export class SaveProductProperties extends Vue {
  showToastSuccess: any // from mixin AlertToast
  showToastError: any // from mixin AlertToast
  @changes.Mutation public delFromChangesProducts!: (s: object) => void
  @errors.Mutation public pushToErrorsProducts!: (s: object) => void

  async saveProdProperties (id: string, change: any, deleteitem:any, showalert:boolean) {
    await this.$axios.$post(`/api/opsidata/products/${id}/properties`, change)
      .then(() => {
        if (deleteitem) {
          this.delFromChangesProducts(deleteitem)
        } else {
          this.$emit('refetch', true)
          this.showToastSuccess(this.$t('message.success.save.productproperty', { id: Object.keys(change.properties) }))
        }
      }).catch((error) => {
        if (showalert) {
          this.showToastError(error)
        } else {
          const errorObj = deleteitem
          errorObj.error = error?.response?.data
          this.pushToErrorsProducts(errorObj)
        }
      })
  }
}
