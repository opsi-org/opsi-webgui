<template>
  <div data-testid="VClientCreation" class="VClientCreation">
    <AlertAAlert ref="newClientAlert" />
    <AlertAAlert ref="clientagentAlert" />
    <AlertAAlert ref="uefiAlert" />
    <AlertAAlert ref="productsAlert" />
    <OverlayOLoading :is-loading="isLoading" />
    <br>
    <GridGFormItem value-more="true">
      <template #label>
        <span class="id">{{ $t('table.fields.id') }}</span>
      </template>
      <template #value>
        <b-form-input
          id="clientname"
          v-model="clientName"
          :aria-label="$t('table.name.client')"
          type="text"
          :state="checkValid"
          required
        />
      </template>
      <template #valueMore>
        <b-form-input
          id="domainName"
          v-model="domainName"
          class="domainName"
          :aria-label="$t('table.name.domain')"
          type="text"
          required
        />
      </template>
    </GridGFormItem>
    <b-row class="mt-4 mb-2">
      <b class="basics">{{ $t('title.basics') }} </b>
    </b-row>
    <GridGFormItem>
      <template #label>
        <span class="description">{{ $t('table.fields.description') }}</span>
      </template>
      <template #value>
        <b-form-input id="description" v-model="newClient.description" :aria-label="$t('table.fields.description')" type="text" />
      </template>
    </GridGFormItem>
    <GridGFormItem>
      <template #label>
        <span class="inventNum">{{ $t('table.fields.inventNum') }}</span>
      </template>
      <template #value>
        <b-form-input id="inventNum" v-model="newClient.inventoryNumber" :aria-label="$t('table.fields.inventNum')" type="text" />
      </template>
    </GridGFormItem>
    <GridGFormItem>
      <template #label>
        <span class="hwAddr">{{ $t('table.fields.hwAddr') }}</span>
      </template>
      <template #value>
        <b-form-input id="hwAddr" v-model="newClient.hardwareAddress" :aria-label="$t('table.fields.hwAddr')" type="text" />
      </template>
    </GridGFormItem>
    <GridGFormItem>
      <template #label>
        <span class="ip">{{ $t('table.fields.ip') }}</span>
      </template>
      <template #value>
        <b-form-input id="ip" v-model="newClient.ipAddress" :aria-label="$t('table.fields.ip')" type="text" />
      </template>
    </GridGFormItem>
    <GridGFormItem>
      <template #label>
        <span class="notes">{{ $t('table.fields.notes') }}</span>
      </template>
      <template #value>
        <b-form-textarea id="notes" v-model="newClient.notes" :aria-label="$t('table.fields.notes')" rows="2" no-resize />
      </template>
    </GridGFormItem>
    <b-row class="mt-4 mb-2">
      <b class="settings">{{ $t('title.settings') }} </b>
    </b-row>
    <GridGFormItem>
      <template #label>
        <span class="uefi">{{ $t('table.fields.uefi') }}</span>
      </template>
      <template #value>
        <b-form-checkbox id="uefi" v-model="uefi" :aria-label="$t('table.fields.uefi')" />
      </template>
    </GridGFormItem>
    <b-row class="mt-4 mb-2">
      <b class="assignments">{{ $t('title.assignments') }} </b>
    </b-row>
    <GridGFormItem>
      <template #label>
        <span class="depot">{{ $t('table.fields.depot') }}</span>
      </template>
      <template #value>
        <TreeTSDepotsNotStored :id.sync="depotId" />
      </template>
    </GridGFormItem>
    <GridGFormItem>
      <template #label>
        <span class="group">{{ $t('table.fields.group') }}</span>
      </template>
      <template #value>
        <TreeTSGroupInitSelection :id.sync="group" />
      </template>
    </GridGFormItem>
    <b-row class="mt-4 mb-2">
      <b class="initsetup">{{ $t('title.initsetup') }} </b>
    </b-row>
    <GridGFormItem>
      <template #label>
        <span class="netbootproduct">{{ $t('table.fields.netbootproduct') }}</span>
      </template>
      <template #value>
        <b-form-select id="netbootproduct" v-model="netbootproduct" :options="netbootproductslist" />
      </template>
    </GridGFormItem>
    <GridGFormItem>
      <template #label>
        <span class="clientagent">{{ $t('table.fields.clientagent') }}</span>
      </template>
      <template #value>
        <b-form inline>
          <b-form-checkbox v-model="clientagent" />
          <div :class="{'d-none' : !clientagent}">
            <b-form-input id="username" v-model="form.username" :placeholder="$t('form.username')" :state="formvalidation" required />
            <b-form-input id="password" v-model="form.password" :placeholder="$t('form.password')" :state="formvalidation" required />
            <b-form-select id="type" v-model="form.type" :options="clientagenttypes" required />
          </div>
        </b-form>
      </template>
    </GridGFormItem>
    <DivDComponentGroup class="float-right">
      <b-button id="resetButton" class="resetButton" variant="primary" @click="resetNewClientForm()">
        <b-icon :icon="iconnames.reset" /> {{ $t('button.reset') }}
      </b-button>
      <b-button id="addButton" class="addButton" variant="success" :disabled="!clientName" @click="createOpsiClient()">
        <b-icon :icon="iconnames.add" /> {{ $t('button.create') }}
      </b-button>
    </DivDComponentGroup>
  </div>
</template>

<script lang="ts">
import { Component, namespace, Watch, Vue } from 'nuxt-property-decorator'
import { Constants } from '../../mixins/uib-mixins'
import { SetUEFI, DeployClientAgent, SaveProductActionRequest } from '../../mixins/save'

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

@Component({ mixins: [Constants, SetUEFI, DeployClientAgent, SaveProductActionRequest] })
export default class VClientCreation extends Vue {
  iconnames: any
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

  @Watch('depotId', { deep: true }) depotIdChanged () { this.fetchNetbootProducts() }

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

  get formvalidation () {
    if (this.form.username && this.form.password) {
      return true
    } else {
      return false
    }
  }

  get checkValid () {
    return this.clientName.length > 0 && !this.clientIds.includes(this.clientName + this.domainName)
  }

  async fetch () {
    await this.$axios.$get(`/api/opsidata/depots/clients?selectedDepots=[${this.selectionDepots}]`)
      .then((response) => {
        this.clientIds = response.sort()
      }).catch((error) => {
        const detailedError = ((error?.response?.data?.message) ? error.response.data.message : '') + ' ' + ((error?.response?.data?.details) ? error.response.data.details : '')
        const ref = (this.$refs.newClientAlert as any)
        ref.alert(this.$t('message.error.fetch') as string + 'DepotClients', 'danger', detailedError)
      })
    this.fetchNetbootProducts()
  }

  async fetchNetbootProducts () {
    const depot = this.depotId
    await this.$axios.$get(`/api/opsidata/depots/products?selectedDepots=[${depot}]`)
      .then((response) => {
        this.netbootproductslist = response
      }).catch((error) => {
        const detailedError = ((error?.response?.data?.message) ? error.response.data.message : '') + ' ' + ((error?.response?.data?.details) ? error.response.data.details : '')
        const ref = (this.$refs.newClientAlert as any)
        ref.alert(this.$t('message.error.fetch') as string + 'NetbootProducts', 'danger', detailedError)
      })
  }

  async deployclientagent () {
    this.form.clients = [this.newClient.hostId]
    if (!this.form.username || !this.form.password || !this.form.clients) {
      return
    }
    const hidemodal = false
    await this.deployClientAgent(this.form, hidemodal)
  }

  async assignToGroup () {
    await this.$axios.$post(`api/opsidata/clients/${this.newClient.hostId}/groups`, this.group)
      .catch((error) => {
        const detailedError = ((error?.response?.data?.message) ? error.response.data.message : '') + ' ' + ((error?.response?.data?.details) ? error.response.data.details : '')
        const ref = (this.$refs.newClientAlert as any)
        ref.alert(this.$t('message.error.assignGroup') as string, 'danger', detailedError)
      })
  }

  async setupNetbootProduct () {
    const change = {
      clientIds: [this.newClient.hostId],
      productIds: [this.netbootproduct],
      actionRequest: 'setup'
    }
    await this.saveProdActionRequest(change, null)
  }

  async createOpsiClient () {
    this.isLoading = true
    this.newClient.hostId = this.clientName.trim() + this.domain.trim()
    if (this.clientIds.includes(this.newClient.hostId)) {
      this.isLoading = false
      const ref = (this.$refs.newClientAlert as any)
      ref.alert(this.$t('message.warning.clientExists', { client: this.newClient.hostId }) as string, 'warning')
      return
    }
    const request = {
      client: this.newClient, depot: this.depotId
    }
    await this.$axios.$post('/api/opsidata/clients', request)
      .then(() => {
        const ref = (this.$refs.newClientAlert as any)
        ref.alert(this.$t('message.success.createClient', { client: this.newClient.hostId }) as string, 'success')
        if (this.uefi) {
          this.setUEFI(this.newClient.hostId)
        }
        if (this.group) {
          this.assignToGroup()
        }
        if (this.clientagent) {
          this.deployclientagent()
        }
        if (this.netbootproduct) {
          this.setupNetbootProduct()
        }
      }).catch((error) => {
        const detailedError = ((error?.response?.data?.message) ? error.response.data.message : '') + ' ' + ((error?.response?.data?.details) ? error.response.data.details : '')
        const ref = (this.$refs.newClientAlert as any)
        ref.alert(this.$t('message.error.createClient') as string, 'danger', detailedError)
      })
    this.isLoading = false
  }

  resetNewClientForm () {
    this.clientName = ''
    this.newClient = {} as NewClient
  }
}
</script>

<style>
.VClientCreation {
  overflow-x: hidden;
  padding-left: 10px;
  height: 100vh !important;
}
</style>
