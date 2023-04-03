<template>
  <div data-testid="MDeleteClient">
    <b-button
      v-if="incontextmenu == false"
      variant="outline-primary"
      size="sm"
      class="w-100 h-100 text-left border-0"
      :disabled="(config)?config.read_only:false"
      @click="$bvModal.show('event-modal-delete-' + clientId)"
    >
      <b-icon :icon="iconnames.delete" />  <span class="clientdeletion"> {{ $t('label.delete') }} </span>
    </b-button>
    <div
      v-else
      variant="outline-primary"
      size="sm"
      class="w-100 h-100 text-left border-0"
      :disabled="(config)?config.read_only:false"
      @click="$bvModal.show('event-modal-delete-' + clientId)"
      @keypress.enter="$bvModal.show('event-modal-delete-' + clientId)"
    >
      <b-icon :icon="iconnames.delete" />  <span class="clientdeletion"> {{ $t('label.delete') }} </span>
    </div>

    <b-modal
      :id="'event-modal-delete-' + clientId"
      :title="$t('title.deleteClient')"
      data-testid="MDeleteClientModal"
      centered
      scrollable
      hide-footer
      hide-title
      no-fade
      no-stacking
    >
      <span class="confirm"> {{ $t('message.confirm.deleteClient', { client: clientId }) }} </span>
      <div class="float-right mt-2">
        <b-button
          data-testid="ConfirmDeleteClient"
          variant="danger"
          size="sm"
          :disabled="(config)?config.read_only:false"
          @click="deleteOpsiClient(clientId)"
        >
          <b-icon :icon="iconnames.delete" />  <span class="deletion"> {{ $t('label.delete') }} </span>
        </b-button>
      </div>
    </b-modal>
  </div>
</template>

<script lang="ts">
import { Component, Prop, namespace, Vue } from 'nuxt-property-decorator'
import { IObjectString2Boolean } from '../../.utils/types/tgeneral'
import { Constants } from '../../mixins/uib-mixins'
const config = namespace('config-app')
const selections = namespace('selections')

@Component({ mixins: [Constants] })
export default class MDeleteClient extends Vue {
  iconnames: any
  show:boolean = false
  $axios: any
  $t: any
  $router: any
  @Prop({ default: false }) incontextmenu!: boolean
  @Prop({ default: true }) clientId!: string
  @Prop({ default: () => { return () => { /* default */ } } }) refetch!: Function

  @config.Getter public config!: IObjectString2Boolean
  @selections.Mutation public delFromSelectionClients!: (s: string) => void

  async deleteOpsiClient (ident:string) {
    const id = ident
    const ref = (this.$root.$children[1].$refs.statusAlert as any) || (this.$root.$children[2].$refs.statusAlert as any)
    await this.$axios.$delete('/api/opsidata/clients/' + id)
      .then(() => {
        ref.alert(this.$t('message.success.deleteClient', { client: id }) as string, 'success')
        this.delFromSelectionClients(id)
        this.$bvModal.hide('event-modal-delete-' + this.clientId)
        this.refetch()
      }).catch((error) => {
        const detailedError = ((error?.response?.data?.message) ? error.response.data.message : '') + ' ' + ((error?.response?.data?.details) ? error.response.data.details : '')
        ref.alert(this.$t('message.error.deleteClient') as string, 'danger', detailedError)
      })
  }
}
</script>
