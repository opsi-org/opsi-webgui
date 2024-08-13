<template>
  <div>
    <div class="flex">
    <!-- <slot name="filter" /> -->
    <InputIFilter
        :data="tableData"
        :filterable-columns="Object.values(wrappedColumns)"
        @update="($event: any) => $emit('update-input-filter', $event)"
      />
    <!-- <slot name="column-visibility">
      <FormitemDDTableColumnVisibility :table-id="id" v-model:headers="columns" :sort-by="sortBy" :multi="true" :incontextmenu="true" />
    </slot> -->
  </div>
  <!-- <div class="h-192 min-h-192 w-full" :class="{small: props.small !== false}"> -->
  <div class="h-96 max-w-full" :class="{small: props.small !== false}">
    <el-auto-resizer>
      <template #default="{ height, width }">
        <el-table-v2
          v-if="Object.values(wrappedColumns).length > 0"
          ref="tableRef"
          v-model:sort-state="sortState"
          :columns="Object.values(wrappedColumns)"
          :data="dataModel"
          :width="width"
          :height="height"
          :estimated-row-height="50"
          fixed
          :row-class="rowClass"
          @scroll="onScroll"
          @column-sort="onSort"
          @end-reached="onEndReached"
          >
          <!-- :row-event-handlers="rowEventHandlers" -->
        </el-table-v2>
        <!-- <div class="min-h-36 w-screen border-1 border-red-500"></div> -->
      </template>
    </el-auto-resizer>
    <el-pagination
      v-model:page-size="perPage"
      v-model:current-page="pageNumber"
      :total="props.totalItems"
      layout="sizes, prev, pager, next"
      :page-sizes="[1, 5, 10, 20, 50, 100, 10000]"
      :small="true"
      :background="true"
      :hide-on-single-page="false"
      @current-change="updateCurrentPage"
      @size-change="updatePerPage"
      />
      <ContextmenuCMTable ref="menu" :item="currentSelectedRow" :row-id="props.rowId" :type="props.id"/>
      <!-- rowId {{ props.rowId }}
      Cur: {{currentSelectedRow}} -->
      <pre>{{tableData}}</pre>
  </div>
  </div>
</template>

<script lang="tsx" setup>
// tsx used to create components inside ts code (see columns[...].cellRenderer)
import { useIcons } from '~/composables/mixins/useIcons'
import {TableV2SortOrder, type CheckboxValueType, type RowEventHandlerParams, type RowEventHandlers } from 'element-plus'
import type { RowClassNameGetter, SortBy, SortState } from 'element-plus'
import type { ISelectionCellProps, ITableHeaderRow } from '~/types/ttableV3'
import type { FunctionalComponent } from 'vue'
import type { TRowData } from '~/types/Datatypes'
import type { ITableData } from '~/types/ttable';
import type { CellRendererParams } from 'element-plus/es/components/table-v2/src/types.mjs'

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
const lastSelectedItemForSingleselect = ref<any>(undefined)

const sortState = ref<SortState>({ [props.sortBy]: TableV2SortOrder.DESC })

const rowEventHandlers: RowEventHandlers = {
  onClick: (params: RowEventHandlerParams) => {
    const rowData:TRowData  = params.rowData
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
  },
  onDblclick: (params: RowEventHandlerParams) => {
    // const rowData:TRowData  = params.rowData
  },
  onContextmenu: (params: RowEventHandlerParams) => {
    const rowData:TRowData  = params.rowData
    currentSelectedRow.value = rowData
    menu.value.show(params.event)
  },
}
const SelectionCell: FunctionalComponent<ISelectionCellProps> = ({
  value,
  intermediate = false,
  onChange,
  show = true,
}) => {
  if (selectionStore.multiSelection === true) {
    return (
      // < ></>
      <>
      { show === true ?
      <el-checkbox
        v-if={show === true}
        onChange={onChange}
        onClick={(e: any) => e.stopPropagation()}
        modelValue={value}
        indeterminate={intermediate}
      />
      : ''}
      </>
    )
  } else {
    const label = computed(()=> value === true? (<><iconIIcon icon={icons.check}></iconIIcon></>) : '')
    return (
      <>

      { show === true ?
      <el-text>{label.value}</el-text>
      : ''}
      </>
    )
  }
}

const rowClass = ({ rowIndex, rowData }: Parameters<RowClassNameGetter<any>>[0]) => {
  // if (rowIndex === 0)
  //   return "before:content-['Festivus']"
  if (rowIndex !== 0)
    if (rowIndex % (perPage.value) === 0)
      return 'bg-blue-500'

  if (rowData.dummy === true) {
    // is first page and first row of page
    const isFirstPageFirstRow = pageNumber.value === 1 && rowIndex === 0
    // is last page and last row of page
    const isLastPageLastRow = pageNumber.value === Math.ceil(props.totalItems / perPage.value) && rowIndex === dataModel.value.length - 1
    if (isFirstPageFirstRow){
      return 'bg-red-500'+ ' !hidden'
    }else if (isLastPageLastRow){
      return 'bg-red-500'+ ' !hidden'
    } else if (rowIndex === 0) {
      return 'bg-orange-500 min-h-[30px]'
    } else {
      return 'bg-yellow-500 align-top min-h-12'
    }
  }
  return ''
}

onMounted(()=>{
  wrappedColumns.value = updateColumns()
  // wrappedData.value = updateData()
})


const selectionInStoreByType = computed<string[]>(()=> selectionStore['_'+selectKey.value])
watch(()=>props.tableData.pageNumber, (val)=>{ pageNumber.value = val })
watch(()=>props.tableData.perPage, (val)=>{ perPage.value = val })
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

watch (()=>dataModel, ()=>{
  wrappedColumns.value = updateColumns()
  // wrappedData.value = updateData()
}, {deep: true})

function onSort({ key, order }: SortBy) {
  sortState.value[key] = order
  if (sortState.value[key] === undefined) {
    sortState.value[key] = TableV2SortOrder.DESC
  }
  $emit('sort-changed',  {
    key,
    isDesc: sortState.value[key] === TableV2SortOrder.DESC
  })
  // data.value = data.value.reverse()
}
function updateColumns() {
  if (columnsModel.value == undefined) return {}

  // const _columns: ITableHeaderRow = JSON.parse(JSON.stringify(props.columns))
  const _columns: ITableHeaderRow = {...columnsModel.value}
  Object.values(_columns)
    .map(c => {
      if (c.cellRenderer === undefined)
        c.cellRenderer = ({rowData,cellData}: CellRendererParams<any>) => {
          if (rowData)
            return <el-text>a {rowData[c.dataKey || c.key]}</el-text>
          return <el-text > XX </el-text>
      }
      else {
        const renderer = c.cellRenderer
        c.cellRenderer = ({rowData}: any) => {
          if (rowData && rowData.dummy === undefined)
            return renderer({rowData} as any)
          else if (rowData && rowData.dummy === true && c.dataKey === props.rowId)
            return <div contenteditable="true">{rowData[props.rowId]}</div>
            // return <el-text >b {rowData[props.rowId]} </el-text>
          return <el-text />
        }
      }
    } )
  if (columnsModel.value?.selected === undefined) {
    return _columns
  }
  _columns.selected.headerCellRenderer = () => {
    const _data = unref(dataModel)
    // const allSelected = _data.every((row: any) => row.selected)
    // const containsChecked = _data.some((row: any) => row.selected)
    const clearSelection = (event:any) => {
      $emit('selection-clear')
      dataModel.map((row:any) => {
        row.selected = false
        return row
      })
    }
    return (
      <buttonBTNClearSelection onClearselection={clearSelection}/>
    )
  }
  _columns.selected.cellRenderer = ({ rowData }) => {
    const selected = computed<boolean>(()=> selectionInStoreByType.value.includes(rowData[props.rowId]) || rowData.selected)
    const onChange = (value: CheckboxValueType) => {
      rowData.selected = value
      $emit('selection-changed', rowData[props.rowId])
    }
    // return <SelectionCell show={false} value={selected.value} onChange={onChange} />
    return <SelectionCell show={rowData.dummy !== true} value={selected.value} onChange={onChange} />
  }
  return _columns
}

function updateCurrentPage(pageNo: number) {
  if (pageNo){
    pageNumber.value = pageNo
    $emit('tabledata-changed', {...props.tableData, pageNumber: pageNo})
    $emit('fetch')
  }
}
function updatePerPage(perPage: number) {
  if (perPage) {
    $emit('tabledata-changed', {...props.tableData, perPage, pageNumber: 1})
    $emit('fetch')
  }
}
function updateData() {
  if (dataModel === undefined) return []
  const _data = dataModel
  return _data
}

const lastFetchedDirection = ref<'next'|'prev'>('next')
const middleOfTable = ref<number>(50 + 150)
async function onScroll(event: any) {
  // show marker in middle of table
  // middleOfTable.value = tableRef.value.$el.clientHeight / 2 + 50
  if (event.yAxisScrollDir === 'backward' && event.scrollTop === 0 && pageNumber.value > 1 ) {
  } else {
    // scroll to top. not at top
    return
  }
  //   // we only want to fetch prev if we are at the top of the table

  // if (!(event.yAxisScrollDir !== 'forward' || event.scrollTop > 0 || pageNumber.value === 1)) {
  //   // scroll to top. not at top //, event, pageNumber.value, tableRef.value.$el)
  //   return
  // }
  // scroll to top. at top

  const visiblePages =  Math.ceil(dataModel.value.length / perPage.value)
  // update current page (without fetching)
  if (lastFetchedDirection.value === 'next' && visiblePages > 1){
    $emit('tabledata-changed', {...props.tableData, pageNumber: pageNumber.value - 2})
  } else {
    $emit('tabledata-changed', {...props.tableData, pageNumber: pageNumber.value - 1})
  }

  // fetch manually and push data to start of array
  await $emit('fetch', 'prev')

  // scroll to middle of table
  const visiblePagesNew = dataModel.value.length / perPage.value
  if (visiblePagesNew > 1)
    tableRef.value.scrollToRow(props.tableData.perPage, "start")

  lastFetchedDirection.value = 'prev'
}
function onEndReached() {
  if (pageNumber.value >= props.totalItems / perPage.value){
    return
  }

  if (lastFetchedDirection.value === 'prev' && pageNumber.value > 1){
    $emit('tabledata-changed', {...props.tableData, pageNumber: pageNumber.value + 2})
  } else{
    $emit('tabledata-changed', {...props.tableData, pageNumber: pageNumber.value + 1})
  }
  $emit('fetch', 'next')
  lastFetchedDirection.value = 'next'
  // emit('')
}

</script>



