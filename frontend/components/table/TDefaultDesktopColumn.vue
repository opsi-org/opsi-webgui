<template>
  <PColumn
    :key="props.column.key"
    :fields="props.column.key"
    :header="props.column.title"
    />
</template>

<script setup lang="tsx">
  // <PColumn
  //   :column-key="props.column.key"
  //   :key="props.column.key"
  //   :fields="props.column.key"
  //   :header="props.column.title"
  //   :sortable="props.column.sortable"
  //   :class="{
  //     '!w-1/1': true,
  //     '': props.column._fixed === TableV2FixedDir.LEFT || props.column.fixed === TableV2FixedDir.LEFT || props.column.fixed === true || props.column._fixed === true,
  //     'flex flex-row-reverse': props.column._fixed === TableV2FixedDir.RIGHT || props.column.fixed === TableV2FixedDir.RIGHT,
  //     // []: Boolean(props.column._fixed) === false && Boolean(props.column.fixed) === false,
  //     // [props.column.class]: true,
  //   }"
  //   >
  //   <template v-if="props.column.headerCellRenderer" #header="slotProps">
  //     <HeaderCellRenderer :colData="props.column" :key="props.column.title"/>
  //   </template>
  //   <template v-else-if="props.column.icon" #header>
  //     <el-tooltip
  //       effect="dark"
  //       :content="props.column.tooltip"
  //       placement="bottom-end"
  //     >
  //     <!-- <IconIIcon :icon="props.column.icon" :style="'color: blue'" /> -->
  //     <IconIIcon :icon="props.column.icon" :style="'color: var(' + props.column.iconColor + ')'" />
  //     </el-tooltip>
  //   </template>

  //   <template v-if="props.column.cellRenderer" #body="slotProps">
  //     <el-text v-if="slotProps.data[props.rowId] && slotProps.data.dummy && props.column.key==props.rowId"
  //       class="min-h-24"
  //     >
  //     <!-- @click="onScroll(slotProps.data.direction)" -->
  //       {{ slotProps.data[props.rowId] }}
  //     </el-text>
  //     <CellRenderer v-else-if="!slotProps.data.dummy" :colData="props.column" :key="props.column.key" :rowData="slotProps.data"/>
  //   </template>
  // </PColumn>
// import Column from 'primevue/column'
import { TableV2FixedDir } from 'element-plus';
import type { ITableHeaderCell, ITableHeaderRow } from '~/types/ttableV3';

// log().log_colored('red', "TDefaultDesktopColumn !!!!!!!!!!!!!!!!!!!!!")

const HeaderCellRenderer = ({colData}: any) => {
  if (colData.headerCellRenderer)
    return colData.headerCellRenderer()
  return <el-text>{ colData.title }</el-text>
}
const CellRenderer = ({key, rowData, colData}: any) => {
  if (colData.cellRenderer)
    return colData.cellRenderer({rowData})
  return <el-text>{ key }</el-text>
}

const props = defineProps({
  column: { type: Object as PropType<ITableHeaderCell>, required:true},
  // data: { type: Array<any>, required:true},
  // tableData: { type: Object as PropType<ITableData>, required:true },
  // totalItems: { type: Number, required:true },
  // id: { type: String, default: 'servers' },
  rowId: { type: String, default: 'depotId'},
  // sortBy: { type: String, default: 'selection'},
  // isMobile: { type: Boolean, default: ()=> {return useMQ().isMobile.value}},
  // isLoading: { type: Boolean, default: false, required:false },
})
</script>