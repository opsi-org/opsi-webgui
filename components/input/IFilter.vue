<template>
  <div>
    <label for="filter" class="sr-only"> {{ $t('table.filter', {el: additionalTitle}) }} </label>
    <b-form-input
      id="filter"
      v-bind="$props"
      ref="IFilter"
      v-model="data.filterQuery"
      data-testid="IFilter"
      aria-label="Filter"
      class="filter"
      :placeholder="$t('table.filter', {el: additionalTitle})"
    />
  </div>
</template>

<script lang="ts">
import { Component, Prop, Ref } from 'nuxt-property-decorator'
import { BFormInput } from 'bootstrap-vue'
import { ITableData } from '../../.utils/types/ttable'

@Component
export default class IFilter extends BFormInput {
  @Ref('IFilter') readonly IFilter!: HTMLInputElement
  @Prop({}) dataChanging!: string
  @Prop({}) data!: ITableData
  @Prop({ default: '' }) additionalTitle!: string

  mounted () {
    if (this.IFilter) {
      this.IFilter.focus()
    }
  }
}
</script>

<style>
.filter {
  /* width: 90%; */
  max-width: 250px !important;
}
</style>
