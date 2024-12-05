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
            <div class="dropdown-content">
              <div class="dropdown-section">
                <div class="dropdown-title">
                  <IconIIcon :icon="icons.filter" /> Filter By
                </div>
                <div class="dropdown-items">
                  <template v-for="column in tableColumn" :key="column.key">
                    <el-dropdown-item>
                      <el-checkbox
                        :disabled="!column.filter"
                        v-model="column.filter"
                        @change="applyFilter(column.key)"
                      />
                    </el-dropdown-item>
                  </template>
                </div>
              </div>
              <div class="dropdown-section">
                <div class="dropdown-title">
                  <el-button link @click="toggleSortOrder">
                    <IconIIcon
                      :icon="sortDesc ? icons.sortDesc : icons.sortAsc"
                    />
                    {{ sortDesc ? 'Sort Descending' : 'Sort Ascending' }}
                  </el-button>
                </div>
                <div class="dropdown-items">
                  <el-radio-group v-model="sortBy" class="!contents">
                    <template v-for="column in tableColumn" :key="column.key">
                      <el-dropdown-item>
                        <el-radio
                          :disabled="!column.sortable"
                          :value="column.key"
                          @change="applySort(column.key)"
                        />
                      </el-dropdown-item>
                    </template>
                  </el-radio-group>
                </div>
              </div>
              <div class="dropdown-section">
                <div class="dropdown-title">
                  <IconIIcon :icon="icons.columns" /> Column Selection
                </div>
                <div class="dropdown-items">
                  <template v-for="column in tableColumn" :key="column.key">
                    <el-dropdown-item>
                      <el-checkbox
                        v-model="column.visible"
                        @click.stop
                        :disabled="column.alwaysVisible"
                        >{{ column.title }}</el-checkbox
                      >
                    </el-dropdown-item>
                  </template>
                </div>
              </div>
            </div>
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
    <el-collapse v-model="collapseRowIdValue" accordion>
      <PVirtualScroller
        :items="fetchedData"
        :item-size="50"
        class="w-full h-[39rem] maxVisibleNoOverflow"
      >
        <template #item="{ item }">
          <div class="">
            <CellRenderer
              v-if="tableColumn[0]"
              row-id="selected"
              :row-data="item"
              :col-data="tableColumn[0]"
              class="!inline-block align-top mt-3 mr-2"
            />

            <el-collapse-item
              :name="item[props.rowId]"
              :class="[
                '!inline-block',
                hasClientActions && actionConfig && actionLog && actionClone
                  ? 'w-[calc(100%-180px)]' // clients or
                  : 'w-[calc(100%-70px)]', // servers/products
                // update style if more actions are available or styling of rowaction changed
              ]"
            >
              <!-- style="max-width: calc(100% - 30px); width: calc(100% - 180px)" -->
              <template #title>
                <div
                  class="flex flex-wrap items-center !justify-between w-full border-1 border-red-500 leading-normal"
                >
                  <div
                    class="flex-1 min-w-min w-min h-[24px] sm:h-[48px] flex items-center justify-start text-left"
                    :class="{
                      'font-bold': !['selection', rowId, 'actions'].includes(
                        sortBy,
                      ),
                    }"
                  >
                    <!-- CELL ID/ROWID/IDENT/.. -->
                    <CellRenderer
                      :row-id="props.rowId"
                      :row-data="item"
                      :col-data="
                        tableColumn.find((col) => col.key === props.rowId)
                      "
                    />
                  </div>
                  <div
                    class="flex-1 min-w-[130px] w-[130px] h-[24px] sm:h-[48px] flex items-center justify-start text-ellipsis whitespace-nowrap overflow-hidden"
                  >
                    <!-- sorted column -->
                    <CellRenderer
                      v-if="!['selection', rowId, 'actions'].includes(sortBy)"
                      :row-id="sortBy"
                      :row-data="item"
                      :col-data="tableColumn.find((col) => col.key === sortBy)"
                      class="min-w-0 whitespace-nowrap overflow-hidden text-ellipsis"
                    />
                  </div>
                </div>
              </template>

              <Details
                v-if="
                  collapseRowIdValue && collapseRowIdValue === item[props.rowId]
                "
                :row-data="item"
                :col-data="tableColumn.find((col) => col.key === props.rowId)"
              />
            </el-collapse-item>

            <!-- ROWACTIONS -->
            <div class="!inline-block align-top mt-2 ml-3">
              <el-tooltip
                :content="$t('title.config')"
                placement="top"
                v-if="actionConfig"
              >
                <el-button
                  link
                  @click="handleConfigClick(item)"
                  :class="{
                    'is-active': activeButton === 'config-' + item.clientId,
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
                  @click="handleLogClick(item)"
                  :class="{
                    'is-active': activeButton === 'log-' + item.clientId,
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
                  @click="handleCloneClick(item)"
                  :class="{
                    'is-active': activeButton === 'clone-' + item.clientId,
                  }"
                >
                  <IconIIcon :icon="icons.client" />
                </el-button>
              </el-tooltip>
              <DropdownDDClientActions
                v-if="hasClientActions"
                :client-ids="[item.clientId]"
              />
            </div>
          </div>
        </template>
      </PVirtualScroller>
    </el-collapse>

    <!-- Custom Context Menu -->
    <!-- <div v-if="contextMenuVisible" :style="contextMenuStyle" class="context-menu">
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
    </div> -->
  </div>
</template>

<script setup lang="tsx">
  // import { debounce } from 'lodash'
  import { useNotification } from '~/composables/mixins/useComponent'
  import { useIcons } from '../../composables/mixins/useIcons'

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

  const collapseRowIdValue = ref<any>({})

  const fetchedData = ref()
  const activeButton = ref<string | null>(null)
  const totalItems = ref<number>(0)
  const currentPage = ref(1)
  const pageSize = ref(9999999999999)
  const isLoading = ref(false)
  const isFirstPage = ref(false)
  const isLastPage = ref(false)
  const infiniteScrollDiv = ref<HTMLElement | null>(null)
  const filterQuery = ref('')
  const filterBy = ref(props.rowId)
  const sortBy = ref(props.sortBy || props.rowId)
  const sortDesc = ref(false)
  const contextMenuVisible = ref(false)
  // const contextMenuStyle = ref({})
  // const contextMenuRow = ref(null)

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

  function handleClickOutside(event: MouseEvent) {
    const contextMenu = document.querySelector('.context-menu')
    if (contextMenu && !contextMenu.contains(event.target as Node)) {
      contextMenuVisible.value = false
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

  function handleConfigClick(rowData: any) {
    if (!props.actionConfig) {
      return
    }
    activeButton.value = 'config-' + rowData[props.rowId]
    // router.push(props.actionConfig + rowData.ident)
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

  function toggleSortOrder() {
    sortDesc.value = !sortDesc.value
    fetchWrapper()
  }

  const CellRenderer = (attributes: any): VNode => {
    const colData = attributes['col-data'] || attributes.colData
    const rowData = attributes['row-data'] || attributes.rowData
    const htmlclass = attributes['class'] || attributes.class
    if (!colData) {
      console.error(
        `CellRenderer: col-data not found in: ${JSON.stringify(attributes)}`,
      )
      return <el-text class={htmlclass}>undefined</el-text>
    }
    if (colData.cellRenderer) {
      return colData.cellRenderer({ rowData })
    }
    return <el-text class={htmlclass}>{rowData[colData.key]}</el-text>
  }

  const Details = (params: any): VNode => {
    const rowData = params['rowData'] || params['row-data']
    // const colData = params['colData'] || params['col-data']
    const _width = { width: '100%' }
    const data: Array<any> = []
    // const _fixedRightLast: Array<any> = []
    props.tableColumn.forEach((colInfo: any) => {
      const cId: string = colInfo.key as string
      const visible = colInfo._majorKey === undefined && cId !== 'selected'
      if (!visible) {
        return
      }
      if (colInfo.key === 'rowactions') {
        return
      }

      data.push({ id: cId, value: rowData[cId] })
    })
    return (
      <div class="mx-3">
        <el-table
          show-header={false}
          lazy={true}
          data={data}
          size="small"
          row-key="id"
          style={_width}
          table-layout="auto"
          default-expand-all
        >
          <el-table-column prop="id" label="id">
            {{
              default: (scope: any) => {
                const rowKey = scope.row.id
                const colObj = props.tableColumn.find(
                  (col) => col.key === rowKey,
                )

                if (
                  rowKey == undefined ||
                  rowKey == 'rowactions' ||
                  rowKey == 'actionRequest'
                ) {
                  return <el-text>{colObj.title || colObj.tooltip}</el-text>
                }
                if (colObj.headerCellRenderer !== undefined) {
                  return colObj.headerCellRenderer({ rowData } as any)
                }
                return <el-text>{colObj.title || colObj.tooltip}</el-text>
              },
            }}
          </el-table-column>
          <el-table-column prop="value" label="value" align={'right'}>
            {{
              default: (scope: any) => {
                const rowKey = scope.row.id
                const colObj = props.tableColumn.find(
                  (col) => col.key === rowKey,
                )
                if (rowKey.startsWith('_')) {
                  return
                }
                const rowValue = scope.row.value
                const renderer = colObj.cellRenderer
                if (renderer !== undefined) {
                  return renderer({ rowData } as any)
                }
                return <el-text>{rowValue}</el-text>
              },
            }}
          </el-table-column>
        </el-table>
      </div>
    )
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
