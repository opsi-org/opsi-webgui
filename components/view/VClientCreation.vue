<template>
  <div data-testid="VClientCreation" class="VClientCreation">
    <AlertAAlert ref="newClientAlert" />
    <IconILoading v-if="isLoading" />
    <div v-else>
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
        <!-- <b class="clientDetails">{{ $t('table.clientDetails') }} </b> -->
        <b class="basics">{{ $t('Basics') }} </b>
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
        <!-- <b class="addtnlInfo">{{ $t('table.addtnlInfo') }}</b> -->
        <b class="settings">{{ $t('Settings') }} </b>
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
        <!-- <b class="addtnlInfo">{{ $t('table.addtnlInfo') }}</b> -->
        <b class="basics">{{ $t('Assignments') }} </b>
      </b-row>
      <GridGFormItem>
        <template #label>
          <span class="depot">{{ $t('table.fields.depot') }}</span>
        </template>
        <template #value>
          <TreeTSDepotsNotStored :id.sync="depotId" />
          <!-- <b-form-input id="depot" v-model="depot" :aria-label="$t('table.fields.depot')" type="text" /> -->
        </template>
      </GridGFormItem>
      <GridGFormItem>
        <template #label>
          <span class="group">{{ $t('table.fields.group') }}</span>
        </template>
        <template #value>
          <b-form-textarea id="group" v-model="group" :aria-label="$t('table.fields.group')" rows="2" no-resize />
        </template>
      </GridGFormItem>
      <b-row class="mt-4 mb-2">
        <!-- <b class="addtnlInfo">{{ $t('table.addtnlInfo') }}</b> -->
        <b class="setup">{{ $t('Initial Setup') }} </b>
      </b-row>
      <GridGFormItem>
        <template #label>
          <span class="netbootproduct">{{ $t('table.fields.netbootproduct') }}</span>
        </template>
        <template #value>
          <b-form-textarea id="netbootproduct" v-model="netbootproduct" :aria-label="$t('table.fields.netbootproduct')" rows="2" no-resize />
        </template>
      </GridGFormItem>
      <GridGFormItem>
        <template #label>
          <span class="clientagent">{{ $t('table.fields.clientagent') }}</span>
        </template>
        <template #value>
          <b-form-textarea id="clientagent" v-model="clientagent" :aria-label="$t('table.fields.clientagent')" rows="2" no-resize />
        </template>
      </GridGFormItem>
    </div>
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
import { Component, namespace, Vue } from 'nuxt-property-decorator'
import { Constants } from '../../mixins/uib-mixins'

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

@Component({ mixins: [Constants] })
export default class VClientCreation extends Vue {
  iconnames: any
  $axios: any
  $nuxt: any
  $fetch: any
  $mq: any
  $t: any

  clientIds: Array<string> = []
  result: string = ''
  isLoading: boolean = false
  domain: string = ''
  clientName: string = ''
  depotId: string = ''
  netbootproduct: string = ''
  newClient: NewClient = {
    hostId: '',
    description: '',
    inventoryNumber: '',
    hardwareAddress: '',
    ipAddress: null,
    notes: ''
  }

  uefi: boolean = false

  @cache.Getter public opsiconfigserver!: string
  @selections.Getter public selectionDepots!: Array<string>

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

  beforeMount () {
    this.$fetch()
  }

  resetNewClientForm () {
    this.clientName = ''
    this.newClient = {} as NewClient
  }

  get checkValid () {
    return this.clientName.length > 0 && !this.clientIds.includes(this.clientName + this.domainName)
    // return this.clientName.length > 0  && isNaN(this.clientName[0] as any) && !this.clientIds.includes(this.clientName + this.domainName)
  }

  async fetch () {
    // this.clientIds = (await this.$axios.$get('/api/opsidata/depots/clients', { params })).sort()
    await this.$axios.$get(`/api/opsidata/depots/clients?selectedDepots=[${this.selectionDepots}]`)
      .then((response) => {
        this.clientIds = response.sort()
      }).catch((error) => {
        const detailedError = ((error?.response?.data?.message) ? error.response.data.message : '') + ' ' + ((error?.response?.data?.details) ? error.response.data.details : '')
        const ref = (this.$refs.newClientAlert as any)
        ref.alert(this.$t('message.error.fetch') as string + 'DepotClients', 'danger', detailedError)
      })
  }

  async setUEFI () {
    await this.$axios.$post(`api/opsidata/clients/${this.newClient.hostId}/uefi`)
      .catch((error) => {
        const detailedError = ((error?.response?.data?.message) ? error.response.data.message : '') + ' ' + ((error?.response?.data?.details) ? error.response.data.details : '')
        const ref = (this.$refs.newClientAlert as any)
        ref.alert(this.$t('message.error.uefi') as string, 'danger', detailedError)
      })
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
          this.setUEFI()
        }
        // this.$nuxt.refresh()
      }).catch((error) => {
        const detailedError = ((error?.response?.data?.message) ? error.response.data.message : '') + ' ' + ((error?.response?.data?.details) ? error.response.data.details : '')
        const ref = (this.$refs.newClientAlert as any)
        ref.alert(this.$t('message.error.createClient') as string, 'danger', detailedError)
      })
    this.isLoading = false
  }
}
</script>

<style>
.VClientCreation {
  display: flow-root;
  overflow-x: hidden;
  padding-left: 10px;
}
</style>
