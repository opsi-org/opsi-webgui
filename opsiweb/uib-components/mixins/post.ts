import { Component, namespace, Vue } from 'nuxt-property-decorator'
import { AlertToast } from './component'
import { MBus } from './messagebus'

const auth = namespace('auth')
const selections = namespace('selections')
const settings = namespace('settings')

@Component({ mixins: [MBus] }) export class CallLogout extends Vue {
  wsDisconnect: any // mixin
  @auth.Mutation public logout!: () => void
  @auth.Mutation public clearSession!: () => void
  @selections.Mutation public clearAllSelection!: () => void
  @settings.Mutation public setExpiresInterval!: (any) => void

  async callLogout () {
    const response = await this.$axios.$post('/api/auth/logout')
    if (response.result === 'logout success') {
      this.wsDisconnect()
      this.logout()
      this.clearSession()
      this.setExpiresInterval(undefined)
      if (this.$route.name !== 'login') {
        await this.$router.push({ path: '/login' })
      }
      this.clearAllSelection()
    }
  }
}

@Component({ mixins: [AlertToast] }) export class Group extends Vue {
  showToastSuccess: any // mixin
  showToastError: any // mixin
  async addClientToListOfGroups (client: string, groupsList: Array<string>) {
    await this.$axios.$post(`/api/opsidata/clients/${client}/groups`, groupsList)
      .then((response) => {
        this.showToastSuccess(this.$t('message.success.save.clienttogroups', { client }))
      })
      .catch((error) => {
        this.showToastError(error)
      })
  }
}

@Component({ mixins: [AlertToast] }) export class SetUEFI extends Vue {
  showToastError: any // mixin
  async setUEFI (clientId: string, uefi:string) {
    await this.$axios.$post(`api/opsidata/clients/${clientId}/uefi`, uefi)
      .catch((error) => {
        this.showToastError(error, this.$t('message.error.uefi'))
      })
  }
}
@Component({ mixins: [AlertToast] }) export class DeployClientAgent extends Vue {
  showToastError: any // mixin
  async deployClientAgent (data: any, modal:boolean, incontextmenu:boolean) {
    const ref = (this.$refs.clientagentAlert as any)
    await this.$axios.$post('/api/opsidata/clients/deploy', data)
      .then(() => {
        ref.alert(this.$t('message.success.clientagent', { client: data.clientId[0] }) as string, 'success')
        if (modal) {
          this.$bvModal.hide('event-modal-deployCA-' + data.clientId[0] + '-context-menu-' + incontextmenu)
        }
      }).catch((error) => {
        this.showToastError(error, this.$t('message.error.clientagent'))
        // const detailedError = ((error?.response?.data?.message) ? error.response.data.message : '') + ' ' + ((error?.response?.data?.detail) ? error.response.data.detail : '')
        // ref.alert(this.$t('message.error.clientagent') as string, 'danger', detailedError)
      })
  }
}
