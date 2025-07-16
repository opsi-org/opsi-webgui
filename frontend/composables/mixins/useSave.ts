/**
This file is part of opsi-webgui application.
opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
Copyright (c) uib GmbH <info@uib.de> 2025
All rights reserved.
License: AGPL-3.0
*/
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

  async function saveParameters(url: string, request: any, deleteitem: any, showalert: boolean) {
    const { error } = await useApiPOSTkwargs(url, { body: request, showError: showalert })
    if (error) {
      if (!showalert) {
        const errorObj = deleteitem
        errorObj.error = error?.response?.data
        pushToErrorsHostParam(errorObj)
      }
      return
    }

    if (deleteitem) {
      delFromChangesHostParam(deleteitem)
    } else {
      notifySuccess({ message: t('message.successfullySavedHostParameters') })
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

  async function saveProdActionRequest(change: object, deleteitem: any, showalert: boolean) {
    const { error } = await useApiPOSTkwargs('/opsidata/clients/products', {
      body: change,
      showError: showalert,
    })
    if (error) {
      if (!showalert) {
        const errorObj = deleteitem
        errorObj.error = error?.response?.data
        pushToErrorsProducts(errorObj)
      }
      return false
    }

    if (deleteitem) {
      delFromChangesProducts(deleteitem)
    } else {
      notifySuccess({ message: t('message.successfullySavedProductActionRequest') })
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
  _t: any = undefined
) => {
  let t = _t
  if (!t) {
    t = _getI18nInComposable()
  }

  const delFromChangesProducts = storeChanges().delFromChangesProducts
  const pushToErrorsProducts = storeErrors().pushToErrorsProducts
  async function saveProdProperties(id: string, change: any, deleteitem: any, showalert: boolean) {
    const { error } = await useApiPOSTkwargs(`/opsidata/products/${id}/properties`, {
      body: change,
      showError: showalert,
    })
    if (error) {
      if (!showalert) {
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
        message: t('message.propertyChanged', {
          property: Object.keys(change.properties),
        }),
      })
    }
  }
  return { delFromChangesProducts, pushToErrorsProducts, saveProdProperties }
}
