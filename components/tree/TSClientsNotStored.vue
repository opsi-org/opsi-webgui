<template>
  <div>
    <treeselect
      v-if="clientIds"
      v-model="idselection"
      data-testid="TSClientsNotStored"
      class="treeselect_notstored treeselect_short"
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
    // TODO : backend --> return clients data as list of { id: clientID, label: clientID } for treeselect component
    const result = (await this.$axios.$get('/api/opsidata/depots/clients', { params })).sort()
    for (const c in result) {
      const client = result[c]
      clients[c] = { id: client, label: client }
      // clients.push({ id: client, label: client })
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
