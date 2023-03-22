<template>
  <div>
    <b-form-input
      id="filter"
      v-bind="$props"
      ref="IFilter"
      v-model="data.filterQuery"
      :aria-label="$t('table.filter', {el: additionalTitle})"
      data-testid="IFilter"
      class="filter"
      :placeholder="$t('table.filter', {el: additionalTitle})"
    />
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

  mounted () {
    if (this.IFilter) {
      this.IFilter.focus()
    }
  }
}
</script>

<style>
.filter {
  max-width: var(--component-width) !important;
}
</style>
