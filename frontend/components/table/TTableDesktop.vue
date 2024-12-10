<template>
  <div>
    <slot name="header" />

    <div class="toolbar">
      <div class="toolbar-left">
        <el-button @click="$emit('clearSelection')">
          <IconIIcon :icon="icons.clear" />
        </el-button>
        <el-input
          v-model="filterQuery"
          placeholder="Type to filter..."
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
            <el-table :data="tableColumn" style="width: 100%">
              <el-table-column prop="title" label="Column" min-width="150px" />
              <el-table-column label="Column Selection">
                <template #header>
                  <el-tooltip content="Column Selection">
                    <IconIIcon :icon="icons.columns" />
                  </el-tooltip>
                </template>
                <template #default="scope">
                  <el-checkbox
                    v-model="scope.row.visible"
                    @click.stop
                    :disabled="scope.row.alwaysVisible"
                  />
                </template>
              </el-table-column>
              <el-table-column label="Sort">
                <template #header>
                  <el-tooltip
                    :content="sortDesc ? 'Sort Descending' : 'Sort Ascending'"
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
              <el-table-column label="Filter">
                <template #header>
                  <el-tooltip content="Filter">
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

    <div
      ref="infiniteScrollDiv"
      class="overflow-y-auto h-"
      :style="'height: ' + bodyHeight + '!important'"
      @scroll="debouncedHandleScroll"
    >
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
              <HeaderCellRenderer :col-data="column" />
            </template>

            <template #default="scope" v-if="column.key === 'actions'">
              <div v-contextmenu="(e:any) => showContextMenu(e, scope)">
                <!-- <div v-contextmenu="thisinstance?.vnode?.props?.onShowContextMenu ? (e:any) => onContextMenu(e, scope) : () =>{}"> -->
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
                  :content="$t('title.clone')"
                  placement="top"
                  v-if="actionClone"
                >
                  <el-button
                    link
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
      <div class="extra-column">
        <span v-if="!isLastPage && !isLoading"
          >Scroll down to load next page...</span
        >
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
  import { useIcons } from '../../composables/mixins/useIcons'
  import { vContextmenu } from '../../composables/mixins/v-contextmenu'

  const { notifyError } = useNotification()
  const $t = useI18n().t
  const router = useRouter()
  const icons = useIcons()

  const props = defineProps({
    rowId: { type: String, required: true },
    tableColumn: { type: Array<any>, required: true },
    fetch: { type: Function, required: true },
    bodyHeight: { type: String, default: '80vh', required: false },
    sortBy: { type: String, default: undefined, required: false },
    actionClone: { type: Function, default: undefined, required: false },
    actionLog: { type: Function, default: undefined, required: false },
    actionConfig: { type: Function, default: undefined, required: false },
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
  const sortDesc = ref(false)
  const contextMenuVisible = ref(false)
  const contextMenuStyle = ref({})
  const contextMenuRow = ref(null)

  defineExpose({ refetch: fetchWrapper, fetchedData })

  watch([() => filterQuery.value], fetchWrapper, { immediate: true })
  watch(
    () => props.sortBy,
    () => {
      sortBy.value = props.sortBy || props.rowId
      fetchWrapper()
    },
  )
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
    try {
      const res = await props.fetch(params)
      if (res == undefined) {
        console.error('fetchWrapper: Empty response')
        isLoading.value = false
        return
      } else if (res.total) {
        totalItems.value = res.total
        isFirstPage.value = currentPage.value == 1
        isLastPage.value = currentPage.value * pageSize.value >= res.total
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
      target.clientHeight / fetchedData.value.length
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
    // router.push(props.actionLog + rowData.ident)
    router.push(props.actionLog(rowData))
  }

  function handleCloneClick(rowData: any) {
    if (!props.actionClone) {
      return
    }
    activeButton.value = 'clone-' + rowData[props.rowId]
    // router.push(props.actionClone + rowData.ident)
    router.push(props.actionClone(rowData))
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
    // const CellRenderer = ({key, 'row-data', colData}: any): VNode => {
    const colData = attributes['col-data'] || attributes.colData
    const rowData = attributes['row-data'] || attributes.rowData

    if (!colData) {
      console.error(
        `CellRenderer: col-data not found in: ${JSON.stringify(attributes)}`,
      )
      return <el-text>undefined</el-text>
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
      return <el-text>undefined</el-text>
    }
    if (colData.headerCellRenderer) {
      return colData.headerCellRenderer()
    }
    return <el-text>{colData.title}</el-text>
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
