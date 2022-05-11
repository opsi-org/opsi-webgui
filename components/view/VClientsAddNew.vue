<template>
  <div data-testid="VClientsAddNew" class="VClientsAddNew">
    <AlertAAlert ref="newClientAlert" />
    <IconILoading v-if="isLoading" />
    <div v-else>
      <br>
      <GridGFormItem :label=" $t('table.fields.id')" value-more="true">
        <template #value>
          <label for="clientname" class="sr-only"> clientName </label>
          <b-form-input id="clientname" v-model="clientName" type="text" :state="checkValid" required />
        </template>
        <template #valueMore>
          <label for="domainName" class="sr-only"> domainName </label>
          <b-form-input id="domainName" v-model="domainName" type="text" required />
        </template>
      </GridGFormItem>
      <b-row class="mt-5 mb-4">
        <b>{{ $t('table.clientDetails') }}: </b>
      </b-row>
      <GridGFormItem :label=" $t('table.fields.description')">
        <template #value>
          <label for="description" class="sr-only"> {{ $t('table.fields.description') }} </label>
          <b-form-input id="description" v-model="newClient.description" type="text" />
        </template>
      </GridGFormItem>
      <GridGFormItem :label=" $t('table.fields.inventNum')">
        <template #value>
          <label for="inventNum" class="sr-only"> {{ $t('table.fields.inventNum') }} </label>
          <b-form-input id="inventNum" v-model="newClient.inventoryNumber" type="text" />
        </template>
      </GridGFormItem>
      <GridGFormItem :label=" $t('table.fields.hwAddr')">
        <template #value>
          <label for="hwAddr" class="sr-only"> {{ $t('table.fields.hwAddr') }} </label>
          <b-form-input id="hwAddr" v-model="newClient.hardwareAddress" type="text" />
        </template>
      </GridGFormItem>
      <GridGFormItem :label=" $t('table.fields.ip')">
        <template #value>
          <label for="ip" class="sr-only"> {{ $t('table.fields.ip') }} </label>
          <b-form-input id="ip" v-model="newClient.ipAddress" type="text" />
        </template>
      </GridGFormItem>
      <b-row class="mt-5 mb-4">
        <b>{{ $t('table.addtnlInfo') }}:</b>
      </b-row>
      <GridGFormItem :label=" $t('table.fields.notes')">
        <template #value>
          <label for="notes" class="sr-only"> {{ $t('table.fields.notes') }} </label>
          <b-form-textarea id="notes" v-model="newClient.notes" rows="2" no-resize />
        </template>
      </GridGFormItem>
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
export default class VClientsAddNew extends Vue {
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

  async createOpsiClient () {
    this.isLoading = true
    this.newClient.hostId = this.clientName.trim() + this.domain.trim()
    if (this.clientIds.includes(this.newClient.hostId)) {
      this.isLoading = false
      const ref = (this.$refs.newClientAlert as any)
      ref.alert(this.$t('message.warning.clientExists', { client: this.newClient.hostId }) as string, 'warning')
      return
    }
    await this.$axios.$post('/api/opsidata/clients', this.newClient)
      .then(() => {
        const ref = (this.$refs.newClientAlert as any)
        ref.alert(this.$t('message.success.createClient', { client: this.newClient.hostId }) as string, 'success')
        this.$nuxt.refresh()
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
.VClientsAddNew {
  display: flow-root;
}
</style>
