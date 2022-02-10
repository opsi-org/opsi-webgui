<template>
  <div>
    <b-table
      :id="id"
      :ref="id"
      :primary-key="id"
      :class="items.length <10 && items.length > 0 ? 'smalltable' : 'infinitescrolltable'"
      sticky-header
      show-empty
      responsive
      :fields="Object.values(headerData).filter((h) => { return (h.visible || h._fixed) })"
      :items="items"
      selectable
      selected-variant=""
      :select-mode="selectmode"
      @row-clicked="onRowClicked"
    >
      <template #empty>
        --
      </template>
      <template #head(sel)="{}">
        {{ selection.length }}/{{ totalItems }}
        <b-button
          v-if="selection.length>0"
          v-b-tooltip.hover
          title="Clear selected"
          variant="light"
          size="sm"
          @click="clearSelected"
        >
          <b-icon-brush />
        </b-button>
      </template>
      <template #head(clientId)>
        <InputIFilter :data="tableData" :additional-title="$t('table.fields.id')" />
      </template>
      <template #head(rowactions)="{}">
        <DropdownDDTableColumnVisibilty table-id="table" :headers="headerData" />
      </template>
      <template #cell(sel)="row">
        <b-icon-check2 v-if="selection.includes(row.item.ident)" />
        {{ fixRow(row) }}
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
import { Component, Prop, Vue } from 'nuxt-property-decorator'
import { ITableHeaders, ITableData, ITableDataItem, ITableRow } from '../../.utils/types/ttable'
@Component
export default class Tbvtable extends Vue {
  @Prop({ }) id!: string
  @Prop({ }) totalItems!: number
  @Prop({ }) ismultiselect!: boolean
  @Prop({ default: () => { return [] } }) readonly selection!: Array<string>
  @Prop({ default: () => { return () => { /* default */ } } }) setselection!: Function
  @Prop({ default: () => { return () => { /* default */ } } }) headerData!: ITableHeaders
  @Prop({ }) tableData!: ITableData
  @Prop({ }) items!: Array<any>

  get selectmode () {
    if (this.ismultiselect) {
      return 'multi'
    } else { return 'single' }
  }

  fixRow (row: ITableRow): void {
    const rowIdent = row.item.ident as any
    row.rowSelected = this.selection.includes(rowIdent)
    const elem = document.getElementById(`${this.id}__row_${rowIdent}`)
    if (row.rowSelected) {
      row.item._rowVariant = 'primary'
      if (elem) {
        elem.classList.add('table-active')
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

  onRowClicked (item:ITableDataItem) {
    const ident = item.ident
    const selectionCopy:Array<string> = [...this.selection]
    if (this.ismultiselect) {
      if (selectionCopy.includes(ident)) {
        selectionCopy.splice(selectionCopy.indexOf(ident), 1)
      } else {
        selectionCopy.push(ident)
      }
      this.setselection(selectionCopy)
    } else if (selectionCopy.includes(ident)) {
      this.setselection([])
    } else {
      this.setselection([ident])
    }
  }

  clearSelected () {
    this.setselection([])
  }
}
</script>

<style>
.tablefooter {
  color: gray;
  font-size: 15px;
}
.infinitescrolltable.b-table-sticky-header {
  max-height: 70vh;
}
.smalltable.b-table-sticky-header {
  max-height: 10vh;
}
</style>
