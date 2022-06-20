<template>
  <div data-testid="TInfiniteScroll" class="TInfiniteScrollWrapper" :class="{loadingCursor: isLoading}">
    <p v-if="error">
      {{ error }}
    </p>
    <b-table
      v-else
      :id="id"
      :ref="id"
      v-b-scrollspy
      :stacked="$mq=='mobile'"
      :primary-key="id"
      class="TInfiniteScroll"
      :class="{ firstpage: isFirstPage,
                lastpage: isLastPage,
                mobileview: $mq=='mobile',
                singleRowTable: items.length <8 && items.length > 0}"
      sticky-header
      show-empty
      responsive
      :fields="Object.values(headerData).filter((h) => { return (h.visible || h._fixed) })"
      :items="items"
      selectable
      selected-variant=""
      :select-mode="selectmode"
      sort-icon-left
      :per-page="tableData.perPage"
      :no-local-sorting="true"
      :sort-by.sync="tableData.sortBy"
      :sort-desc.sync="tableData.sortDesc"
      @row-clicked="onRowClicked"
    >
      <template v-if="totalpages > 1" #top-row="{ columns }">
        <b-th :colspan="columns" class="tablehead">
          <span class="scrollcaption"> {{ $t('table.infinit.scrollup') }} </span>
        </b-th>
      </template>
      <template v-if="totalpages > 1" #bottom-row="{ columns }">
        <b-th :colspan="columns" class="tablefooter">
          <span class="scrollcaption"> {{ $t('table.infinit.scrolldown') }} </span>
        </b-th>
      </template>

      <template #empty>
        {{ (isLoading) ? '' : $t('table.emptyText') }}
      </template>
      <template #head()="data">
        <small> <b>{{ data.label }} </b> </small>
      </template>
      <template #head(selected)>
        <small v-if="rowident !== 'productId'"> <b>
          {{ $t('count/all', {count:selection.length, all:totalItems||0}) }}
          <!-- {{ selection.length }}/{{ totalItems|| 0 }}  -->
        </b> </small>
        <ButtonBTNClearSelection v-if="selection.length>0" class="clearselection-btn" :clearselection="clearSelected" :show-label="false" />
      </template>
      <template #head(rowactions)>
        <b-button-group>
          <DropdownDDTableSorting :table-id="id" :sort-by.sync="tableData.sortBy" :sort-desc.sync="tableData.sortDesc" :header-data.sync="headerData" variant="outline-primary" />
          <!-- <DropdownDDTableColumnVisibility :table-id="id" :headers="headerData" /> -->
          <DropdownDDTableColumnVisibility :table-id="id" :headers.sync="headerData" :sort-by="tableData.sortBy" :multi="true" variant="outline-primary" />
        </b-button-group>
      </template>
      <template #cell(rowactions)="row">
        <b-button-group v-if="headerData.rowactions.mergeOnMobile!==true || $mq!=='mobile'">
          <slot name="rowactions" v-bind="row" />
        </b-button-group>
      </template>
      <template #cell(selected)="row">
        <b-icon v-if="selection.includes(row.item[rowident])" :icon="iconnames.tablerowSelected" class="selectionitem selected" />
        <b-icon v-else-if="$mq=='mobile'" :icon="iconnames.tablerowNotSelected" class="selectionitem not-selected" />
        {{ fixRow(row) }}
      </template>
      <template
        v-for="slotName in Object.keys($scopedSlots)"
        #[slotName]="slotScope"
      >
        <slot :name="slotName" v-bind="slotScope" />
      </template>
    </b-table>
    <BarBTableFooter :pagination="{ tableData: tableData, totalRows:totalItems, totalpages:totalpages }" />
    <!-- </BarBTableFooter> -->
    <b-overlay :show="isLoading" no-wrap opacity="0.5" />
  </div>
</template>

<script lang="ts">
import { Component, namespace, Prop, Vue, Watch } from 'nuxt-property-decorator'
import { ITableHeaders, ITableData, ITableDataItem, ITableRow } from '../../.utils/types/ttable'
import { Constants } from '../../mixins/uib-mixins'
const cache = namespace('data-cache')

@Component({ mixins: [Constants] })
export default class TInfiniteScroll extends Vue {
  iconnames: any
  $axios: any
  $mq: any
  scrolltop: number = 190
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

  get tableScrollBody () { return (this.$refs[this.id] as any)?.$el }
  get isFirstPage () { return this.totalpages > 0 && this.tableData.pageNumber === 1 }
  get isLastPage () { return this.tableData.pageNumber === this.totalpages }
  get selectmode () { return (this.ismultiselect) ? 'range' : 'single' }

  @Watch('tableData', { deep: true }) tableDataChanged () { this.addScrollEvent() }
  @Watch('items', { deep: false }) pageChanged () { this.scrollTop() }

  async fetch () { await this.fetchitems() }

  // @Watch('tableInfo', { deep: true }) sortPropChanged () { this.syncSort(this.tableInfo, this.tableData, false, this.id) }
  mounted () {
    // if (this.$mq === 'mobile') {
    //   this.headerData.selected._fixed = false
    //   this.headerData.selected.visible = false
    // }
    this.addScrollEvent()
  }

  beforeDestroy () {
    window.removeEventListener('scroll', this.onScroll)
  }

  addScrollEvent () {
    try {
      this.tableScrollBody.removeEventListener('scroll', this.onScroll)
    } catch (error) {
      console.warn('cannot remove event listener', this.tableData)
    }
    try {
      this.tableScrollBody.addEventListener('scroll', this.onScroll)
    } catch (error) {
      console.warn('cannot add event listener', this.tableData)
    }
  }

  scrollTop () {
    if (!this.tableScrollBody) {
      return
    }
    if (this.isFirstPage) {
      this.tableScrollBody.scrollTop = 0
    } else {
      this.tableScrollBody.scrollTop = this.scrolltop
    }
  }

  async previousPage () {
    if (!this.isLoading) {
      if (this.tableData.pageNumber === 1) {
        return
      }
      this.tableData.pageNumber--
      await this.fetchitems()
    }
  }

  async nextPage () {
    if (!this.isLoading) {
      if (this.tableData.pageNumber === this.totalpages) {
        return
      }
      this.tableData.pageNumber++
      await this.fetchitems()
    }
  }

  async onScroll (event) {
    if (event.target && // On Scroll Up
      event.target.scrollTop === 0) {
      await this.previousPage()
    } else if (event.target && // On Scroll Down
      event.target.scrollTop + event.target.clientHeight + this.scrolltop >=
          event.target.scrollHeight
    ) {
      await this.nextPage()
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
        this.setselection([ident])
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
.TInfiniteScroll.b-table-sticky-header {
  max-height: 70vh;
}
.singleRowTable.b-table-sticky-header {
  max-height: 15vh;
}
.mobileview.table-responsive {
  max-height: 70vh;
}
.singleRowTable.mobileview.table-responsive {
  max-height: 17vh;
}

/* .mobile .table-responsive { min-height: 90vh;  height: 90vh;}
.singleRowTable .mobile .table-responsive { min-height: 12vh;  height: 12vh;} */
/* .mobile .table-responsive { min-height: 90vh;  height: 90vh;}
.desktop :not(.tab-pane) .table-responsive { max-height: 75vh; }
.desktop .tab-pane .table-responsive { max-height: 70vh; } */

.table.b-table > thead > tr > .table-b-table-default, .table.b-table > tbody > tr > .table-b-table-default, .table.b-table > tfoot > tr > .table-b-table-default {
  /* each header cell */
  color: inherit;
  background-color: inherit;
}
.TInfiniteScroll{
  padding-bottom: 70px;
  /* min-height: 350px; */
}
.TInfiniteScroll .table td,
.TInfiniteScroll .table th {
    /* border-top: 0px solid #000; */
    border-top: 1px solid var(--table-border);
}
.mobileview.TInfiniteScroll .table td,
.mobileview.TInfiniteScroll .table th {
  border-top: 0px;
}
.TInfiniteScroll thead > tr > th{
  margin-top: 5px;
}
.TInfiniteScrollWrapper {
  /* padding-bottom: 50px; */
}
.TInfiniteScroll .clearselection-btn {
  padding: 0px !important;
}
.TInfiniteScroll .table thead th,
.TInfiniteScroll .table thead td {
  padding: 0.40rem;
}
.data-transfer-status-table
  .b-table-sticky-header
  > .table.b-table
  > thead
  > tr
  > th:not(.v-th) {
  top: 32px;
}
.TInfiniteScroll.b-table-sticky-header thead th {
  /* border: -1px solid green !important; */
}
.TInfiniteScroll> .b-table-stacked > tbody > tr:first-of-type {margin-top: 200px !important;}
.TInfiniteScroll> .b-table-stacked > tbody > tr:last-of-type {margin-bottom: 200px !important;}
.TInfiniteScroll.firstpage> .b-table-stacked > tbody > tr:first-of-type {margin-top: 0px !important;} /** no margin for first page in mobile view */
.TInfiniteScroll.firstpage .b-table-top-row {display: none;} /** no top-row if first page in desktop view */

.TInfiniteScroll> .b-table-stacked > tbody > tr:first-of-type {margin-top: 200px !important;}
.TInfiniteScroll> .b-table-stacked > tbody > tr:last-of-type {margin-bottom: 200px !important;}
.TInfiniteScroll.lastpage> .b-table-stacked > tbody > tr:last-of-type {margin-top: 0px !important;}
.TInfiniteScroll.lastpage .b-table-bottom-row { display: none;}

.tablehead {
  padding-top: 200px !important;
  text-align: center;
}
.tablefooter {
  padding-bottom: 200px !important;
  text-align: center;
}
.scrollcaption {
  text-align: center;
  height: 200px;
  margin-top: 200px;
  color: var(--color, #6c757d);
  font-size: small;
}

.b-table-sticky-header thead > tr:last-child{
  background-color: var(--background, white);
}

th .btn-group .btn-outline-primary,
th .btn-group .btn-outline-primary:hover,
td .btn-group .btn-outline-primary,
td .btn-group .btn-outline-primary:hover {
  border: unset !important; /* removes border artifacts in rowactions buttons*/
  border-color: unset !important; /* removes border artifacts in rowactions buttons*/
}
thead .col-rowactions {
  padding-left: 12px !important;
}

.btn-group .moreActions.dropdown {
  max-width:30px !important;
}
.btn-group .moreActions > .btn {
  width:33px !important;
  padding: 0px;
}
.mobile .mobileVisibleOnlySelection {
  display: none !important;
}
.mobile .table.b-table.b-table-stacked > tbody > tr {
  border-top: 1px solid var(--dark) !important;
}
</style>
