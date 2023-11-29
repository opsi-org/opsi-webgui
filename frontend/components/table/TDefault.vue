<template>
  <DropdownDDTableColumnVisibility :table-id="id" v-model:headers="props.columns" :sort-by="sortBy" :multi="true" :incontextmenu="true" />

  <div class="h-screen w-screen">
    <el-auto-resizer>
      <template #default="{ height, width }">
        <el-table-v2
          :columns="Object.values(wrappedColumns)"
          :data="props.data"
          :width="width"
          :height="height"
          fixed
        />
      </template>
    </el-auto-resizer>
  </div>
</template>


<script lang="tsx" setup>
// tsx used to create components inside ts code (see columns[...].cellRenderer)

import type { ISelectionCellProps, ITableHeaderRow } from '~/types/ttableV3'
import {type CheckboxValueType } from 'element-plus';
import type { FunctionalComponent } from 'vue';


const props = defineProps({
  columns: { type: Object as PropType<ITableHeaderRow>, required:true},
  data: { type: Array<any>, required:true},
  id: { type: String, default: 'depots' },
  sortBy: { type: String, default: 'selection'}
})
const $emit = defineEmits(['selection-changed', 'selection-clear'])
const wrappedColumns = computed<ITableHeaderRow>( () => {
// onMounted(() => {
  if (props.columns == undefined) return {}
  if (props.columns.selected == undefined) return {}
  const _columns = {...props.columns}

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
      // <SelectionCell
      //   value={allSelected}
      //   intermediate={containsChecked && !allSelected}
      //   onChange={onChange}
      // />
  }

  _columns.selected.cellRenderer = ({ rowData }) => {
    const onChange = (value: CheckboxValueType) => {
      rowData.selected = value
      $emit('selection-changed', rowData.depotId)
    }
    return <SelectionCell value={rowData.selected} onChange={onChange} />
  }
  return _columns
})

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