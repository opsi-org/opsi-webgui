<template>
  <b-table v-bind="$props" @row-selected="rowchanged">
    <template #cell(sel)="row">
      <!-- {{datakey}}: {{selection}} -->
      <b-icon-check2 v-if="row.rowSelected || selection.includes(row.item[datakey])">
        {{ fixRow(row) }}
      </b-icon-check2>
    </template>
  </b-table>
</template>

<script lang="ts">
import { Component, Prop } from 'nuxt-property-decorator'
import { BTable } from 'bootstrap-vue'
import { IRow } from '~/types/tsettings'
// const selections = namespace('selections')

@Component
export default class TTable extends BTable {
  @Prop({ }) datakey!: string
  @Prop({ default: () => { return [] } }) readonly selection!: Array<string>
  @Prop({ default: () => { return () => { /* default */ } } }) rowchanged!: Function
  // @Prop({ default: () => { return () => { /* default */ } } }) fetch!: Function

  fixRow (row: IRow): void {
    row.rowSelected = this.selection.includes(row.item.ident)
    if (row.rowSelected) {
      const elem = document.getElementById(`__row_${row.item.ident}`)
      if (elem) { elem.classList.add('b-table-row-selected') }
      row.item._rowVariant = 'primary'
    } else {
      const elem = document.getElementById(`__row_${row.item.ident}`)
      if (elem) { elem.classList.remove('b-table-row-selected') }
      row.item._rowVariant = ''
    }
  }
}
</script>

<style>
</style>
