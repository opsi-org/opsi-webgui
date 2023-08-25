<template>
  <div data-testid="VClientreachable">
    <OverlayOLoading :is-loading="isLoading" />
    <AlertAAlert ref="CheckAlert" />
    <template v-if="reachability">
      <b-icon v-if="reachability.toString() === 'true'" :icon="icon.check" />
      <b-icon v-else :icon="icon.x" />
    </template>
    <b-button v-else variant="outline-primary" :title="$t('table.fields.checkreachable')" size="sm" @click="checkReachable">
      <b-icon :icon="icon.clientReachable" />
    </b-button>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'nuxt-property-decorator'
import { Icons } from '../../mixins/icons'

@Component({ mixins: [Icons] })
export default class VClientReachable extends Vue {
  icon: any
  $axios: any
  $t: any
  @Prop({ }) id!: string
  reachability: any = null
  isLoading:boolean = false

  async checkReachable () {
    this.isLoading = true
    const params: any = {}
    params.selectedClients = JSON.stringify([this.id])
    await this.$axios.$get('/api/opsidata/clients/reachable', { params })
      .then((response) => {
        this.reachability = Object.values(response)
      }).catch((error) => {
        const detailedError = ((error?.response?.data?.message) ? error.response.data.message : '') + ' ' + ((error?.response?.data?.detail) ? error.response.data.detail : '')
        const ref = (this.$refs.CheckAlert as any)
        ref.alert(this.$t('message.error.title') + this.$t('table.fields.reachablility'), 'danger', detailedError)
      })
    this.isLoading = false
  }

  prettyJSON (data: Object) {
    return JSON.stringify(data, null, 2)
  }
}
</script>
