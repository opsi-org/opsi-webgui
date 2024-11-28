
<template>
  <el-table
    :data="fetchedData"
    v-loading="isLoading"
    @sort-change="(s:any) => $emit('handleSortChange', s)"
    @row-click="onRowClick"
    >
        <template v-for="column in tableColumn">
          <el-table-column
            v-if="column.visible || column.alwaysVisible"
            :key="column.key"
            :prop="column.key"
            :label="column.title"
            :type="column.type"
            :width="column.width || ''"
            :sortable="column.sortable"
          >
            <template #header v-if="column.headerCellRenderer">
              <HeaderCellRenderer :col-data="column"/>
            </template>
            <template #header v-else-if="column.icon">
              <el-tooltip
              class="box-item"
              effect="dark"
              :content="column.title"
              >
              <el-text><IconIIcon :icon="column.icon" /> </el-text>
            </el-tooltip>
            </template>
            <template #header v-else>
              <el-text>{{ column.title }}</el-text>
            </template>


            <template #default="scope" v-if="column.key === 'actions'">
              <div v-contextmenu="thisinstance?.vnode?.props?.onShowContextMenu ? (e:any) => onContextMenu(e, scope) : () =>{}">
                <el-tooltip :content="$t('title.config')" placement="top" v-if="thisinstance?.vnode?.props?.onHandleConfigClick">
                  <el-button
                    type="text"
                    @click="$emit('handleConfigClick', scope.row)"
                    :class="{ 'is-active': activeButton === 'config-' + scope.row.clientId }"
                  >
                    <IconIIcon :icon="icons.settings" />
                  </el-button>
                </el-tooltip>
                <el-tooltip :content="$t('title.log')" placement="top" v-if="thisinstance?.vnode?.props?.onHandleLogClick">
                  <el-button
                    type="text"
                    @click="$emit('handleLogClick', scope.row)"
                    :class="{ 'is-active': activeButton === 'log-' + scope.row.clientId }"
                  >
                    <IconIIcon :icon="icons.log" />
                  </el-button>
                </el-tooltip>
                <el-tooltip :content="$t('title.clone')" placement="top" v-if="thisinstance?.vnode?.props?.onHandleCloneClick">
                  <el-button
                    type="text"
                    @click="$emit('handleCloneClick', scope.row)"
                    :class="{ 'is-active': activeButton === 'clone-' + scope.row.clientId }"
                  >
                    <IconIIcon :icon="icons.client" />
                  </el-button>
                </el-tooltip>
                <DropdownDDClientActions :client-ids="[scope.row.clientId]" />
              </div>
            </template>
            <template #default="scope" v-else>
              <CellRenderer :col-data="column" :row-data="scope.row"/>
            </template>
          </el-table-column>
        </template>
      </el-table>
</template>

<script setup lang="tsx">
import {useIcons} from '../../composables/mixins/useIcons'

const thisinstance = getCurrentInstance()
const $t = useI18n().t
const icons = useIcons()
const fetchedData = defineModel<Array<any>>('data', { required:true})
const activeButton = defineModel<string|null>('activeButton')
// const isLoading = defineModel<string>('isLoading', { required:true})

const props = defineProps({
  // columns: { type: Object as PropType<ITableHeaderRow>, required:true},
  rowId: { type: String, required: true },
  isLoading: { type: Boolean, required: true },
  tableColumn: { type: Array<any>, required: true },
})
const $emit = defineEmits(['handleSortChange', 'handleCloneClick', 'handleLogClick', 'handleConfigClick', 'showContextMenu', 'selectionChanged'])

function onRowClick(row: any, column: any, event: any) {
  if (['svg', 'button', 'path', "span"].includes(event.target?.localName)) {
    //console.warn("onRowClick: clicked on another item in row (not row itself)", event.target?.localName)
    return
  }else {
    //console.log("onRowClick: clicked on row", event.target?.localName)
  }
  $emit('selectionChanged', row[props.rowId])
}
function onContextMenu(event: MouseEvent, scope: any) {
   $emit('showContextMenu',{event, row:scope.row})
}


const CellRenderer = (attributes: any): VNode => {
// const CellRenderer = ({key, 'row-data', colData}: any): VNode => {
  const colData  = attributes['col-data'] || attributes.colData
  const rowData = attributes['row-data'] || attributes.rowData

  if (!colData) {
    console.error(`CellRenderer: col-data not found in: ${JSON.stringify(attributes)}`)
    return <el-text>undefined</el-text>
  }
  if (colData.cellRenderer) {
    return colData.cellRenderer({rowData})
  }
  return <el-text>{ rowData[colData.key] }</el-text>
}

const HeaderCellRenderer = (attributes: any): VNode => {
  const colData  = attributes['col-data'] || attributes.colData
  if (!colData) {
    console.warn(`HeaderCellRenderer: col-data not found in: ${JSON.stringify(attributes)}`)
    return <el-text>undefined</el-text>
  }
  if (colData.headerCellRenderer){
    return colData.headerCellRenderer()
  }
  return <el-text>{ colData.title }</el-text>
}
</script>
