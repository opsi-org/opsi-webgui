<template>
  <div>
    <BarBPageHeader>
      <template #right>
        <b-button @click="resetNewClientForm()">
          <b-icon icon="arrow-counterclockwise" /> Reset
        </b-button>
        <b-button :disabled="!clientNamewithoutDomain" @click="createOpsiClient()">
          <b-icon icon="plus" /> Add
        </b-button>
      </template>
    </BarBPageHeader>
    <IconILoading v-if="isLoading" />
    <DivDScrollResult v-else>
      <template slot="content">
        <b-row class="mb-2">
          <b-col sm="3" class="text-sm-right">
            Client ID:
          </b-col>
          <b-col>
            <b-form-input
              v-model="clientNamewithoutDomain"
              type="text"
              required
            />
          </b-col>
          <b-col>
            <b-form-input v-model="domainName" size="sm" type="text" required />
          </b-col>
        </b-row>
        <b>Client Details: </b>
        <b-row class="mb-2">
          <b-col sm="3" class="text-sm-right">
            Description:
          </b-col>
          <b-col>
            <b-form-input
              v-model="newClient.description"
              type="text"
            />
          </b-col>
        </b-row>
        <b-row class="mb-2">
          <b-col sm="3" class="text-sm-right">
            Inventory Number:
          </b-col>
          <b-col>
            <b-form-input
              v-model="newClient.inventoryNumber"
              type="text"
            />
          </b-col>
        </b-row>
        <b-row class="mb-2">
          <b-col sm="3" class="text-sm-right">
            Hardware Address:
          </b-col>
          <b-col>
            <b-form-input
              v-model="newClient.hardwareAddress"
              type="text"
            />
          </b-col>
        </b-row>

        <b-row class="mb-2">
          <b-col sm="3" class="text-sm-right">
            IP Address:
          </b-col>
          <b-col>
            <b-form-input
              v-model="newClient.ipAddress"
              type="text"
            />
          </b-col>
        </b-row>
        <b>Additional Information: </b>
        <b-row class="mb-2">
          <b-col sm="3" class="text-sm-right">
            Notes:
          </b-col>
          <b-col>
            <b-form-textarea
              v-model="newClient.notes"
              rows="2"
              no-resize
            />
          </b-col>
        </b-row>
      </template>
    </DivDScrollResult>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'nuxt-property-decorator'
interface NewClient {
  hostId: string,
  description: string,
  inventoryNumber: string,
  hardwareAddress: string,
  ipAddress: any,
  notes: string
}

@Component export default class VClientsAddNew extends Vue {
  isLoading: boolean = false
  domainName: string = '.uib.local'
  clientNamewithoutDomain: string = ''
  newClient: NewClient = {
    hostId: '',
    description: '',
    inventoryNumber: '',
    hardwareAddress: '',
    ipAddress: null,
    notes: ''
  }

  resetNewClientForm () {
    this.clientNamewithoutDomain = ''
    this.newClient = {} as NewClient
  }

  createOpsiClient () {
    this.isLoading = true
    // await this.$axios.$post('/api/opsidata/clients', JSON.stringify(this.newClient))
    this.isLoading = false
  }
}
</script>

<style>
</style>
