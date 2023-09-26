<template>
  <b-input-group class="border pr-2 componentwrapper">
    <b-dropdown size="sm" no-caret variant="outline-primary border-0">
      <template #button-content>
        <b-icon :icon="icon.filter" />
      </template>
      <b-dropdown-item active>
        {{ $t('table.fields.id') }}
      </b-dropdown-item>
    </b-dropdown>
    <b-form-input
      id="filter"
      v-bind="$props"
      ref="IFilter"
      v-model="data.filterQuery"
      size="sm"
      :aria-label="$t('table.filter', {el: additionalTitle})"
      data-testid="IFilter"
      class="filter border-0"
      :placeholder="$t('table.filter', {el: additionalTitle})"
    />
    <b-button
      variant="transparent"
      class="border-0 filterclear p-0"
      size="sm"
      :title="$t('button.clearFilter')"
      @click="clearFilter"
    >
      <b-icon :class="data.filterQuery? '' : 'd-none'" :icon="icon.x" />
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
.filterclear{
  width: 20px;
}
</style>
