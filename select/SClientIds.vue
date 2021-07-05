<template>
  <b-form-select v-model="idselection" :options="clientIds" @change="$emit('update:id', idselection)">
    <template #first>
      <b-form-select-option :value="''" disabled>
        -- Please select a Client --
      </b-form-select-option>
    </template>
  </b-form-select>
</template>

<script lang="ts">
import { Component, namespace, Vue } from 'nuxt-property-decorator'
const selections = namespace('selections')

@Component
export default class SClientIds extends Vue {
  clientIds: Array<string> = []
  idselection: string = ''
  @selections.Getter public selectionDepots!: Array<string>

  async fetch () {
    this.clientIds = (await this.$axios.$post('/api/opsidata/depots/clients',
      JSON.stringify({ selectedDepots: this.selectionDepots }))
    ).result.clients.sort()
    // this.idselection = this.clientIds[0]
  }
}
</script>

<style>

</style>
