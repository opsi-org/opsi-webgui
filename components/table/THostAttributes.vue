<template>
  <div data-testid="THostAttributes">
    <TableTSimple
      v-if="result"
      :is-busy="isLoading"
      :error="showError"
      :errortext="errorText"
      :stacked="true"
      :tableitems="[result]"
      :tablefields="fields"
    />
  </div>
</template>

<script lang="ts">
import { Component, namespace, Prop, Watch, Vue } from 'nuxt-property-decorator'
// const auth = namespace('auth')
interface Request {
    hosts: string
}

@Component
export default class THostAttributes extends Vue {
  $axios: any
  $t: any
  $fetch: any
  // $mq: any

  @Prop({ }) id!: string
  result:Object = {}
  request: Request = { hosts: '' }
  isLoading: boolean = false
  showError: boolean = false
  errorText: string = ''
  // @auth.Mutation public setSession!: () => void

  get fields () {
    return [
      { label: this.$t('table.fields.id'), key: 'hostId' },
      { label: this.$t('table.fields.type'), key: 'type' },
      { label: this.$t('table.fields.description'), key: 'description' },
      { label: this.$t('table.fields.notes'), key: 'notes' },
      { label: this.$t('table.fields.hwAddr'), key: 'hardwareAddress' },
      { label: this.$t('table.fields.ip'), key: 'ipAddress' },
      { label: this.$t('table.fields.inventNum'), key: 'inventoryNumber' },
      { label: this.$t('table.fields.created'), key: 'created' },
      { label: this.$t('table.fields.lastSeen'), key: 'lastSeen' },
      { label: this.$t('table.fields.hostKey'), key: 'opsiHostKey' },
      { label: this.$t('table.fields.otp'), key: 'oneTimePassword' }
    ]
  }

  @Watch('id', { deep: true }) idChanged () { this.$fetch() }

  beforeMount () {
    this.$fetch()
  }

  async fetch () {
    if (this.id) {
      this.isLoading = true
      this.request.hosts = this.id
      const params = this.request
      await this.$axios.$get('/api/opsidata/hosts', { params })
        .then((response) => {
          this.result = response[0]
          // this.setSession()
        }).catch((error) => {
        // eslint-disable-next-line no-console
          console.error(error)
          this.showError = true
          this.errorText = this.$t('message.errortext') as string
        })
      this.isLoading = false
    }
  }
}
</script>

<style>

</style>
