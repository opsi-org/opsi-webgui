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
      :style="`height: ${infiniteScrollHeight || availableTableSpace}px !important;`"
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
        :height="tableHeight || availableTableSpace"
        @sort-change="handleSortChange"
        @row-click="onRowClick"
        class="!overflow-hidden"
      >
        <!--  row index -->
        <el-table-column width="50" label="#">
          <template #default="{ $index }">
            <span>{{ $index + 1 + (currentPage - 1) * pageSize }}</span>
          </template>
        </el-table-column>
        <!-- columns -->
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
              <HeaderCellRenderer :col-data="column" />
            </template>

            <template #default="scope" v-if="column.key === 'actions'">
              <div v-contextmenu="(e:any) => showContextMenu(e, scope)">
                <el-tooltip
                  :content="$t('title.config')"
                  placement="top"
                  v-if="actionConfig"
                >
                  <el-button
                    link
                    @click="handleConfigClick(scope.row)"
                    :class="{
                      'is-active':
                        activeButton === 'config-' + scope.row.clientId,
                    }"
                  >
                    <IconIIcon :icon="icons.settings" />
                  </el-button>
                </el-tooltip>
                <el-tooltip
                  :content="$t('title.log')"
                  placement="top"
                  v-if="actionLog"
                >
                  <el-button
                    link
                    @click="handleLogClick(scope.row)"
                    :class="{
                      'is-active': activeButton === 'log-' + scope.row.clientId,
                    }"
                  >
                    <IconIIcon :icon="icons.log" />
                  </el-button>
                </el-tooltip>
                <el-tooltip
                  v-if="actionClone"
                  :content="$t('title.clone')"
                  placement="top"
                >
                  <el-button
                    link
                    :disabled="storeConfigapp().config?.read_only"
                    @click="handleCloneClick(scope.row)"
                    :class="{
                      'is-active':
                        activeButton === 'clone-' + scope.row.clientId,
                    }"
                  >
                    <IconIIcon :icon="icons.client" />
                  </el-button>
                </el-tooltip>
                <DropdownDDClientActions
                  v-if="hasClientActions"
                  :disabled="storeConfigapp().config?.read_only"
                  :client-ids="[scope.row.clientId]"
                />
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
        @size-change="
          (v) => {
            if (v && pageSize !== v) {
              pageSize = v
              refreshTable()
            }
          }
        "
        :current-page="currentPage"
        :page-size="pageSize"
        :page-sizes="[pageSize]"
        layout="total, sizes, prev, pager, next, jumper"
        :total="totalItems"
      />
      <!-- :page-sizes="[
          ...new Set([pageSize, 20, 50, 100].sort((a, b) => a - b)),
        ]" -->
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
  import { debounce } from 'lodash'
  import { useNotification } from '~/composables/mixins/useComponent'
  import { vContextmenu } from '../../composables/mixins/v-contextmenu'
  // import { useZoomLevel } from '@vueuse/electron'

  const { notifyError } = useNotification()
  const $t = useI18n().t
  const router = useRouter()
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
  // const tableHeader = ref()
  // const tableFooter = ref()
  const fetchedData = ref()
  const activeButton = ref<string | null>(null)
  const totalItems = ref<number>(0)
  const currentPage = ref(1)

  const _windowHeight = ref(window.innerHeight)
  const _windowZoom = ref(window.devicePixelRatio)
  const scrollDivHeight = ref(400) // Height of scroll divs before/after tableRows
  const rowHeight = computed(() => 52.48) // default rowHeight
  const notTableHeight = ref(0) // height of all elements above and below the table, such as toolbar, pagination, calculated in onMounted

  const availableTableSpace = computed(
    () => Math.min(_windowHeight.value - notTableHeight.value, 3000),
    // 300px includes height of menu, toolbar, pagination... (el-breadcrumb.height, tableHeader.height, el-pagination.height + x)
  )
  const actualDataSize = computed(() => fetchedData.value?.length || 0)
  const pageSize = computed(() =>
    // calc page size dynamicly
    Math.min(
      50, // max page size // othewise it can be too much data for the table
      Math.floor(
        (availableTableSpace.value + notTableHeight.value) / rowHeight.value,
      ),
    ),
  )
  const infiniteScrollHeight = computed(() =>
    // fixed height of infiniteScrollDiv (table will have heigher height, so infiniteScrollDiv will have scroll)

    actualDataSize.value < pageSize.value / 2 &&
    availableTableSpace.value > 1000
      ? Math.min(availableTableSpace.value / 2, 1000)
      : availableTableSpace.value,
  )

  const tableHeight = computed(() => {
    // calc table height dynamicly, includes scrollDivs (depending on isFirst/last, or if only few rows)
    const scrollDivCount =
      isFirstPage.value && isLastPage.value ? 0 : isFirstPage.value ? 1 : 2
    if (actualDataSize.value < pageSize.value / 2) {
      return infiniteScrollHeight.value + scrollDivHeight.value * scrollDivCount
    }
    return actualDataSize.value * rowHeight.value + 200
  })

  const isLoading = ref(false)
  const isFirstPage = computed(() => currentPage.value == 1)
  const isLastPage = computed(
    () => currentPage.value * pageSize.value >= totalItems.value,
  )
  const infiniteScrollDiv = ref<HTMLElement | null>(null)
  const filterQuery = ref('')
  const filterBy = ref(props.rowId)
  const sortBy = ref(props.sortBy || props.rowId)
  const sortDesc = ref(props.sortDesc || false)
  const contextMenuVisible = ref(false)
  const contextMenuStyle = ref({})
  const contextMenuRow = ref(null)

  const hasRowsWrapper = computed(() => totalItems.value > 0)

  defineExpose({
    refetch: () => {
      fetchWrapper()
    },
    fetchedData,
    hasRows: hasRowsWrapper,
  })

  watch(
    [() => filterQuery.value],
    () => {
      fetchWrapper()
    },
    { immediate: true },
  )
  watch(
    () => props.sortBy,
    () => {
      if (props.sortBy !== sortBy.value) {
        sortBy.value = props.sortBy || props.rowId
        fetchWrapper()
      }
    },
  )
  watch(
    () => props.sortDesc,
    () => {
      if (props.sortDesc !== sortDesc.value) {
        sortDesc.value = props.sortDesc || false
        fetchWrapper()
      }
    },
  )
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

  const debouncedRefetchOnPageSize = debounce(refetchOnPageSize, 300)
  function refetchOnPageSize() {
    fetchWrapper()
  }
  function updateWindowValues() {
    setElHeights()
    // Event-Listener for resize & zoom, but only if height changed
    if (window.innerHeight === _windowHeight.value) {
      return
    }
    _windowHeight.value = window.innerHeight
    _windowZoom.value = window.devicePixelRatio
    debouncedRefetchOnPageSize()
  }

  function setElHeights() {
    // we need to calculate the height of all elements above and below the table to reduce the available space for the table, this needs to be done onMount cause otherwise the elements are not rendered yet
    const _elHeightBreadcrumb =
      document.getElementById('globalBreadcrumb')?.clientHeight ?? 0
    const _elHeightTableHeader =
      document.getElementById(`tableHeader-${props.tableId}`)?.clientHeight ?? 0
    const _elHeightTableFooter =
      document.getElementById(`tableFooter-${props.tableId}`)?.clientHeight ?? 0
    notTableHeight.value =
      _elHeightBreadcrumb + _elHeightTableHeader + _elHeightTableFooter + 110
  }
  function prepareParams() {
    const params: any = {}
    if (sortBy.value) params.sortBy = sortBy.value
    if (filterQuery.value) params.filterQuery = filterQuery.value
    if (currentPage.value) params.pageNumber = currentPage.value
    if (pageSize.value) params.perPage = pageSize.value
    params.sortDesc = sortDesc.value ? true : false
    return params
  }
  async function fetchWrapper() {
    isLoading.value = true

    const params = prepareParams()
    try {
      const res = await props.fetch(params)
      if (res == undefined) {
        totalItems.value = 0
        fetchedData.value = []
        console.error('fetchWrapper: Empty response')
        isLoading.value = false
        return
      } else if (res.total >= 0) {
        totalItems.value = res.total
        // isFirstPage.value = currentPage.value == 1
        // isLastPage.value = currentPage.value * pageSize.value >= res.total
        if (res.total > 0) {
          const pageExists =
            currentPage.value <= Math.ceil(res.total / pageSize.value)
          if (!pageExists) {
            currentPage.value = Math.ceil(res.total / pageSize.value)
          }
        }
        fetchedData.value = res.data
      }
    } catch (error) {
      totalItems.value = 0
      fetchedData.value = []
      notifyError({ message: $t('message.error.unexpected') + error })
      isLoading.value = false
    } finally {
      isLoading.value = false
      scrollToTopOfTable()
    }
  }

  function refreshTable() {
    fetchWrapper()
  }

  function showContextMenu(event: any, row: any) {
    event.preventDefault()
    contextMenuRow.value = row

    const menuWidth = 200
    const menuHeight = 350
    const pageWidth = window.innerWidth
    const pageHeight = window.innerHeight

    let left = event.clientX
    let top = event.clientY

    if (left + menuWidth > pageWidth) {
      left = pageWidth - menuWidth
    }

    if (top + menuHeight > pageHeight) {
      top = pageHeight - menuHeight
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
    const target = event.target as HTMLElement
    const dynamicScrollThreshold =
      Math.max(target.clientHeight, 100) / actualDataSize.value
    if (target.scrollTop <= dynamicScrollThreshold) {
      scrollUp()
    } else if (
      target.scrollHeight - target.scrollTop <=
      target.clientHeight + dynamicScrollThreshold
    ) {
      scrollDown()
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
          behavior: 'smooth',
        })
        return
      }

      infiniteScrollDiv.value.scrollTo({
        top: 400,
        behavior: 'smooth',
      })
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
    if (!props.actionConfig) {
      return
    }
    activeButton.value = 'config-' + rowData[props.rowId]
    router.push(props.actionConfig(rowData))
  }

  function handleLogClick(rowData: any) {
    if (!props.actionLog) {
      return
    }
    activeButton.value = 'log-' + rowData[props.rowId]
    router.push(props.actionLog(rowData))
  }

  function handleCloneClick(rowData: any) {
    if (!props.actionClone) {
      return
    }
    activeButton.value = 'clone-' + rowData[props.rowId]
    router.push(props.actionClone(rowData))
  }

  // TODO: Implement Filter by
  function applyFilter(columnKey: string) {
    filterBy.value = columnKey
  }

  function applySort(columnKey: string) {
    sortBy.value = columnKey
    // console.error('Sort By', sortBy.value)

    fetchWrapper()
  }

  function handleSortChange({
    prop,
    order,
  }: {
    column: any
    prop: string
    order: any
  }) {
    sortBy.value = prop
    sortDesc.value = order === 'descending'

    fetchWrapper()
  }

  function toggleSortOrder() {
    sortDesc.value = !sortDesc.value

    fetchWrapper()
  }
  function onRowClick(row: any, column: any, event: any) {
    if (['svg', 'button', 'path', 'span'].includes(event.target?.localName)) {
      return
    }
    $emit('selectionChanged', row[props.rowId])
  }

  const CellRenderer = (attributes: any): VNode => {
    const colData = attributes['col-data'] || attributes.colData
    const rowData = attributes['row-data'] || attributes.rowData

    if (!colData) {
      console.error(
        `CellRenderer: col-data not found in: ${JSON.stringify(attributes)}`,
      )
      return <el-text>{$t('label.undefined')}</el-text>
    }
    if (colData.cellRenderer) {
      return colData.cellRenderer({ rowData })
    }
    return <el-text>{rowData[colData.key]}</el-text>
  }

  const HeaderCellRenderer = (attributes: any): VNode => {
    const colData = attributes['col-data'] || attributes.colData
    if (!colData) {
      console.warn(
        `HeaderCellRenderer: col-data not found in: ${JSON.stringify(attributes)}`,
      )
      return <el-text>{$t('label.undefined')}</el-text>
    }
    if (colData.headerCellRenderer) {
      return colData.headerCellRenderer()
    }
    return <el-text>{colData.title}</el-text>
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
</style>
