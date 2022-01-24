<template>
  <div data-testid="TSDepots">
    <LazyTreeTSTreeselect v-if="depotsList" type="depots" :options="depotsList" :placeholder="'title.depots'" icon="hdd-network" />
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'nuxt-property-decorator'

@Component
export default class TSDepots extends Vue {
  $axios: any
  // $nuxt: any
  // $fetch: any
  // $mq: any
  // $t: any

  depotsList: Array<object> = []
  // @auth.Mutation public setSession!: () => void

  async fetch () {
    const depots: Array<object> = []
    const result = (await this.$axios.$get('/api/opsidata/depot_ids'))
    for (const d in result) {
      const depot = result[d]
      depots.push({ id: depot + ';depotlist', text: depot, type: 'ObjectToGroup' })
    }
    this.depotsList = depots
    // this.setSession()
  }
}
</script>
