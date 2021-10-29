<template>
  <div>
    <BarBPageHeader>
      <template #right>
        <b-button variant="primary" @click="resetNewClientForm()">
          <b-icon icon="arrow-counterclockwise" /> {{ $t('button.reset') }}
        </b-button>
        <b-button variant="success" :disabled="!clientName" @click="createOpsiClient()">
          <b-icon icon="plus" /> {{ $t('button.add') }}
        </b-button>
      </template>
    </BarBPageHeader>
    <IconILoading v-if="isLoading" />
    <div v-else>
      <br>
      <b-row class="mb-2">
        <b-col sm="3" class="text-sm-right">
          {{ $t('table.fields.id') }}:
        </b-col>
        <b-col>
          <b-form-input v-model="clientName" type="text" required />
        </b-col>
        <b-col>
          <b-form-input v-model="domainName" type="text" required />
        </b-col>
      </b-row>
      <b>{{ $t('table.clientDetails') }}: </b>
      <b-row class="mb-2">
        <b-col sm="3" class="text-sm-right">
          {{ $t('table.fields.description') }}:
        </b-col>
        <b-col>
          <b-form-input v-model="newClient.description" type="text" />
        </b-col>
      </b-row>
      <b-row class="mb-2">
        <b-col sm="3" class="text-sm-right">
          {{ $t('table.fields.inventNum') }}:
        </b-col>
        <b-col>
          <b-form-input v-model="newClient.inventoryNumber" type="text" />
        </b-col>
      </b-row>
      <b-row class="mb-2">
        <b-col sm="3" class="text-sm-right">
          {{ $t('table.fields.hwAddr') }}:
        </b-col>
        <b-col>
          <b-form-input v-model="newClient.hardwareAddress" type="text" />
        </b-col>
      </b-row>

      <b-row class="mb-2">
        <b-col sm="3" class="text-sm-right">
          {{ $t('table.fields.ip') }}:
        </b-col>
        <b-col>
          <b-form-input v-model="newClient.ipAddress" type="text" />
        </b-col>
      </b-row>
      <b>{{ $t('table.addtnlInfo') }}: </b>
      <b-row class="mb-2">
        <b-col sm="3" class="text-sm-right">
          {{ $t('table.fields.notes') }}:
        </b-col>
        <b-col>
          <b-form-textarea v-model="newClient.notes" rows="2" no-resize />
        </b-col>
      </b-row>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, namespace, Vue } from 'nuxt-property-decorator'
import { makeToast } from '@/scripts/utils/scomponents'

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

@Component export default class VClientsAddNew extends Vue {
  clientRequest: ClientRequest = { selectedDepots: [] }
  clientIds: Array<string> = []
  opsiconfigserver: string = ''
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
    this.clientIds = (await this.$axios.$get('/api/opsidata/depots/clients', { params })).sort()
    this.opsiconfigserver = (await this.$axios.$get('/api/user/opsiserver')).result
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
      makeToast(this, this.newClient.hostId + this.$t('message.exists'), 'OOPS!', 'warning')
      return
    }
    await this.$axios.$post('/api/opsidata/clients', JSON.stringify(this.newClient))
      .then(() => {
        // eslint-disable-next-line no-console
        makeToast(this, this.newClient.hostId + this.$t('message.add'), this.$t('message.success') as string, 'success')
        this.$nuxt.refresh()
      }).catch((error) => {
        // eslint-disable-next-line no-console
        console.error(error)
        makeToast(this, this.$t('message.errortext') as string, this.$t('message.error') as string, 'danger', 8000)
      })
    this.isLoading = false
  }
}
</script>
