<template>
  <div>
    <BarBPageHeader>
      <template #right>
        <b-button @click="resetNewClientForm()">
          <b-icon icon="arrow-counterclockwise" /> {{ $t('button.reset') }}
        </b-button>
        <b-button :disabled="!clientName" @click="createOpsiClient()">
          <b-icon icon="plus" /> {{ $t('button.add') }}
        </b-button>
      </template>
    </BarBPageHeader>
    <IconILoading v-if="isLoading" />
    <DivDScrollResult v-else>
      <template slot="content">
        <b-row class="mb-2">
          <b-col sm="3" class="text-sm-right">
            {{ $t('table.fields.id') }}:
          </b-col>
          <b-col>
            <b-form-input v-model="clientName" type="text" required />
          </b-col>
          <b-col>
            <b-form-input v-model="domainName" size="sm" type="text" required />
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
      </template>
    </DivDScrollResult>
  </div>
</template>

<script lang="ts">
import { Component, namespace, Vue } from 'nuxt-property-decorator'
const selections = namespace('selections')

interface NewClient {
  hostId: string,
  description: string,
  inventoryNumber: string,
  hardwareAddress: string,
  ipAddress: any,
  notes: string
}

@Component export default class VClientsAddNew extends Vue {
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
    this.clientIds = (await this.$axios.$post('/api/opsidata/depots/clients',
      JSON.stringify({ selectedDepots: this.selectionDepots }))
    ).result.clients.sort()

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
      // eslint-disable-next-line no-console
      console.log('newClient: ALREADY EXISTS')
      return
    }
    // eslint-disable-next-line no-console
    console.log('newClient', this.newClient)
    await this.$axios.$post('/api/opsidata/clients', JSON.stringify(this.newClient))
    this.isLoading = false
  }
}
</script>

<style>
</style>
