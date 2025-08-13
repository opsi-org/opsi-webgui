<!--
This file is part of opsi-webgui application.
opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
Copyright (c) uib GmbH <info@uib.de> 2025
All rights reserved.
License: AGPL-3.0
-->
<template>
  <div>
    <!-- TABLE HEADER -->
    <div :id="'tableHeader-' + tableId">
      <slot name="header" />
      <div class="toolbar pb-2">
        <div class="toolbar-left">
          <el-button @click="$emit('clearSelection')">
            <IconIIcon :icon="icons.clear" />
          </el-button>
          <el-input v-model="filterQuery" :placeholder="$t('typeToFilter')" clearable>
            <template #prefix>
              <IconIIcon :icon="icons.filter" />
            </template>
          </el-input>

          <el-dropdown trigger="click">
            <el-button>
              <IconIIcon :icon="icons.columns" />
            </el-button>
            <template #dropdown>
              <el-table
                ref="table"
                :data="tableColumn"
                style="width: 100%"
                :height="tableHeight <= 600 ? tableHeight : 'auto'"
              >
                <el-table-column :label="$t('column')" min-width="150px">
                  <!-- prop="title" -->
                  <template #default="scope">
                    <el-text v-if="scope.row.title">{{ scope.row.title }}</el-text>
                    <el-text v-else>{{ $t('selection') }}</el-text>
                  </template>
                </el-table-column>
                <el-table-column :label="$t('columnSelection')">
                  <template #header>
                    <IconIIcon :icon="icons.columns" :title="$t('columnSelection')" />
                  </template>
                  <template #default="scope">
                    <el-checkbox
                      v-model="scope.row.visible"
                      @click.capture.stop
                      :disabled="scope.row.alwaysVisible"
                    />
                  </template>
                </el-table-column>
                <el-table-column :label="$t('sort')">
                  <template #header>
                    <el-button
                      @click="toggleSortOrder"
                      :title="sortDescWrapper ? $t('sortDescending') : $t('sortAscending')"
                    >
                      <IconIIcon :icon="sortDescWrapper ? icons.sortDesc : icons.sortAsc" />
                    </el-button>
                  </template>
                  <template #default="scope">
                    <el-radio
                      v-if="scope.row.sortable"
                      :disabled="!scope.row.sortable"
                      :value="scope.row.key"
                      v-model="sortByWrapper"
                      @change="applySort(scope.row.key)"
                    />
                  </template>
                </el-table-column>
                <el-table-column :label="$t('filter')">
                  <template #header>
                    <IconIIcon :icon="icons.filter" :title="$t('filter')" />
                  </template>
                  <template #default="scope">
                    <el-checkbox
                      v-if="scope.row.filter"
                      disabled
                      v-model="scope.row.filter"
                      @change="applyFilter(scope.row.key)"
                    />
                  </template>
                </el-table-column>
              </el-table>
            </template>
          </el-dropdown>

          <el-button @click="refreshTable" :title="$t('refresh')">
            <IconIIcon :icon="icons.refresh" />
          </el-button>
        </div>
        <div class="toolbar-right">
          <slot name="toolbar-right" />
        </div>
      </div>
    </div>
    <!-- SCROLL AND TABLE -->
    <div
      ref="infiniteScrollDiv"
      class="overflow-y-auto"
      :style="`height: ${visibleTableHeight || availableTableHeight}px !important;
      `"
      @scroll="debouncedHandleScroll"
    >
      <div
        v-if="totalItems > 0 && !isFirstPage"
        class="extra-column"
        :style="`height: ${scrollDivHeight}px;`"
      >
        <div v-if="!isLoading">{{ $t('scrollUpToLoadPreviousPage') }}</div>
      </div>
      <!-- TABLE -->
      <el-table
        v-loading="isLoading"
        :data="fetchedData"
        @sort-change="handleSortChange"
        @row-click="onRowClick"
        class="!overflow-hidden"
        :class="`!min-h-[${tableHeightMin}px]`"
        :height="tableHeight || availableTableHeight"
      >
        <!-- selection -->
        <el-table-column
          :key="'selected'"
          :prop="tableColumnObj['selected'].key"
          :label="tableColumnObj['selected'].title"
          :width="tableColumnObj['selected'].width || ''"
          :sortable="tableColumnObj['selected'].sortable"
        >
          <template #default="scope">
            <CellRenderer
              v-if="tableColumnObj['selected']"
              row-id="selected"
              :row-data="scope.row"
              :col-data="tableColumnObj['selected']"
              :class="`!inline-block my-[2px]`"
            />
          </template>
        </el-table-column>

        <!-- rowId -->
        <el-table-column
          :key="props.rowId"
          :prop="tableColumnObj[props.rowId].key"
          :label="tableColumnObj[props.rowId].title"
          :width="tableColumnObj[props.rowId].width || ''"
          :sortable="tableColumnObj[props.rowId].sortable"
        >
          <template #default="scope">
            <CellRenderer :col-data="tableColumnObj[props.rowId]" :row-data="scope.row" />
          </template>
        </el-table-column>

        <!-- sorted column -->
        <el-table-column
          v-if="!['selected', rowId, 'actions'].includes(sortByWrapper)"
          :key="tableColumnObj[sortByWrapper].key"
          :prop="tableColumnObj[sortByWrapper].key"
          :label="tableColumnObj[sortByWrapper].title"
          :width="tableColumnObj[sortByWrapper].width || ''"
        >
          <template #header v-if="tableColumnObj[sortByWrapper].icon">
            <el-text>
              <IconIIcon
                :icon="tableColumnObj?.[sortByWrapper].icon"
                :title="tableColumnObj?.[sortByWrapper].title"
              />
            </el-text>
          </template>
          <template #header v-else>
            <HeaderCellRenderer :col-data="tableColumnObj[sortByWrapper]" />
          </template>
          <template #default="scope">
            <CellRenderer
              :row-id="sortByWrapper"
              :row-data="scope.row"
              :col-data="tableColumnObj[sortByWrapper]"
              class="min-w-0 whitespace-nowrap overflow-hidden text-ellipsis"
            />
          </template>
        </el-table-column>

        <!-- actions -->
        <el-table-column
          v-else-if="tableColumnObj['actions']"
          key="actions"
          :prop="tableColumnObj['actions'].key"
          :label="tableColumnObj['actions'].title"
          :width="tableColumnObj['actions'].width || ''"
          :sortable="tableColumnObj['actions'].sortable"
        >
          <template #default="scope">
            <ActionsRenderer :row-data="scope.row" />
          </template>
        </el-table-column>

        <!-- expand content -->
        <el-table-column type="expand">
          <template #default="scope">
            <Details
              class="mb-3 px-2"
              :row-data="scope.row"
              :col-data="tableColumnObj[props.rowId]"
            />
          </template>
        </el-table-column>
      </el-table>

      <div class="extra-column" :style="`height: ${scrollDivHeight}px;`">
        <span v-if="totalItems > 0 && !isLastPage && !isLoading">{{
          $t('scrollDownToLoadNextPage')
        }}</span>
      </div>
    </div>

    <!-- TABLE FOOTER -->
    <div class="flex justify-end mt-2" :id="'tableFooter-' + tableId">
      <div class="">
        <el-pagination
          @current-change="handlePagination"
          @size-change="() => {}"
          :current-page="currentPage"
          :page-size="pageSize"
          :page-sizes="[pageSize]"
          :total="totalItems"
          layout="total, sizes, prev, pager, next, jumper"
          size="small"
        />
      </div>
    </div>

    <!-- Custom Context Menu -->
    <div v-if="contextMenuVisible" :style="contextMenuStyle" class="context-menu">
      <ul>
        <li @click="handleCommand(contextMenuRow, 'config')">
          <IconIIcon :icon="icons.settings" /> {{ $t('configuration') }}
        </li>
        <li @click="handleCommand(contextMenuRow, 'log')">
          <IconIIcon :icon="icons.log" /> {{ $t('logs') }}
        </li>
        <li @click="handleCommand(contextMenuRow, 'clone')">
          <IconIIcon :icon="icons.client" /> {{ $t('clone') }}
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="tsx">
  import { useDynamicHeightTable } from '~/composables/mixins/useDynamicHeightTable'
  import { useTableHelper } from '~/composables/mixins/useTableHelper'

  const $t = useI18n().t
  const icons = useIcons()

  const props = defineProps({
    rowId: { type: String, required: true },
    tableId: { type: String, required: true },
    tableColumn: { type: Array<any>, required: true },
    fetch: { type: Function, required: true },
    sortBy: { type: String, default: undefined, required: false },
    sortDesc: { type: [Boolean, String], default: false, required: false },
    actionClone: { type: Function, default: undefined, required: false },
    actionLog: { type: Function, default: undefined, required: false },
    actionConfig: { type: Function, default: undefined, required: false },
    hasClientActions: { type: Boolean, default: false, required: false },
  })

  const $emit = defineEmits(['selectionChanged', 'clearSelection'])

  const table = ref()
  const fetchedData = ref()
  const activeButton = ref<string | null>(null)
  const totalItems = ref<number>(0)
  const currentPage = ref(1)
  const actualDataSize = computed(() => fetchedData.value?.length || 0)
  const tableColumnObj = computed(() => {
    const obj: any = {}
    props.tableColumn.forEach((col: any) => {
      obj[col.key] = col
    })
    return obj
  })

  const {
    pageSize,
    tableHeight,
    availableTableHeight,
    visibleTableHeight,
    scrollDivHeight,
    isFirstPage,
    isLastPage,
    tableHeightMin,
    updateWindowValues,
    setElHeights,
  } = useDynamicHeightTable(actualDataSize, currentPage, totalItems, props.tableId, fetchWrapper)

  const infiniteScrollDiv = ref<HTMLElement | null>(null)
  const {
    // we reuse this functions and refs also in TTableDesktop
    isLoading,
    filterQuery,
    sortByWrapper,
    sortDescWrapper,
    contextMenuVisible,
    contextMenuStyle,
    contextMenuRow,
    debouncedHandleScroll,
    handleCommand,
    toggleSortOrder,
    applySort,
    applyFilter,
    refreshTable,
    handleSortChange,
    handlePagination,
    onRowClick,
    handleClickOutside,
    fetchDataWrapper,

    CellRenderer,
    HeaderCellRenderer,
    Details,
    ActionsRenderer,
  } = useTableHelper(
    props,
    currentPage,
    pageSize,
    $emit,
    fetchedData,
    totalItems,
    isFirstPage,
    isLastPage,
    infiniteScrollDiv,
    activeButton,
    scrollDivHeight
  )

  const hasRowsWrapper = computed(() => totalItems.value > 0)
  defineExpose({
    refetch: () => {
      fetchWrapper()
    },
    fetchedData,
    hasRows: hasRowsWrapper,
    getRowById: (id: string) => {
      return fetchedData.value?.find((row: any) => row[props.rowId] === id)
    },
  })

  onMounted(() => {
    setElHeights()
    fetchWrapper()
    document.addEventListener('click', handleClickOutside)
    window.addEventListener('resize', updateWindowValues)
    window.addEventListener('devicePixelRatio', updateWindowValues)
  })

  onBeforeUnmount(() => {
    document.removeEventListener('click', handleClickOutside)
    window.removeEventListener('resize', updateWindowValues)
    window.removeEventListener('devicePixelRatio', updateWindowValues)
  })

  async function fetchWrapper() {
    await fetchDataWrapper()
  }
</script>

<style scoped>
  .extra-column {
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

  :deep(.el-table__expand-column .cell),
  :deep(.el-table__expand-column .el-table__expand-icon) {
    padding: 0px !important;
    margin: 0px !important;
    width: fit-content !important;
  }
  :deep(.el-table__expand-column) {
    width: fit-content !important;
    justify-items: center;
    margin: 0px !important;
    padding: 0px 2px !important;
  }
  :deep(.el-pagination__sizes),
  :deep(.btn-prev),
  :deep(.el-pagination__jump) {
    --el-pagination-item-gap: 5px;
  }
</style>
