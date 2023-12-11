<template>
  <DropdownDDTableColumnVisibility :table-id="id" v-model:headers="props.columns" :sort-by="sortBy" :multi="true" :incontextmenu="true" />
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
        >
        </el-table-v2>
      </template>
    </el-auto-resizer>
  </div>
</template>


<script lang="tsx" setup>
// tsx used to create components inside ts code (see columns[...].cellRenderer)

import type { ISelectionCellProps, ITableHeaderRow } from '~/types/ttableV3'
import {type CheckboxValueType, type Column } from 'element-plus';
import type { FunctionalComponent } from 'vue';

const props = defineProps({
  columns: { type: Object as PropType<ITableHeaderRow>, required:true},
  data: { type: Array<any>, required:true},
  id: { type: String, default: 'depots' },
  sortBy: { type: String, default: 'selection'},
  small: { type: Boolean, default: true }
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
      $emit('selection-changed', rowData.depotId)
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
</style>