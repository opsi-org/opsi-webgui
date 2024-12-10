import { useNotification } from './useComponent'
import { _getI18nInComposable } from './helper-i18n'
const { notifySuccess, notifyError } = useNotification()
export const useSaveParameters = (_t: any = undefined) => {
  let t = _t
  if (!t) {
    t = _getI18nInComposable()
  }
  const delFromChangesHostParam = storeChanges().delFromChangesHostParam
  const pushToErrorsHostParam = storeErrors().pushToErrorsHostParam

  async function saveParameters(
    url: string,
    request: any,
    deleteitem: any,
    showalert: boolean,
  ) {
    const { error } = await useApiPOST(url, request)
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
  }
  return {
    delFromChangesHostParam,
    pushToErrorsHostParam,
    saveParameters,
  }
}

export const useSaveProductActionRequest = (_t: any = undefined) => {
  let t = _t
  if (!t) {
    t = _getI18nInComposable()
  }

  const delFromChangesProducts = storeChanges().delFromChangesProducts
  const pushToErrorsProducts = storeErrors().pushToErrorsProducts

  async function saveProdActionRequest(
    change: object,
    deleteitem: any,
    showalert: boolean,
  ) {
    const { error } = await useApiPOST('/opsidata/clients/products', change)
    if (error) {
      if (showalert) {
        notifyError({ message: error?.response?.data?.message })
      } else {
        const errorObj = deleteitem
        errorObj.error = error?.response?.data
        pushToErrorsProducts(errorObj)
      }
      return false
    }

    if (deleteitem) {
      delFromChangesProducts(deleteitem)
    } else {
      notifySuccess({ message: t('message.success.save.prodActionRequest') })
      // await $nuxt.refresh()
      // TODO how to refresh nuxt ??? https://stackoverflow.com/questions/77387776/nuxt-3-reload-refresh-the-page
    }
    return true
  }
  return {
    delFromChangesProducts,
    pushToErrorsProducts,
    saveProdActionRequest,
  }
}

export const useSaveProductProperties = (
  refetch: undefined | ((b: boolean) => void) = undefined,
  _t: any = undefined,
) => {
  let t = _t
  if (!t) {
    t = _getI18nInComposable()
  }

  const delFromChangesProducts = storeChanges().delFromChangesProducts
  const pushToErrorsProducts = storeErrors().pushToErrorsProducts
  async function saveProdProperties(
    id: string,
    change: any,
    deleteitem: any,
    showalert: boolean,
  ) {
    const { error } = await useApiPOST(
      `/opsidata/products/${id}/properties`,
      change,
    )
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
      notifySuccess({
        message: t('message.success.save.productproperty', {
          id: Object.keys(change.properties),
        }),
      })
    }
  }
  return { delFromChangesProducts, pushToErrorsProducts, saveProdProperties }
}
