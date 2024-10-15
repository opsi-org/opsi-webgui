<template>
  <div class="">

  <div v-if="Object.keys(columnsModel).length > 0">
    <div class="flex justify-content-between">
      <slot name="header-title" />
      <slot name="header-pre-visibility" />
      <slot name="header-pre-filter" />
      <InputIFilter
      :data="tableData"
      :filterable-columns="Object.values(wrappedColumns)"
      @update="($event: any) => $emit('update-input-filter', $event)"
      />
      <slot name="header-post-filter" />
    </div>
    <!-- <FormitemDDTableColumnVisibility :table-id="id" v-model:headers="columnsModel" :sort-by="sortBy" :multi="true" :incontextmenu="true" /> -->
    <el-collapse v-model="collapseRowIdValue" accordion>
      <PVirtualScroller :items="dataModel" :item-size="50" class="w-full h-[39rem] maxVisibleNoOverflow" >
      <!-- style="width: 200px; height: 200px" -->
        <template #item="{ item }">
            <!-- <div :class="['flex align-items-center p-2', { 'surface-hover': options.odd }]" style="height: 50px">{{ item }}</div> -->
            <el-collapse-item :name="item[props.rowId]">
              <template #title>
                <div class="min-w-fit">
                  <CellRenderer v-if="wrappedColumns.selected" row-id="selected" :row-data="item" :col-data="wrappedColumns['selected']" />

                  <el-text v-if="!wrappedColumns[props.rowId].cellRenderer"> {{item[props.rowId]}} </el-text>
                  <CellRenderer v-else :row-id="props.rowId" :row-data="item" :col-data="wrappedColumns[props.rowId]" />
                </div>

                <div class="w-full flex flex-row-reverse">
                  <CellRenderer v-if="wrappedColumns.rowactions" row-id="rowactions" :row-data="item" :col-data="wrappedColumns.rowactions" />
                </div>
              </template>
              <Details v-if="collapseRowIdValue && collapseRowIdValue === item[props.rowId]"  :row-data="item" :col-data="wrappedColumns[props.rowId]" />
            </el-collapse-item>
        </template>
      </PVirtualScroller>
    </el-collapse>
    <!-- <el-collapse v-model="collapseRowIdValue" accordion>
      <el-collapse-item v-for="row, index in dataModel" :key="JSON.stringify(row)" :name="row[props.rowId]">
        <template #title>
          <div class="min-w-fit">
            <CellRenderer v-if="wrappedColumns.selected" rowId="selected" :rowData="row" :colData="wrappedColumns['selected']" />

            <el-text v-if="!wrappedColumns[props.rowId].cellRenderer"> {{row[props.rowId]}} </el-text>
            <CellRenderer v-else :rowId="props.rowId" :rowData="row" :colData="wrappedColumns[props.rowId]" />
          </div>

          <div class="w-full flex flex-row-reverse">
            <CellRenderer v-if="wrappedColumns.rowactions" rowId="rowactions" :rowData="row" :colData="wrappedColumns.rowactions" />
          </div>
        </template>
        <Details v-if="collapseRowIdValue && collapseRowIdValue === row[props.rowId]"  :rowData="row" :colData="wrappedColumns[props.rowId]" />
      </el-collapse-item>
    </el-collapse> -->
  </div>
</div>
</template>


<script lang="tsx" setup>
// tsx used to create components inside ts code (see columns[...].cellRenderer)

import {TableV2FixedDir, type CheckboxValueType, type Column } from 'element-plus'
import type { ITableHeaderCell, ITableHeaderRow } from '~/types/ttableV3'
import type { ITableData } from '../../types/ttable'
const tableStore = storeTablesettings()

const collapseRowIdValue = ref<any>({})
const CellRenderer = (params: any): VNode => {
  const colData = params['colData'] || params['col-data']
  const rowData = params['rowData'] || params['row-data']
  const key = params.key
  if (colData.cellRenderer)
    return colData.cellRenderer({rowData})
  return <el-text>{ key }</el-text>
}
const Details = (params: any): VNode => {
  const rowData = params['rowData'] || params['row-data']
  // const colData = params['colData'] || params['col-data']
  const _width = {'width': '100%'}
  const data: Array<any> = []
  // const _fixedRightLast: Array<any> = []
  const values: Array<ITableHeaderCell> = Object.values(wrappedColumns.value)
  values.forEach((colInfo: ITableHeaderCell) =>{
    const cId:string = colInfo.key as string
    // const visible = tableStore.columns[props.id].includes(cId)
    // const visible = tableStore[props.id + 'Columns'].includes(cId)
    const visible = colInfo._majorKey === undefined && cId !== 'selected'
    if (!visible) { return }
    if (colInfo.key === 'rowactions') { return }

    if (cId.startsWith('_')) {
      // column is a major column / collapseable / with children e.g. Statistics
      const major: any = { id: cId, value: '', children:[]}
      Object.values(wrappedColumns.value).filter(e => e._majorKey === cId).map(
        (e:any) => major.children.push({ id: e.dataKey, value: rowData[e.dataKey]}) )
      data.push(major)
    } else if (colInfo.fixed === TableV2FixedDir.RIGHT){
      // _fixedRightLast.push({ id: cId, value: rowData[cId]})
    } else {
      data.push({ id: cId, value: rowData[cId]})
    }
  })
  return <div class="mx-3">
      <el-table
        show-header={false}
        lazy={true}
        data={data}
        size="small"
        row-key="id"
        style={_width}
        table-layout="auto"
        default-expand-all
      >
        <el-table-column prop="id" label="id">
          {{
            default: (scope: any) => {
              const rowKey = scope.row.id
              const rowObj = columnsModel.value[rowKey]
              if (rowKey == undefined || rowKey == 'rowactions' || rowKey == 'actionRequest') {
                return <el-text>{ columnsModel.value[rowKey].title || columnsModel.value[rowKey].tooltip }</el-text>
              }
              if (rowObj.headerCellRenderer !== undefined) {
                return rowObj.headerCellRenderer({ rowData } as any)
              }
              return <el-text>{ columnsModel.value[rowKey].title || columnsModel.value[rowKey].tooltip }</el-text>
            }
          }}

        </el-table-column>
        <el-table-column prop="value" label="value" align={'right'}>
          {{
            default: (scope: any) => {
              const rowKey = scope.row.id
              if (rowKey.startsWith('_')) {
                return
              }
              const rowValue = scope.row.value
              const colInfo = wrappedColumns.value[rowKey]

              const renderer = colInfo.cellRenderer
              if (renderer !== undefined) {
                return renderer({ rowData } as any)
              }
              return <el-text>{ rowValue }</el-text>
            }
          }}
        </el-table-column>
      </el-table>
    </div>
}

const columnsModel = defineModel<ITableHeaderRow>('columns', { required:true})
const dataModel = defineModel<Array<any>>('data', { required:true})
const props = defineProps({
  // columns: { type: Object as PropType<ITableHeaderRow>, required:true},
  tableData: { type: Object as PropType<ITableData>, required:true },
  rowId: { type: String, default: 'depotId'},
  data: { type: Array<any>, required:true},
  id: { type: String, default: 'servers' },
  sortBy: { type: String, default: 'selection'},
  // fetch: {type: Function, default: (p:any) => {} },
  isLoading: { type: Boolean, default: false, required:false },
})
const $emit = defineEmits(['fetch', 'selection-changed', 'selection-clear', 'update-input-filter'])
const wrappedColumns = ref<ITableHeaderRow>({})
wrappedColumns.value = updateColumns()
// const wrappedData = ref<Array<any>>([])
// onMounted(()=>{
//   // wrappedColumns.value = updateColumns()
//   // wrappedData.value = updateData()
// })

// const visibleColumns = reactive<Array<string>>([])
watch (()=>dataModel, ()=>{ wrappedColumns.value = updateColumns() }, {deep: true})
watch (()=>columnsModel, ()=>{ wrappedColumns.value = updateColumns() }, {deep: true})
// wrappedData.value = updateData()

watch(()=>tableStore[props.id + 'Columns' as keyof typeof tableStore], ()=>{
  const curRow = collapseRowIdValue.value
  collapseRowIdValue.value = undefined
  collapseRowIdValue.value = curRow
})
function updateColumns() {
  if (columnsModel.value == undefined) return {}

  const _columns: ITableHeaderRow = JSON.parse(JSON.stringify(columnsModel.value))
  for (const [key, value] of Object.entries(columnsModel.value)) {
    if (value.cellRenderer !== undefined) {
      _columns[key].cellRenderer = value.cellRenderer
    }
    if (value.headerCellRenderer !== undefined) {
      _columns[key].headerCellRenderer = value.headerCellRenderer
    }
  }
  // Object.values(_columns)
  //   .map(c => {
  //     if (!c.fixed) c.hidden = true
  //   } )

  if (columnsModel.value?.selected === undefined) {
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
  if (dataModel.value === undefined) return []
  const _data = dataModel
  return _data
}

</script>

<style scoped>
:global(section > section > main.el-main) {
  overflow: hidden;
}
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