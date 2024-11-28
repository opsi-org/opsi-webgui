<template>
  <div>
    <slot name="header" />

    <div class="toolbar">
      <div class="toolbar-left">
        <el-dropdown trigger="click">
          <el-button>
            <IconIIcon :icon="icons.columns" />
          </el-button>
          <template #dropdown>
            <div class="dropdown-content">
              <div class="dropdown-section">
                <div class="dropdown-title">
                  <IconIIcon :icon="icons.filter" /> Filter By
                </div>
                <div class="dropdown-items">
                  <template v-for="column in tableColumn" :key="column.key">
                    <el-dropdown-item>
                      <el-checkbox :disabled="!column.filter" v-model="column.filter" @change="applyFilter(column.key)" />
                    </el-dropdown-item>
                  </template>
                </div>
              </div>
              <div class="dropdown-section">
                <div class="dropdown-title">
                  <el-button link @click="toggleSortOrder">
                    <IconIIcon :icon="sortDesc ? icons.sortDesc : icons.sortAsc" />
                    {{ sortDesc ? 'Sort Descending' : 'Sort Ascending' }}
                  </el-button>
                </div>
                <div class="dropdown-items">
                  <template v-for="column in tableColumn" :key="column.key">
                    <el-dropdown-item >
                      <el-radio :disabled="!column.sortable" v-model="column.sortable" @change="applySort(column.key)" />
                    </el-dropdown-item>
                  </template>
                </div>
              </div>
              <div class="dropdown-section">
                <div class="dropdown-title">
                  <IconIIcon :icon="icons.columns" /> Column Selection
                </div>
                <div class="dropdown-items">
                  <template v-for="column in tableColumn" :key="column.key">
                    <el-dropdown-item>
                      <el-checkbox v-model="column.visible" @click.stop :disabled="column.alwaysVisible">{{ column.title }}</el-checkbox>
                    </el-dropdown-item>
                  </template>
                </div>
              </div>
            </div>
          </template>
        </el-dropdown>
        <el-input v-model="filterQuery" placeholder="Type to filter..." class="w-50" >
          <template #prepend>
            <IconIIcon :icon="icons.filter" />
          </template>
          <template #append>
            <el-button link @click="filterQuery = ''" >
              <IconIIcon :icon="icons.x" />
            </el-button>
          </template>
        </el-input>
        <el-tooltip :content="$t('label.refresh')" placement="top">
          <el-button link @click="refreshTable">
            <IconIIcon :icon="icons.refresh" />
          </el-button>
        </el-tooltip>
        <ButtonBTNClearSelection @clearselection="$emit('clearSelection')" />
      </div>
      <div class="toolbar-right">
        <el-button type="primary">New Button</el-button>
      </div>
    </div>

    <!-- <div ref="infiniteScrollDiv" :style="'height: calc(80vh - var(--)); overflow-y: auto;'" @scroll="debouncedHandleScroll"> -->
    <div ref="infiniteScrollDiv"
      class="overflow-y-auto h-"
      :style="'height: ' + bodyHeight"
      @scroll="debouncedHandleScroll">
      <div v-if="!isFirstPage" class="extra-column">
        <div v-if="!isLoading">Scroll up to load previous page...</div>
      </div>
      <el-table
        :data="fetchedData"
        v-loading="isLoading"
        @sort-change="handleSortChange"
        @row-click="onRowClick"
        >
            <template v-for="column in tableColumn">
              <el-table-column
                v-if="column.visible || column.alwaysVisible"
                :key="column.key"
                :prop="column.key"
                :label="column.title"
                :width="column.width || ''"
                :sortable="column.sortable"
                >
                <template #header v-if="column.icon">
                  <el-tooltip
                  class="box-item"
                  effect="dark"
                  :content="column.title"
                  >
                  <el-text><IconIIcon :icon="column.icon" /> </el-text>
                </el-tooltip>
                </template>
                <template #header v-else>
                  <HeaderCellRenderer :col-data="column"/>
                </template>


                <template #default="scope" v-if="column.key === 'actions'">
                  <div v-contextmenu="(e:any) => showContextMenu(e, scope)">
                  <!-- <div v-contextmenu="thisinstance?.vnode?.props?.onShowContextMenu ? (e:any) => onContextMenu(e, scope) : () =>{}"> -->
                    <el-tooltip :content="$t('title.config')" placement="top" v-if="actionConfig">
                      <el-button
                        type="text"
                        @click="handleConfigClick(scope.row)"
                        :class="{ 'is-active': activeButton === 'config-' + scope.row.clientId }"
                      >
                        <IconIIcon :icon="icons.settings" />
                      </el-button>
                    </el-tooltip>
                    <el-tooltip :content="$t('title.log')" placement="top" v-if="actionLog">
                      <el-button
                        type="text"
                        @click="handleLogClick(scope.row)"
                        :class="{ 'is-active': activeButton === 'log-' + scope.row.clientId }"
                      >
                        <IconIIcon :icon="icons.log" />
                      </el-button>
                    </el-tooltip>
                    <el-tooltip :content="$t('title.clone')" placement="top" v-if="actionClone">
                      <el-button
                        type="text"
                        @click="handleCloneClick(scope.row)"
                        :class="{ 'is-active': activeButton === 'clone-' + scope.row.clientId }"
                      >
                        <IconIIcon :icon="icons.client" />
                      </el-button>
                    </el-tooltip>
                    <DropdownDDClientActions v-if="hasClientActions" :client-ids="[scope.row.clientId]" />
                  </div>
                </template>
                <template #default="scope" v-else>
                  <CellRenderer :col-data="column" :row-data="scope.row"/>
                </template>
              </el-table-column>
            </template>
      </el-table>
      <div class="extra-column">
        <span v-if="!isLastPage && !isLoading">Scroll down to load next page...</span>
      </div>
    </div>

    <div class="flex justify-end">
      <el-pagination
        @current-change="handlePagination"
        :current-page="currentPage"
        :page-size="pageSize"
        layout="total, prev, pager, next, jumper"
        :total="totalItems"
      />
    </div>

    <!-- Custom Context Menu -->
    <div v-if="contextMenuVisible" :style="contextMenuStyle" class="context-menu">
      <ul>
        <li @click="handleCommand(contextMenuRow, 'config')">
          <IconIIcon :icon="icons.settings" /> {{ $t('title.config') }}
        </li>
        <li @click="handleCommand(contextMenuRow, 'log')">
          <IconIIcon :icon="icons.log" /> {{ $t('title.log') }}
        </li>
        <li @click="handleCommand(contextMenuRow, 'clone')">
          <IconIIcon :icon="icons.client" /> {{ $t('title.clone') }}
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="tsx">
import { debounce } from 'lodash'
import { useNotification } from '~/composables/mixins/useComponent';
import {useIcons} from '../../composables/mixins/useIcons'
// import { useRouter } from 'vue-router'
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { vContextmenu } from '../../composables/mixins/v-contextmenu'

// const fetchedData = defineModel<Array<any>>('data', { required:true})
// const activeButton = defineModel<string|null>('activeButton')
// const isLoading = defineModel<string>('isLoading', { required:true})

const { notifyError } = useNotification()
const $t = useI18n().t
const router = useRouter()
const icons = useIcons()

// const storeSelection = storeSelections()

const props = defineProps({
  // columns: { type: Object as PropType<ITableHeaderRow>, required:true},
  rowId: { type: String, required: true },
  // isLoading: { type: Boolean, required: true },
  tableColumn: { type: Array<any>, required: true },
  fetch: { type: Function, required: true },
  bodyHeight: { type: String, default: '80vh', required: false },
  sortBy: { type: String, default: undefined, required: false },
  actionClone: { type: String, default: undefined, required: false },
  actionLog: { type: String, default: undefined, required: false },
  actionConfig: { type: String, default: undefined, required: false },
  hasClientActions: { type: Boolean, default: false, required: false },
})

const $emit = defineEmits(['selectionChanged', 'clearSelection'])

const fetchedData = ref()
const activeButton = ref<string | null>(null)
const totalItems = ref<number>(0)
const currentPage = ref(1)
const pageSize = ref(20)
const isLoading = ref(false)
const isFirstPage = ref(false)
const isLastPage = ref(false)
const infiniteScrollDiv = ref<HTMLElement | null>(null)
const filterQuery = ref('')
const filterBy = ref(props.rowId)
const sortBy = ref(props.sortBy || props.rowId)
const sortDesc = ref(true)
const contextMenuVisible = ref(false)
const contextMenuStyle = ref({})
const contextMenuRow = ref(null)


defineExpose({ refetch: fetchWrapper, fetchedData })


watch([()=>filterQuery.value], fetchWrapper, { immediate: true })
watch(()=>props.sortBy, () => {
  sortBy.value = props.sortBy || props.rowId
  fetchWrapper()
})
onMounted(() => {
  fetchWrapper()
  document.addEventListener('click', handleClickOutside)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside)
})
async function fetchWrapper() {
  isLoading.value = true
  const params = {
    filterQuery: filterQuery.value,
    pageNumber: currentPage.value,
    perPage: pageSize.value,
    sortBy: sortBy.value,
    sortDesc: sortDesc.value,
  }
  // fetchedData.value = undefined
  try {
    const res = await props.fetch(params)
    if (res.total) {
      totalItems.value = res.total
      isFirstPage.value = currentPage.value == 1
      isLastPage.value = currentPage.value * pageSize.value >= res.total
      if (res.total > 0) {
        const pageExists = currentPage.value <= Math.ceil(res.total / pageSize.value)
        console.error('Page Not Exists current page:', currentPage.value, 'total:', res.total, 'page size:', pageSize.value, 'page exists:', pageExists)
        if (!pageExists) {
          console.error('setting current page to last page')
          currentPage.value = Math.ceil(res.total / pageSize.value)
        }
      }

    }
    fetchedData.value = res.data
  } catch (error) {
    notifyError({ message: $t('message.error.unexpected') + error })
  } finally {
    isLoading.value = false
    scrollToTopOfTable()
  }
}

function refreshTable() {
  fetchWrapper()
}


function showContextMenu(event: any, row: any) {
// function showContextMenu(event: MouseEvent, rowData: any) {
  event.preventDefault()
  contextMenuRow.value = row

  const menuWidth = 200;
  const menuHeight = 350;
  const pageWidth = window.innerWidth;
  const pageHeight = window.innerHeight;

  let left = event.clientX;
  let top = event.clientY;

  if (left + menuWidth > pageWidth) {
    left = pageWidth - menuWidth;
  }

  if (top + menuHeight > pageHeight) {
    top = pageHeight - menuHeight;
  }

  contextMenuStyle.value = {
    top: `${top}px`,
    left: `${left}px`,
    position: 'absolute',
    zIndex: 1000,
  }
  contextMenuVisible.value = true
}

function handleClickOutside(event: MouseEvent) {
  const contextMenu = document.querySelector('.context-menu')
  if (contextMenu && !contextMenu.contains(event.target as Node)) {
    contextMenuVisible.value = false
  }
}

function handleScroll(event: Event) {
  const target = event.target as HTMLElement;
  const dynamicScrollThreshold = target.clientHeight / fetchedData.value.length;
  if (target.scrollTop <= dynamicScrollThreshold) {
    scrollUp();
  } else if (target.scrollHeight - target.scrollTop <= target.clientHeight + dynamicScrollThreshold) {
    scrollDown();
  }
}

const debouncedHandleScroll = debounce(handleScroll, 200)

async function scrollUp() {
  if (!isLoading.value && !isFirstPage.value) {
    currentPage.value--
    await fetchWrapper()
  }
}

async function scrollDown() {
  if (!isLoading.value && !isLastPage.value) {
    currentPage.value++
    await fetchWrapper()
  }
}

function scrollToTopOfTable() {
  if (infiniteScrollDiv.value) {
    if (currentPage.value == 1) {
      infiniteScrollDiv.value.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
      return
    }
    infiniteScrollDiv.value.scrollTo({
      top: 400,
      behavior: 'smooth'
    });
  }
}


function handleCommand(rowData: any, command: string) {
  contextMenuVisible.value = false
  switch (command) {
    case 'config':
      handleConfigClick(rowData)
      break
    case 'log':
      handleLogClick(rowData)
      break
    case 'clone':
      handleCloneClick(rowData)
      break
  }
}

function handlePagination(val: number) {
  currentPage.value = val
  fetchWrapper()
}


function handleConfigClick(rowData: any) {
  activeButton.value = 'config-' + rowData[props.rowId]
  router.push(props.actionConfig + rowData.ident)
}

function handleLogClick(rowData: any) {
  activeButton.value = 'log-' + rowData[props.rowId]
  router.push(props.actionLog + rowData.ident)
}

function handleCloneClick(rowData: any) {
  activeButton.value = 'clone-' + rowData[props.rowId]
  router.push(props.actionClone + rowData.ident)
}

// TODO: Implement Filter by
function applyFilter(columnKey: string) {
  filterBy.value = columnKey
  // fetchWrapper()
}

function applySort(columnKey: string) {
  sortBy.value = columnKey
  console.error('Sort By', sortBy.value)
  fetchWrapper()
}

function handleSortChange({prop, order}: {column: any, prop: string, order: any }) {
  sortBy.value = prop
  sortDesc.value = order === 'descending'
  fetchWrapper()
}

function toggleSortOrder() {
  sortDesc.value = !sortDesc.value
  fetchWrapper()
}
function onRowClick(row: any, column: any, event: any) {
  if (['svg', 'button', 'path', "span"].includes(event.target?.localName)) {
    return
  }
  $emit('selectionChanged', row[props.rowId])
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

<style scoped>
.extra-column {
  height: 400px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
}
.toolbar-left {
  display: flex;
  align-items: center;
  gap: 10px;
}

.toolbar-right {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 10px;
}
.dropdown-content {
  display: flex;
  padding: 10px;
}

.dropdown-section {
  flex: 1;
  margin-right: 20px;
}

.dropdown-title {
  font-weight: bold;
  margin-bottom: 5px;
  display: flex;
  align-items: center;
}

.dropdown-items {
  display: flex;
  flex-direction: column;
  gap: 5px;
}
.context-menu {
  background-color: white;
  border: 1px solid #ccc;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  padding: 10px;
  border-radius: 4px;
  width: 200px;
  max-height: 350px;
  overflow: auto;
}
.context-menu ul {
  list-style: none;
  padding: 0;
  margin: 0;
}
.context-menu li {
  padding: 5px 10px;
  cursor: pointer;
}
.context-menu li:hover {
  background-color: #f0f0f0;
}
</style>
