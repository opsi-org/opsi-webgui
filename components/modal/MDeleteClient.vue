<template>
  <div data-testid="MDeleteClient">
    <b-button
      variant="outline-primary"
      size="sm"
      :title="$t('label.delete')"
      class="w-100 h-100 text-left border-0"
      :disabled="(config)?config.read_only:false"
      @click="show = !show"
    >
      <b-icon :icon="iconnames.delete" />  <span class="clientdeletion"> {{ $t('label.delete') }} </span>
    </b-button>

    <b-modal
      v-model="show"
      :title="$t('title.deleteClient')"
      centered
      scrollable
      hide-footer
      hide-title
      no-fade
    >
      <AlertAAlert ref="deleteClientAlert" />
      <span class="confirm"> {{ $t('message.confirm.deleteClient', { client: clientId }) }} </span>
      <DivDComponentGroup class="float-right">
        <b-button
          class="float-right"
          variant="danger"
          size="sm"
          :disabled="(config)?config.read_only:false"
          @click="deleteOpsiClient(clientId)"
        >
          <b-icon :icon="iconnames.delete" />  <span class="deletion"> {{ $t('label.delete') }} </span>
        </b-button>
      </DivDComponentGroup>
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
  show:boolean = false
  $axios: any
  @Prop({ default: true }) clientId!: string

  @config.Getter public config!: IObjectString2Boolean
  @selections.Mutation public delFromSelectionClients!: (s: string) => void

  async deleteOpsiClient (ident:string) {
    const id = ident
    await this.$axios.$delete('/api/opsidata/clients/' + id)
      .then(() => {
        const ref = (this.$refs.deleteClientAlert as any)
        ref.alert(this.$t('message.success.deleteClient', { client: id }) as string, 'success')
        this.delFromSelectionClients(id)
      }).catch((error) => {
        const ref = (this.$refs.deleteClientAlert as any)
        const detailedError = ((error?.response?.data?.message) ? error.response.data.message : '') + ' ' + ((error?.response?.data?.details) ? error.response.data.details : '')
        ref.alert(this.$t('message.error.deleteClient') as string, 'danger', detailedError)
      })
  }
}
</script>
