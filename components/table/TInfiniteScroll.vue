<template>
  <div data-testid="TInfiniteScroll">
    <p v-if="error">
      {{ error }}
    </p>
    <b-table
      v-else
      :id="id"
      :ref="id"
      :primary-key="id"
      :class="{smalltable: items.length <10 && items.length > 0,
               infinitescrolltable: items.length > 10,
               tableproducts: rowident === 'productId',
               noscroll: totalItems < tableData.perPage}"
      sticky-header
      show-empty
      responsive
      :fields="Object.values(headerData).filter((h) => { return (h.visible || h._fixed) })"
      :items="items"
      selectable
      selected-variant=""
      :select-mode="selectmode"
      sort-icon-left
      :no-local-sorting="true"
      :sort-by.sync="tableData.sortBy"
      :sort-desc.sync="tableData.sortDesc"
      @row-clicked="onRowClicked"
    >
      <template #empty>
        --
      </template>
      <template #head()="data">
        <small> <b>{{ data.label }} </b> </small>
      </template>
      <template #head(selcted)="{}">
        <small v-if="rowident !== 'productId'"> <b> {{ selection.length }}/{{ totalItems }} </b> </small>
        <ButtonBTNClearSelection v-if="selection.length>0" :clearselection="clearSelected" />
      </template>
      <template #head(rowactions)="{}">
        <DropdownDDTableColumnVisibilty :table-id="id" :headers="headerData" />
      </template>
      <template #cell(selected)="row">
        <b-icon v-if="selection.includes(row.item[rowident])" :icon="iconnames.tablerowSelected" />
        {{ fixRow(row) }}
      </template>
      <template
        v-for="slotName in Object.keys($scopedSlots)"
        #[slotName]="slotScope"
      >
        <slot :name="slotName" v-bind="slotScope" />
      </template>
    </b-table>
    <span v-if="items.length>0" class="tablefooter">Showing Page {{ tableData.pageNumber }} / {{ totalpages }}</span>
    <b-overlay :show="isLoading" no-wrap opacity="0.5" />
  </div>
</template>

<script lang="ts">
import { Component, namespace, Prop, Vue } from 'nuxt-property-decorator'
import { ITableHeaders, ITableData, ITableDataItem, ITableRow } from '../../.utils/types/ttable'
import { Constants } from '../../mixins/uib-mixins'
const cache = namespace('data-cache')

@Component({ mixins: [Constants] })
export default class TInfiniteScroll extends Vue {
  iconnames: any
  $axios: any
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
  @Prop({ default: () => { return () => { /* default */ } } }) routechild!: Function
  @Prop({ default: () => { return () => { /* default */ } } }) headerData!: ITableHeaders
  @Prop({ }) tableData!: ITableData
  @Prop({ }) items!: Array<any>

  @cache.Getter public opsiconfigserver!: string
  get selectmode () {
    if (this.ismultiselect) {
      return 'multi'
    } else { return 'single' }
  }

  async fetch () {
    await this.fetchitems()
  }

  mounted () {
    // this.$nextTick(() => {
    const tableScrollBody = (this.$refs[this.id] as any).$el
    // const tableScrollBody = (this.$root.$children[2].$refs.LayoutDefaultContent as any)
    tableScrollBody.addEventListener('scroll', this.onScroll)
    // })
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
    const elem = document.getElementById(`${this.id}__row_${this.rowident}`)
    if (row.rowSelected) {
      row.item._rowVariant = 'primary'
      if (elem) {
        // elem.setAttribute('aria-selected', 'true')
        elem.classList.add('b-table-row-selected')
      }
    } else {
      row.item._rowVariant = ''
      if (elem) {
        // elem.setAttribute('aria-selected', 'false')
        elem.classList.remove('b-table-row-selected')
      }
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
    }
    if (!this.ismultiselect) {
      if (this.rowident === 'productId') {
        this.routechild(ident)
      } else if (selectionCopy.includes(ident)) {
        this.setselection([])
      } else {
        this.setselection([ident])
      }
    }
  }

  clearSelected () {
    this.setselection([])
    if (this.rowident === 'depotId') {
      this.setselection([this.opsiconfigserver])
    }
  }
}
</script>

<style>
.tablefooter {
  color: black;
  font-size: 12px;
}
.infinitescrolltable.b-table-sticky-header {
  /* max-height: 65vh; */
  max-height:650px;
}
.tableproducts.b-table-sticky-header {
  /* max-height: 60vh; */
  max-height:610px;
}
.smalltable.b-table-sticky-header {
  max-height: 12vh;
}
.noscroll.b-table-sticky-header {
  max-height: 70vh;
}
</style>
