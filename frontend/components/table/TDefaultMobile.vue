<template>
    <DropdownDDTableColumnVisibility :table-id="id" v-model:headers="props.columns" :sort-by="sortBy" :multi="true" :incontextmenu="true" />
    <el-collapse v-model="activeRowIndex" accordion>
      <el-collapse-item v-for="row, index in wrappedData" :name="index">
        <template #title>
          <CellRenderer v-if="wrappedColumns.selected" rowId="selected" :rowData="row" :colData="wrappedColumns['selected']" />

          <el-text v-if="!wrappedColumns[props.rowId].cellRenderer"> {{row[props.rowId]}} </el-text>
          <CellRenderer v-else :rowId="props.rowId" :rowData="row" :colData="wrappedColumns[props.rowId]" />
        </template>

        <Details :rowData="row" :colData="wrappedColumns[props.rowId]" />

      </el-collapse-item>
    </el-collapse>
  <pre>
    <!-- {{ wrappedColumns }} -->
    <!-- {{ wrappedData }} -->
  </pre>
</template>


<script lang="tsx" setup>
// tsx used to create components inside ts code (see columns[...].cellRenderer)

import type { ISelectionCellProps, ITableHeaderRow } from '~/types/ttableV3'
import {type CheckboxValueType, type Column } from 'element-plus';
import type { FunctionalComponent } from 'vue';

const activeRowIndex = ref<number>()
const CellRenderer = ({key, rowData, colData}: any) => {
  console.log('cellrenderer', key, rowData, colData)
  if (colData.cellRenderer)
    return colData.cellRenderer({rowData})
  return <el-text>{ key }</el-text>
}

const Details = ({rowData, colData}: any) => {
  const data: Array<any> = []
  Object.keys(wrappedColumns.value)
    .filter(cId => wrappedColumns.value[cId].hidden
              && !wrappedColumns.value[cId].fixed)
    .map(cId => { data.push({ id: cId, value: rowData[cId]})})
    return <div class="mx-3">
      <el-table
        show-header={false}
        lazy={true}
        data={data}
        size="small"
        style="width: 100%"
      >
        <el-table-column prop="id" label="id" width="100">
        </el-table-column>
        <el-table-column prop="value" label="value">
          {{
            default: (scope: any) => {
              const rowKey = scope.row.id
              const rowValue = scope.row.value
              const renderer = wrappedColumns.value[rowKey].cellRenderer
              {/* console.log(rowKey, rowValue, renderer) */}
              if (renderer !== undefined)
                return renderer({ rowData } as any)
                {/* return <CellRenderer rowData={rowData} colData={colData} /> */}
              return <el-text>{ rowValue }</el-text>
            }
          }}
        </el-table-column>
      </el-table>
    </div>
}

const props = defineProps({
  columns: { type: Object as PropType<ITableHeaderRow>, required:true},
  rowId: { type: String, default: 'depotId'},
  data: { type: Array<any>, required:true},
  id: { type: String, default: 'depots' },
  sortBy: { type: String, default: 'selection'}
})
const $emit = defineEmits(['selection-changed', 'selection-clear'])
const wrappedColumns = ref<ITableHeaderRow>({})
const wrappedData = ref<Array<any>>([])
onMounted(()=>{
  wrappedColumns.value = updateColumns()
  wrappedData.value = updateData()
})

function updateColumns() {
  if (props.columns == undefined) return {}

  let _columns: ITableHeaderRow = { ...props.columns}
  Object.values(_columns)
    .map(c => {
      if (!c.fixed) c.hidden = true

      // if (c.cellRenderer === undefined)
      //   c.cellRenderer = ({rowData}: any) => {
      //     if (rowData)
      //       return <el-text> {rowData[c.dataKey || c.key]}</el-text>
      //     return <el-text />
      // }
    } )

  if (props.columns.selected === undefined) {
    return _columns
  }
  // _columns.selected.headerCellRenderer = () => {
  //   const clearSelection = (event:any) => {
  //     $emit('selection-clear')
  //     props.data.map((row:any) => {
  //       row.selected = false
  //       return row
  //     })
  //   }
  //   return (
  //     <buttonBTNClearSelection onClearselection={clearSelection}/>
  //   )
  // }
  _columns.selected.cellRenderer = ({ rowData }) => {
    const onChange = (value: CheckboxValueType) => {

      rowData.selected = value
      $emit('selection-changed', rowData.depotId)
    }
      // onChangeSelf={onChange}
      // onChangeStop={onChange}
      // onChangeStopPrevent={onChange}
      // onChangePrevent={onChange}
    return <el-checkbox
      onChange={onChange}
      modelValue={rowData.selected}
      indeterminate={false}
      class="pr-3"
    />
  }
  // <SelectionCell value={rowData.selected} onChange={onChange} class="mr-2"/>
  return _columns
}
function updateData() {
  if (props.data === undefined) return []
  const _data = props.data
  return _data
}


const SelectionCell: FunctionalComponent<ISelectionCellProps> = ({
  value,
  intermediate = false,
  onChange,
}) => {
  return (
    <el-checkbox
      onChange={onChange}
      modelValue={value}
      indeterminate={intermediate}
    />
  )
}
</script>

<style scoped>
:deep(.el-collapse-item__header) {
  word-break: break-all !important;
  line-height: initial !important;
  height: fit-content;
  padding-top: 10px !important;
  padding-bottom: 10px !important;
  padding-left: 15px !important;
  padding-right: 5px !important;
  text-align: start;
}
</style>