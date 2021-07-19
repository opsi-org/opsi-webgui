<template>
  <div>
    <!-- <b-form-select v-model="idselection" :options="clientIds" @change="$emit('update:id', idselection)">
      <template #first>
        <b-form-select-option :value="''" disabled>
          -- Please select a Client --
        </b-form-select-option>
      </template>
    </b-form-select> -->

    <b-form-select v-model="idselection" :options="paginatedOptions" @change="$emit('update:id', idselection)">
      <template #first>
        <b-form-select-option :value="''" disabled>
          -- Please select a Client --
        </b-form-select-option>
      </template>
    </b-form-select>
    <b-button v-if="hasNextPage" @click="getClientIds()">
      Load More
    </b-button>
    <!-- {{ request.pageNumber }}
    {{ paginatedOptions.length }} {{ totalClients }} {{ hasNextPage }} -->
  </div>
</template>

<script lang="ts">
import { Component, namespace, Vue } from 'nuxt-property-decorator'
const selections = namespace('selections')
interface Request {
  pageNumber: number
  perPage:number
  selectedDepots: Array<string>
}

@Component
export default class SClientIds extends Vue {
  loadMore:boolean= true
  request: Request = {
    pageNumber: 0,
    perPage: 10,
    selectedDepots: []
  }

  paginatedOptions: Array<string> = []
  totalClients: Number = 0
  result: Array<string> = []

  clientIds: Array<string> = []
  idselection: string = ''
  @selections.Getter public selectionDepots!: Array<string>

  async fetch () {
    this.clientIds = (await this.$axios.$post('/api/opsidata/depots/clients',
      JSON.stringify({ selectedDepots: this.selectionDepots }))
    ).result.clients.sort()
    // this.idselection = this.clientIds[0]
  }

  beforeMount () {
    this.getClientIds()
  }

  get hasNextPage () {
    if (this.paginatedOptions.length && this.totalClients) {
      return this.paginatedOptions.length < this.totalClients
    }
  }

  getClientIds () {
    this.request.selectedDepots = this.selectionDepots
    this.request.pageNumber = this.request.pageNumber + 1
    const data: any = this.getItems()
    this.totalClients = 39
    this.paginatedOptions = this.paginatedOptions.concat(data)
  }

  getItems () {
    if (this.request.pageNumber === 1) {
      this.result = ['agorumcore-tst.uib.local', 'akunde1.uib.local', 'akunde2.uib.local', 'dummy4.uib.local', 'dummy5.uib.local', 'dummy6.uib.local',
        'dummy7.uib.local', 'dummy8.uib.local', 'dummy9.uib.local', 'dummy10.uib.local']
    }
    if (this.request.pageNumber === 2) {
      this.result = ['dummy11.uib.local', 'dummy12.uib.local', 'dummy13.uib.local', 'dummy14.uib.local', 'dummy15.uib.local', 'dummy16.uib.local',
        'dummy17.uib.local', 'dummy18.uib.local', 'dummy19.uib.local', 'dummy20.uib.local']
    }
    if (this.request.pageNumber === 3) {
      this.result = ['dummy21.uib.local', 'dummy22.uib.local', 'dummy23.uib.local', 'dummy24.uib.local', 'dummy25.uib.local', 'dummy26.uib.local',
        'dummy27.uib.local', 'dummy28.uib.local', 'dummy29.uib.local', 'dummy30.uib.local']
    }
    if (this.request.pageNumber === 4) {
      this.result = ['dummy31.uib.local', 'dummy32.uib.local', 'dummy33.uib.local', 'dummy34.uib.local', 'dummy35.uib.local', 'dummy36.uib.local',
        'dummy37.uib.local', 'dummy38.uib.local', 'dummy39.uib.local']
    }
    return this.result
  }
}
</script>

<style>

</style>
