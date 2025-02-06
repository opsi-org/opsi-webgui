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
              <el-table
                ref="table"
                :data="tableColumn"
                style="width: 100%"
                :height="tableHeight <= 600 ? tableHeight : 'auto'"
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
      :style="`height: ${visibleTableHeight || availableTableHeight}px !important;
      `"
      @scroll="debouncedHandleScroll"
    >
      <!-- class="overflow-y-auto !min-h-[700px] border-sky-500 border-2" -->
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
        @sort-change="handleSortChange"
        @row-click="onRowClick"
        class="!overflow-hidden"
        :class="`!min-h-[${tableHeightMin}px]`"
        :height="tableHeight || availableTableHeight"
      >
        <!-- :style="`min-height: ${tableHeightMin}px;`" -->
        <!-- :class="`!min-h-[900px] `" -->
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

        <!--  row index -->
        <!-- <el-table-column width="50" label="#">
          <template #default="{ $index }">
            <span>{{ $index + 1 + (currentPage - 1) * pageSize }}</span>
          </template>
        </el-table-column> -->

        <!-- rowId -->
        <el-table-column
          :key="props.rowId"
          :prop="tableColumnObj[props.rowId].key"
          :label="tableColumnObj[props.rowId].title"
          :width="tableColumnObj[props.rowId].width || ''"
          :sortable="tableColumnObj[props.rowId].sortable"
        >
          <template #default="scope">
            <CellRenderer
              :col-data="tableColumnObj[props.rowId]"
              :row-data="scope.row"
            />
          </template>
        </el-table-column>

        <!-- sorted column -->
        <el-table-column
          v-if="!['selected', rowId, 'actions'].includes(sortBy)"
          :key="tableColumnObj[sortBy].key"
          :prop="tableColumnObj[sortBy].key"
          :label="tableColumnObj[sortBy].title"
          :width="tableColumnObj[sortBy].width || ''"
        >
          <template #header v-if="tableColumnObj[sortBy].icon">
            <el-tooltip
              class="box-item"
              effect="dark"
              :content="tableColumnObj[sortBy].title"
            >
              <el-text
                ><IconIIcon :icon="tableColumnObj[sortBy].icon" />
              </el-text>
            </el-tooltip>
          </template>
          <template #header v-else>
            <HeaderCellRenderer :col-data="tableColumnObj[sortBy]" />
          </template>
          <template #default="scope">
            <CellRenderer
              :row-id="sortBy"
              :row-data="scope.row"
              :col-data="tableColumnObj[sortBy]"
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
              class="mb-3"
              :row-data="scope.row"
              :col-data="tableColumnObj[props.rowId]"
            />
          </template>
        </el-table-column>
      </el-table>

      <div class="extra-column" :style="`height: ${scrollDivHeight}px;`">
        <span v-if="totalItems > 0 && !isLastPage && !isLoading">{{
          $t('table.infinit.scrolldown')
        }}</span>
      </div>
    </div>

    <!-- TABLE FOOTER -->
    <div class="flex justify-end mt-2" :id="'tableFooter-' + tableId">
      <div class="">
        <!-- <br /> -->
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
        <!-- <el-text class="text-right">{{
          $t('label.total', { count: totalItems })
        }}</el-text> -->
      </div>
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
  //   import { vContextmenu } from '../../composables/mixins/v-contextmenu'
  import { useDynamicHeight } from '~/composables/mixins/useDynamicHeight'
  import { useTableHelper } from '~/composables/mixins/useTableHelper'

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
    notTableHeight,
    tableHeightMin,
    updateWindowValues,
    setElHeights,
  } = useDynamicHeight(
    actualDataSize,
    currentPage,
    totalItems,
    props.tableId,
    fetchWrapper,
  )

  const infiniteScrollDiv = ref<HTMLElement | null>(null)
  const {
    // we reuse this functions and refs also in TTableDesktop
    isLoading,
    filterQuery,
    // filterBy,
    sortBy,
    sortDesc,
    contextMenuVisible,
    contextMenuStyle,
    contextMenuRow,

    debouncedHandleScroll,
    // showContextMenu,
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
