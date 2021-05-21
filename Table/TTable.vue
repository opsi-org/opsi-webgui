<template>
  <b-table
    v-bind="$props"
    :class="$mq"
    @row-selected="rowchanged"
  >
    <template #cell(sel)="row">
      <!-- {{datakey}}: {{selection}} -->
      {{ fixRow(row) }}
      <b-icon-check2 v-if="row.rowSelected || selection.includes(row.item[datakey])" />
    </template>

    <template #head(actions)="{}">
      <DropdownDDTableColumnVisibilty :headers="headers" />
    </template>
  </b-table>
</template>

<script lang="ts">
import { Component, Prop } from 'nuxt-property-decorator'
import { BTable } from 'bootstrap-vue'
import { ITableRow, ITableHeaders } from '~/types/tsettings'
// const selections = namespace('selections')

@Component
export default class TTable extends BTable {
  @Prop({ }) datakey!: string
  @Prop({ default: () => { return [] } }) readonly selection!: Array<string>
  @Prop({ default: () => { return () => { /* default */ } } }) rowchanged!: Function
  @Prop({ default: () => { return () => { /* default */ } } }) headers!: ITableHeaders

  fixRow (row: ITableRow): void {
    row.rowSelected = this.selection.includes(row.item.ident)
    if (row.rowSelected) {
      const elem = document.getElementById(`__row_${row.item.ident}`)
      if (elem) { elem.classList.add('b-table-row-selected') }
      row.item._rowVariant = 'primary'
    } else {
      const elem = document.getElementById(`__row_${row.item.ident}Major`)
      if (elem) { elem.classList.remove('b-table-row-selected') }
      row.item._rowVariant = ''
    }
  }
}
</script>

<style>
.fixed_column_selection{
  float: right;
}
._fixed_column_btn_selected_item{
  background-color: var(--primary_light);
}
</style>
