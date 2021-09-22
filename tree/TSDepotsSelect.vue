<template>
  <treeselect
    v-if="depotIds"
    v-model="idselection"
    class="treeselect"
    :options="depotIds"
    placeholder="-- Please select a Depot --"
    @input="$emit('update:id', idselection)"
  />
</template>

<script lang="ts">
import { Component, namespace, Vue } from 'nuxt-property-decorator'
const selections = namespace('selections')

@Component
export default class TSDepotsSelect extends Vue {
  depotIds: Array<object> = []
  idselection: string = ''
  @selections.Getter public selectionDepots!: Array<string>

  async fetch () {
    const depots: Array<object> = []
    const result = (await this.$axios.$get('/api/opsidata/depotIds')).result.sort()
    for (const d in result) {
      const depot = result[d]
      depots.push({ id: depot, label: depot })
    }
    this.depotIds = depots
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
.treeselect{
  max-width: 350px;
}
</style>
