<template>
  <div data-testid="TSDepotsNotStored">
    <treeselect
      v-if="depotIds"
      v-model="idselection"
      class="treeselect_idselect"
      :options="depotIds"
      :placeholder="$t('form.depot')"
      :always-open="false"
      @input="$emit('update:id', idselection)"
    />
  </div>
</template>

<script lang="ts">
import { Component, namespace, Vue } from 'nuxt-property-decorator'
const selections = namespace('selections')

@Component
export default class TSDepotsNotStored extends Vue {
  $axios: any

  depotIds: Array<object> = []
  idselection: string = ''
  @selections.Getter public selectionDepots!: Array<string>

  async fetch () {
    const depots: Array<object> = []
    const result = (await this.$axios.$get('/api/opsidata/depot_ids')).sort()
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
.treeselect_idselect{
  max-width: var(--component-width) !important;
}
.treeselect_idselect .vue-treeselect__control {
  background-color: var(--component, var(--background, black));
  color: var(--color, var(--light, white));
  border:1px solid var(--border, #ced4da );
}
.treeselect_idselect .vue-treeselect__menu {
  background-color: var(--component, var(--background, black));
  color: var(--color, var(--light, white));
}
.treeselect_idselect .vue-treeselect__single-value {
  color: var(--color, var(--light, white));
}
.treeselect_idselect .vue-treeselect__input {
  color: var(--color) !important;
}
.treeselect_idselect .vue-treeselect__menu .vue-treeselect__option--highlight {
  color: var(--color);
  background-color: var(--hover);
}
.treeselect_idselect.vue-treeselect--single .vue-treeselect__option--selected{
  color: var(--light);
  background-color: var(--primary);
}
</style>
