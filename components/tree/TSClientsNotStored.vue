<template>
  <div>
    <treeselect
      v-if="clientIds"
      v-model="idselection"
      data-testid="TSClientsNotStored"
      class="treeselect_idselect"
      :options="clientIds"
      :placeholder="$t('form.client')"
      @input="$emit('update:id', idselection)"
    />
  </div>
</template>

<script lang="ts">
import { Component, namespace, Vue } from 'nuxt-property-decorator'
const selections = namespace('selections')
interface ClientRequest {
    selectedDepots: string
}

@Component
export default class TSClientsNotStored extends Vue {
  $axios:any
  clientRequest: ClientRequest = { selectedDepots: '' }
  clientIds: Array<object> = []
  idselection: string = ''
  @selections.Getter public selectionDepots!: Array<string>
  @selections.Getter public selectionClients!: Array<string>

  async fetch () {
    const clients: Array<object> = []
    this.clientRequest.selectedDepots = JSON.stringify(this.selectionDepots)
    const params = this.clientRequest
    const result = (await this.$axios.$get('/api/opsidata/depots/clients', { params })).sort()
    for (const c in result) {
      const client = result[c]
      clients.push({ id: client, label: client })
    }
    this.clientIds = clients
    if (this.selectionClients.length !== 0) {
      this.idselection = this.selectionClients[0]
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
  color: black;
  background-color: var(--primary);
}
</style>
