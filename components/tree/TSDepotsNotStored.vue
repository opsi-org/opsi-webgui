<template>
  <div data-testid="TSDepotsNotStored">
    <treeselect
      v-if="depotIds"
      v-model="idselection"
      class="treeselect_idselect"
      :options="depotIds"
      placeholder="-- Please select a Depot --"
      @input="$emit('update:id', idselection)"
    />
  </div>
</template>

<script lang="ts">
import { Component, namespace, Vue } from 'nuxt-property-decorator'
const selections = namespace('selections')
// const auth = namespace('auth')

@Component
export default class TSDepotsNotStored extends Vue {
  $axios: any
  // $nuxt: any
  // $fetch: any
  // $mq: any
  // $t: any

  depotIds: Array<object> = []
  idselection: string = ''
  @selections.Getter public selectionDepots!: Array<string>
  // @auth.Mutation public setSession!: () => void

  async fetch () {
    const depots: Array<object> = []
    const result = (await this.$axios.$get('/api/opsidata/depot_ids')).sort()
    for (const d in result) {
      const depot = result[d]
      depots.push({ id: depot, label: depot })
    }
    this.depotIds = depots
    // this.setSession()
    if (this.selectionDepots.length !== 0) {
      this.idselection = this.selectionDepots[0]
    } else {
      this.idselection = result[0]
    }
    this.$emit('update:id', this.idselection)
  }
}
</script>

<style>
.treeselect_idselect{
  max-width: 305px;
}
.treeselect_idselect .vue-treeselect__placeholder {
  color: black;
}
</style>
