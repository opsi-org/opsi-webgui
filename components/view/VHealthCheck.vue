<template>
  <div data-testid="VHealthCheck" class="VHealthCheck">
    <BarBPageHeader v-if="asChild" :title="$t('title.healthcheck') + ' - '" :subtitle="id" :closeroute="closeroute" />
    <BarBPageHeader v-if="!asChild">
      <template #left>
        <slot name="IDSelection" />
      </template>
    </BarBPageHeader>
    <AlertAAlert ref="healthCheckAlert" />
    <OverlayOLoading :is-loading="$fetchState.pending" />
    <div> {{ healthcheckdata }}</div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'nuxt-property-decorator'
@Component
export default class VHealthCheck extends Vue {
  $axios: any
  $t:any
  @Prop({ }) id!: string
  @Prop({ default: false }) 'asChild'!: string
  @Prop({ default: false }) 'closeroute'!: string

  healthcheckdata: Array<object> = []
  errorText: string = ''

  async fetch () {
    const request = { id: 1, jsonrpc: '2.0', method: 'service_healthCheck', params: [] }
    const host = window.location.hostname
    const baseURL = 'https://' + host + ':4447/rpc'
    await this.$axios.$post(baseURL, request)
      .then((response) => {
        this.healthcheckdata = response.result
      }).catch((error) => {
        const detailedError = ((error?.response?.data?.message) ? error.response.data.message : '') + ' ' + ((error?.response?.data?.details) ? error.response.data.details : '')
        const ref = (this.$refs.healthCheckAlert as any)
        ref.alert(this.$t('message.error.fetch') as string + 'Health Check', 'danger', detailedError)
        this.errorText = this.$t('message.error.defaulttext') as string
      })
  }
}
</script>
