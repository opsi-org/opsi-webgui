<template>
  <div data-testid="MClientreachable">
    <IconILoading v-if="isLoading" :small="true" />
    <b-button
      v-else
      variant="outline-primary"
      size="sm"
      :title="$t('button.reachable')"
      :disabled="selectionClients.length <= 0"
      @click="checkReachable"
    >
      <IconIIcon :icon="icon.clientReachable" />
    </b-button>
    <b-modal
      id="client-reachability"
      data-testid="MClientReachableModal"
      :title="$t('label.reachable')"
      centered
      scrollable
      hide-footer
      no-fade
    >
      <pre v-if="reachability">{{ prettyJSON(reachability) }}</pre>
    </b-modal>
  </div>
</template>

<script lang="ts">
import { Component, namespace, Vue } from 'nuxt-property-decorator'
import { AlertToast } from '../../mixins/component'
import { Icons } from '../../mixins/icons'
const selections = namespace('selections')

@Component({ mixins: [Icons, AlertToast] })
export default class MClientReachable extends Vue {
  showToastError: any // from mixin AlertToast
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
        this.$bvModal.show('client-reachability')
      }).catch((error) => {
        this.showToastError(error)
      })
    this.isLoading = false
  }

  prettyJSON (data: Object) {
    return JSON.stringify(data, null, 2)
  }
}
</script>
