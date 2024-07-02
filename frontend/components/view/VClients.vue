<template>
  <div>
    <el-dropdown trigger="click">
      <el-button type="text">
        Columns <i class="el-icon-arrow-down el-icon--right"></i>
      </el-button>
      <template #dropdown>
        <template v-for="column in tableColumn" >
          <el-dropdown-item v-if="!column.alwaysVisible" :key="column.key">
            <el-checkbox v-model="column.visible" @click.stop>{{ column.title }}</el-checkbox>
          </el-dropdown-item>
        </template>
      </template>
    </el-dropdown>

    <div ref="infiniteScrollDiv" style="height: 80vh; overflow-y: auto;" @scroll="debouncedHandleScroll">
      <div v-if="!isFirstPage" class="extra-column">
        <div v-if="!isLoading">Scroll up to load previous page...</div>
      </div>
      <el-table :data="fetchedData" v-loading="isLoading">
        <template v-for="column in tableColumn">
          <el-table-column
            v-if="column.visible || column.alwaysVisible"
            :key="column.key"
            :prop="column.key"
            :label="column.title"
            :type="column.type"
            :sortable="column.sortable"
          >
          </el-table-column>
        </template>
      </el-table>
      <div class="extra-column">
        <span v-if="!isLastPage && !isLoading" >Scroll down to load next page...</span>
      </div>
    </div>

    <div class="flex justify-end">
      <el-pagination
        @current-change="handlePagination"
        :current-page="currentPage"
        :page-size="pageSize"
        layout="total, prev, pager, next, jumper"
        :total="totalItems">
      </el-pagination>
    </div>
  </div>
</template>
<script setup lang="ts">
import { debounce } from 'lodash'
import type { T_ClientsList } from '~/types/APItypes';
import { useNotification } from '~/composables/mixins/useComponent';
const { notifyError } = useNotification()
const storeSelection = storeSelections()
const $t = useI18n().t
let fetchedData = ref()
const totalItems = ref<number>(0)
const currentPage = ref(1)
const pageSize = ref(20)
const isLoading = ref(false)
let isFirstPage = ref(false)
let isLastPage = ref(false)
let infiniteScrollDiv = ref<HTMLElement | null>(null)

const tableColumn = ref([
  {title: 'selected', key: 'selected', sortable: false, type: 'selection', visible: true, alwaysVisible: true},
  {title: 'clientId', key: 'clientId', sortable: true, visible: true, alwaysVisible: true},
  {title: 'macAddress', key: 'macAddress', sortable: false, visible: false},
  {title: 'ipAddress', key: 'ipAddress', sortable: true, visible: false},
  {title: 'description', key: 'description', sortable: false, visible: false},
  {title: 'notes', key: 'notes', sortable: true, visible: false},
  {title: 'lastSeen', key: 'lastSeen', sortable: false, visible: false},
  {title: 'uefi', key: 'uefi', sortable: true, visible: false},
  {title: 'version_outdated', key: 'version_outdated', sortable: false, visible: false},
  {title: 'version_outdated_netboot', key: 'version_outdated_netboot', sortable: false, visible: false},
  {title: 'installationStatus_unknown', key: 'installationStatus_unknown', sortable: false, visible: true},
  {title: 'installationStatus_installed', key: 'installationStatus_installed', sortable: false, visible: true},
  {title: 'actionResult_failed', key: 'actionResult_failed', sortable: false, visible: true},
  {title: 'actionResult_successful', key: 'actionResult_successful', sortable: false, visible: true},
  {title: 'reachable', key: 'reachable', sortable: false, visible: false},
  {title: 'actions', key: 'actions', sortable: false, visible: true, alwaysVisible: true},
])

onMounted(() => {
  fetchClients()
})

function handleScroll(event: Event) {
  let target = event.target as HTMLElement;
  let dynamicScrollThreshold = target.clientHeight / fetchedData.value.length;
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
    filterQuery: '',
    pageNumber: currentPage.value,
    perPage: pageSize.value,
    sortBy:'clientId',
    sortDesc:true,
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
    notifyError({ message: $t('message.error.unexpected') })
  } finally {
    isLoading.value = false
    scrollToTopOfTable()
  }
}

function handlePagination(val: number) {
  currentPage.value = val
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

</style>