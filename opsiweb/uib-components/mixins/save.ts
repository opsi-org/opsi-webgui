import { Component, namespace, Vue } from 'nuxt-property-decorator'
import { AlertToast } from './component'

const changes = namespace('changes')
const errors = namespace('errors')
@Component({ mixins: [AlertToast] }) export class SaveParameters extends Vue {
  showToast: any // from mixin AlertToast
  @changes.Mutation public delFromChangesHostParam!: (s: object) => void
  @errors.Mutation public pushToErrorsHostParam!: (s: object) => void
  async saveParameters (url: string, request: any, deleteitem:any, showalert:boolean) {
    // const ref = (this.$root.$children[1].$refs.statusAlert as any) || (this.$root.$children[2].$refs.statusAlert as any)
    await this.$axios.$post(url, request)
      .then(() => {
        if (deleteitem) {
          this.delFromChangesHostParam(deleteitem)
        } else {
          // ref.alert(this.$t('message.success.trackChanges.save'), 'success')
          this.showToast({
            title: this.$t('message.success.title'),
            content: this.$t('message.success.trackChanges.save'),
            variant: 'success',
            autoHideDelay: 3000
          })
        }
      }).catch((error) => {
        if (showalert) {
          // ref.alert(this.$t('message.error.title'), 'danger', error.response.data)
          this.showToast({
            title: this.$t('message.error.title'),
            error_data: error.response.data,
            variant: 'danger',
            noAutoHide: true
          })
        } else {
          const errorObj = deleteitem
          errorObj.error = error.response.data
          this.pushToErrorsHostParam(errorObj)
        }
      })
  }
}

@Component({ mixins: [AlertToast] }) export class SaveProductActionRequest extends Vue {
  showToast: any // from mixin AlertToast
  @changes.Mutation public delFromChangesProducts!: (s: object) => void
  @errors.Mutation public pushToErrorsProducts!: (s: object) => void
  async saveProdActionRequest (change : object, deleteitem:any, showalert:boolean) {
    // const ref = (this.$root.$children[1].$refs.statusAlert as any) || (this.$root.$children[2].$refs.statusAlert as any)
    await this.$axios.$post('/api/opsidata/clients/products', change)
      .then(async () => {
        if (deleteitem) {
          this.delFromChangesProducts(deleteitem)
        } else {
          // ref.alert(this.$t('message.success.save.prodActionRequest'), 'success')
          this.showToast({
            title: this.$t('message.success.title'),
            content: this.$t('message.success.save.prodActionRequest'),
            variant: 'success',
            autoHideDelay: 3000
          })
          await this.$nuxt.refresh()
        }
      }).catch((error) => {
        if (showalert) {
          // ref.alert(this.$t('message.error.title'), 'danger', error.response.data)
          this.showToast({
            title: this.$t('message.error.title'),
            error_data: error.response.data,
            variant: 'danger',
            noAutoHide: true
          })
        } else {
          const errorObj = deleteitem
          errorObj.error = error.response.data
          this.pushToErrorsProducts(errorObj)
        }
      })
  }
}

@Component({ mixins: [AlertToast] }) export class SaveProductProperties extends Vue {
  showToast: any // from mixin AlertToast
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
          // ref.alert(this.$t('message.success.trackChanges.save'), 'success')
          this.showToast({
            title: this.$t('message.success.title'),
            content: this.$t('message.success.trackChanges.save'),
            variant: 'success',
            autoHideDelay: 3000
          })
          this.$emit('refetch', true)
          // this.$nuxt.refresh()
        }
      }).catch((error) => {
        if (showalert) {
          // ref.alert(this.$t('message.error.title'), 'danger', error.response.data)
          this.showToast({
            title: this.$t('message.error.title'),
            error_data: error.response.data,
            variant: 'danger',
            noAutoHide: true
          })
        } else {
          const errorObj = deleteitem
          errorObj.error = error.response.data
          this.pushToErrorsProducts(errorObj)
        }
      })
  }
}
