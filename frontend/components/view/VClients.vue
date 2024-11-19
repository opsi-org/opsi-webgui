<template>
  <div>
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
                  <el-button type="text" @click="toggleSortOrder">
                    <IconIIcon :icon="sortDesc ? icons.sortDesc : icons.sortAsc" />
                    {{ sortDesc ? 'Sort Descending' : 'Sort Ascending' }}
                  </el-button>
                </div>
                <div class="dropdown-items">
                  <template v-for="column in tableColumn" :key="column.key">
                    <el-dropdown-item>
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
            <el-button type="text" @click="filterQuery = ''" >
              <IconIIcon :icon="icons.x" />
            </el-button>
          </template>
        </el-input>
        <el-tooltip :content="$t('label.refresh')" placement="top">
          <el-button type="text" @click="refreshTable">
            <IconIIcon :icon="icons.refresh" />
          </el-button>
        </el-tooltip>
      </div>
      <div class="toolbar-right">
        <el-button type="primary">New Button</el-button>
      </div>
    </div>

    <div ref="infiniteScrollDiv" style="height: 80vh; overflow-y: auto;" @scroll="debouncedHandleScroll">
      <div v-if="!isFirstPage" class="extra-column">
        <div v-if="!isLoading">Scroll up to load previous page...</div>
      </div>
      <el-table :data="fetchedData" v-loading="isLoading" @sort-change="handleSortChange">
        <template v-for="column in tableColumn">
          <el-table-column
            v-if="column.visible || column.alwaysVisible"
            :key="column.key"
            :prop="column.key"
            :label="column.title"
            :type="column.type"
            :sortable="column.sortable"
          >
            <template #default="scope" v-if="column.key === 'actions'">
              <div v-contextmenu="(event: MouseEvent) => showContextMenu(event, scope.row)">
                <el-tooltip :content="$t('title.config')" placement="top">
                  <el-button
                    type="text"
                    @click="handleConfigClick(scope.row)"
                    :class="{ 'is-active': activeButton === 'config-' + scope.row.clientId }"
                  >
                    <IconIIcon :icon="icons.settings" />
                  </el-button>
                </el-tooltip>
                <el-tooltip :content="$t('title.log')" placement="top">
                  <el-button
                    type="text"
                    @click="handleLogClick(scope.row)"
                    :class="{ 'is-active': activeButton === 'log-' + scope.row.clientId }"
                  >
                    <IconIIcon :icon="icons.log" />
                  </el-button>
                </el-tooltip>
                <el-tooltip :content="$t('title.clone')" placement="top">
                  <el-button
                    type="text"
                    @click="handleCloneClick(scope.row)"
                    :class="{ 'is-active': activeButton === 'clone-' + scope.row.clientId }"
                  >
                    <IconIIcon :icon="icons.client" />
                  </el-button>
                </el-tooltip>
                <DropdownDDClientActions :client-ids="[scope.row.clientId]" />
              </div>
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

<script setup lang="ts">
import { debounce } from 'lodash'
import type { T_ClientsList } from '~/types/APItypes';
import { useNotification } from '~/composables/mixins/useComponent';
import {useIcons} from '../../composables/mixins/useIcons'
import { useRouter } from 'vue-router'
import { vContextmenu } from '../../composables/mixins/v-contextmenu'

const icons = useIcons()
const router = useRouter()
const { notifyError } = useNotification()
const storeSelection = storeSelections()
const $t = useI18n().t
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
const filterBy = ref('clientId')
const sortBy = ref('clientId')
const sortDesc = ref(true)
const contextMenuVisible = ref(false)
const contextMenuStyle = ref({})
const contextMenuRow = ref(null)

const tableColumn = ref([
  {title: 'selected', key: 'selected', sortable: true, type: 'selection', visible: true, alwaysVisible: true},
  {title: 'clientId', key: 'clientId', sortable: true, visible: true, alwaysVisible: true, filter: true},
  {title: 'macAddress', key: 'macAddress', sortable: false, visible: false},
  {title: 'ipAddress', key: 'ipAddress', sortable: true, visible: false},
  {title: 'description', key: 'description', sortable: false, visible: false},
  {title: 'notes', key: 'notes', sortable: true, visible: false},
  {title: 'lastSeen', key: 'lastSeen', sortable: true, visible: false},
  {title: 'uefi', key: 'uefi', sortable: true, visible: false},
  {title: 'version_outdated_localboot', key: 'version_outdated', sortable: true, visible: true, alwaysVisible: true},
  {title: 'version_outdated_netboot', key: 'version_outdated_netboot', sortable: true, visible: true, alwaysVisible: true},
  {title: 'installationStatus_unknown', key: 'installationStatus_unknown', sortable: true, visible: true, alwaysVisible: true},
  {title: 'installationStatus_installed', key: 'installationStatus_installed', sortable: true, visible: true, alwaysVisible: true},
  {title: 'actionResult_failed', key: 'actionResult_failed', sortable: true, visible: true, alwaysVisible: true},
  {title: 'actionResult_successful', key: 'actionResult_successful', sortable: true, visible: true, alwaysVisible: true},
  {title: 'reachable', key: 'reachable', sortable: false, visible: true, alwaysVisible: true},
  {title: 'actions', key: 'actions', sortable: false, visible: true, alwaysVisible: true},
])



watch([()=>filterQuery.value], fetchClients, { immediate: true })

onMounted(() => {
  fetchClients()
  document.addEventListener('click', handleClickOutside)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside)
})

function refreshTable() {
  fetchClients()
}


function showContextMenu(event: MouseEvent, rowData: any) {
  event.preventDefault()
  contextMenuRow.value = rowData

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
    await fetchClients()
  }
}

async function scrollDown() {
  if (!isLoading.value && !isLastPage.value) {
    currentPage.value++
    await fetchClients()
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

async function fetchClients() {
  isLoading.value = true
  const params = {
    filterQuery: filterQuery.value,
    pageNumber: currentPage.value,
    perPage: pageSize.value,
    sortBy: sortBy.value,
    sortDesc: sortDesc.value,
    selected: JSON.stringify(storeSelection.selectionClients),
    selectedDepots: JSON.stringify(storeSelection.selectionDepots)
  }
  try {
    const {data, error, headers} = await useApiGETBody<T_ClientsList>('/opsidata/clients', params)
      if (error) {
      notifyError({ message: error?.response?.data?.message || $t('message.error.generic') })
      return
    }
    if (data.value == undefined) {
      notifyError({ message: $t('message.error.empty-response') })
      return
    }
    fetchedData.value = data.value
    totalItems.value = parseInt(headers.get('x-total-count') || '0')
    if (headers.get('x-total-count')) {
      isFirstPage.value = currentPage.value == 1
      isLastPage.value = currentPage.value * pageSize.value >= parseInt(headers.get('x-total-count') || '0')
    }
  } catch (error) {
    notifyError({ message: $t('message.error.unexpected') + error })
  } finally {
    isLoading.value = false
    scrollToTopOfTable()
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
  fetchClients()
}


function handleConfigClick(rowData: any) {
  activeButton.value = 'config-' + rowData.clientId
  router.push('/clients/client/config/' + rowData.ident)
}

function handleLogClick(rowData: any) {
  activeButton.value = 'log-' + rowData.clientId
  router.push('/clients/client/logs/' + rowData.ident)
}

function handleCloneClick(rowData: any) {
  activeButton.value = 'clone-' + rowData.clientId
  router.push('/clients/client/clone/' + rowData.ident)
}

// TODO: Implement Filter by
function applyFilter(columnKey: string) {
  filterBy.value = columnKey
  // fetchClients()
}

function applySort(columnKey: string) {
  sortBy.value = columnKey
  console.error('Sort By', sortBy.value)
  fetchClients()
}

function handleSortChange({ prop }: { prop: string }) {
  sortBy.value = prop
  fetchClients()
}

function toggleSortOrder() {
  sortDesc.value = !sortDesc.value
  fetchClients()
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
