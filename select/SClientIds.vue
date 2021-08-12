<template>
  <b-form-select v-model="idselection" :options="clientIds" @change="$emit('update:id', idselection)">
    <template #first>
      <b-form-select-option :value="''" disabled>
        -- {{ $t('formselect.client') }} --
      </b-form-select-option>
    </template>
  </b-form-select>
</template>

<script lang="ts">
import { Component, namespace, Vue } from 'nuxt-property-decorator'
const selections = namespace('selections')
interface ClientRequest {
    selectedDepots: string
}

@Component
export default class SClientIds extends Vue {
  clientRequest: ClientRequest = { selectedDepots: '' }
  clientIds: Array<string> = []
  idselection: string = ''
  @selections.Getter public selectionDepots!: Array<string>

  async fetch () {
    this.clientRequest.selectedDepots = JSON.stringify(this.selectionDepots)
    const params = this.clientRequest
    this.clientIds = (await this.$axios.$get('/api/opsidata/depots/clients', { params })).result.clients.sort()
    // this.idselection = this.clientIds[0]
  }
}
</script>

<style>

</style>
