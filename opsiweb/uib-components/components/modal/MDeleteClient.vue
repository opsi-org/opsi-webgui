<template>
  <div data-testid="MDeleteClient">
    <b-button
      v-if="incontextmenu == false"
      variant="outline-primary"
      size="sm"
      class="w-100 h-100 text-left border-0"
      :disabled="config?.read_only"
      @click="$bvModal.show('event-modal-delete-' + clientId)"
    >
      <b-icon :icon="icon.delete" />  <span class="clientdeletion"> {{ $t('label.delete') }} </span>
    </b-button>
    <div
      v-else
      variant="outline-primary"
      size="sm"
      class="w-100 h-100 text-left border-0 incontextmenu"
      :disabled="config?.read_only"
      @click="$bvModal.show('event-modal-delete-' + clientId)"
      @keypress.enter="$bvModal.show('event-modal-delete-' + clientId)"
    >
      <b-icon :icon="icon.delete" />  <span class="clientdeletion"> {{ $t('label.delete') }} </span>
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
      <span class="confirm text-small"> {{ $t('message.confirm.deleteClient', { client: clientId }) }} </span>
      <b-button
        data-testid="ConfirmDeleteClient"
        variant="danger"
        class="float-right"
        size="sm"
        :disabled="config?.read_only"
        @click="deleteOpsiClient(clientId)"
      >
        <b-icon :icon="icon.delete" />  <span class="deletion"> {{ $t('label.delete') }} </span>
      </b-button>
    </b-modal>
  </div>
</template>

<script lang="ts">
import { Component, Prop, namespace, Vue } from 'nuxt-property-decorator'
import { IObjectString2Boolean } from '../../.utils/types/tgeneral'
import { Icons } from '../../mixins/icons'
const config = namespace('config-app')
const selections = namespace('selections')

@Component({ mixins: [Icons] })
export default class MDeleteClient extends Vue {
  icon: any
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
        const detailedError = ((error?.response?.data?.message) ? error.response.data.message : '') + ' ' + ((error?.response?.data?.detail) ? error.response.data.detail : '')
        ref.alert(this.$t('message.error.deleteClient') as string, 'danger', detailedError)
      })
  }
}
</script>
