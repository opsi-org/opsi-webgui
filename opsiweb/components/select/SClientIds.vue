<template>
  <div>
    <!-- <b-form-select v-model="idselection" :options="clientIds" @change="$emit('update:id', idselection)">
    <template #first>
      <b-form-select-option :value="''" disabled>
        -- Please select a Client --
      </b-form-select-option>
    </template>
  </b-form-select> -->

    <b-form-select v-model="idselection" :options="options" @change="$emit('update:id', idselection)">
      <template #first>
        <b-form-select-option :value="''" disabled>
          -- Please select a Client --
        </b-form-select-option>
      </template>
    </b-form-select>
    <b-button>Load More</b-button>
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

  options: Array<string> = []

  clientIds: Array<string> = []
  idselection: string = ''
  @selections.Getter public selectionDepots!: Array<string>

  async fetch () {
    this.clientIds = (await this.$axios.$post('/api/opsidata/depots/clients',
      JSON.stringify({ selectedDepots: this.selectionDepots }))
    ).result.clients.sort()
    // this.idselection = this.clientIds[0]
  }

  mounted () {
    this.getClientIds()
  }

  getClientIds () {
    this.request.selectedDepots = this.selectionDepots
    this.request.pageNumber = this.request.pageNumber++
    const data: any = this.getItems(this.request)
    // this.clientIds = (await this.$axios.$post('/api/opsidata/depots/clients',
    //   JSON.stringify(this.request))
    // ).result.clients
    this.options.concat(data)
  }

  getItems (request: any) {
    if (request.pageNumber === 1) {
      return ['dummy1.uib.local', 'dummy2.uib.local', 'dummy1.uib.local', 'dummy2.uib.local', 'dummy1.uib.local', 'dummy2.uib.local',
        'dummy1.uib.local', 'dummy2.uib.local', 'dummy1.uib.local', 'dummy2.uib.local']
    }
    if (request.pageNumber === 2) {
      return ['dummy1.uib.local', 'dummy2.uib.local', 'dummy1.uib.local', 'dummy2.uib.local', 'dummy1.uib.local', 'dummy2.uib.local',
        'dummy1.uib.local', 'dummy2.uib.local', 'dummy1.uib.local', 'dummy2.uib.local']
    }
  }
}
</script>

<style>

</style>
