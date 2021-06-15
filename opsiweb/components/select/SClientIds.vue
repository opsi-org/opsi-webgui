<template>
  <!-- TODO: Need backend method like '/api/opsidata/clientIds' for fetching only sorted list of clientIds  -->
  <b-form-select v-model="idselection" :options="clientIds" @change="$emit('update:id', idselection)">
    <template #first>
      <b-form-select-option :value="null" disabled>
        -- Please select a Client --
      </b-form-select-option>
    </template>
  </b-form-select>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'nuxt-property-decorator'

@Component
export default class SClientIds extends Vue {
  @Prop({ }) id!: string

  clientIds: Array<string> = []
  idselection: string = ''

  fetch () {
    this.clientIds = ['agorumcore-tst.uib.local', 'akunde1.uib.local']
    this.idselection = this.clientIds[0]
  }
}
</script>

<style>

</style>
