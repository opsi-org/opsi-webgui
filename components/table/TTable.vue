<template>
  <div data-testid="TTable">
    <b-table
      v-bind="$props"
      :ref="$props.id"
      :class="$mq"
      :primary-key="datakey"
      :tbody-tr-class="{'table-active': false}"
      :select-mode="selectmode"
      borderless
      :striped="false"
      :small="small!=false"
      :stacked="$mq=='mobile'"
      :hover="!disableSelection"
      :selectable="!disableSelection"
      sort-icon-left
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
        {{ header.label }}
      </template>
      <template #head(sel)="{}">
        {{ selection.length }}/{{ totalrows }}
      </template>
      <template #cell(sel)="row">
        <!-- <b-icon-check v-if="row.rowSelected || selection.includes(row.item[datakey])" /> -->
        {{ fixRow(row) }}
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
  </div>
</template>

<script lang="ts">
import { Component, Prop } from 'nuxt-property-decorator'
import { BTable } from 'bootstrap-vue'
import { ITableRow, ITableHeaders, ITableDataItem, ITableData } from '@/.utils/types/ttable'
@Component
export default class TTable extends BTable {
  @Prop({ }) datakey!: string
  @Prop({ }) ismultiselect!: boolean
  @Prop({ }) totalrows!: number
  @Prop({ default: () => { return [] } }) readonly selection!: Array<string>
  @Prop({ default: () => { return () => { /* default */ } } }) onchangeselection!: Function
  @Prop({ default: () => { return () => {} } }) routechild!: Function
  @Prop({ default: () => { return () => { /* default */ } } }) headers!: ITableHeaders
  @Prop({ default: false }) readonly disableSelection!: boolean
  @Prop({ }) tabledata!: ITableData

  rowIdent: any

  get selectmode () {
    if (this.ismultiselect) {
      return 'multi'
    } else { return 'single' }
  }

  fixRow (row: ITableRow): void {
    if (this.datakey === 'productId') {
      this.rowIdent = row.item.productId
    } else {
      this.rowIdent = row.item.ident
    }

    row.rowSelected = this.selection.includes(this.rowIdent)
    const elem = document.getElementById(`${this.id}__row_${this.rowIdent}`)
    // if (elem) { elem.classList.remove('table-active') }
    // else { console.debug('row is null', `${this.id}__row_${this.rowIdent}`) }
    if (row.rowSelected) {
      row.item._rowVariant = 'primary'
      if (elem) {
        elem.classList.add('b-table-row-selected')
        elem.classList.add('table-primary')
        elem.classList.add('aaaa')
      }
    } else {
      row.item._rowVariant = ''
      if (elem) {
        elem.classList.remove('table-active')
        elem.classList.remove('b-table-row-selected')
        elem.classList.remove('table-primary')
        elem.classList.remove('aaaa')
      }
    }
  }

  // fixRow (row: ITableRow): void {
  //   if (this.datakey === 'productId') {
  //     this.rowIdent = row.item.productId
  //   } else {
  //     this.rowIdent = row.item.ident
  //   }
  //   // eslint-disable-next-line no-console
  //   // console.log('rowIdent', this.rowIdent)

  //   if (typeof this.rowIdent === 'string') {
  //     row.rowSelected = this.selection.includes(this.rowIdent)
  //     const elem = document.getElementById(`${this.id}__row_${this.rowIdent}`)
  //     if (elem) { elem.classList.remove('table-active') }
  //     // else { console.debug('row is null', `${this.id}__row_${this.rowIdent}`) }
  //     if (row.rowSelected) {
  //       row.item._rowVariant = 'primary'
  //       if (elem) {
  //         elem.classList.add('b-table-row-selected')
  //         elem.classList.add('table-primary')
  //         elem.classList.add('aaaa')
  //       }
  //     } else {
  //       row.item._rowVariant = ''
  //       if (elem) {
  //         elem.classList.remove('table-active')
  //         elem.classList.remove('b-table-row-selected')
  //         elem.classList.remove('table-primary')
  //       }
  //     }
  //   }
  //   // row.rowSelected = this.selection.includes(row.item.ident)
  //   // if (row.rowSelected) {
  //   //   const elem = document.getElementById(`__row_${row.item.ident}`)
  //   //   if (elem) { elem.classList.add('b-table-row-selected') }
  //   //   row.item._rowVariant = 'primary'
  //   // } else {
  //   //   const elem = document.getElementById(`__row_${row.item.ident}Major`)
  //   //   if (elem) { elem.classList.remove('b-table-row-selected') }
  //   //   row.item._rowVariant = ''
  //   // }
  // }

  rowChanged (item: ITableDataItem) {
    if (this.ismultiselect) {
      const selectionCopy:Array<string> = [...this.selection]
      // for (const el in document.querySelector('.table tr') as ) {
      //   el.classList.remove('table-active')
      // }

      if (this.datakey === 'productId' && item.productId) {
        if (selectionCopy.includes(item.productId)) {
          selectionCopy.splice(selectionCopy.indexOf(item.productId), 1)
        } else {
          selectionCopy.push(item.productId)
        }
      } else if (item.depotId && selectionCopy.includes(item.depotId)) {
        selectionCopy.splice(selectionCopy.indexOf(item.depotId), 1)
      } else if (item.clientId && selectionCopy.includes(item.clientId)) {
        selectionCopy.splice(selectionCopy.indexOf(item.clientId), 1)
      } else if (item.depotId) {
        selectionCopy.push(item.depotId)
      } else if (item.clientId) {
        selectionCopy.push(item.clientId)
      }

      // if (selectionCopy.includes(item.ident)) {
      //   selectionCopy.splice(selectionCopy.indexOf(item.ident), 1)
      // } else {
      //   selectionCopy.push(item.ident)
      // }
      this.onchangeselection(selectionCopy)

      // const elem = document.getElementById(`${this.id}__row_${this.rowIdent}`)
      // if (elem) { elem.classList.remove('table-active') }
      // else { console.debug('row is null', `${this.id}__row_${this.rowIdent}`) }
    } else {
      this.routechild(item.productId)
    }
  }
}
</script>

<style>
.fixed_column_selection{
  float: right;
}
/* .table-active, .table-active > th, .table-active > td {
  background-color: unset !important;
} */

.b-table-row-selected.table-primary{
  background-color: #7aafca !important;
  /* background-color: var(--primary) !important; */
  /* background-color: inherit !important; */
}
.table-primary, .table-primary > td, .table-primary > th {
  background-color: #7aafca !important;
}

/* .table.b-table > tbody > .table-active, .table.b-table > tbody > .table-active > th, .table.b-table > tbody > .table-active > td,
.table-active, .table-active > td, .table-active > th {
  background-color: unset;
} */
</style>
