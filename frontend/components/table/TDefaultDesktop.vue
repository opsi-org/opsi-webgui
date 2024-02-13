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
  <div class="h-96 w-full" :class="{small: props.small !== false}">
    <el-auto-resizer>
      <template #default="{ height, width }">
        <el-table-v2
          v-if="Object.values(wrappedColumns).length > 0"
          v-model:sort-state="sortState"
          :columns="Object.values(wrappedColumns)"
          :data="dataModel"
          :width="width"
          :height="height"
          fixed
          :row-event-handlers="rowEventHandlers"
          @scroll="onScroll"
          @column-sort="onSort"
        >
        </el-table-v2>
      </template>
    </el-auto-resizer>
    <el-pagination
      v-model:page-size="perPage"
      v-model:current-page="pageNumber"
      :total="props.totalItems"
      layout="sizes, prev, pager, next"
      :page-sizes="[1, 5, 10, 20, 50, 100]"
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
import type { SortBy, SortState } from 'element-plus'
import type { ISelectionCellProps, ITableHeaderRow } from '~/types/ttableV3'
import type { FunctionalComponent } from 'vue'
import type { TRowData } from '~/types/Datatypes'
import type { ITableData } from '~/types/ttable';

const selectionStore = storeSelections()
const tableStore = storeTablesettings()
const icons = useIcons()

const columnsModel = defineModel<ITableHeaderRow>('columns', { required:true})
const dataModel = defineModel<Array<any>>('data', { required:true})
const $emit = defineEmits(['selection-changed', 'selection-clear', 'tabledata-changed', 'sort-changed', 'update-input-filter'])
const props = defineProps({
  // columns: { type: Object as PropType<ITableHeaderRow>, required:true},
  // data: { type: Array<any>, required: true },
  tableData: { type: Object as PropType<ITableData>, required: true },
  totalItems: { type: Number, required: true },
  id: { type: String, default: 'servers' },
  rowId: { type: String, default: 'depotId' },
  sortBy: { type: String, default: 'selection'},
  small: { type: Boolean, default: true }
})

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
    console.log('row click', params.rowIndex, params.rowKey, rowData, params.event)
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
    console.log('row dblclick', params.rowKey, params.event)
  },
  onContextmenu: (params: RowEventHandlerParams) => {
    const rowData:TRowData  = params.rowData
    currentSelectedRow.value = rowData
    console.log('row contextmenu', params.rowKey, params.event, rowData)
    menu.value.show(params.event)
  },
}
const SelectionCell: FunctionalComponent<ISelectionCellProps> = ({
  value,
  intermediate = false,
  onChange,
}) => {
  if (selectionStore.multiSelection === true) {
    return (
      <el-checkbox
        onChange={onChange}
        onClick={(e: any) => e.stopPropagation()}
        modelValue={value}
        indeterminate={intermediate}
      />
    )
  } else {
    const label = computed(()=> value === true? (<><iconIIcon icon={icons.check}></iconIIcon></>) : '')
    return (
      <>
      <el-text>{label.value}</el-text>
      </>
    )
  }
}


onMounted(()=>{
  wrappedColumns.value = updateColumns()
  // wrappedData.value = updateData()
})


const selectionInStoreByType = computed<string[]>(()=> selectionStore['_'+selectKey.value])

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
  console.log('data changed')
  wrappedColumns.value = updateColumns()
  // wrappedData.value = updateData()
}, {deep: true})

function onSort({ key, order }: SortBy) {
  sortState.value[key] = order
  if (sortState.value[key] === undefined) {
    sortState.value[key] = TableV2SortOrder.DESC
  }8910
  console.log('onSort', key, order, sortState.value[key])
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
        c.cellRenderer = ({rowData}: any) => {
          if (rowData)
            return <el-text> {rowData[c.dataKey || c.key]}</el-text>
          return <el-text />
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
      console.log('selection changed', props.rowId, rowData[props.rowId])
      $emit('selection-changed', rowData[props.rowId])
    }
    return <SelectionCell value={selected.value} onChange={onChange} />
  }
  return _columns
}

function updateCurrentPage(pageNumber: number) {
  console.log('updateCurrentPage', pageNumber)
  $emit('tabledata-changed', {...props.tableData, pageNumber})
}
function updatePerPage(perPage: number) {
  console.log('updatePerPage', perPage)
  $emit('tabledata-changed', {...props.tableData, perPage, pageNumber: 1})
}
function updateData() {
  if (dataModel === undefined) return []
  const _data = dataModel
  return _data
}
function onScroll(event: any) {
  console.log('scroll', event)
}

</script>


<style scoped>
/* :deep([data-key="rowactions"]) { */
  /* width: 40px !important; */
  /* background-color: aqua !important; */
/* } */
</style>
