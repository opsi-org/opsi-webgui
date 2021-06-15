<template>
  <b-form-select v-model="idselection" :options="depotIds" @change="$emit('update:id', idselection)">
    <template #first>
      <b-form-select-option :value="null" disabled>
        -- Please select a Depot --
      </b-form-select-option>
    </template>
  </b-form-select>
</template>

<script lang="ts">
import { Component, Vue } from 'nuxt-property-decorator'

@Component
export default class SDepotIds extends Vue {
  // @Prop({ }) id!: string

  depotIds: Array<string> = []
  idselection: string = ''

  async fetch () {
    this.depotIds = (await this.$axios.$post('/api/opsidata/depotsIds')).result
    this.idselection = this.depotIds[0]
  }
}
</script>

<style>

</style>
