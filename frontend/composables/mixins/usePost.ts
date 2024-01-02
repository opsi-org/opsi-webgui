// import { Component, namespace, Vue } from 'nuxt-property-decorator'
// import { AlertToast } from './component'
import { useMBus } from './useMessagebus'
import { useNotification } from './useComponent'

// const auth = namespace('auth')
// const selections = namespace('selections')
// const settings = namespace('settings')

export const useCallLogout = () => {
// @Component({ mixins: [MBus] }) export class CallLogout extends Vue {
  const wsDisconnect = useMBus().wsDisconnect // mixin

  const logout = storeAuth().logout
  const clearSession = storeAuth().clearSession
  // @auth.Mutation public logout!: () => void
  // @auth.Mutation public clearSession!: () => void
  const clearAllSelection = storeSelections().clearAllSelection
  // @selections.Mutation public clearAllSelection!: () => void
  const setExpiresInterval = storeSettings().setExpiresInterval
  // @settings.Mutation public setExpiresInterval!: (any) => void

  async function  callLogout () {
    const { data, error } = await useApiPOST('/auth/logout')
    if (error) {
        useNotification().error(error)
      return
    }
    // const response = await this.$axios.$post('/api/auth/logout')
    // if (response.result === 'logout success') {
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

export const useGroup = () => {
  const { t } = useI18n()
// @Component({ mixins: [AlertToast] }) export class Group extends Vue {
  // showToastSuccess: any // mixin
  // showToastError: any // mixin
  async function addClientToListOfGroups (client: string, groupsList: Array<string>) {

    const { data, error } = await useApiPOST(`/api/opsidata/clients/${client}/groups`, groupsList)
    if (error) {
      console.log("error", error)
      useNotification().error(error)
      return
    }

    useNotification().success(t('message.success.save.clienttogroups', { client }))

    // await this.$axios.$post(`/api/opsidata/clients/${client}/groups`, groupsList)
    //   .then((response) => {
    //     this.showToastSuccess(this.$t('message.success.save.clienttogroups', { client }))
    //   })
    //   .catch((error) => {
    //     this.showToastError(error)
    //   })
  }
  return { addClientToListOfGroups }
}

export const useSetUEFI = () => {
// @Component({ mixins: [AlertToast] }) export class SetUEFI extends Vue {
  const { t } = useI18n()
  // showToastError: any // mixin
  async function setUEFI (clientId: string, uefi:string) {

    const { data, error } = await useApiPOST(`api/opsidata/clients/${clientId}/uefi`, uefi)
    if (error) {
      console.log("error", error)
      useNotification().error(error, t('message.error.uefi'))
      return
    }

    // await this.$axios.$post(`api/opsidata/clients/${clientId}/uefi`, uefi)
    //   .catch((error) => {
    //     this.showToastError(error, this.$t('message.error.uefi'))
    //   })
  }
  return { setUEFI }
}

export const useDeployClientAgent = () => {
// @Component({ mixins: [AlertToast] }) export class DeployClientAgent extends Vue {
  const { t } = useI18n()
  const clientagentAlert = ref<any>()
  // showToastError: any // mixin
  async function deployClientAgent (_data: any, modal:boolean, incontextmenu:boolean) {
    // const ref = ($refs.clientagentAlert as any)

    const { data, error } = await useApiPOST('/api/opsidata/clients/deploy', _data)
    if (error) {
      console.log("error", error)
      useNotification().error(error, t('message.error.clientagent'))
      return
    }

    clientagentAlert.value.alert(t('message.success.clientagent', { client: data.value.clientId[0] }), 'success')
    if (modal) {
      const { hide } = useModal('event-modal-deployCA-' + data.value.clientId[0] + '-context-menu-' + incontextmenu)
      hide ()
      // $bvModal.hide('event-modal-deployCA-' + data.clientId[0] + '-context-menu-' + incontextmenu)
    }
    throw new Error('TODO: check if this really works in mixin/composable. If so remove this line')


    // await this.$axios.$post('/api/opsidata/clients/deploy', data)
    //   .then(() => {
    //     ref.alert(this.$t('message.success.clientagent', { client: data.clientId[0] }) as string, 'success')
    //     if (modal) {
    //       this.$bvModal.hide('event-modal-deployCA-' + data.clientId[0] + '-context-menu-' + incontextmenu)
    //     }
    //   }).catch((error) => {
    //     this.showToastError(error, this.$t('message.error.clientagent'))
    //     // const detailedError = ((error?.response?.data?.message) ? error.response.data.message : '') + ' ' + ((error?.response?.data?.detail) ? error.response.data.detail : '')
    //     // ref.alert(this.$t('message.error.clientagent') as string, 'danger', detailedError)
    //   })
  }
  return { deployClientAgent }
}
