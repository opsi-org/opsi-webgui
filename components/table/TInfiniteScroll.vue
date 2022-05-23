<template>
  <div data-testid="TInfiniteScroll" class="TInfiniteScrollWrapper">
    <p v-if="error" > {{error}} </p>
    <b-table
      v-else
      :id="id"
      :ref="id"
      :stacked="$mq=='mobile'"
      :primary-key="id"
      class="TInfiniteScroll"
      :class="{ firstpage: isFirstPage,
                lastpage: isLastPage }"
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
        <div style="min-width: 60px;">
          <small v-if="rowident !== 'productId'"> <b> {{ selection.length }}/{{ totalItems|| 0 }} </b> </small>
          <ButtonBTNClearSelection v-if="selection.length>0" class="clearselection-btn" :clearselection="clearSelected" :show-label="false" />
        </div>
      </template>
      <template #head(rowactions)>
        <!-- <DropdownDDTableColumnVisibility :table-id="id" :headers="headerData" /> -->
        <DropdownDDTableColumnVisibility :table-id="id" :headers.sync="headerData" :sort-by="tableData.sortBy" :multi="true" />
      </template>
      <template #cell(selected)="row">
        <b-icon v-if="selection.includes(row.item[rowident])" :icon="iconnames.tablerowSelected" />
        <b-icon v-else-if="$mq=='mobile'" :icon="iconnames.tablerowNotSelected" />
        {{ fixRow(row) }}
      </template>
      <template
        v-for="slotName in Object.keys($scopedSlots)"
        #[slotName]="slotScope"
      >
        <slot :name="slotName" v-bind="slotScope" />
      </template>
    </b-table>
    <BarBTableFooter :pagination="{ tableData: tableData, totalRows:totalItems, totalpages:totalpages }">
      <ButtonBTNRefetch :is-loading="isLoading" :tooltip="$t('button.refresh', {id: id})" :refetch="$fetch" />
    </BarBTableFooter>
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
  mounted () { this.addScrollEvent() }
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
      this.tableScrollBody.scrollTop = 190
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
      event.target.scrollTop + event.target.clientHeight >=
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
.table.b-table > thead > tr > .table-b-table-default, .table.b-table > tbody > tr > .table-b-table-default, .table.b-table > tfoot > tr > .table-b-table-default {
  /* each header cell */
  color: inherit;
  background-color: inherit;
}
.TInfiniteScroll{
  padding-bottom: 70px;
  min-height: 350px;
}
.TInfiniteScroll thead > tr > th{
  margin-top: 5px;
}
.TInfiniteScrollWrapper {
  padding-bottom: 50px;
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
.table-responsive {
  max-height: 66vh ;
}
.b-table-sticky-header thead > tr:last-child{
  background-color: var(--background, white);
}
</style>
