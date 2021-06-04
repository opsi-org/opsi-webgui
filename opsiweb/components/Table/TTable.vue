<template>
  <b-table
    v-bind="$props"
    :ref="$props.id"
    :class="$mq"
    @row-clicked="rowChanged"
  >
    <template #head(sel)="{}">
      {{ selection.length }}/{{ totalrows }}
    </template>
    <template #cell(sel)="row">
      {{ fixRow(row) }}
      <b-icon-check2 v-if="row.rowSelected || selection.includes(row.item[datakey])" />
    </template>

    <template #head(actions)="{}">
      <DropdownDDTableColumnVisibilty :headers="headers" />
    </template>
    <template
      v-for="slotName in Object.keys($scopedSlots)"
      #[slotName]="slotScope"
    >
      <slot :name="slotName" v-bind="slotScope" />
    </template>
  </b-table>
</template>

<script lang="ts">
import { Component, Prop } from 'nuxt-property-decorator'
import { BTable } from 'bootstrap-vue'
import { ITableRow, ITableHeaders, ITableDataItem } from '~/types/tsettings'
@Component
export default class TTable extends BTable {
  @Prop({ }) datakey!: string
  @Prop({ }) totalrows!: number
  @Prop({ default: () => { return [] } }) readonly selection!: Array<string>
  @Prop({ default: () => { return () => { /* default */ } } }) onchangeselection!: Function
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

  rowChanged (item: ITableDataItem) {
    const selectionCopy:Array<string> = [...this.selection]
    if (selectionCopy.includes(item.ident)) {
      selectionCopy.splice(selectionCopy.indexOf(item.ident), 1)
    } else {
      selectionCopy.push(item.ident)
    }
    this.onchangeselection(selectionCopy)
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
