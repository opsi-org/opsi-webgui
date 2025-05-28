/**
This file is part of opsi-webgui application.
opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
Copyright (c) uib GmbH <info@uib.de> 2025
All rights reserved.
License: AGPL-3.0
*/
import { useMBus } from './useMessagebus'
import { useNotification } from './useComponent'
const { notifySuccess, notifyError } = useNotification()
export const useCallLogout = (t: any = undefined) => {
  if (t === undefined) {
    // try to get t from i18n, better would be to pass it as parameter
    console.warn('useCallLogout: t is undefined')
    t = useI18n().t
  }
  const wsDisconnect = useMBus(undefined, false, t).wsDisconnect // mixin

  const logout = storeAuth().logout
  const clearSession = storeAuth().clearSession
  const clearAllSelection = storeSelections().clearAllSelection
  const setExpiresInterval = storeSettings().setExpiresInterval

  async function callLogout() {
    const { error } = await useApiPOST('/auth/logout')
    if (error) {
      notifyError({ message: error?.response?.data?.message })
      console.error('error on logout', error)
      return
    }
    try {
      wsDisconnect()
      logout()
      clearSession()
      setExpiresInterval(undefined)
    } catch (e) {
      console.error('error on logout', e)
    }
    if (useRoute().name !== 'login') {
      await useRouter().push({ path: '/login' })
    }
    clearAllSelection()
    // }
  }
  return { callLogout }
}

export const useGroup = (_t: any = undefined) => {
  let t = _t
  if (!t) {
    t = useI18n().t
  }

  async function addClientToListOfGroups(client: string, groupsList: Array<string>) {
    const { error } = await useApiPOST(`/opsidata/clients/${client}/groups`, groupsList)
    if (error) {
      notifyError({ message: error?.response?.data?.message })
      return
    }
    notifySuccess({
      message: t('message.success.save.clienttogroups', { client }),
    })
  }
  return { addClientToListOfGroups }
}

export const useSetUEFI = (_t: any = undefined) => {
  let t = _t
  if (!t) {
    t = useI18n().t
  }

  async function setUEFI(clientId: string, uefi: string) {
    const { error } = await useApiPOST(`api/opsidata/clients/${clientId}/uefi`, uefi)
    if (error) {
      notifyError({
        title: t('message.error.uefi'),
        message: error?.response?.data?.message,
      })
      return
    }
  }
  return { setUEFI }
}

export const useDeployClientAgent = (_t: any = undefined) => {
  let t = _t
  if (!t) {
    t = useI18n().t
  }
  const clientagentAlert = ref<any>()
  async function deployClientAgent(_data: any, modal: boolean) {
    throw new Error('Is this function in use?')
    // TODO: use correct type for data (param and response type)
    const { data, error } = await useApiPOST<any>('/opsidata/clients/deploy', _data)
    if (error) {
      notifyError({
        title: t('message.error.clientagent'),
        message: error?.response?.data?.message,
      })
      return
    }

    clientagentAlert.value.alert(
      t('message.success.clientagent', { client: data.value.clientId[0] }),
      'success'
    )
    if (modal) {
      console.error('TODO: close modal ? ') // ts shows that usemodal does not exist
      // const { hide } = useModal('event-modal-deployCA-' + data.value.clientId[0] + '-context-menu-' + incontextmenu)
      // hide ()
    }
    throw new Error('TODO: check if this really works in mixin/composable. If so remove this line')
  }
  return { deployClientAgent }
}
