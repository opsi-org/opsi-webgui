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
      <!-- @change="changeModel" -->
  </div>
</template>

<script lang="ts">
import { Component, Prop, Ref } from 'nuxt-property-decorator'
import { BFormInput } from 'bootstrap-vue'
import { ITableData, ITableInfo } from '../../.utils/types/ttable'

@Component
export default class IFilter extends BFormInput {
  @Ref('IFilter') readonly IFilter!: HTMLInputElement
  @Prop({}) dataChanging!: string
  @Prop({}) data!: ITableData|ITableInfo
  @Prop({ default: '' }) additionalTitle!: string

  // changeModel (data) { this.$emit('update:data', data) }

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
