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
      <div class="toolbar">
        <div class="toolbar-left">
          <el-button @click="$emit('clearSelection')">
            <IconIIcon :icon="icons.clear" />
          </el-button>
          <el-input
            v-model="filterQuery"
            :placeholder="$t('label.filter.placeholder')"
            clearable
          >
            <template #prefix>
              <IconIIcon :icon="icons.filter" />
            </template>
          </el-input>

          <el-dropdown trigger="click">
            <el-button>
              <IconIIcon :icon="icons.columns" />
            </el-button>
            <template #dropdown>
              <div class="table-caption">
                <el-checkbox
                  v-model="storeTSettings.otherSettings[props.tableId].border"
                  :label="$t('table.settings.border')"
                />

                <el-checkbox
                  v-model="storeTSettings.otherSettings[props.tableId].stripe"
                  :label="$t('table.settings.stripe')"
                />
                <el-checkbox
                  v-if="
                    storeTSettings.otherSettings[props.tableId]
                      .statisticIcons != undefined
                  "
                  v-model="
                    storeTSettings.otherSettings[props.tableId].statisticIcons
                  "
                  :label="$t('table.settings.statisticIcons')"
                />
                <el-checkbox
                  v-if="
                    storeTSettings.otherSettings[props.tableId]
                      .reachableAllClients != undefined
                  "
                  v-model="
                    storeTSettings.otherSettings[props.tableId]
                      .reachableAllClients
                  "
                  :label="$t('table.settings.reachableAllClients')"
                />
              </div>
              <el-table
                ref="table"
                :data="tableColumn"
                style="width: 100%"
                :height="
                  availableTableHeight <= 700
                    ? availableTableHeight - 100
                    : availableTableHeight
                "
              >
                <el-table-column :label="$t('label.column')" min-width="150px">
                  <!-- prop="title" -->
                  <template #default="scope">
                    <el-text v-if="scope.row.title">{{
                      scope.row.title
                    }}</el-text>
                    <el-text v-else>{{ $t('label.selection') }}</el-text>
                  </template>
                </el-table-column>
                <el-table-column :label="$t('label.column.selection')">
                  <template #header>
                    <el-tooltip :content="$t('label.column.selection')">
                      <IconIIcon :icon="icons.columns" />
                    </el-tooltip>
                  </template>
                  <template #default="scope">
                    <el-checkbox
                      v-model="scope.row.visible"
                      @click.capture.stop
                      :disabled="scope.row.alwaysVisible"
                    />
                  </template>
                </el-table-column>
                <el-table-column :label="$t('label.sort')">
                  <template #header>
                    <el-tooltip
                      :content="
                        sortDesc
                          ? $t('label.sort.descending')
                          : $t('label.sort.ascending')
                      "
                    >
                      <el-button @click="toggleSortOrder">
                        <IconIIcon
                          :icon="sortDesc ? icons.sortDesc : icons.sortAsc"
                        />
                      </el-button>
                    </el-tooltip>
                  </template>
                  <template #default="scope">
                    <el-radio
                      v-if="scope.row.sortable"
                      :disabled="!scope.row.sortable"
                      :value="scope.row.key"
                      v-model="sortBy"
                      @change="applySort(scope.row.key)"
                    />
                  </template>
                </el-table-column>
                <el-table-column :label="$t('label.filter')">
                  <template #header>
                    <el-tooltip :content="$t('label.filter')">
                      <IconIIcon :icon="icons.filter" />
                    </el-tooltip>
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

          <el-tooltip :content="$t('label.refresh')" placement="top">
            <el-button @click="refreshTable">
              <IconIIcon :icon="icons.refresh" />
            </el-button>
          </el-tooltip>
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
      :style="`height: ${visibleTableHeight || availableTableHeight}px !important;`"
      @scroll="debouncedHandleScroll"
    >
      <div
        v-if="totalItems > 0 && !isFirstPage"
        class="extra-column"
        :style="`height: ${scrollDivHeight}px;`"
      >
        <div v-if="!isLoading">{{ $t('table.infinit.scrollup') }}</div>
      </div>
      <!-- TABLE -->
      <el-table
        v-loading="isLoading"
        :data="fetchedData"
        :height="tableHeight || availableTableHeight"
        @sort-change="handleSortChange"
        @row-click="onRowClick"
        class="!overflow-hidden"
        table-layout="auto"
        :border="storeTSettings.otherSettings[props.tableId].border"
        :stripe="storeTSettings.otherSettings[props.tableId].stripe"
      >
        <!--  row index -->
        <!-- <el-table-column label="#" align="right" class-name="column-index">
          <template #default="{ $index }">
            <span class="!text-xs !p-[2px]">{{
              $index + 1 + (currentPage - 1) * pageSize
            }}</span>
          </template>
        </el-table-column> -->
        <!-- columns -->
        <template v-for="column in tableColumn">
          <el-table-column
            v-if="column.visible || column.alwaysVisible"
            :key="column.key"
            :prop="column.key"
            :label="column.title"
            :class="column.class"
            :class-name="`column-${column.key} ${column.className} ${column.classNameDyn}`"
            :label-class-name="column.headerClassName"
            :width="column.width || ''"
            :sortable="column.sortable"
            :align="column.align"
          >
            <template #header v-if="column.icon">
              <el-tooltip
                class="box-item !inline-block"
                :class="column.headerClassName"
                effect="dark"
                :content="column.title"
              >
                <el-text class="!inline-block">
                  <!-- {{ column.title }} -->
                  <IconIIcon
                    :icon="column.icon"
                    class="min-w-4 min-h-4 max-w-6 max-h-6"
                  />
                </el-text>
              </el-tooltip>
            </template>
            <template #header v-else>
              <HeaderCellRenderer :col-data="column" />
            </template>

            <template #default="scope" v-if="column.key === 'actions'">
              <div v-contextmenu="(e:any) => showContextMenu(e, scope)">
                <ActionsRenderer :row-data="scope.row" />
              </div>
            </template>
            <template #default="scope" v-else>
              <CellRenderer :col-data="column" :row-data="scope.row" />
            </template>
          </el-table-column>
        </template>
      </el-table>

      <div class="extra-column" :style="`height: ${scrollDivHeight}px;`">
        <span v-if="totalItems > 0 && !isLastPage && !isLoading">{{
          $t('table.infinit.scrolldown')
        }}</span>
      </div>
    </div>

    <!-- TABLE FOOTER -->
    <div class="flex justify-end" :id="'tableFooter-' + tableId">
      <el-pagination
        @current-change="handlePagination"
        @size-change="(v) => {}"
        :current-page="currentPage"
        :page-size="pageSize"
        :page-sizes="[pageSize]"
        layout="total, sizes, prev, pager, next, jumper"
        :total="totalItems"
      />
    </div>

    <!-- Custom Context Menu -->
    <div
      v-if="contextMenuVisible"
      :style="contextMenuStyle"
      class="context-menu"
    >
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
  import { vContextmenu } from '../../composables/mixins/v-contextmenu'
  import { useDynamicHeightTable } from '~/composables/mixins/useDynamicHeightTable'
  import { useTableHelper } from '~/composables/mixins/useTableHelper'
  // import { useZoomLevel } from '@vueuse/electron'

  const $t = useI18n().t
  const icons = useIcons()

  const props = defineProps({
    rowId: { type: String, required: true },
    tableId: { type: String, required: true },
    tableColumn: { type: Array<any>, required: true },
    fetch: { type: Function, required: true },
    // height: { type: String, default: '80vh', required: false },
    sortBy: { type: String, default: undefined, required: false },
    sortDesc: { type: Boolean, default: false, required: false },
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
  const storeTSettings = storeTablesettings()

  const {
    pageSize,
    tableHeight,
    availableTableHeight,
    visibleTableHeight,
    scrollDivHeight,
    isFirstPage,
    isLastPage,
    updateWindowValues,
    setElHeights,
  } = useDynamicHeightTable(
    actualDataSize,
    currentPage,
    totalItems,
    props.tableId,
    fetchWrapper,
  )

  const infiniteScrollDiv = ref<HTMLElement | null>(null)
  const {
    // we reuse this functions and refs also in TTableDesktopMobile
    isLoading,
    filterQuery,
    // filterBy,
    sortBy,
    sortDesc,
    contextMenuVisible,
    contextMenuStyle,
    contextMenuRow,

    debouncedHandleScroll,
    showContextMenu,
    handleCommand,
    toggleSortOrder,
    applySort,
    applyFilter,
    refreshTable,
    handleSortChange,
    handlePagination,
    onRowClick,
    // handleConfigClick,
    // handleLogClick,
    // handleCloneClick,
    handleClickOutside,
    fetchDataWrapper,

    CellRenderer,
    HeaderCellRenderer,
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
    scrollDivHeight,
  )

  const hasRowsWrapper = computed(() => totalItems.value > 0)

  defineExpose({
    refetch: () => {
      fetchWrapper()
    },
    fetchedData,
    hasRows: hasRowsWrapper,
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

  :deep(td .cell),
  :deep(th .cell) {
    min-width: min-content;
    max-width: max-content;
    padding: 1px;
  }
  :deep(.column-selected),
  :deep(.column-index),
  :deep(.column-selected .cell),
  :deep(.column-index .cell) {
    min-width: auto;
    padding: 2px;
  }
</style>
