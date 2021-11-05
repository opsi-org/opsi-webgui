<template>
  <treeselect
    v-if="clientIds"
    v-model="idselection"
    class="treeselect_idselect"
    :options="clientIds"
    placeholder="-- Please select a Client --"
    @input="$emit('update:id', idselection)"
  />
</template>

<script lang="ts">
import { Component, namespace, Vue } from 'nuxt-property-decorator'
const selections = namespace('selections')
interface ClientRequest {
    selectedDepots: string
}

@Component
export default class TSClientsNotStored extends Vue {
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
  max-width: 300px;
}
</style>
