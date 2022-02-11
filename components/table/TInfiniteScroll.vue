<template>
  <div>
    <p v-if="error">
      {{ error }}
    </p>
    <b-table
      v-else
      :id="id"
      :ref="id"
      :primary-key="id"
      :class="items.length <10 && items.length > 0 ? 'smalltable' : 'infinitescrolltable'"
      sticky-header
      show-empty
      responsive
      :stacked="totalItems == 1"
      :borderless="totalItems == 1"
      :fields="Object.values(headerData).filter((h) => { return (h.visible || h._fixed) })"
      :items="items"
      selectable
      selected-variant=""
      :select-mode="selectmode"
      sort-icon-left
      @row-clicked="onRowClicked"
    >
      <template #empty>
        --
      </template>
      <template #head()="data">
        <small> <b>{{ data.label }} </b> </small>
      </template>
      <template #head(sel)="{}">
        <small> <b> {{ selection.length }}/{{ totalItems }} </b> </small>
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
      <template #head(rowactions)="{}">
        <DropdownDDTableColumnVisibilty :table-id="id" :headers="headerData" />
      </template>
      <template #cell(sel)="row">
        <b-icon-check2 v-if="selection.includes(row.item[rowident])" />
        {{ fixRow(row) }}
      </template>
      <template
        v-for="slotName in Object.keys($scopedSlots)"
        #[slotName]="slotScope"
      >
        <slot :name="slotName" v-bind="slotScope" />
      </template>
    </b-table>
    <span v-if="items.length>0" class="tablefooter">Showing {{ items.length }} {{ id }} from page {{ tableData.pageNumber }} / {{ totalpages }}</span>
    <b-overlay :show="isLoading" no-wrap opacity="0.5" />
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'nuxt-property-decorator'
import { ITableHeaders, ITableData, ITableDataItem, ITableRow } from '../../.utils/types/ttable'
@Component
export default class TInfiniteScroll extends Vue {
  @Prop({ }) error!: string
  @Prop({ }) isLoading!: boolean
  @Prop({ }) id!: string
  @Prop({ }) rowident!: string
  @Prop({ }) totalpages!: number
  @Prop({ }) totalItems!: number
  @Prop({ }) ismultiselect!: boolean
  @Prop({ default: () => { return [] } }) readonly selection!: Array<string>
  @Prop({ default: () => { return () => { /* default */ } } }) fetchitems!: Function
  @Prop({ default: () => { return () => { /* default */ } } }) setselection!: Function
  @Prop({ default: () => { return () => { /* default */ } } }) headerData!: ITableHeaders
  @Prop({ }) tableData!: ITableData
  @Prop({ }) items!: Array<any>

  get selectmode () {
    if (this.ismultiselect) {
      return 'multi'
    } else { return 'single' }
  }

  async fetch () {
    await this.fetchitems()
  }

  mounted () {
    this.$nextTick(() => {
      const tableScrollBody = (this.$refs[this.id] as any).$el
      tableScrollBody.addEventListener('scroll', this.onScroll)
    })
  }

  beforeDestroy () {
    const tableScrollBody = (this.$refs[this.id] as any).$el
    tableScrollBody.removeEventListener('scroll', this.onScroll)
  }

  onScroll (event) {
    if (this.items.length === 0) {
      const tableScrollBody = (this.$refs[this.id] as any).$el
      tableScrollBody.removeEventListener('scroll', this.onScroll)
    } else if ( // On Scroll Up
      event.target.scrollTop === 0) {
      if (!this.isLoading) {
        if (this.tableData.pageNumber === 1) {
          return
        }
        this.tableData.pageNumber--
        this.fetchitems()
        event.target.scrollTop = event.target.clientHeight - 5
      }
    } else if ( // On Scroll Down
      event.target.scrollTop + event.target.clientHeight >=
          event.target.scrollHeight
    ) {
      if (!this.isLoading) {
        if (this.tableData.pageNumber === this.totalpages) {
          return
        }
        this.tableData.pageNumber++
        this.fetchitems()
        event.target.scrollTop = 5
      }
    }
  }

  fixRow (row: ITableRow): void {
    const rowIdent = row.item[this.rowident] as any
    row.rowSelected = this.selection.includes(rowIdent)
    if (row.rowSelected) {
      row.item._rowVariant = 'primary'
    } else {
      row.item._rowVariant = ''
    }
  }

  onRowClicked (item:ITableDataItem) {
    const ident = item[this.rowident]
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
  max-height: 12vh;
}
</style>
