<template>
  <div data-testid="VClientCreation" class="VClientCreation">
    <AlertAAlert ref="newClientAlert" />
    <AlertAAlert ref="clientagentAlert" />
    <AlertAAlert ref="groupAlert" data-testid="groupAlert" />
    <OverlayOLoading :is-loading="isLoading" />
    <GridGFormItem value-more="true" variant="longvalue" :label="$t('table.fields.id')" labelclass="id">
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
    <b-row class="text-small mb-2">
      <b class="basics">{{ $t('title.basics') }} </b>
    </b-row>
    <div>
      <GridGFormItem
        v-for="(value, label, index) in newClient"
        :key="index"
        :label="label"
        :labelclass="'text-capitalize ' + label"
        variant="longvalue"
        :class="label.toString() === 'hostId' ? 'd-none' : ''"
      >
        <template #value>
          <b-form-textarea
            v-if="label.toString() === 'notes'"
            v-model="newClient.notes"
            size="sm"
            rows="4"

            no-resize
          />
          <b-form-input v-else v-model="newClient[label.toString()]" size="sm" type="text" />
        </template>
      </GridGFormItem>
    </div>
    <b-row class="text-small mb-2">
      <b class="assignments">{{ $t('title.assignments') }} </b>
    </b-row>
    <GridGFormItem :label="$t('table.fields.depot')" variant="longvalue" labelclass="depot">
      <template #value>
        <TreeTSDepotsNotStored :id.sync="depotId" />
      </template>
    </GridGFormItem>
    <GridGFormItem :label="$t('table.fields.group')" variant="longvalue" labelclass="group">
      <template #value>
        <TreeTSGroupInitSelection :id.sync="group" />
      </template>
    </GridGFormItem>
    <b-row class="text-small mb-2">
      <b class="initsetup">{{ $t('title.initsetup') }} </b>
    </b-row>
    <GridGFormItem :label=" $t('table.fields.netbootproduct')" variant="longvalue" labelclass="netbootproduct">
      <template #value>
        <b-form-select
          id="netbootproduct"
          v-model="netbootproduct"
          size="sm"
          value-field="productId"
          text-field="productId"
          :options="netbootproductslist"
        />
      </template>
    </GridGFormItem>
    <GridGFormItem :label="$t('table.fields.clientagent')" variant="longvalue" labelclass="clientagent">
      <template #value>
        <b-form inline>
          <b-form-checkbox v-model="clientagent" />
          <div :class="{'d-none' : !clientagent}">
            <b-form-input
              id="username"
              v-model="form.username"
              size="sm"
              class="valid-none"
              :placeholder="$t('form.username')"
              :state="formvalidation_user"
              required
            />
            <b-form-input
              id="password"
              v-model="form.password"
              size="sm"
              class="valid-none"
              :placeholder="$t('form.password')"
              :state="formvalidation_pw"
              required
            />
            <b-form-select id="type" v-model="form.type" size="sm" :options="clientagenttypes" required />
          </div>
        </b-form>
      </template>
    </GridGFormItem>
    <b-row class="text-small mb-2">
      <b class="settings">{{ $t('title.settings') }} </b>
    </b-row>
    <GridGFormItem :label="$t('table.fields.uefi')" variant="longvalue" labelclass="uefi">
      <template #value>
        <b-form-checkbox id="uefi" v-model="uefi" size="sm" :aria-label="$t('table.fields.uefi')" />
      </template>
    </GridGFormItem>
    <GridGFormItem variant="longvalue">
      <template #value>
        <div class="float-right mt-2">
          <b-button id="resetButton" class="resetButton d-inline" size="sm" variant="primary" @click="resetNewClientForm()">
            <b-icon :icon="icon.reset" class="d-inline" />
            <div class="resetButtonLabel d-inline">{{ $t('button.reset') }}</div>
          </b-button>

          <b-button
            id="addButton"
            data-testid="addButton"
            size="sm"
            class="addButton d-inline"
            variant="success"
            :disabled="!clientName"
            @click="createOpsiClient()"
          >
            <b-icon :icon="icon.add" class="d-inline" />
            <div class="addButtonLabel d-inline">{{ $t('button.create') }}</div>
          </b-button>
        </div>
      </template>
    </GridGFormItem>
  </div>
</template>

<script lang="ts">
import { Component, namespace, Watch, Vue } from 'nuxt-property-decorator'
import { Icons } from '../../mixins/icons'
import { SaveProductActionRequest } from '../../mixins/save'
import { Client } from '../../mixins/get'
import { Group, SetUEFI, DeployClientAgent } from '../../mixins/post'

const cache = namespace('data-cache')
const selections = namespace('selections')

interface NewClient {
  hostId: string,
  description: string,
  inventoryNumber: string,
  hardwareAddress: string,
  ipAddress: any,
  notes: string
}

interface FormClientAgent {
    clients: Array<string>,
    username: string,
    password: string,
    type: string
}

@Component({ mixins: [Icons, Client, Group, SetUEFI, DeployClientAgent, SaveProductActionRequest] })
export default class VClientCreation extends Vue {
  getClientIdList:any
  icon: any
  $axios: any
  $nuxt: any
  $fetch: any
  $mq: any
  $t: any
  setUEFI:any
  deployClientAgent:any
  saveProdActionRequest:any
  clientIds: Array<string> = []
  result: string = ''
  isLoading: boolean = false
  domain: string = ''
  clientName: string = ''
  depotId: string = ''
  group: any = null
  newClient: NewClient = {
    hostId: '',
    description: '',
    inventoryNumber: '',
    hardwareAddress: '',
    ipAddress: null,
    notes: ''
  }

  form: FormClientAgent = { clients: [], username: '', password: '', type: 'windows' }
  clientagenttypes: Array<string> = ['windows', 'linux', 'mac']
  uefi: boolean = false
  clientagent: boolean = false
  netbootproduct: string = ''
  netbootproductslist: Array<string> = []

  @cache.Getter public opsiconfigserver!: string
  @selections.Getter public selectionDepots!: Array<string>
  addClientToListOfGroups: any

  @Watch('depotId', { deep: true }) async depotIdChanged () { await this.fetchNetbootProducts() }

  get domainName () {
    if (this.opsiconfigserver) {
      this.result = this.opsiconfigserver
      this.result = this.result.substring(this.result.indexOf('.'))
    }
    this.domain = this.result
    return this.result
  }

  set domainName (val: string) {
    this.domain = val
  }

  get formvalidation_user () { return this.form.username !== '' }
  get formvalidation_pw () { return this.form.password !== '' }

  get checkValid () {
    return this.clientName.length > 0 && !this.clientIds.includes(this.clientName + this.domainName)
  }

  async fetch () {
    await this.fetchClients()
    await this.fetchNetbootProducts()
  }

  async fetchClients () {
    this.clientIds = await this.getClientIdList(this.selectionDepots)
  }

  async fetchNetbootProducts () {
    const depot = this.depotId
    await this.$axios.$get(`/api/opsidata/depots/products?selectedDepots=[${depot}]`)
      .then((response) => {
        this.netbootproductslist = response
      }).catch((error) => {
        const detailedError = ((error?.response?.data?.message) ? error.response.data.message : '') + ' ' + ((error?.response?.data?.detail) ? error.response.data.detail : '')
        const ref = (this.$refs.newClientAlert as any)
        ref.alert(detailedError, 'danger')
      })
  }

  async deployclientagent () {
    this.form.clients = [this.newClient.hostId]
    if (!this.form.username || !this.form.password || !this.form.clients) {
      return
    }
    const modal = false
    await this.deployClientAgent(this.form, modal)
  }

  async assignToGroup () {
    await this.addClientToListOfGroups(this.newClient.hostId, this.group)
  }

  async setupNetbootProduct () {
    const change = {
      clientIds: [this.newClient.hostId],
      productIds: [this.netbootproduct],
      actionRequest: 'setup'
    }
    const successalert = false
    await this.saveProdActionRequest(change, null, successalert)
  }

  async createOpsiClient () {
    this.isLoading = true
    this.newClient.hostId = this.clientName.trim() + this.domain.trim()
    const ref = (this.$root.$children[1].$refs.statusAlert as any) || (this.$root.$children[2].$refs.statusAlert as any)
    if (this.clientIds.includes(this.newClient.hostId)) {
      this.isLoading = false
      ref.alert(this.$t('message.warning.clientExists', { client: this.newClient.hostId }) as string, 'warning')
      return
    }
    const request = {
      client: this.newClient, depot: this.depotId
    }
    await this.$axios.$post('/api/opsidata/clients', request)
      .then(async () => {
        ref.alert(this.$t('message.success.createClient', { client: this.newClient.hostId }) as string, 'success')
        if (this.uefi) {
          this.setUEFI(this.newClient.hostId, this.uefi.toString())
        }
        if (this.group) {
          await this.assignToGroup()
        }
        if (this.clientagent) {
          await this.deployclientagent()
        }
        if (this.netbootproduct) {
          await this.setupNetbootProduct()
        }
      }).catch((error) => {
        const detailedError = ((error?.response?.data?.message) ? error.response.data.message : '') + ' ' + ((error?.response?.data?.detail) ? error.response.data.detail : '')
        ref.alert(this.$t('message.error.createClient') as string, 'danger', detailedError)
      })
    this.isLoading = false
  }

  resetNewClientForm () {
    this.clientName = ''
    this.newClient = {
      hostId: '',
      description: '',
      inventoryNumber: '',
      hardwareAddress: '',
      ipAddress: null,
      notes: ''
    } as NewClient
  }
}
</script>

<style>
.VClientCreation {
  overflow-x: hidden;
  padding-left: 10px;
}
.valid-none.is-valid {
  background-image: unset !important;
  border-color: var(--b-input_component) !important;
  box-shadow: unset !important;
}
.valid-none.is-valid:focus {
  border-color: var(--b-input_component-focus) !important;
  box-shadow: unset !important;
}
</style>
