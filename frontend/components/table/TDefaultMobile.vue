<template>
    <FormitemDDTableColumnVisibility :table-id="id" v-model:headers="columns" :sort-by="sortBy" :multi="true" :incontextmenu="true" />
    <el-collapse v-model="activeRowIndex" accordion>
      <el-collapse-item v-for="row, index in wrappedData" :name="index">
        <template #title>
          <CellRenderer v-if="wrappedColumns.selected" rowId="selected" :rowData="row" :colData="wrappedColumns['selected']" />

          <el-text v-if="!wrappedColumns[props.rowId].cellRenderer"> {{row[props.rowId]}} </el-text>
          <CellRenderer v-else :rowId="props.rowId" :rowData="row" :colData="wrappedColumns[props.rowId]" />
        </template>
        <Details v-if="activeRowIndex === index" :rowData="row" :colData="wrappedColumns[props.rowId]" />

      </el-collapse-item>
    </el-collapse>
</template>


<script lang="tsx" setup>
// tsx used to create components inside ts code (see columns[...].cellRenderer)

import type { ITableHeaderRow } from '~/types/ttableV3'
import {TableV2FixedDir, type CheckboxValueType, type Column } from 'element-plus';
import { useUtilsData } from '~/composables/mixins/useUtilsData'
const tableStore = storeTablesettings()

const activeRowIndex = ref<number>()
const CellRenderer = ({key, rowData, colData}: any) => {
  if (colData.cellRenderer)
    return colData.cellRenderer({rowData})
  return <el-text>{ key }</el-text>
}
const Details = ({rowData, colData}: any) => {
  console.log('load details')
  const _width = {'width': '100%'}
  const data: Array<any> = []
  const _fixedRightLast: Array<any> = []
  Object.values(wrappedColumns.value).forEach((colInfo) =>{
    const cId = colInfo.key
    // const visible = tableStore.columns[props.id].includes(cId)
    const visible = tableStore[props.id + 'Columns'].includes(cId)
    if (!visible) {
      return
    }

    if (cId.startsWith('_')) {
      // column is a major column / collapseable / with children e.g. Statistics
      const major: any = { id: cId, value: '', children:[]}
      Object.values(wrappedColumns.value).filter(e => e._majorKey === cId).map(
        (e:any) => major.children.push({ id: e.dataKey, value: rowData[e.dataKey]}) )
      data.push(major)
    } else if (colInfo.fixed === TableV2FixedDir.RIGHT){
      _fixedRightLast.push({ id: cId, value: rowData[cId]})
    } else {
      data.push({ id: cId, value: rowData[cId]})
    }
  })
  data.push(..._fixedRightLast)
  return <div class="mx-3">
      <el-table
        show-header={false}
        lazy={true}
        data={data}
        size="small"
        row-key="id"
        style={_width}
        default-expand-all
      >
        <el-table-column prop="id" label="id">
          {{
            default: (scope: any) => {
              const rowKey = scope.row.id
              return <el-text>{ wrappedColumns.value[rowKey].title }</el-text>
            }
          }}

        </el-table-column>
        <el-table-column prop="value" label="value">
          {{
            default: (scope: any) => {
              const rowKey = scope.row.id
              if (rowKey.startsWith('_')) return
              const rowValue = scope.row.value
              const colInfo = wrappedColumns.value[rowKey]
              console.log('colInfo', colInfo, rowKey, rowValue)

              const renderer = colInfo.cellRenderer
              if (renderer !== undefined)
                return renderer({ rowData } as any)
              return <el-text>{ rowValue }</el-text>
            }
          }}
        </el-table-column>
      </el-table>
    </div>
}

const columns = defineModel<ITableHeaderRow>()
const props = defineProps({
  // columns: { type: Object as PropType<ITableHeaderRow>, required:true},
  rowId: { type: String, default: 'depotId'},
  data: { type: Array<any>, required:true},
  id: { type: String, default: 'servers' },
  sortBy: { type: String, default: 'selection'},
  fetch: {type: Function, default: (p:any) => {} }
})
const $emit = defineEmits(['selection-changed', 'selection-clear'])
const wrappedColumns = ref<ITableHeaderRow>({})
const wrappedData = ref<Array<any>>([])
onMounted(()=>{
  wrappedColumns.value = updateColumns()
  wrappedData.value = updateData()
})

const visibleColumns = reactive<Array<string>>([])

watch(()=>tableStore[props.id + 'Columns'], ()=>{
// watch(()=>tableStore.columns[props.id], ()=>{
  console.log('WRAPPED CHANGED')
  const curRow = activeRowIndex.value
  activeRowIndex.value = undefined
  activeRowIndex.value = curRow
})
function updateColumns() {
  if (columns.value == undefined) return {}

  let _columns: ITableHeaderRow = { ...columns.value}
  Object.values(_columns)
    .map(c => {
      if (!c.fixed) c.hidden = true
    } )

  if (columns.value?.selected === undefined) {
    return _columns
  }
  _columns.selected.cellRenderer = ({ rowData }) => {
    const onChange = (value: CheckboxValueType) => {

      rowData.selected = value
      $emit('selection-changed', rowData)
    }
    return <el-checkbox
      onChange={onChange}
      modelValue={rowData.selected}
      indeterminate={false}
      class="pr-3"
    />
  }
  return _columns
}
function updateData() {
  if (props.data === undefined) return []
  const _data = props.data
  return _data
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