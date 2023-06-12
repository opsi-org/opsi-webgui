<template>
  <div data-testid="MClientreachable">
    <b-button
      :title="$t('table.fields.checkreachable')"
      :class="{ 'border-0': selectionClients.length <= 0 }"
      variant="transparent"
      :disabled="selectionClients.length <= 0"
      @click="$bvModal.show('clientreachability')"
    >
      <b-icon :icon="icon.clientReachable" />
    </b-button>
    <b-modal
      id="clientreachability"
      data-testid="MClientReachableModal"
      :title="$t('table.fields.checkreachable')"
      centered
      scrollable
      hide-header
      hide-footer
      no-fade
    >
      <b-button class="border" variant="transparent" @click="checkReachable">
        {{ $t('button.reachable') }}
      </b-button>
      <AlertAAlert ref="CheckAlert" />
      <OverlayOLoading :is-loading="isLoading" />
      <pre v-if="reachability">{{ prettyJSON(reachability) }}</pre>
    </b-modal>
  </div>
</template>

<script lang="ts">
import { Component, namespace, Vue } from 'nuxt-property-decorator'
import { Icons } from '../../mixins/icons'
const selections = namespace('selections')

@Component({ mixins: [Icons] })
export default class MClientReachable extends Vue {
  icon: any
  $axios: any
  $t: any
  reachability: any = null
  isLoading:boolean = false

  @selections.Getter public selectionClients!: Array<string>

  async checkReachable () {
    this.isLoading = true
    const params: any = {}
    params.selectedClients = JSON.stringify(this.selectionClients)
    await this.$axios.$get('/api/opsidata/clients/reachable', { params })
      .then((response) => {
        this.reachability = response
      }).catch((error) => {
        const detailedError = ((error?.response?.data?.message) ? error.response.data.message : '') + ' ' + ((error?.response?.data?.detail) ? error.response.data.detail : '')
        const ref = (this.$refs.CheckAlert as any)
        ref.alert(this.$t('message.error.fetch') as string + 'Reachability Check', 'danger', detailedError)
      })
    this.isLoading = false
  }

  prettyJSON (data: Object) {
    return JSON.stringify(data, null, 2)
  }
}
</script>
