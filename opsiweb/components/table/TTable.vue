<template>
  <b-table
    v-bind="$props"
    :ref="$props.id"
    :class="$mq"
    class="ttable"
    :small="$mq=='mobile'"
    :stacked="$mq=='mobile'"
    hover
    selectable
    borderless
    select-mode="multi"
    @row-clicked="rowChanged"
  >
    <template #table-busy>
      <IconILoading v-if="$props.busy" />
    </template>
    <!-- TODO: backend method broken for some attributes like installationStatus, actionResult, version..  -->
    <!-- :no-local-sorting="true"
    :sort-by.sync="tabledata.sortBy"
    :sort-desc.sync="tabledata.sortDesc"
    sort-icon-right -->
    <template #head()="header">
      {{ $t(header.label) }}
    </template>
    <template #head(sel)="{}">
      {{ selection.length }}/{{ totalrows }}
    </template>
    <template #cell(sel)="row">
      {{ fixRow(row) }}
      <b-icon-check2 v-if="row.rowSelected || selection.includes(row.item[datakey])" />
    </template>

    <template #head(rowactions)="{}">
      <DropdownDDTableColumnVisibilty :table-id="$props.id" :headers="headers" />
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
import { ITableRow, ITableHeaders, ITableDataItem, ITableData } from '~/types/ttable'
@Component
export default class TTable extends BTable {
  @Prop({ }) datakey!: string
  @Prop({ }) totalrows!: number
  @Prop({ default: () => { return [] } }) readonly selection!: Array<string>
  @Prop({ default: () => { return () => { /* default */ } } }) onchangeselection!: Function
  @Prop({ default: () => { return () => { /* default */ } } }) headers!: ITableHeaders
  @Prop({ }) tabledata!: ITableData

  fixRow (row: ITableRow): void {
    // eslint-disable-next-line no-console
    console.log('rowitem.ident', row.item.ident)
    if (typeof row.item.ident === 'string') {
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
    // row.rowSelected = this.selection.includes(row.item.ident)
    // if (row.rowSelected) {
    //   const elem = document.getElementById(`__row_${row.item.ident}`)
    //   if (elem) { elem.classList.add('b-table-row-selected') }
    //   row.item._rowVariant = 'primary'
    // } else {
    //   const elem = document.getElementById(`__row_${row.item.ident}Major`)
    //   if (elem) { elem.classList.remove('b-table-row-selected') }
    //   row.item._rowVariant = ''
    // }
  }

  rowChanged (item: ITableDataItem) {
    const selectionCopy:Array<string> = [...this.selection]
    if (this.datakey === 'productId') {
      if (selectionCopy.includes(item.productId)) {
        selectionCopy.splice(selectionCopy.indexOf(item.productId), 1)
      } else {
        selectionCopy.push(item.productId)
      }
    } else if (selectionCopy.includes(item.ident)) {
      selectionCopy.splice(selectionCopy.indexOf(item.ident), 1)
    } else {
      selectionCopy.push(item.ident)
    }

    // if (selectionCopy.includes(item.ident)) {
    //   selectionCopy.splice(selectionCopy.indexOf(item.ident), 1)
    // } else {
    //   selectionCopy.push(item.ident)
    // }
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
