<template>
  <b-input-group>
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
    <b-button variant="outline-dark" @click="clearFilter">
      <b-icon :icon="icon.clear" />
    </b-button>
  </b-input-group>
</template>

<script lang="ts">
import { Component, Prop, Ref } from 'nuxt-property-decorator'
import { BFormInput } from 'bootstrap-vue'
import { Icons } from '../../mixins/icons'
import { ITableData, ITableInfo } from '../../.utils/types/ttable'

@Component({ mixins: [Icons] })
export default class IFilter extends BFormInput {
  icon: any
  @Ref('IFilter') readonly IFilter!: HTMLInputElement
  @Prop({}) dataChanging!: string
  @Prop({}) data!: ITableData|ITableInfo
  @Prop({ default: '' }) additionalTitle!: string

  mounted () {
    if (this.IFilter) {
      this.IFilter.focus()
    }
  }

  clearFilter () {
    this.data.filterQuery = ''
  }
}
</script>

<style>
.filter {
  max-width: var(--component-width) !important;
}
</style>
