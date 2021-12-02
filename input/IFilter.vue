<template>
  <div data-testid="IFilter">
    <b-form-input
      v-bind="$props"
      ref="IFilter"
      v-model="data.filterQuery"
      aria-label="Filter"
      class="filter"
      :placeholder="$t('table.filter') + ' ' + additionalTitle"
    />
  </div>
</template>

<script lang="ts">
import { Component, Prop, Ref } from 'nuxt-property-decorator'
import { BFormInput } from 'bootstrap-vue'
import { ITableData } from 'uib-components/.utils/types/ttable'

@Component
export default class IFilter extends BFormInput {
  @Ref('IFilter') readonly IFilter!: HTMLInputElement
  @Prop({ }) dataChanging!: string
  @Prop({ }) data!: ITableData
  @Prop({ default: '' }) additionalTitle!: string

  mounted () {
    this.IFilter.focus()
  }
}
</script>

<style>
.filter{
  width: 90%;
  max-width: 300px !important;
}
</style>
