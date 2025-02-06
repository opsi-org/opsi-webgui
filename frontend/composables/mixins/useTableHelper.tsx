/**
This file is part of opsi-webgui application.
opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
Copyright (c) uib GmbH <info@uib.de> 2025
All rights reserved.
License: AGPL-3.0
*/

import { debounce } from 'lodash'
import { useNotification } from '~/composables/mixins/useComponent'

import DDClientActions from '~/components/dropdown/DDClientActions.vue'
import IIcon from '~/components/icon/IIcon.vue'

export const useTableHelper = (
  props: any,
  currentPage: Ref,
  pageSize: Ref,
  $emit: any,
  fetchedData: Ref,
  totalItems: Ref,
  isFirstPage: Ref,
  isLastPage: Ref,
  infiniteScrollDiv: Ref,
  activeButton: Ref,
  scrollDivHeight: Ref,
) => {
  const $t = useI18n().t
  const router = useRouter()
  const icons = useIcons()
  const { notifyError } = useNotification()

  const isLoading = ref(false)
  const filterQuery = ref('')
  const filterBy = ref(props.rowId)
  const sortBy = ref(props.sortBy || props.rowId)
  const sortDesc = ref(props.sortDesc || false)
  const contextMenuVisible = ref(false)
  const contextMenuStyle = ref({})
  const contextMenuRow = ref(null)

  watch(
    [() => filterQuery.value],
    () => {
      fetchDataWrapper()
    },
    { immediate: true },
  )
  watch(
    () => props.sortBy,
    () => {
      if (props.sortBy !== sortBy.value) {
        sortBy.value = props.sortBy || props.rowId
        fetchDataWrapper()
      }
    },
  )
  watch(
    () => props.sortDesc,
    () => {
      if (props.sortDesc !== sortDesc.value) {
        sortDesc.value = props.sortDesc || false
        fetchDataWrapper()
      }
    },
  )

  function prepareParams() {
    const params: any = {}
    if (sortBy.value) params.sortBy = sortBy.value
    if (filterQuery.value) params.filterQuery = filterQuery.value
    if (currentPage.value) params.pageNumber = currentPage.value
    if (pageSize.value) params.perPage = pageSize.value
    params.sortDesc = sortDesc.value ? true : false
    return params
  }
  async function fetchDataWrapper() {
    isLoading.value = true

    const params = prepareParams()
    try {
      const res = await props.fetch(params)
      if (res == undefined) {
        totalItems.value = 0
        fetchedData.value = []
        console.error('fetchDataWrapper: Empty response')
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
    fetchDataWrapper()
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
      Math.max(target.clientHeight, 100) / (pageSize.value || 0)

    if (target.scrollTop <= dynamicScrollThreshold) {
      _scrollUp()
      return
    } else if (
      target.scrollHeight - target.scrollTop <=
      target.clientHeight + dynamicScrollThreshold
    ) {
      _scrollDown()
      return
    }
    // or do nothing
  }

  const debouncedHandleScroll = debounce(handleScroll, 500)

  async function _scrollUp() {
    if (!isLoading.value && !isFirstPage.value) {
      currentPage.value--

      await fetchDataWrapper()
    }
  }

  async function _scrollDown() {
    if (!isLoading.value && !isLastPage.value) {
      currentPage.value++

      await fetchDataWrapper()
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
        top: scrollDivHeight.value,
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

    fetchDataWrapper()
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

    fetchDataWrapper()
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

    fetchDataWrapper()
  }

  function toggleSortOrder() {
    sortDesc.value = !sortDesc.value

    fetchDataWrapper()
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
  const ActionsRenderer = (attributes: any): VNode => {
    const rowData = attributes['row-data'] || attributes.rowData
    // const colData = attributes['col-data'] || attributes.colData
    return (
      <div>
        <el-tooltip
          content={$t('title.config')}
          placement="top"
          v-if={props.actionConfig}
        >
          <el-button
            link
            onClick={() => handleConfigClick(rowData)}
            class={
              activeButton.value === 'config-' + rowData.clientId
                ? 'is-active'
                : ''
            }
          >
            <IIcon icon={icons.settings} />
          </el-button>
        </el-tooltip>
        <el-tooltip content={$t('title.log')} placement="top" v-if="actionLog">
          <el-button
            link
            onClick={() => handleLogClick(rowData)}
            class={
              activeButton.value === 'log-' + rowData.clientId
                ? 'is-active'
                : ''
            }
          >
            <IIcon icon={icons.log} />
          </el-button>
        </el-tooltip>
        <el-tooltip
          v-if="actionClone"
          content={$t('title.clone')}
          placement="top"
        >
          <el-button
            link
            disabled={storeConfigapp().config?.read_only}
            onClick={() => handleCloneClick(rowData)}
            class={
              activeButton.value === 'clone-' + rowData.clientId
                ? 'is-active'
                : ''
            }
          >
            <IIcon icon={icons.client} />
          </el-button>
        </el-tooltip>
        <DDClientActions
          v-if="hasClientActions"
          disabled={storeConfigapp().config?.read_only}
          client-ids={[rowData.clientId]}
        />
      </div>
    )
  }

  const Details = (params: any): VNode => {
    const rowData = params['rowData'] || params['row-data']
    const _width = { width: '100%' }
    const data: Array<any> = []
    let dataActions: any = {}
    props.tableColumn.forEach((colInfo: any) => {
      const cId: string = colInfo.key as string
      const visible = colInfo._majorKey === undefined && cId !== 'selected'
      if (!visible) {
        return
      }
      if (colInfo.key == 'actions') {
        dataActions = {
          id: 'actions',
          value: '',
        }
        return
      }
      data.push({ id: cId, value: rowData[cId] })
    })
    // 'actions' should be first row
    data.unshift(dataActions)

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
                  (col: any) => col.key === rowKey,
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
                  (col: any) => col.key === rowKey,
                )
                if (rowKey.startsWith('_')) {
                  return
                }
                const rowValue = scope.row.value
                const renderer = colObj.cellRenderer
                if (colObj.key == 'actions') {
                  return (
                    <ActionsRenderer
                      rowData={rowData}
                      colData={colObj}
                    ></ActionsRenderer>
                  )
                }
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

  return {
    isLoading,
    filterQuery,
    // filterBy,
    sortBy,
    sortDesc,
    contextMenuVisible,
    contextMenuStyle,
    contextMenuRow,
    prepareParams,
    fetchDataWrapper,
    refreshTable,
    showContextMenu,
    handleClickOutside,
    debouncedHandleScroll,
    // _scrollUp,
    // _scrollDown,
    // handleScroll,
    scrollToTopOfTable,
    handleCommand,
    handlePagination,
    handleConfigClick,
    handleLogClick,
    handleCloneClick,
    applyFilter,
    applySort,
    handleSortChange,
    toggleSortOrder,
    onRowClick,

    CellRenderer,
    HeaderCellRenderer,
    Details,
    ActionsRenderer,
  }
}
