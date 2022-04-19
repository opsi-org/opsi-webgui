<template>
  <div data-testid="VClientsAddNew">
    <AlertAAlert ref="newClientAlert" />
    <IconILoading v-if="isLoading" />
    <div v-else>
      <br>
      <b-row class="mb-2">
        <b-col sm="3" class="text-sm-right">
          {{ $t('table.fields.id') }}:
        </b-col>
        <b-col>
          <label for="clientname" class="sr-only"> clientName </label>
          <b-form-input id="clientname" v-model="clientName" type="text" required />
        </b-col>
        <b-col>
          <label for="domainName" class="sr-only"> domainName </label>
          <b-form-input id="domainName" v-model="domainName" type="text" required />
        </b-col>
      </b-row>
      <b>{{ $t('table.clientDetails') }}: </b>
      <b-row class="mb-2">
        <b-col sm="3" class="text-sm-right">
          {{ $t('table.fields.description') }}:
        </b-col>
        <b-col>
          <label for="description" class="sr-only"> {{ $t('table.fields.description') }} </label>
          <b-form-input id="description" v-model="newClient.description" type="text" />
        </b-col>
      </b-row>
      <b-row class="mb-2">
        <b-col sm="3" class="text-sm-right">
          {{ $t('table.fields.inventNum') }}:
        </b-col>
        <b-col>
          <label for="inventNum" class="sr-only"> {{ $t('table.fields.inventNum') }} </label>
          <b-form-input id="inventNum" v-model="newClient.inventoryNumber" type="text" />
        </b-col>
      </b-row>
      <b-row class="mb-2">
        <b-col sm="3" class="text-sm-right">
          {{ $t('table.fields.hwAddr') }}:
        </b-col>
        <b-col>
          <label for="hwAddr" class="sr-only"> {{ $t('table.fields.hwAddr') }} </label>
          <b-form-input id="hwAddr" v-model="newClient.hardwareAddress" type="text" />
        </b-col>
      </b-row>

      <b-row class="mb-2">
        <b-col sm="3" class="text-sm-right">
          {{ $t('table.fields.ip') }}:
        </b-col>
        <b-col>
          <label for="ip" class="sr-only"> {{ $t('table.fields.ip') }} </label>
          <b-form-input id="ip" v-model="newClient.ipAddress" type="text" />
        </b-col>
      </b-row>
      <b>{{ $t('table.addtnlInfo') }}: </b>
      <b-row class="mb-2">
        <b-col sm="3" class="text-sm-right">
          {{ $t('table.fields.notes') }}:
        </b-col>
        <b-col>
          <label for="notes" class="sr-only"> {{ $t('table.fields.notes') }} </label>
          <b-form-textarea id="notes" v-model="newClient.notes" rows="2" no-resize />
        </b-col>
      </b-row>
    </div>
    <DivDComponentGroup class="float-right">
      <b-button variant="primary" @click="resetNewClientForm()">
        <b-icon :icon="iconnames.reset" /> {{ $t('button.reset') }}
      </b-button>
      <b-button variant="success" :disabled="!clientName" @click="createOpsiClient()">
        <b-icon :icon="iconnames.add" /> {{ $t('button.add') }}
      </b-button>
    </DivDComponentGroup>
  </div>
</template>

<script lang="ts">
import { Component, namespace, Vue } from 'nuxt-property-decorator'
// import { makeToast } from '../../.utils/utils/scomponents'
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
interface ClientRequest {
    selectedDepots: Array<string>
}

@Component({ mixins: [Constants] })
export default class VClientsAddNew extends Vue {
  iconnames: any
  $axios: any
  $nuxt: any
  $fetch: any
  $mq: any

  clientRequest: ClientRequest = { selectedDepots: [] }
  clientIds: Array<string> = []
  result: string = ''
  isLoading: boolean = false
  domain: string = ''
  clientName: string = ''
  newClient: NewClient = {
    hostId: '',
    description: '',
    inventoryNumber: '',
    hardwareAddress: '',
    ipAddress: null,
    notes: ''
  }

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

  async fetch () {
    this.clientRequest.selectedDepots = this.selectionDepots
    const params = this.clientRequest
    // this.clientIds = (await this.$axios.$get('/api/opsidata/depots/clients', { params })).sort()
    await this.$axios.$get('/api/opsidata/depots/clients', { params })
      .then((response) => {
        this.clientIds = response.sort()
      }).catch((error) => {
        const ref = (this.$refs.newClientAlert as any)
        ref.alert('Failed to fetch: DepotClients', 'danger', error)
      })
  }

  resetNewClientForm () {
    this.clientName = ''
    this.newClient = {} as NewClient
  }

  async createOpsiClient () {
    this.isLoading = true
    this.newClient.hostId = this.clientName.trim() + this.domain.trim()
    if (this.clientIds.includes(this.newClient.hostId)) {
      this.isLoading = false
      const ref = (this.$refs.newClientAlert as any)
      ref.alert(this.$t('message.exists', { client: this.newClient.hostId }) as string, 'warning')
      // makeToast(this, this.$t('message.exists', { client: this.newClient.hostId }) as string, 'OOPS!', 'warning')
      return
    }
    await this.$axios.$post('/api/opsidata/clients', this.newClient)
      .then(() => {
        const ref = (this.$refs.newClientAlert as any)
        ref.alert(this.$t('message.add', { client: this.newClient.hostId }) as string, 'success')
        // makeToast(this, this.$t('message.add', { client: this.newClient.hostId }) as string, this.$t('message.success') as string, 'success')
        this.$nuxt.refresh()
      }).catch((error) => {
        const ref = (this.$refs.newClientAlert as any)
        ref.alert(this.$t('message.errortext') as string, 'danger', error)
        // makeToast(this, this.$t('message.errortext') as string, this.$t('message.error') as string, 'danger', 8000)
      })
    this.isLoading = false
  }
}
</script>
