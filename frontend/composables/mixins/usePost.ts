import { useMBus } from './useMessagebus'
import { useNotification } from './useComponent'
const { notifySuccess, notifyError } = useNotification()
export const useCallLogout = (t: any = undefined) => {
  const wsDisconnect = useMBus(undefined, false, t).wsDisconnect // mixin

  const logout = storeAuth().logout
  const clearSession = storeAuth().clearSession
  const clearAllSelection = storeSelections().clearAllSelection
  const setExpiresInterval = storeSettings().setExpiresInterval

  async function  callLogout () {
    const { error } = await useApiPOST('/auth/logout')
    if (error) {
      notifyError({ message: error?.response?.data?.message })
      return
    }

      wsDisconnect()
      logout()
      clearSession()
      setExpiresInterval(undefined)
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
  if (!t){
    t = useI18n().t
  }

  async function addClientToListOfGroups (client: string, groupsList: Array<string>) {

    const { error } = await useApiPOST(`/api/opsidata/clients/${client}/groups`, groupsList)
    if (error) {
      notifyError({ message: error?.response?.data?.message })
      return
    }
    notifySuccess({ message: t('message.success.save.clienttogroups', { client }) })
  }
  return { addClientToListOfGroups }
}

export const useSetUEFI = (_t: any = undefined) => {
  let t = _t
  if (!t){
    t = useI18n().t
  }

  async function setUEFI (clientId: string, uefi:string) {

    const { error } = await useApiPOST(`api/opsidata/clients/${clientId}/uefi`, uefi)
    if (error) {
      notifyError({ title:t('message.error.uefi'), message: error?.response?.data?.message })
      return
    }
  }
  return { setUEFI }
}

export const useDeployClientAgent = (_t: any = undefined) => {
  let t = _t
  if (!t){
    t = useI18n().t
  }
  const clientagentAlert = ref<any>()
  async function deployClientAgent (_data: any, modal:boolean) {
    throw new Error('Is this function in use?')
    // TODO: use correct type for data (param and response type)
    const { data, error } = await useApiPOST<any>('/api/opsidata/clients/deploy', _data)
    if (error) {
      notifyError({ title:t('message.error.clientagent'), message: error?.response?.data?.message })
      return
    }

    clientagentAlert.value.alert(t('message.success.clientagent', { client: data.value.clientId[0] }), 'success')
    if (modal) {
      console.error("TODO: close modal ? ") // ts shows that usemodal does not exist
      // const { hide } = useModal('event-modal-deployCA-' + data.value.clientId[0] + '-context-menu-' + incontextmenu)
      // hide ()
    }
    throw new Error('TODO: check if this really works in mixin/composable. If so remove this line')
  }
  return { deployClientAgent }
}
