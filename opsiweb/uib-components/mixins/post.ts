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
        this.$router.push({ path: '/login' })
      }
    }
  }
}

@Component export class Group extends Vue {
  async addClientToListOfGroups (client: string, groupsList: Array<string>) {
    await this.$axios.$post(`/api/opsidata/clients/${client}/groups`, groupsList)
      .then((response) => {
        const ref = (this.$refs.groupAlert as any)
        ref.alert('', 'success', response)
      })
      .catch((error) => {
        const detailedError = ((error?.response?.data?.message) ? error.response.data.message : '') + ' ' + ((error?.response?.data?.details) ? error.response.data.details : '')
        const ref = (this.$refs.groupAlert as any)
        ref.alert(this.$t('message.error.title') as string, 'danger', detailedError)
      })
  }
}

@Component export class SetUEFI extends Vue {
  async setUEFI (clientId: string) {
    await this.$axios.$post(`api/opsidata/clients/${clientId}/uefi`)
      .catch((error) => {
        const detailedError = ((error?.response?.data?.message) ? error.response.data.message : '') + ' ' + ((error?.response?.data?.details) ? error.response.data.details : '')
        const ref = (this.$refs.uefiAlert as any)
        ref.alert(this.$t('message.error.uefi') as string, 'danger', detailedError)
      })
  }
}
@Component export class DeployClientAgent extends Vue {
  async deployClientAgent (data: any, hidemodal:boolean) {
    const ref = (this.$refs.clientagentAlert as any)
    await this.$axios.$post('/api/opsidata/clients/deploy', data)
      .then(() => {
        ref.alert(this.$t('message.success.clientagent', { client: data.clientId[0] }) as string, 'success')
        if (hidemodal) {
          this.$bvModal.hide('event-modal-deployCA-' + data.clientId[0])
        }
      }).catch((error) => {
        const detailedError = ((error?.response?.data?.message) ? error.response.data.message : '') + ' ' + ((error?.response?.data?.details) ? error.response.data.details : '')
        ref.alert(this.$t('message.error.clientagent') as string, 'danger', detailedError)
      })
  }
}
