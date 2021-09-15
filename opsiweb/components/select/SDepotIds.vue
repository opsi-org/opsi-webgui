<template>
  <b-form-select v-model="idselection" :options="depotIds" @change="$emit('update:id', idselection)">
    <template #first>
      <b-form-select-option :value="''" disabled>
        -- {{ $t('formselect.depot') }} --
      </b-form-select-option>
    </template>
  </b-form-select>
</template>

<script lang="ts">
import { Component, namespace, Vue } from 'nuxt-property-decorator'
const selections = namespace('selections')

@Component
export default class SDepotIds extends Vue {
  depotIds: Array<string> = []
  idselection: string = ''
  @selections.Getter public selectionDepots!: Array<string>

  async fetch () {
    this.depotIds = (await this.$axios.$get('/api/opsidata/depotIds')).result
    this.idselection = this.selectionDepots[0]
    this.$emit('update:id', this.idselection)
  }
}
</script>
