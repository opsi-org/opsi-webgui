<template>
  <div data-testid="MRenameClient">
    <b-button
      v-if="incontextmenu == false"
      variant="outline-primary"
      size="sm"
      class="w-100 h-100 text-left border-0"
      :disabled="config?.read_only"
      @click="$bvModal.show('event-modal-rename-' + clientId)"
    >
      <b-icon :icon="icon.pencil" />  <span class="rename"> {{ $t('label.rename') }} </span>
    </b-button>
    <div
      v-else
      variant="outline-primary"
      size="sm"
      class="w-100 h-100 text-left border-0 incontextmenu"
      :disabled="config?.read_only"
      @click="$bvModal.show('event-modal-rename-' + clientId)"
      @keypress.enter="$bvModal.show('event-modal-rename-' + clientId)"
    >
      <b-icon :icon="icon.pencil" />  <span> {{ $t('label.rename') }} </span>
    </div>

    <b-modal
      :id="'event-modal-rename-' + clientId"
      :title="$t('title.renameClient') + t_fixed('keep-english.title.delimiter')+ clientId"
      data-testid="MRenameClientModal"
      centered
      scrollable
      hide-footer
      hide-title
      no-fade
      no-stacking
      @shown="fetchClients"
    >
      <GridGFormItem value-more="true" variant="longvalue" :label="$t('table.fields.newid')">
        <template #value>
          <b-form-input
            id="clientname"
            v-model="clientName"
            size="sm"
            data-testid="clientname"
            :aria-label="$t('table.name.client')"
            type="text"
            :state="checkValid"
            required
          />
          <b-form-invalid-feedback :state="checkValid">
            <span v-if="clientIds.includes(clientName + domainName)"> {{ $t('message.formvalid.clientExists') }} </span>
          </b-form-invalid-feedback>
        </template>
        <template #valueMore>
          <b-form-input
            id="domainName"
            v-model="domainName"
            size="sm"
            class="domainName"
            :aria-label="$t('table.name.domain')"
            type="text"
            required
          />
        </template>
      </GridGFormItem>
      <GridGFormItem variant="longvalue">
        <template #value>
          <b-button
            variant="outline-primary"
            class="float-right"
            size="sm"
            :disabled="config?.read_only || !clientName"
            @click="renameOpsiClient()"
          >
            <b-icon :icon="icon.pencil" />  <span> {{ $t('label.rename') }} </span>
          </b-button>
        </template>
      </GridGFormItem>
    </b-modal>
  </div>
</template>

<script lang="ts">
import { Component, Prop, namespace, Vue } from 'nuxt-property-decorator'
import { IObjectString2Boolean } from '../../.utils/types/tgeneral'
import { Client } from '../../mixins/get'
import { Icons } from '../../mixins/icons'
import { Strings } from '../../mixins/strings'
const cache = namespace('data-cache')
const config = namespace('config-app')
const selections = namespace('selections')

@Component({ mixins: [Icons, Strings, Client] })
export default class MRenameClient extends Vue {
  getClientIdList:any
  icon: any
  t_fixed: any
  show:boolean = false
  $axios: any
  $t: any
  $router: any
  @Prop({ default: false }) incontextmenu!: boolean
  @Prop({ default: true }) clientId!: string
  @Prop({ default: () => { return () => { /* default */ } } }) refetch!: Function
  newId: string = ''
  hostAttr:any = {}
  clientIds: Array<string> = []
  clientName: string = ''
  domain: string = ''

  @cache.Getter public opsiconfigserver!: string
  @config.Getter public config!: IObjectString2Boolean
  @selections.Getter public selectionDepots!: Array<string>

  get domainName () {
    let result: any
    if (this.opsiconfigserver) {
      result = this.opsiconfigserver
      result = result.substring(result.indexOf('.'))
    }
    this.domain = result
    return result
  }

  set domainName (val: string) {
    this.domain = val
  }

  get checkValid () {
    return this.clientName.length > 0 && !Number.isInteger(parseInt(this.clientName.charAt(0))) && !this.clientIds.includes(this.clientName + this.domainName)
  }

  async fetchClients () {
    this.clientIds = await this.getClientIdList(this.selectionDepots)
  }

  async fetchAttributes () {
    await this.$axios.$get(`/api/opsidata/hosts?hosts=${this.clientId}`)
      .then((response) => {
        this.hostAttr = response[0]
      }).catch((error) => {
        const detailedError = ((error?.response?.data?.message) ? error.response.data.message : '') + ' ' + ((error?.response?.data?.detail) ? error.response.data.detail : '')
        const ref = (this.$refs.renameCLient as any)
        ref.alert(detailedError, 'danger')
      })
  }

  async renameOpsiClient () {
    this.newId = this.clientName.trim() + this.domain.trim()
    await this.fetchAttributes()
    const attr = this.hostAttr
    delete attr.type
    delete attr.created
    delete attr.lastSeen
    delete attr.systemUUID
    delete attr.uefi
    attr.hostId = this.newId
    await this.$axios.$put(`/api/opsidata/clients/${this.clientId}`, attr)
      .then((response) => {
        this.$bvModal.hide('event-modal-rename-' + this.clientId)
        const ref = (this.$root.$children[1].$refs.statusAlert as any) || (this.$root.$children[2].$refs.statusAlert as any)
        ref.alert(this.$t('message.success.title'), 'success', response)
        this.refetch()
      }).catch((error) => {
        const ref = (this.$refs.renameCLient as any)
        const detailedError = ((error?.response?.data?.message) ? error.response.data.message : '') + ' ' + ((error?.response?.data?.detail) ? error.response.data.detail : '')
        ref.alert(detailedError, 'danger')
      })
  }
}
</script>
