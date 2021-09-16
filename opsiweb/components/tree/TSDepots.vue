<template>
  <LazyTreeTSTreeselect v-if="depotsList" type="depots" :options="depotsList" :placeholder="'title.depots'" />
</template>

<script lang="ts">
import { Component, Vue } from 'nuxt-property-decorator'

@Component
export default class TSDepots extends Vue {
  depotsList: Array<object> = []

  async fetch () {
    const depots: Array<object> = []
    const result = (await this.$axios.$get('/api/opsidata/depotIds')).result
    for (const d in result) {
      const depot = result[d]
      depots.push({ id: depot + ';depotlist', text: depot, type: 'ObjectToGroup' })
    }
    this.depotsList = depots
  }
}
</script>
