import { useNotification } from './useComponent'
import { _getI18nInComposable } from './helper-i18n'
const { notifySuccess, notifyError } = useNotification()
export const useSaveParameters = (_t: any = undefined) => {
  let t = _t
  if (!t){
    t = _getI18nInComposable()
  }
  const delFromChangesHostParam = storeChanges().delFromChangesHostParam
  const pushToErrorsHostParam = storeErrors().pushToErrorsHostParam

  async function saveParameters (url: string, request: any, deleteitem:any, showalert:boolean) {

    const { data, error } = await useApiPOST(url, request)
    if (error) {
      if (showalert) {
        notifyError({ message: error?.response?.data?.message })
      } else {
          const errorObj = deleteitem
          errorObj.error = error?.response?.data
          pushToErrorsHostParam(errorObj)
      }
      return
    }

    if (deleteitem) {
      delFromChangesHostParam(deleteitem)
    } else {
      notifySuccess({ message: t('message.success.save.parameters') })
    }
    // await this.$axios.$post(url, request)
    //   .then(() => {
    //     if (deleteitem) {
    //       this.delFromChangesHostParam(deleteitem)
    //     } else {
    //       this.showToastSuccess(this.$t('message.success.save.parameters'))
    //     }
    //   }).catch((error) => {
    //     if (showalert) {
    //       this.showToastError(error)
    //     } else {
    //       const errorObj = deleteitem
    //       errorObj.error = error?.response?.data
    //       this.pushToErrorsHostParam(errorObj)
    //     }
    //   })
  }
  return {
    delFromChangesHostParam,
    pushToErrorsHostParam,
    saveParameters
  }
}

export const useSaveProductActionRequest = (_t:any = undefined) => {
  let t = _t
  if (!t){
    t = _getI18nInComposable()
  }

  const delFromChangesProducts = storeChanges().delFromChangesProducts
  const pushToErrorsProducts = storeErrors().pushToErrorsProducts

  async function saveProdActionRequest (change : object, deleteitem:any, showalert:boolean) {
    const { data, error } = await useApiPOST('/opsidata/clients/products', change)
    if (error) {
      if (showalert) {
        notifyError({ message: error?.response?.data?.message })
      } else {
        const errorObj = deleteitem
        errorObj.error = error?.response?.data
        pushToErrorsProducts(errorObj)
      }
      return
    }

    if (deleteitem) {
      delFromChangesProducts(deleteitem)
    } else {
      notifySuccess({ message: t('message.success.save.prodActionRequest') })
      // await $nuxt.refresh()
      // TODO how to refresh nuxt ??? https://stackoverflow.com/questions/77387776/nuxt-3-reload-refresh-the-page
    }

  }

  //   await this.$axios.$post('/api/opsidata/clients/products', change)
  //     .then(async () => {
  //       if (deleteitem) {
  //         this.delFromChangesProducts(deleteitem)
  //       } else {
  //         this.showToastSuccess(this.$t('message.success.save.prodActionRequest'))
  //         await this.$nuxt.refresh()
  //       }
  //     }).catch((error) => {
  //       if (showalert) {
  //         this.showToastError(error)
  //       } else {
  //         const errorObj = deleteitem
  //         errorObj.error = error?.response?.data
  //         this.pushToErrorsProducts(errorObj)
  //       }
  //     })
  // }
  return { delFromChangesProducts, pushToErrorsProducts, saveProdActionRequest}
}


export const useSaveProductProperties = (refetch: (b: boolean) => void = (b: any) => {}, _t: any = undefined) => {
  let t = _t
  if (!t){
    t = _getI18nInComposable()
  }

  const delFromChangesProducts = storeChanges().delFromChangesProducts
  const pushToErrorsProducts = storeErrors().pushToErrorsProducts
  // const $emit = defineEmits(['refetch'])
  async function saveProdProperties (id: string, change: any, deleteitem:any, showalert:boolean) {
    const { data, error } = await useApiPOST(`/opsidata/products/${id}/properties`, change)
    if (error) {
      if (showalert) {
        notifyError({ message: error?.response?.data?.message })
      } else {
        const errorObj = deleteitem
        errorObj.error = error?.response?.data
        pushToErrorsProducts(errorObj)
      }
      return
    }

    if (deleteitem) {
      delFromChangesProducts(deleteitem)
    } else {
      // $emit('refetch', true)
      if (refetch) refetch(true)
        notifySuccess({ message: t('message.success.save.productproperty', { id: Object.keys(change.properties) }) })
    }

    // await this.$axios.$post(`/api/opsidata/products/${id}/properties`, change)
    //   .then(() => {
    //     if (deleteitem) {
    //       this.delFromChangesProducts(deleteitem)
    //     } else {
    //       this.$emit('refetch', true)
    //       this.showToastSuccess(this.$t('message.success.save.productproperty', { id: Object.keys(change.properties) }))
    //     }
    //   }).catch((error) => {
    //     if (showalert) {
    //       this.showToastError(error)
    //     } else {
    //       const errorObj = deleteitem
    //       errorObj.error = error?.response?.data
    //       this.pushToErrorsProducts(errorObj)
    //     }
    //   })
  }
  return { delFromChangesProducts, pushToErrorsProducts, saveProdProperties}
}
