<template>
  <div data-testid="BTNClientReachable">
    <OverlayOLoading :is-loading="isLoading" />
    <span v-if="reachability" class="ml-2">
      <b-icon v-if="reachability.toString() === 'true'" :icon="icon.check" />
      <b-icon v-else :icon="icon.x" />
    </span>
    <b-button
      v-else
      :class="classes"
      :title="$t('table.fields.checkreachable')"
      variant="outline-primary"
      size="sm"
      @click="checkReachable"
    >
      <b-icon :icon="icon.clientReachable" />
    </b-button>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'nuxt-property-decorator'
import { AlertToast } from '../../mixins/component'
import { Icons } from '../../mixins/icons'

@Component({ mixins: [Icons, AlertToast] })
export default class BTNClientReachable extends Vue {
  showToastError: any // from mixin AlertToast
  icon: any
  $axios: any
  $t: any
  @Prop({ }) id!: string
  @Prop({ default: '' }) classes!: string
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
        this.showToastError(error) // this.$t('table.fields.reachablility')
      })
    this.isLoading = false
  }

  prettyJSON (data: Object) {
    return JSON.stringify(data, null, 2)
  }
}
</script>
