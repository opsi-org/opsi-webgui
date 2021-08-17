<template>
  <TableTDefault
    v-if="result"
    :is-busy="isLoading"
    :error="showError"
    :errortext="errorText"
    :stacked="true"
    :tableitems="[result]"
    :tablefields="fields"
  />
</template>

<script lang="ts">
import { Component, Prop, Watch, Vue } from 'nuxt-property-decorator'
interface Request {
    hosts: string
}

@Component
export default class THostAttributes extends Vue {
  @Prop({ }) id!: string
  result:Object = {}
  request: Request = { hosts: '' }
  isLoading: boolean = false
  showError: boolean = false
  errorText: string = ''

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
          this.result = response.result
          this.isLoading = false
        }).catch((error) => {
        // eslint-disable-next-line no-console
          console.error(error)
          this.showError = true
          this.errorText = (this as any).$t('message.errortext')
          this.isLoading = false
        })
    }
  }
}
</script>

<style>

</style>
