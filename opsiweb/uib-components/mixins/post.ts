import { Component, namespace, Vue } from 'nuxt-property-decorator'

const auth = namespace('auth')
const selections = namespace('selections')
const settings = namespace('settings')

@Component export class CallLogout extends Vue {
  @auth.Mutation public logout!: () => void
  @auth.Mutation public clearSession!: () => void
  @selections.Mutation public clearAllSelection!: () => void
  @settings.Mutation public setExpiresInterval!: (any) => void

  async callLogout () {
    const response = await this.$axios.$post('/api/auth/logout')
    if (response.result === 'logout success') {
      this.logout()
      this.clearSession()
      this.setExpiresInterval(undefined)
      this.clearAllSelection()
      if (this.$route.name !== 'login') {
        await this.$router.push({ path: '/login' })
      }
    }
  }
}

@Component export class Group extends Vue {
  async addClientToListOfGroups (client: string, groupsList: Array<string>) {
    await this.$axios.$post(`/api/opsidata/clients/${client}/groups`, groupsList)
      .then((response) => {
        const ref = (this.$refs.groupAlert as any)
        ref.alert(response, 'success')
      })
      .catch((error) => {
        const detailedError = ((error?.response?.data?.message) ? error.response.data.message : '') + ' ' + ((error?.response?.data?.detail) ? error.response.data.detail : '')
        const ref = (this.$refs.groupAlert as any)
        ref.alert(this.$t('message.error.title') as string, 'danger', detailedError)
      })
  }
}

@Component export class SetUEFI extends Vue {
  async setUEFI (clientId: string, uefi:string) {
    await this.$axios.$post(`api/opsidata/clients/${clientId}/uefi`, uefi)
      .catch((error) => {
        const detailedError = ((error?.response?.data?.message) ? error.response.data.message : '') + ' ' + ((error?.response?.data?.detail) ? error.response.data.detail : '')
        const ref = (this.$root.$children[1].$refs.errorAlert as any) || (this.$root.$children[2].$refs.errorAlert as any)
        ref.alert(this.$t('message.error.uefi') as string, 'danger', detailedError)
      })
  }
}
@Component export class DeployClientAgent extends Vue {
  async deployClientAgent (data: any, modal:boolean) {
    const ref = (this.$refs.clientagentAlert as any)
    await this.$axios.$post('/api/opsidata/clients/deploy', data)
      .then(() => {
        ref.alert(this.$t('message.success.clientagent', { client: data.clientId[0] }) as string, 'success')
        if (modal) {
          this.$bvModal.hide('event-modal-deployCA-' + data.clientId[0])
        }
      }).catch((error) => {
        const detailedError = ((error?.response?.data?.message) ? error.response.data.message : '') + ' ' + ((error?.response?.data?.detail) ? error.response.data.detail : '')
        ref.alert(this.$t('message.error.clientagent') as string, 'danger', detailedError)
      })
  }
}
