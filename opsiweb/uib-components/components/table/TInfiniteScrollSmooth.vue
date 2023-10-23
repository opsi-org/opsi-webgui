<template>
  <div>
    <div v-if="$mq == 'mobile'" class="d-flex flex-nowrap">
      <ButtonBTNClearSelection v-if="selection.length>0" class="clearselection-btn" :clearselection="clearSelected" :show-label="false" />
      <slot name="producttableheader" />
    </div>
    <div
      :id="'TInfiniteScrollSmoothWrapper_' + id"
      data-testid="TInfiniteScrollSmooth"
      class="TInfiniteScrollSmoothWrapper"
      :class="{
        loadingCursor: isLoading,
        empty: cache_pages.flat().length <= 0
      }"
    >
      <p v-if="error">
        {{ error }}
      </p>
      <b-table
        v-else
        :id="id"
        :ref="id"
        v-b-scrollspy
        :stacked="$mq=='mobile'"
        :primary-key="rowident"
        class="TInfiniteScrollSmooth"
        :class="{ firstpage: isFirstPage,
                  lastpage: isLastPage,
                  mobileview: $mq=='mobile',
                  isLoading: isLoading,
        }"
        sticky-header
        show-empty
        small
        responsive
        hover
        :fields="Object.values(headerData).filter((h) => { return (h.visible || h._fixed) })"
        :items="cache_pages.flat()"
        selectable
        selected-variant=""
        select-mode="range"
        sort-icon-left
        :per-page="tableData.perPage*cache_pages.max_elements"
        :no-local-sorting="true"
        :sort-by.sync="tableData.sortBy"
        :sort-desc.sync="tableData.sortDesc"
        @row-clicked="onRowClicked"
        @row-contextmenu="contextOpen"
      >
        <template v-if="totalpages > 1" #top-row="{ columns }">
          <b-th :colspan="columns" class="tablehead">
            <span class="scrollcaption"> {{ $t('table.infinit.scrollup') }} </span>
          </b-th>
        </template>
        <template v-if="totalpages > 1" #bottom-row="{ columns }">
          <b-th v-if="isLastPage" :colspan="columns" class="tablefooter_lastpage" />
          <b-th v-else :colspan="columns" class="tablefooter">
            <span class="scrollcaption"> {{ $t('table.infinit.scrolldown') }} </span>
          </b-th>
        </template>

        <template #empty>
          <small>{{ (isLoading) ? '' : $t('table.emptyText') }}</small>
        </template>
        <template #head()="data">
          <small> <b>{{ data.label }} </b> </small>
        </template>
        <template #cell()="data">
          <small>{{ data.value }}</small>
        </template>
        <template #head(selected)>
          <small>
            <b v-if="rowident !== 'productId'" class="count">
              {{ t_fixed('keep-english.count/all').replace('count',selection.length).replace('all', totalItems||0) }}
            </b>
            <ButtonBTNClearSelection :disabled="selection.length<1" class="clearselection-btn" :clearselection="clearSelected" :show-label="false" short />
          </small>
        </template>
        <template #cell(rowactions)="row">
          <b-button-group
            v-if="headerData.rowactions.mergeOnMobile!==true || $mq!=='mobile'"
            :class="{'row-selected': selection.includes(row.item[rowident])}"
            size="sm"
          >
            <slot name="rowactions" v-bind="row" />
          </b-button-group>
        </template>
        <template #cell(selected)="row">
          <small>
            <b-icon v-if="selection.includes(row.item[rowident])" :icon="icon.check" class="selectionitem selected" />
            <b-icon v-else-if="$mq=='mobile'" :icon="icon.dash" class="selectionitem not-selected" />
          </small>
          {{ fixRow(row) }}
        </template>
        <template
          v-for="slotName in Object.keys($scopedSlots)"
          #[slotName]="slotScope"
        >
          <slot :name="slotName" v-bind="slotScope" />
        </template>
      </b-table>
      <BarBTableFooter v-if="cache_pages.flat().length>0" :pagination="{ tableData, cache_pages, totalpages, totalRows:totalItems }" />
      <OverlayOLoading :is-loading="isLoading" />
      <br>
      <ContextmenuCMViewTable ref="contextmenu" :context-clienttable="id=='Clients'" :primary-key="rowident">
        <template
          v-for="slotName in contextSlots"
          #[slotName]="slotScope"
        >
          <slot :name="slotName" v-bind="slotScope" />
        </template>
      </ContextmenuCMViewTable>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, namespace, Prop, Vue, Watch } from 'nuxt-property-decorator'
import { ITableHeaders, ITableData, ITableDataItem, ITableRow } from '../../.utils/types/ttable'
import QueueNested from '../../.utils/utils/QueueNested'
import { Icons } from '../../mixins/icons'
import { Strings } from '../../mixins/strings'
const cache = namespace('data-cache')
//  TODO Fix Scrolling for Netboot
@Component({ mixins: [Icons, Strings] })
export default class TInfiniteScrollSmooth extends Vue {
  icon: any
  t_fixed: any
  $axios: any
  $mq: any
  @Prop({ }) error!: string
  @Prop({ }) isLoading!: boolean
  @Prop({ }) id!: string
  @Prop({ }) rowident!: string
  @Prop({ }) totalpages!: number
  @Prop({ }) totalItems!: number
  @Prop({ }) tableData!: ITableData
  @Prop({ }) cache_pages!: QueueNested
  @Prop({ default: () => { return [] } }) readonly selection!: Array<string>
  @Prop({ default: () => { return () => { /* default */ } } }) fetchitems!: Function // TODO remove fetchitems
  @Prop({ default: () => { return () => { /* default */ } } }) setselection!: Function
  @Prop({ default: () => { return () => { /* default */ } } }) routechild!: Function
  @Prop({ default: () => { return () => { /* default */ } } }) headerData!: ITableHeaders
  isScrolling = false
  scroll_sleep_ms: number = 5
  elementBeforeFetch:any = undefined
  scrollDownOffset: number = 50 // how sensitive the scroll is to fetch a new page (start and end of table)
  animationColor = 'var(--hover)' // to see the last element before fetch
  bgOriginal:string = '' // to restore the original background color of the table row
  scrollPositions = { offsetBottom: 0, topPagePrev: 0, withTopSpace: false }

  @cache.Getter public opsiconfigserver!: string

  get contextSlots () { return Object.keys(this.$scopedSlots).filter(k => k.startsWith('contextcontent')) }
  get tableScrollBody () { return (this.$refs[this.id] as any)?.$el }
  get isFirstPage () { return this.totalpages > 0 && (this.tableData.pageNumber === 1 || this.cache_pages.first_page_number === 1) }
  get isLastPage () {
    return (this.tableData.pageNumber === this.totalpages || this.cache_pages.first_page_number === this.totalpages || this.cache_pages.last_page_number >= this.totalpages)
  }

  @Watch('tableData', { deep: true }) tableDataChanged () { this.addScrollEvent() }
  @Watch('cache_pages.elements', { deep: false }) async pageChanged () {
    let el = this.tableScrollBody
    if (this.cache_pages.scrollDirection !== 'none') {
      el = this.elementBeforeFetch
    }
    const lastScrollDirection = this.cache_pages.scrollDirection
    Vue.nextTick(() => { // scroll to element
      this.scrollToElement(el, this.cache_pages.scrollDirection)
      this.cache_pages.scrollDirection = 'none'
    })
    const x = this.getRowForAnimation(lastScrollDirection, false)
    if (x) {
      x.style.border = '1px solid ' + this.animationColor
      await this.animateColor(x, this.animationColor, true, true, false)
    }
  }

  mounted () {
    this.addScrollEvent()
  }

  beforeDestroy () {
    try {
      // window.removeEventListener('scroll', this.onScroll)
      this.tableScrollBody.removeEventListener('scroll', this.onScroll)
    } catch (error) {
      // console.warn('error removing scrolllistener: ', error)
    }
  }

  addScrollEvent () {
    try {
      this.tableScrollBody.removeEventListener('scroll', this.onScroll)
    } catch (error) {
      // console.warn('cannot remove event listener', this.tableData)
    }
    try {
      this.tableScrollBody.addEventListener('scroll', this.onScroll)
    } catch (error) {
      // console.warn('cannot add event listener', this.tableData)
    }
  }

  async previousPage () {
    if (this.isLoading || this.isScrolling) { return }
    this.isScrolling = true // cause isLoading is not enough
    this.$emit('update:isLoading', true)
    if (this.tableData.pageNumber <= 1) {
      this.isScrolling = false
      return
    }

    // animate background color for first element (before fetch) so user can see the last first element
    this.cache_pages.scrollDirection = 'up'
    this.elementBeforeFetch = await this.getRowForAnimation(this.cache_pages.scrollDirection, true) // default

    // get scroll position to jump there again after fetching
    this.scrollPositions.withTopSpace = this.cache_pages.first_page_number > 1
    if (this.cache_pages.length === 1) {
      // this.scrollPositions.withTopSpace = this.tableData.pageNumber > 1
      this.scrollPositions.topPagePrev = this.tableScrollBody.offsetTop
    }
    if (!this.isFirstPage) {
      await this.animateColor(this.elementBeforeFetch, this.animationColor, false, true, true)
    }

    // get prev page (actually triggered by updating tableData pageNumber)
    const newPageNumber = this.cache_pages.first_page_number - 1
    if (newPageNumber > 0) {
      this.tableData.pageNumber = newPageNumber
    }

    // scroll back triggered by Watcher
    this.isScrolling = false
    this.$emit('update:isLoading', false)
  }

  async nextPage () {
    if (this.isLoading || this.isScrolling) { return }
    this.isScrolling = true
    this.$emit('update:isLoading', true)
    if (this.tableData.pageNumber >= this.totalpages) {
      this.$emit('update:isLoading', false)
      this.isScrolling = false
      return
    }
    // animate background color for first element (before fetch) so user can see the last first element
    this.cache_pages.scrollDirection = 'down'
    this.elementBeforeFetch = this.getRowForAnimation(this.cache_pages.scrollDirection, true) // default
    // get scroll position to jump there again after fetching
    this.scrollPositions.withTopSpace = this.cache_pages.first_page_number > 1
    if (this.cache_pages.length === 1) {
      // this.scrollPositions.withTopSpace = this.tableData.pageNumber > 1
      this.scrollPositions.offsetBottom = this.tableScrollBody.scrollTop
    }
    await this.animateColor(this.elementBeforeFetch, this.animationColor, false, true, true)

    // get next page (actually triggered by updating tableData pageNumber)
    const newPageNumber = this.cache_pages.last_page_number + 1
    if (newPageNumber <= this.totalpages) {
      this.tableData.pageNumber = newPageNumber
    }
    // scroll back triggered by Watcher
    this.isScrolling = false
    this.$emit('update:isLoading', false)
  }

  getRowForAnimation (direction = 'up', beforeFetch = true) {
    if (direction === 'none') { return }
    let rowid = ''
    let page = 0
    let lastPageIndex = this.cache_pages.elements.length - 1
    if (!beforeFetch) {
      page = 1
      lastPageIndex = 0
    }
    if (!this.cache_pages.elements?.[page]?.[0]) { return }

    if (direction === 'up') {
      rowid = this.cache_pages.elements[page][0][this.rowident]
    } else if (direction === 'down') {
      const lastRowIndex = this.cache_pages.elements[lastPageIndex].length - 1
      rowid = this.cache_pages.elements[lastPageIndex][lastRowIndex][this.rowident]
    }
    return document.getElementById(`${this.id}__row_${rowid}`)
  }

  async animateColor (el, bgcolor = 'var(--hover)', animation = true, cleanupAttributes = true, storeBGColor = false) {
    // change bg of given element/row
    if (!el) { return }
    if (storeBGColor === true) {
      this.bgOriginal = el.style.backgroundColor // cache last color
    }

    el.style.backgroundColor = bgcolor

    if (animation) {
      await (new Promise(resolve => setTimeout(resolve, this.scroll_sleep_ms)))
      el.style.transitionProperty = 'background-color'
      el.style.transitionDuration = this.scroll_sleep_ms + 's'
      await (new Promise(resolve => setTimeout(resolve, this.scroll_sleep_ms)))

      if (cleanupAttributes) {
        el.style.backgroundColor = this.bgOriginal
        el.style.removeProperty('transitionProperty')
        el.style.removeProperty('transitionDuration')
      }
    }
  }

  scrollToElement (el, direction = 'none') {
    if (!this.tableScrollBody || !el) { return }
    // const toprowHeight = document.querySelector('.b-table-top-row')?.getBoundingClientRect()?.height || 0 // space for scrolling up
    const elToprowHeight = document.querySelector('#TInfiniteScrollSmoothWrapper_' + this.id + ' .b-table-top-row') // space for scrolling up
    const toprowHeight = elToprowHeight?.getBoundingClientRect()?.height ?? 0 // space for scrolling up
    if (this.cache_pages.max_elements === 1 || direction === null || direction === undefined || direction === 'none') {
      // direction = none if trigger e.g. by paginationbar buttons (jumps directly to a specific page)
      if (this.tableData.pageNumber === 1) {
        this.tableScrollBody.scrollTo({ top: 0 })
      } else {
        this.tableScrollBody.scrollTo({ top: toprowHeight - this.scrollDownOffset })
      }
      return
    }

    if (direction === 'up') {
      el.scrollIntoView({ block: 'start' })
      const scrollto = this.scrollPositions.topPagePrev + toprowHeight - this.scrollDownOffset // relative position of first element before fetch
      this.tableScrollBody.scrollBy({ top: -1 * scrollto })
    }
    if (direction === 'down') {
      let scrollto = this.scrollPositions.offsetBottom
      if (!this.scrollPositions.withTopSpace) {
        scrollto += toprowHeight
      }
      this.tableScrollBody.scrollTo({ top: scrollto })
    }
  }

  async onScroll (event) {
    if (!event.target) { return }
    const curScrollposition = event.target.scrollTop
    if (curScrollposition === 0) { // On Scroll Up
      await this.previousPage()
      return
    }

    const offetHeight = event.target.offsetHeight // event.target.clientHeight
    const curPos = curScrollposition + offetHeight
    const maxh = event.target.scrollHeight - this.scrollDownOffset
    if (curPos >= maxh) { // On Scroll Down
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
    if (selectionCopy.includes(ident)) {
      selectionCopy.splice(selectionCopy.indexOf(ident), 1)
    } else {
      selectionCopy.push(ident)
    }
    this.setselection(selectionCopy)
  }

  contextOpen (item, _, evt) {
    evt.preventDefault()
    if (this.$refs.contextmenu) {
      (this.$refs.contextmenu as any).openMenu(evt, item)
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
.theme-light .table.b-table > thead > tr > [aria-sort=none], .table.b-table > tfoot > tr > [aria-sort=none] {
    background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' width='101' height='101' view-box='0 0 101 101' preserveAspectRatio='none'%3e%3cpath fill='black' opacity='.3' d='M51 1l25 23 24 22H1l25-22zM51 101l25-23 24-22H1l25 22z'/%3e%3c/svg%3e");
}
.theme-light .table.b-table > thead > tr > [aria-sort=ascending], .table.b-table > tfoot > tr > [aria-sort=ascending] {
  background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' width='101' height='101' view-box='0 0 101 101' preserveAspectRatio='none'%3e%3cpath fill='black' d='M51 1l25 23 24 22H1l25-22z'/%3e%3cpath fill='black' opacity='.3' d='M51 101l25-23 24-22H1l25 22z'/%3e%3c/svg%3e")
}
.theme-light .table.b-table > thead > tr > [aria-sort=descending], .table.b-table > tfoot > tr > [aria-sort=descending] {
  background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' width='101' height='101' view-box='0 0 101 101' preserveAspectRatio='none'%3e%3cpath fill='black' opacity='.3' d='M51 1l25 23 24 22H1l25-22z'/%3e%3cpath fill='black' d='M51 101l25-23 24-22H1l25 22z'/%3e%3c/svg%3e");
}
.theme-dark .table.b-table > thead > tr > [aria-sort=none], .table.b-table > tfoot > tr > [aria-sort=none] {
    background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' width='101' height='101' view-box='0 0 101 101' preserveAspectRatio='none'%3e%3cpath fill='white' opacity='.3' d='M51 1l25 23 24 22H1l25-22zM51 101l25-23 24-22H1l25 22z'/%3e%3c/svg%3e");
}
.theme-dark .table.b-table > thead > tr > [aria-sort=ascending], .table.b-table > tfoot > tr > [aria-sort=ascending] {
  background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' width='101' height='101' view-box='0 0 101 101' preserveAspectRatio='none'%3e%3cpath fill='white' d='M51 1l25 23 24 22H1l25-22z'/%3e%3cpath fill='white' opacity='.3' d='M51 101l25-23 24-22H1l25 22z'/%3e%3c/svg%3e")
}
.theme-dark .table.b-table > thead > tr > [aria-sort=descending], .table.b-table > tfoot > tr > [aria-sort=descending] {
  background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' width='101' height='101' view-box='0 0 101 101' preserveAspectRatio='none'%3e%3cpath fill='white' opacity='.3' d='M51 1l25 23 24 22H1l25-22z'/%3e%3cpath fill='white' d='M51 101l25-23 24-22H1l25 22z'/%3e%3c/svg%3e");
}

.TInfiniteScrollSmoothWrapper{
  max-height: max-content;
}
.TInfiniteScrollSmoothWrapper .TInfiniteScrollSmooth {
  min-height: 450px !important;
  /* overflow: inherit !important; */
}
.TInfiniteScrollSmoothWrapper .TInfiniteScrollSmooth.b-table-sticky-header {
  max-height: 70vh;
}
.TInfiniteScrollSmoothWrapper .singleRowTable.b-table-sticky-header {
  max-height: 15vh;
}
.TInfiniteScrollSmoothWrapper .mobileview.table-responsive {
  max-height: 60vh;
}
.TInfiniteScrollSmoothWrapper .singleRowTable.mobileview.table-responsive {
  max-height: 17vh;
}

.TInfiniteScrollSmoothWrapper .table.b-table > thead > tr > .table-b-table-default, .table.b-table > tbody > tr > .table-b-table-default, .table.b-table > tfoot > tr > .table-b-table-default {
  color: inherit;
  background-color: inherit;
}
.TInfiniteScrollSmoothWrapper .TInfiniteScrollSmooth .table td,
.TInfiniteScrollSmoothWrapper .TInfiniteScrollSmooth .table th {
  border-top: 1px solid var(--table-border);
}
.TInfiniteScrollSmoothWrapper .mobileview.TInfiniteScrollSmooth .table td,
.TInfiniteScrollSmoothWrapper .mobileview.TInfiniteScrollSmooth .table th {
  border-top: 0px;
}
.TInfiniteScrollSmoothWrapper .TInfiniteScrollSmooth thead > tr > th{
  margin-top: 5px;
}
.TInfiniteScrollSmoothWrapper .TInfiniteScrollSmooth .clearselection-btn {
  padding: 0px !important;
}
.TInfiniteScrollSmoothWrapper .TInfiniteScrollSmooth .table thead th,
.TInfiniteScrollSmoothWrapper .TInfiniteScrollSmooth .table thead td {
  padding: 0.40rem;
}
.TInfiniteScrollSmoothWrapper .data-transfer-status-table
  .b-table-sticky-header
  > .table.b-table
  > thead
  > tr
  > th:not(.v-th) {
  top: 32px;
}
.TInfiniteScrollSmoothWrapper .TInfiniteScrollSmooth.isLoading> tbody {display: none} /** no margin for first page in mobile view */

.TInfiniteScrollSmoothWrapper .TInfiniteScrollSmooth> .b-table-stacked > tbody > tr:first-of-type {margin-top: 200px !important;}
.TInfiniteScrollSmoothWrapper .TInfiniteScrollSmooth> .b-table-stacked > tbody > tr:last-of-type {margin-bottom: 300px !important;}
.TInfiniteScrollSmoothWrapper .TInfiniteScrollSmooth.firstpage> .b-table-stacked > tbody > tr:first-of-type {margin-top: 0px !important;} /** no margin for first page in mobile view */
.TInfiniteScrollSmoothWrapper .TInfiniteScrollSmooth.firstpage .b-table-top-row {display: none;} /** no top-row if first page in desktop view */

.TInfiniteScrollSmoothWrapper .TInfiniteScrollSmooth .table.b-table.b-table-stacked > tbody > tr > [data-label]::before {
  font-weight: normal;
}

.TInfiniteScrollSmoothWrapper .TInfiniteScrollSmooth:not(.mobileview):not(.firstpage) .tablehead {
  padding-top: 200px !important;
  text-align: center;
}
.TInfiniteScrollSmoothWrapper .TInfiniteScrollSmooth:not(.mobileview):not(.lastpage) .tablefooter {
  padding-bottom: 400px !important;
  text-align: center;
}
.TInfiniteScrollSmoothWrapper .tablefooter_lastpage {
  padding-bottom: 600px !important;
  text-align: center;
}
.TInfiniteScrollSmoothWrapper .scrollcaption {
  text-align: center;
  height: 200px;
  margin-top: 200px;
  color: var(--primary, #6c757d);
  font-size: small;
}

.TInfiniteScrollSmoothWrapper .b-table-sticky-header thead > tr:last-child{
  background-color: var(--background, white);
}

/* .TInfiniteScrollSmoothWrapper tbody tr:hover .btn-group .btn-outline-primary {
  border-color: var(--bg-page_item-disabled) !important;
  color: var(--primary-foreground) !important;
}
.TInfiniteScrollSmoothWrapper tbody tr:hover .btn-group .btn-outline-primary:hover {
  border-color: var(--bg-page_item-disabled) !important;
  background-color: var(--primary) !important;
  color: var(--primary-foreground) !important;
} */
.TInfiniteScrollSmoothWrapper thead .col-rowactions {
  padding-left: 12px !important;
}

.TInfiniteScrollSmoothWrapper .btn-group .moreActions.dropdown {
  max-width:30px !important;
}
.TInfiniteScrollSmoothWrapper .btn-group .moreActions > .btn {
  width:33px !important;
  padding: 0px;
}
.mobile .TInfiniteScrollSmoothWrapper .mobileVisibleOnlySelection {
  display: none !important;
}
.mobile .TInfiniteScrollSmoothWrapper .table.b-table.b-table-stacked > tbody > tr {
  border-top: 1px solid var(--background) !important;
}
</style>
