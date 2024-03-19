<template>
  <div>
    <div class="max-w-full" :class="{small: props.small !== false}">
      <!-- <pre class="max-h-56 ">{{ selection }}</pre> -->
      <!-- <pre class="max-h-56 ">{{ visibleColumns.map((v: any) => v.dataKey) }}</pre> -->
      <!-- <pre class="max-h-56 border-1 border-red-400">{{ columnValues }}</pre> -->
      <!-- <pre class="max-h-56 border-1 border-red-400">{{ Object.values(visibleColumns).filter(x => x.fixed === undefined || x.fixed === false || x._fixed === false ) }}</pre> -->
      <!-- <pre class="max-h-56 border-0 border-red-400 ">{{ lazyParams }}</pre> -->
      <!-- COLUMNSValues: <pre>{{ columnValues.length }}</pre>
      COLUMNS: <pre>{{ visibleColumns }}</pre> -->
      <!-- <pre class="max-h-56">{{ selectionInStoreByType }}</pre> -->
      <!-- <pre class="max-h-56">{{ Object.values(visibleColumns).map(v => v.key) }}</pre> <br />
      <pre class="max-h-56">{{ Object.values(columnsModel).map(v => v.key) }}</pre> <br /> -->
      <!-- <pre class="max-h-56">{{ visibleColumns }}</pre> -->
      <!-- class="bg-green-500"
      tableClass="bg-transparent" -->
      <DataTable
        lazy
        ref="tableRef"
        scrollable scrollHeight="400px"
        tableStyle="width: 100%" size="small"
        class="bg-transparent "
        style="width: calc(100% - 5px)"
        resizableColumns
        :dataKey="props.rowId"
        :value="dataModel"
        :row-class="(d) => { return {
          '!w-full': true,
          'noHoverRow min-h-48 h-48': d.direction !== undefined,
          'align-bottom': d.direction === 'prev',
          'align-top': d.direction === 'next',
          'noHoverRow min-h-10 h-10 hover:bg-transparent': d.dummy && d.direction === undefined
          // [(!d.dummy) ? '': (!d.direction) ? '' : 'min-h-48 h-48 ' + (d.direction == 'prev' ? 'align-bottom' : ' align-top')]: true
        }}"
        :highlight-on-select="false"
        v-model:selection="selection" :metaKeySelection="false"
        :sortField="props.tableData.sortBy" :sortOrder="props.tableData.sortDesc ? -1: 1"
        :virtual-scroller-options="{ itemSize: 46 }"
        @update:sort-field="log().log('sortfield changed')"
        @update:sort-order="log().log('sortorder changed')"
        @sort="onSort($event)"
        @row-click="rowEventHandlers.onClick"
        >
        <!-- :virtual-scroller-options="{ lazy: true, onLazyLoad: onVirtualScrollerLoad, itemSize: 10, delay: 1000, showLoader: false, loading: lazyLoading, numToleratedItems: perPage / 2 }" -->
        <!-- :virtualScrollerOptions="virtualScrollerOptions" -->
        <!-- @rowSelect="rowEventHandlers.onClick"
        @rowUnselect="rowEventHandlers.onClick" -->
        <!-- :virtual-scroller-options="{onScroll: onScroll}" -->
        <!-- :onscroll="onScroll" -->
        <template #header>
          <div class="flex justify-content-between">
            <div>
              <h4>{{ props.id }}</h4>
            </div>
            <div class="flex">
              <FormitemDDTableColumnVisibility :table-id="props.id" v-model:headers="columnsModel" :sort-by="props.tableData.sortBy" :multi="true" :incontextmenu="false"/>
              <InputIFilter
              :data="tableData"

              :filterable-columns="Object.values(wrappedColumns)"
              @update="($event: any) => $emit('update-input-filter', $event)"
              />
            </div>
          </div>
        </template>
        <template #footer>
          <!-- <Paginator :rows="props.tableData.perPage" :total-records="props.totalItems" :rowsPerPageOptions="[1, 5, 10, 20, 50, 100, 1000]"
            class="bg-transparent"
            pt:row-per-page-dropdown:id="MY-DROPDOWN-PERPAGE"

            @update:first="onPage($event)"
            @update:rows="onPerPageChange($event)"
            >
            <template #start="slotProps"></template>
            <template #end></template>
          </Paginator> -->
          <div class="flex flex-row-reverse space-x-4 space-x-reverse">
            <el-button
              size="small"
              @click="_fetch"
            ><IconIIcon :icon="icons.refetch" /></el-button>
            <el-pagination
              v-model:current-page="pageNumber"
              v-model:page-size="perPage"
              class="max-w-1/2 !inline-flex"
              :pager-count="5"
              :page-sizes="pagesSizes"
              :small="small"
              :disabled="false"
              :background="false"
              :layout="(pagesSizes.length <= 1) ? 'total' : ((props.totalItems / perPage) <= 1) ? 'total, sizes' : 'total, sizes, prev, pager, next'"
              :total="props.totalItems"
              @size-change="onPerPageChange"
              @current-change="onPage"
            />
          </div>
        </template>
        <div>
          <div v-for="col in (visibleColumns as any)" >
            <PColumn v-if="(col as any).key === 'selected'"
              :selectionMode="selectionStore.multiSelection === true ? 'multiple': 'single'"  headerStyle="width: 4rem"
              :class="col.class"
            >
              <template #loading>
                <div class="flex align-items-center" :style="{ height: '17px', 'flex-grow': '1', overflow: 'hidden' }">
                    <Skeleton width="60%" height="1rem" />
                </div>
              </template>
              <template #header="slotProps">
                <!-- <HeaderCellRenderer :colData="col" :key="col.title"/> -->
                <ButtonBTNClearSelection @clearselection="clearSelection"/>
              </template>
              <template #body="scope">
                <div class="hidden">{{ (getSelectedrowIdsFromStore().includes(scope.data[props.rowId])) ? scope.data.selected = true : scope.data.selected = false }}</div>

                <div v-if="scope.data.dummy"></div>
                <el-checkbox v-else-if="selectionStore.multiSelection" v-model="scope.data.selected" class="selectionItem"/>

                <el-radio-group v-else v-model="scope.data.selected">
                  <!-- <el-radio :value="true">t</el-radio>
                  <el-radio :value="false">f</el-radio> -->
                  <el-radio :label="true" class="selectionItem hide_label" />
                </el-radio-group>
              </template>
              <!-- <template #body="slotProps">
                <CellRenderer :colData="col" :key="col.key" :rowData="slotProps.data"/>
              </template> -->
            </PColumn>
            <!-- :style="(Boolean(col._fixed) !== false || Boolean(col.fixed) !== false) ? 'min-width: ' + col.width + 'px;' : ''" -->
            <!-- :style="getColumnStyle(col)" -->

            <div v-else-if="(col as any).key.startsWith('_')">
              <div
              v-for="colChild in Object.values(columnsModel).filter(e => e._majorKey === col.key)"
              >
              <PColumn
                :key="colChild.key" :field="colChild.key"
                :sortable="colChild.sortable"
                :header="colChild.title"
                  :class="{
                    '!w-1/1': colChild.maxWidth === undefined,
                    '': colChild._fixed === TableV2FixedDir.LEFT || colChild.fixed === TableV2FixedDir.LEFT || colChild.fixed === true || colChild._fixed === true,
                    'flex flex-row-reverse': colChild._fixed === TableV2FixedDir.RIGHT || colChild.fixed === TableV2FixedDir.RIGHT,
                    // []: Boolean(colChild._fixed) === false && Boolean(colChild.fixed) === false,
                    [(colChild.class as string)]: true,
                  }"
                  >
                  <template v-if="colChild.headerCellRenderer" #header="slotProps">
                    <HeaderCellRenderer :colData="colChild" :key="colChild.title"/>
                  </template>
                  <template v-else-if="colChild.icon" #header>
                    <el-tooltip
                      effect="dark"
                      :content="colChild.tooltip"
                      placement="bottom-end"
                    >
                    <IconIIcon :icon="colChild.icon" :style="'color: var(' + colChild.iconColor + ')'" />
                    </el-tooltip>
                  </template>

                  <template v-if="colChild.cellRenderer" #body="slotProps">
                    <!-- CELLS OF THIS (CHILD) COLUMN -->
                    <el-text v-if="slotProps.data[props.rowId] && slotProps.data.dummy && colChild.key==props.rowId"
                      class="min-h-24"
                    >
                      {{ slotProps.data[props.rowId] }}
                    </el-text>
                    <CellRenderer v-else-if="!slotProps.data.dummy" :colData="colChild" :key="colChild.key" :rowData="slotProps.data"/>
                  </template>
                </PColumn>
              </div>
            </div>
            <!-- <TableTDefaultDesktopColumn v-else
              :column="col" :rowId="props.rowId" :key="col.key"
            /> -->
            <PColumn v-else
              :key="col.key" :field="col.key"
              :header="col.title"
              :sortable="col.sortable"
              :class="{
                '!w-1/1': col.maxWidth === undefined,
                '': col._fixed === TableV2FixedDir.LEFT || col.fixed === TableV2FixedDir.LEFT || col.fixed === true || col._fixed === true,
                'flex flex-row-reverse': col._fixed === TableV2FixedDir.RIGHT || col.fixed === TableV2FixedDir.RIGHT,
                // []: Boolean(col._fixed) === false && Boolean(col.fixed) === false,
                [col.class]: true,
              }"
              >
              <template v-if="col.headerCellRenderer" #header="slotProps">
                <HeaderCellRenderer :colData="col" :key="col.title"/>
              </template>
              <template v-else-if="col.icon && col.tooltip" #header>
                <el-tooltip
                  effect="dark"
                  :content="col.tooltip"
                  placement="bottom-end"
                >
                <el-text><IconIIcon :icon="col.icon" :style="'color: var(' + col.iconColor + ')'" /></el-text>
                </el-tooltip>
              </template>
              <template v-else-if="col.title" #header="slotProps">
                <el-text>{{ col.title }}</el-text>
              </template>
              <template v-else #header="slotProps">
                <el-text>{{ col.key }}</el-text>
              </template>

              <template v-if="col.cellRenderer" #body="slotProps">
                <el-text v-if="slotProps.data[props.rowId] && slotProps.data.dummy && col.key==props.rowId"
                  class="min-h-24"
                >
                  {{ slotProps.data[props.rowId] }}
                </el-text>
                <CellRenderer v-else-if="!slotProps.data.dummy" :colData="col" :key="col.key" :rowData="slotProps.data"/>
              </template>
              <template v-else #body="slotProps">
                <!-- <pre>{{ slotProps }}</pre> -->hi
                <el-text>{{ slotProps.data[col.key] }}</el-text>
              </template>
            </PColumn>
            <!-- <Column :key="'id'" :field="'id'" :header="'Id'"> </Column> -->
          </div>
        </div>
      </DataTable>
    </div>
  </div>
</template>

<script lang="tsx" setup>
// tsx used to create components inside ts code (see columns[...].cellRenderer)
import { useIcons } from '~/composables/mixins/useIcons'
import {TableV2SortOrder, type RowEventHandlerParams, TableV2FixedDir } from 'element-plus'
import type { SortState } from 'element-plus'
import type { ITableHeaderRow } from '~/types/ttableV3'
import type { TRowData } from '~/types/Datatypes'
import type { ITableData } from '~/types/ttable'

import DataTable from 'primevue/datatable'
// import Column from 'primevue/column'
// import ColumnGroup from 'primevue/columngroup'   // optional
// import Row from 'primevue/row'                   // optional
import { useUtilsData } from '~/composables/mixins/useUtilsData'
// import TDefaultDesktopColumn from './TDefaultDesktopColumn'

const CellRenderer = ({key, rowData, colData}: any) => {
  if (colData.cellRenderer)
    return colData.cellRenderer({rowData})
  return <el-text>{ key }</el-text>
}
const HeaderCellRenderer = ({colData}: any) => {
  if (colData.headerCellRenderer)
    return colData.headerCellRenderer()
  return <el-text>{ colData.title }</el-text>
}

const selectionStore = storeSelections()
const tableStore = storeTablesettings()
const icons = useIcons()

const columnsModel = defineModel<ITableHeaderRow>('columns', { required:true})
const dataModel = defineModel<Array<any>>('data', { required:true})
const $emit = defineEmits(['fetch', 'selection-changed', 'selection-clear', 'tabledata-changed', 'sort-changed', 'update-input-filter'])
const props = defineProps({
  // columns: { type: Object as PropType<ITableHeaderRow>, required:true},
  // data: { type: Array<any>, required: true },
  tableData: { type: Object as PropType<ITableData>, required: true },
  totalItems: { type: Number, required: true },
  id: { type: String, default: 'servers' },
  rowId: { type: String, default: 'depotId' },
  sortBy: { type: String, default: 'selection'},
  small: { type: Boolean, default: true },
  isLoading: { type: Boolean, default: false, required:false },
})

const tableRef = ref()
const menu = ref()
const currentSelectedRow = ref<TRowData|undefined>()
const selectKey = ref<string>( props.id === 'servers' ? 'selectionDepots': (props.id === 'clients' ? 'selectionClients' : 'selectionProducts'))

const wrappedColumns = ref<ITableHeaderRow>({})
// const wrappedData = ref<Array<any>>([])

const perPage = ref(props.tableData.perPage) // computed(()=> props.tableData.perPage)
const pageNumber = ref(props.tableData.pageNumber) // computed(()=> props.tableData.pageNumber)
const _pagesSizes = [10, 20, 50, 100]
const pagesSizes = ref(_pagesSizes)
updateMaxPerPage()
const lastSelectedItemForSingleselect = ref<any>(undefined)

const sortState = ref<SortState>({ [props.sortBy]: TableV2SortOrder.DESC })

const lastScrollDirection = ref<'next'|'prev'|''>('')

// rowEventHandlers.onClick
const rowEventHandlers: any = {
  onClick: (params: any) => {

    log().log_colored_group('red', '--------onClick-------')
    console.log('onclick', params)

    if (params && params.originalEvent
      && params.originalEvent.target.localName !== "td" // is not a tablecell (raw text)
      && !Boolean(params?.originalEvent?.target?.__vueParentComponent?.attrs?.class?.includes('selectionItem')) // is not the selection cell
    ) {
      log().log_colored_group_end()
      return
    }
    const rowData:TRowData  = params.rowData || params.data || params
    log().log_colored('gray', 'rowEventHandlers.onClick', rowData[props.rowId])
    if (rowData.dummy === true && rowData.direction === undefined) {
      return
    } else if (rowData.dummy === true) {
      log().log_colored('gray', 'clicked on dummy row', rowData.direction)
      onScroll(rowData.direction)
      return
    }
    log().log_colored('gray', 'clicked on real client', rowData[props.rowId])
    // console.log('row click', params.rowIndex, params.rowKey, rowData, params.event)
    const isAlreadyInStore = selectionStore['_'+selectKey.value].includes(rowData[props.rowId])
    log().log('row click', rowData[props.rowId], rowData.selected, isAlreadyInStore)
    if (selectionStore.multiSelection === false) {
      if (lastSelectedItemForSingleselect.value !== undefined) {
        lastSelectedItemForSingleselect.value.selected = false
      }
      lastSelectedItemForSingleselect.value = rowData
      rowData.selected = true
    }
    else {
      rowData.selected = rowData.selected === true ? false : true
    }

    $emit('selection-changed', rowData[props.rowId])
    const isAlreadyInStore2 = selectionStore['_'+selectKey.value].includes(rowData[props.rowId])
    log().log('row click', rowData[props.rowId], rowData.selected, isAlreadyInStore2)
    log().log_colored_group_end()
  },
  onDblclick: (params: RowEventHandlerParams) => {
    // const rowData:TRowData  = params.rowData
    console.log('row dblclick', params.rowKey, params.event)
  },
  onContextmenu: (params: RowEventHandlerParams) => {
    const rowData:TRowData  = params.rowData
    currentSelectedRow.value = rowData
    console.log('row contextmenu', params.rowKey, params.event, rowData)
    menu.value.show(params.event)
  },
}


const lazyLoading = ref(true);
// const loadLazyTimeout = ref();

const virtualScrollerOptions = ref({ lazy: true, onLazyLoad: onVirtualScrollerLoad, itemSize: 10, delay: 500, showLoader: false, loading: lazyLoading, numToleratedItems: perPage.value / 2 })


const selection = ref<Array<string>>(getSelectedrowsFromStore())
// const _visibleColumnsDataKeys = computed(()=> useUtilsData().getVisibleColumnIds(Object.values(columnsModel.value)) )
// const visibleColumns = computed(()=> Object.values(columnsModel.value).filter((c:any) => (c._majorKey === undefined) ? _visibleColumnsDataKeys.value.includes(c.dataKey) : _visibleColumnsDataKeys.value.includes(c._majorKey) ))
const columnValues = computed(()=> Object.values(columnsModel.value))
const visibleColumns = computed(()=> useUtilsData().getVisibleColumns(columnValues.value) )
// const visibleColumns = computed(()=> Object.values(columnsModel.value).filter((c:any) => c.fixed === true || c._fixed === true || c.hidden === false))


// numVisibleColumns.value < numFixedColumns.value + numVisibleColumnsDelta.value
const numVisibleColumns = computed(()=> Object.values(visibleColumns.value).length)
const numFixedColumns = computed(()=> Object.values(visibleColumns.value).filter((c:any) => Boolean(c.fixed) === true || Boolean(c._fixed) === true).length)
const numVisibleColumnsDelta = ref(1)

// watch(()=>props.tableData.pageNumber, (val)=>{ pageNumber.value = val })
// watch(()=>props.tableData.perPage, (val)=>{ perPage.value = val })


watch(()=>tableStore[props.id + 'Columns'], ()=>{
// watch(()=>tableStore.columns[props.id], ()=>{
  // show or hide major-children

  Object.values(wrappedColumns.value)
    .filter((e:any) => e.dataKey.startsWith('_')) // only majors
    .map((e:any)=> {
      const majorKey = e.dataKey
      const children = Object.values(wrappedColumns.value).filter(e => e._majorKey === majorKey).map(e => e.dataKey as string)
      // const visible = tableStore.columns[props.id].includes(e.dataKey)
      const visible = tableStore[props.id + 'Columns'].includes(e.dataKey)
      if (visible){ // is major visible? // show major.chilrden
        wrappedColumns.value[majorKey].hidden = true
        children.map((cId:string)=> wrappedColumns.value[cId].hidden = false)
      } else { // hide mahor.chilrden
        children.map((cId:string)=> wrappedColumns.value[cId].hidden = true)
      }
    })
}, { deep: true})
// watch (()=> columnsModel.value)

watch (()=>props.totalItems, updateMaxPerPage)

watch (()=>dataModel, ()=>{ selection.value = getSelectedrowsFromStore() }, {deep: true})

// function updateColumns() {
  //   if (columnsModel.value == undefined) return {}

  //   // const _columns: ITableHeaderRow = JSON.parse(JSON.stringify(props.columns))
  //   const _columns: ITableHeaderRow = {...columnsModel.value}
  //   Object.values(_columns)
  //     .map(c => {
  //       if (c.cellRenderer === undefined)
  //         c.cellRenderer = ({rowData,cellData}: CellRendererParams<any>) => {
  //           if (rowData)
  //             return <el-text>{rowData[c.dataKey || c.key]}</el-text>
  //           return <el-text > XX </el-text>
  //       }
  //       else {
  //         const renderer = c.cellRenderer
  //         c.cellRenderer = ({rowData}: any) => {
  //           if (rowData && rowData.dummy === undefined)
  //             return renderer({rowData} as any)
  //           else if (rowData && rowData.dummy === true && c.dataKey === props.rowId)
  //             return <div contenteditable="true">{rowData[props.rowId]}</div>
  //             // return <el-text >b {rowData[props.rowId]} </el-text>
  //           return <el-text />
  //         }
  //       }
  //     } )
  //   if (columnsModel.value?.selected === undefined) {
  //     return _columns
  //   }
  //   _columns.selected.headerCellRenderer = () => {
  //     const _data = unref(dataModel)
  //     // const allSelected = _data.every((row: any) => row.selected)
  //     // const containsChecked = _data.some((row: any) => row.selected)
  //     const clearSelection = (event:any) => {
  //       $emit('selection-clear')
  //       dataModel.map((row:any) => {
  //         row.selected = false
  //         return row
  //       })
  //     }
  //     return (
  //       <buttonBTNClearSelection onClearselection={clearSelection}/>
  //     )
  //   }
  //   // _columns.selected.cellRenderer = ({ rowData }) => {
  //   //   const selected = computed<boolean>(()=> selectionInStoreByType.value.includes(rowData[props.rowId]) || rowData.selected)
  //   //   const onChange = (value: CheckboxValueType) => {
  //   //     rowData.selected = value
  //   //     console.log('selection changed', props.rowId, rowData[props.rowId])
  //   //     $emit('selection-changed', rowData[props.rowId])
  //   //   }
  //   //   // return <SelectionCell show={false} value={selected.value} onChange={onChange} />
  //   //   return <SelectionCell show={rowData.dummy !== true} value={selected.value} onChange={onChange} />
  //   // }
  //   return _columns
// }

// function updateCurrentPage(pageNo: number) {
//   console.log('updateCurrentPage', pageNo)
//   pageNumber.value = pageNo
//   $emit('tabledata-changed', {...props.tableData, pageNumber: pageNo})
//   $emit('fetch')
// }
// function updatePerPage(perPage: number) {
//   console.log('updatePerPage', perPage)
//   $emit('tabledata-changed', {...props.tableData, perPage, pageNumber: 1})
//   $emit('fetch')
// }
// function updateData() {
//   if (dataModel === undefined) return []
//   const _data = dataModel
//   return _data
// }

// const lastFetchedDirection = ref<'next'|'prev'>('next')
// const middleOfTable = ref<number>(50 + 150)

watch(()=>props.tableData._lastScrollDirection, ()=> {
  // scroll to element if lastScrollDirection is set to 'prev'
  if (props.tableData._lastScrollDirection === undefined) { return }
  else if (props.tableData._lastScrollDirection === '') { return }
  else if (props.tableData._lastScrollDirection === 'next') { return }
  else if (props.tableData._lastScrollDirection !== 'prev') {
    console.error('no such direction', props.tableData._lastScrollDirection)
    return
  }
  props.tableData._lastScrollDirection = ''
  const items = dataModel.value.filter(x => x.dummy !== true).length
  const visiblePages =  Math.ceil(items / perPage.value)

  if (visiblePages > 1) {
    scrollToRow(props.tableData.perPage)
  }
})

function _fetch() {
  $emit('fetch')
  if (props.tableData.pageNumber > 1) scrollToRow(1, 500)
}


function updateMaxPerPage () {
  // const _pagesSizes = [1, 5, 10, 20, 50, 100, 1000]
  let sizes: number[] = JSON.parse(JSON.stringify(_pagesSizes))
  sizes.push(props.totalItems)
  sizes.sort((a, b) => a - b)
  sizes = sizes.filter((e: number) => e <= props.totalItems)

  perPage.value = props.totalItems
  if (props.totalItems < 10) {
    pagesSizes.value = [props.totalItems]
    return
  }
  pagesSizes.value = sizes
}

function scrollToRow(rowNumber: number, timeout: number=100, behavior: 'auto'|'smooth'|'instant'='instant', block: 'start'|'center'|'end'|'nearest'='start') {
  setTimeout(() => {

    log().log_colored_group('purple', 'SCROLL TO ROW')
    var rows = document.querySelectorAll('[data-pc-section="bodyrow"]');
    const last_first_row = rows[rowNumber]
    log().log_colored('gray', 'rows', rows.length, 'rowNumber', rowNumber, 'last_first_row')
    console.log(last_first_row)
    if (last_first_row === undefined) {
      log().log_colored('red', 'last_first_row is undefined')
      return
    }
    // line is the row number that you want to see into view after scroll
    last_first_row.scrollIntoView({ behavior, block });
    log().log_colored_group_end()
  }, timeout);
}

// TODO:
// - add scroll (real scroll)
// - fix table column visibility
//    - check major columns



function getSelectedrowsFromStore() {
  const _selection: any = []
  for (const rId of selectionStore['_'+selectKey.value]) {
    const row = dataModel.value.find((r: any) => r[props.rowId] === rId)
    if (row !== undefined)
      _selection.push(row)
  }
  return _selection
}
function getSelectedrowIdsFromStore() {
  return getSelectedrowsFromStore().map((r: any) => r[props.rowId])
}


async function onScroll(event: any) {

  log().log_colored_group('red', '---------- scroll', event, '-----------', event)
  const tData = JSON.parse(JSON.stringify(props.tableData))
  if (event === 'next' && lastScrollDirection.value === 'prev') {
    tData.pageNumber = props.tableData.pageNumber + 2
  }
  else if (event === 'prev' && lastScrollDirection.value === 'next') {
    tData.pageNumber = props.tableData.pageNumber - 2
  }
  else {
    tData.pageNumber = props.tableData.pageNumber + ((event === 'next') ? 1 : -1)
  }

  pageNumber.value = tData.pageNumber
  await $emit('tabledata-changed', tData)
  await $emit('fetch', event)
  lastScrollDirection.value = event
  log().log_colored_group_end()
}
//   // console.log('scroll', event, tableRef.value.$el)
//   //console.log('scroll to top. ')
//   // show marker in middle of table
//   // middleOfTable.value = tableRef.value.$el.clientHeight / 2 + 50
//   if (event.yAxisScrollDir === 'backward' && event.scrollTop === 0 && pageNumber.value > 1 ) {
//   } else {
//     console.log('scroll to top. not at top')
//     return
//   }
//   //   // we only want to fetch prev if we are at the top of the table

//   // if (!(event.yAxisScrollDir !== 'forward' || event.scrollTop > 0 || pageNumber.value === 1)) {
//   //   console.log('scroll to top. not at top', event, pageNumber.value, tableRef.value.$el)
//   //   return
//   // }
//   console.log('scroll to top. at top')

//   const visiblePages =  Math.ceil(dataModel.value.length / perPage.value)
//   // update current page (without fetching)
//   if (lastFetchedDirection.value === 'next' && visiblePages > 1){
//     $emit('tabledata-changed', {...props.tableData, pageNumber: pageNumber.value - 2})
//   } else {
//     $emit('tabledata-changed', {...props.tableData, pageNumber: pageNumber.value - 1})
//   }

//   // fetch manually and push data to start of array
//   await $emit('fetch', 'prev')

//   // scroll to middle of table
//   const visiblePagesNew = dataModel.value.length / perPage.value
//   console.log('visiblePagesNew', visiblePagesNew)
//   if (visiblePagesNew > 1)
//     tableRef.value.scrollToRow(props.tableData.perPage, "start")

//   lastFetchedDirection.value = 'prev'
// }
// function onEndReached() {
//   console.log('end reached')
//   if (pageNumber.value >= props.totalItems / perPage.value){
//     console.log('end reached, no more pages')
//     return
//   }

//   if (lastFetchedDirection.value === 'prev' && pageNumber.value > 1){
//     console.log('end reached, fetch prev')
//     $emit('tabledata-changed', {...props.tableData, pageNumber: pageNumber.value + 2})
//   } else{
//     console.log('end reached, fetch next')
//     $emit('tabledata-changed', {...props.tableData, pageNumber: pageNumber.value + 1})
//   }
//   $emit('fetch', 'next')
//   lastFetchedDirection.value = 'next'
//   // emit('')
// }

// const lazyParams = ref({
//     first: 0,
//     rows: 10,
//     sortField: props.tableData.sortBy,
//     sortOrder: props.tableData.sortDesc ? -1: 1,
//     // filters: filters.value
// })
function onPerPageChange(event: any) {
  log().log('onPerPageChange', event)
  if (event === props.tableData.perPage) {
    log().log_colored('orange', 'onPerPageChange, same perPage')
    return
  }
  // loadCarsLazy(event)
  const tData = JSON.parse(JSON.stringify(props.tableData))
  tData.perPage = event
  tData.pageNumber = 1
  lastScrollDirection.value = ''
  $emit('tabledata-changed', tData)
  _fetch()
}
function onPage(newPageNumber: any) {
  log().log_colored_group('white', 'onPage', newPageNumber)
  // loadCarsLazy(event)
  const tData = JSON.parse(JSON.stringify(props.tableData))
  // tData.pageNumber = newPageNumber/tData.perPage + 1 // Paginator from primeVue
  tData.pageNumber = newPageNumber // paginator from element-plus
  // console.log('onPage', tData)
  lastScrollDirection.value = ''
  $emit('tabledata-changed', tData)
  _fetch()
  log().log_colored('gray', 'onPageStored', props.tableData.pageNumber)
  log().log_colored_group_end()
}

function onSort(event: any) {
  console.log('onSort', event)
  const tData = JSON.parse(JSON.stringify(props.tableData))
  tData.sortBy = event.sortField
  tData.sortDesc = event.sortOrder === -1
  // tData.pageNumber = 1
  $emit('tabledata-changed', tData)
  _fetch()
}

async function onVirtualScrollerLoad (event: any) {
  lazyLoading.value = true;
  // if (event.first === 0 && event.last === 0) {
  //   lazyLoading.value = false;
  //   return
  // }
  log().log_colored_group('red', '--------- virtScroll ---------')
  const items = dataModel.value.filter(x => x.dummy !== true).length
  const pageNumber = Math.ceil((items===0)? 1 : items / perPage.value)
  log().log_colored('gray', 'onVirtualScrollerLoad', JSON.stringify(event), 'items', items, ' pageNo', pageNumber)
  if (event.first === 0 && event.last === 0) {
    lazyLoading.value = false;
    log().log_colored('orange', 'onVirtualScrollerLoad', 'same page')
    log().log_colored_group_end()
    return
  }
  if (items != 0 && event.first == 0) {
  // if (pageNumber === props.tableData.pageNumber) {
    log().log_colored('orange', 'onVirtualScrollerLoad', 'same page')
    lazyLoading.value = false;
    log().log_colored_group_end()
    return
  }
  const tData = JSON.parse(JSON.stringify(props.tableData))
  tData.pageNumber = pageNumber
  $emit('tabledata-changed', tData)
  $emit('fetch', 'next')
  log().log_colored_group_end()
}
//   if (event.last === 0 && event.first === 0) {
//     lazyLoading.value = false;
//     return
//   }

//   // !lazyLoading.value && (lazyLoading.value = true);
//   if (loadLazyTimeout.value) {
//     clearTimeout(loadLazyTimeout.value);
//   }

//   loadLazyTimeout.value = setTimeout(async () => {


//   const pageNo = event.first / event.rows + 1
//   const tData = JSON.parse(JSON.stringify(props.tableData))
//   tData.pageNumber = pageNo
//   log().log_colored('red', 'onVirtualScrollerLoad', tData)

// // //     !lazyLoading.value && (lazyLoading.value = true);

//     // if (loadLazyTimeout.value) {
//     //     clearTimeout(loadLazyTimeout.value);
//     // }
// // const tData = JSON.parse(JSON.stringify(props.tableData))
// //   console.log('loadCarsLazy', event)
// //   if (event.sortField) {
// //     tData.sortBy = event.sortField
// //     tData.sortDesc = event.sortOrder === -1
// //     tData.pageNumber = 1
// //   }
// //   if (event.page) {
// //     tData.perPage = event.rows
// //     tData.pageNumber = event.page + 1
// //     // props.tableData.
// //   }
// //   console.warn('loadCarsLazy1', tData)
// //   $emit('tabledata-changed', tData)
// //   console.warn('loadCarsLazy2', tData)
// //   // props.tableData.pageNumber = event.page + 1
// //   // props.tableData.sortBy = event.sortField ? event.sortField : props.tableData.sortBy
// //   // props.tableData.sortDesc = event.sortOrder === -1
//   await $emit('fetch');
//   lazyLoading.value = false;
// }, 1000);
// // //     // //simulate remote connection with a timeout
// // //     // loadLazyTimeout.value = setTimeout(() => {
// // //     //     let _virtualCars = [...virtualCars.value];
// // //     //     let { first, last } = event;

// // //     //     //load data of required page
// // //     //     const loadedCars = cars.value.slice(first, last);

// // //     //     //populate page of virtual cars
// // //     //     Array.prototype.splice.apply(_virtualCars, [...[first, last - first], ...loadedCars]);

// // //     //     virtualCars.value = _virtualCars;
// // //     //     lazyLoading.value = false;
// // //     // }, Math.random() * 1000 + 250);
// }

function clearSelection (event:any) {
  $emit('selection-clear')
  dataModel.value.map((row:any) => {
    row.selected = false
    return row
  })
}
// function getColumnStyle(col: any) {
//   if (col === undefined) return ''
//   let style = ""
//   const isLeft = col._fixed === TableV2FixedDir.LEFT || col.fixed === TableV2FixedDir.LEFT || col.fixed === true || col._fixed === true
//   const isRight = col._fixed === TableV2FixedDir.RIGHT || col.fixed === TableV2FixedDir.RIGHT
//   const isFixed = isLeft || isRight
//   if (col.width !== undefined) {
//     if (isLeft) {
//       style += 'width: ' + col.width + 'px; background-color: red;'
//       style += 'min-width: ' + col.width + 'px; background-color: green;'
//       if (numVisibleColumns.value < numFixedColumns.value + numVisibleColumnsDelta.value) style += 'width:100%;'
//     }else {
//       style += 'width: ' + col.width + 'px; background-color: red;'
//     }
//   }
//   if (col.maxWidth !== undefined) style += 'max-width: ' + col.maxWidth + 'px;'
//   if (col.minWidth !== undefined && !isFixed) style += 'min-width: ' + col.minWidth + 'px;'
//   return style
//   // return (Boolean(col._fixed) !== false || Boolean(col.fixed) !== false) ? 'min-width: ' + col.width + 'px;' : ''
// }
</script>


<style scoped>
:deep(.noHoverRow){
  --bg-color-hover: transparent;
  /* background-color: blue !important; */
}
/* :deep(.p-dropdown-items-wrapper) {
  background-color: black !important;
}
.p-dropdown-item {
  color: black !important;
} */
/* p-dropdown-items-wrapper = el-select-dropdown__list
p-dropdown-items
p-dropdown-item = el-select-dropdown__item */
:deep(.p-datatable .p-datatable-thead > tr > th .p-column-title) {
  display: none !important;
}
:deep(.p-datatable .p-sortable-column .p-sortable-column-icon) {
  color: var(--fg-color) !important;
}
:deep(.hide_label .el-radio__label) {
  display: none !important;
}
:deep(.p-paginator),
:deep(.p-datatable .p-datatable-wrapper),
:deep(.p-datatable .p-datatable-footer),
:deep(.p-datatable .p-datatable-thead),
:deep(.p-datatable .p-datatable-tbody),
:deep(.p-datatable  tr),
:deep(.p-datatable .p-datatable-header) {
  background-color: transparent !important;
}
:deep(.p-datatable  tr > th){
  background-color: var(--bg-color);
}

:deep([data-pc-section="pagebutton"][data-p-highlight="true"]),
:deep(.p-datatable  tr:hover),
:deep(.p-datatable  tr > th:hover){
  background-color: var(--bg-color-hover) !important;
}

:deep(.p-column-header-content [data-pc-name="checkbox"][data-pc-section="root"]) {
  display: none !important;
}
</style>
