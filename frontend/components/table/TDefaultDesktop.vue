<template>
  <FormitemDDTableColumnVisibility :table-id="id" v-model:headers="props.columns" :sort-by="sortBy" :multi="true" :incontextmenu="true" />
  <div class="h-96 w-full" :class="{small: props.small !== false}">
    <el-auto-resizer>
      <template #default="{ height, width }">
        <el-table-v2
          v-if="Object.values(wrappedColumns).length > 0"
          :columns="Object.values(wrappedColumns)"
          :data="wrappedData"
          :width="width"
          :height="height"
          fixed
          :row-event-handlers="rowEventHandlers"
          @scroll="onScroll"
        >
        </el-table-v2>
      </template>
    </el-auto-resizer>
    <el-pagination
      v-model:page-size="perPage"
      v-model:current-page="pageNumber"
      :total="total"
      layout="sizes, prev, pager, next"
      :page-sizes="[1, 5, 10, 20, 50, 100]"
      :small="true"
      :background="true"
      :hide-on-single-page="false"
      @current-change="(v: number) => { $emit('tabledata-changed', {...props.tableData, pageNumber: v})}"
      @size-change="(v: number) => { $emit('tabledata-changed', {...props.tableData, perPage: v, pageNumber: 1})}"
      />
  </div>
</template>

<script lang="tsx" setup>
// tsx used to create components inside ts code (see columns[...].cellRenderer)
import TableV2 from 'element-plus';
import type { ISelectionCellProps, ITableHeaderRow } from '~/types/ttableV3'
import {type CheckboxValueType, type Column, type RowEventHandlerParams, type RowEventHandlers } from 'element-plus';
import type { FunctionalComponent } from 'vue';

const selectionStore = storeSelections()
const tableStore = storeTablesettings()
const props = defineProps({
  columns: { type: Object as PropType<ITableHeaderRow>, required:true},
  data: { type: Array<any>, required: true },
  tableData: { type: Object, required: true },
  totalItems: { type: Number, required: true },
  id: { type: String, default: 'depots' },
  rowId: { type: String, default: 'depotId' },
  sortBy: { type: String, default: 'selection'},
  small: { type: Boolean, default: true }
})
const $emit = defineEmits(['selection-changed', 'selection-clear', 'tabledata-changed'])
const wrappedColumns = ref<ITableHeaderRow>({})
const wrappedData = ref<Array<any>>([])
onMounted(()=>{
  wrappedColumns.value = updateColumns()
  wrappedData.value = updateData()
})
const perPage = ref(props.tableData.perPage) // computed(()=> props.tableData.perPage)
const pageNumber = ref(props.tableData.pageNumber) // computed(()=> props.tableData.pageNumber)
const total = ref(props.totalItems)
console.log('total pagenumber', pageNumber.value)
pageNumber.value = props.tableData.pageNumber
console.log('total pagenumber', pageNumber.value )
const lastSelectedItemForSingleselect = ref<any>(undefined)

watch(()=>tableStore.columns[props.id], ()=>{
  // show or hide major-children
  Object.values(wrappedColumns.value)
    .filter((e:any) => e.dataKey.startsWith('_')) // only majors
    .map((e:any)=> {
      const majorKey = e.dataKey
      const children = Object.values(wrappedColumns.value).filter(e => e._majorKey === majorKey).map(e => e.dataKey as string)
      const visible = tableStore.columns[props.id].includes(e.dataKey)
      if (visible){ // is major visible? // show major.chilrden
        wrappedColumns.value[majorKey].hidden = true
        children.map((cId:string)=> wrappedColumns.value[cId].hidden = false)
      } else { // hide mahor.chilrden
        children.map((cId:string)=> wrappedColumns.value[cId].hidden = true)
      }
    })
}, { deep: true})

function updateColumns() {
  if (props.columns == undefined) return {}

  const _columns: ITableHeaderRow = {...props.columns}
  Object.values(_columns)
    .map(c => {
      if (c.cellRenderer === undefined)
        c.cellRenderer = ({rowData}: any) => {
          if (rowData)
            return <el-text> {rowData[c.dataKey || c.key]}</el-text>
          return <el-text />
      }
    } )

  if (props.columns.selected === undefined) {
    return _columns
  }
  _columns.selected.headerCellRenderer = () => {
    const _data = unref(props.data)
    // const allSelected = _data.every((row: any) => row.selected)
    // const containsChecked = _data.some((row: any) => row.selected)
    const clearSelection = (event:any) => {
      $emit('selection-clear')
      props.data.map((row:any) => {
        row.selected = false
        return row
      })
    }
    return (
      <buttonBTNClearSelection onClearselection={clearSelection}/>
    )
  }
  _columns.selected.cellRenderer = ({ rowData }) => {
    const onChange = (value: CheckboxValueType) => {
      rowData.selected = value
      console.log('selection changed', props.rowId, rowData[props.rowId])
      $emit('selection-changed', rowData[props.rowId])
    }
    return <SelectionCell value={rowData.selected} onChange={onChange} />
  }
  return _columns
}
function updateData() {
  if (props.data === undefined) return []
  const _data = props.data
  return _data
}
const onScroll = (event: any) => {
  console.log('scroll', event)
}
// const rowEventHandlers = (handlers: any) =>{
//   console.log('row event', handlers)
// }
const rowEventHandlers: RowEventHandlers = {
  onClick: (params: RowEventHandlerParams) => {
    // params.event.preventDefault()
    // params.event.preventDefault()
    console.log('row click', params.rowIndex, params.rowKey, params.rowData, params.event)
    if (selectionStore.multiSelection === false) {
      if (lastSelectedItemForSingleselect.value !== undefined) {
        lastSelectedItemForSingleselect.value.selected = false
      }
      lastSelectedItemForSingleselect.value = params.rowData
      params.rowData.selected = true
      $emit('selection-changed', params.rowKey)
    }
    else {
      params.rowData.selected = params.rowData.selected === true ? false : true
    }

    // $emit('selection-changed', )
  },
  onDblclick: (params: RowEventHandlerParams) => {
    console.log('row dblclick', params.rowKey, params.event)
    // $emit('selection-changed', )
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
        modelValue={value}
        indeterminate={intermediate}
      />
    )
  } else {
    //<el-text>{value}</el-text>
    const label = computed(()=> value === true? 'x' : '')
    return (
      <>
      <el-text>{label.value}</el-text>
      {/* <el-checkox-button
        onChange={onChange}
        modelValue={value}
        indeterminate={intermediate}
        label={label}
      /> */}
      </>
    )
  }
}
</script>


<style scoped>
/* :deep([data-key="rowactions"]) { */
  /* width: 40px !important; */
  /* background-color: aqua !important; */
/* } */
</style>
