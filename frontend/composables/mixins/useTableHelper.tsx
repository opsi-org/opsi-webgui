/**
This file is part of opsi-webgui application.
opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
Copyright (c) uib GmbH <info@uib.de> 2025
All rights reserved.
License: AGPL-3.0
*/

import { after, debounce } from 'lodash'
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
  scrollDivHeight: Ref
) => {
  const $t = useI18n().t
  const router = useRouter()
  const icons = useIcons()
  const { notifyError } = useNotification()
  const storeTSettings = storeTablesettings()

  const isLoading = ref(false)
  const filterQuery = ref('')
  const filterBy = ref(props.rowId)
  function isArrayNormalized(object: string | string[]): boolean {
    if (Array.isArray(object)) return true
    try {
      // Wenn es ein "string" ist – z.B. '["foo", "bar"]' oder "foo,bar"
      const parsed = JSON.parse(object)
      return Array.isArray(parsed) && parsed.every((item) => typeof item === 'string')
    } catch {
      // kein JSON – ignorieren
    }
    // Wenn Komma-separierter String: "foo,bar" => ["foo", "bar"]
    if (typeof object === 'string' && object.includes(',')) {
      return object.split(',').every((s) => typeof s.trim() === 'string')
    }
    // Single-String fallback
    return typeof object === 'string' && object.length > 0
  }

  const sortByWrapper = ref<string>(props.sortBy || props.rowId)
  const sortDescWrapper = ref<boolean>(JSON.parse(String(props.sortDesc).toLowerCase()) || false)

  const contextMenuVisible = ref(false)
  const contextMenuStyle = ref({})
  const contextMenuRow = ref(null)
  const visibleColumns = computed<Record<string, boolean>>(() => {
    const visibleColumns: Record<string, boolean> = {}
    props.tableColumn.forEach((col: any) => {
      visibleColumns[col.key] = col.visible
    })
    return visibleColumns
  })

  watch(
    () => visibleColumns.value,
    () => {
      const visibleColumnIds = Object.keys(visibleColumns.value).filter(
        (key) => visibleColumns.value[key]
      )
      storeTSettings.setColumns(props.tableId, visibleColumnIds)
    },
    { deep: true }
  )
  watch(
    [() => filterQuery.value],
    (after, before) => {
      if (before.length <= 0 && after.length > 0 && after[0] === '') return
      fetchDataWrapper()
    },
    {
      immediate: true,
    }
  )
  watch(
    () => props.sortBy,
    () => {
      if (props.sortBy !== sortByWrapper.value) {
        sortByWrapper.value = props.sortBy || props.rowId
        // if is not array, and does not have "," or "[", "]" store
        if (!isArrayNormalized(props.sortBy)) {
          storeTablesettings().setSortColumn(
            props.tableId,
            props.sortBy || props.rowId,
            props.sortDesc || false
          )
        }

        //storeT.setSortColumn(props.tableId, sortBy.value, sortDesc.value)
        fetchDataWrapper()
      }
    }
  )
  watch(
    () => props.sortDesc,
    () => {
      const propSortDesc = JSON.parse(String(props.sortDesc).toLowerCase()) || false
      if (propSortDesc !== sortDescWrapper.value) {
        sortDescWrapper.value = propSortDesc || false
        fetchDataWrapper()
      }
    }
  )
  watch(
    () => storeTSettings.productsSorting,
    () => {
      sortByWrapper.value = storeTSettings.productsSorting.column
      sortDescWrapper.value = storeTSettings.productsSorting.isDesc
    },
    { deep: true }
  )

  function prepareParams() {
    const params: any = {}
    if (sortByWrapper.value) params.sortBy = sortByWrapper.value
    if (filterQuery.value) params.filterQuery = filterQuery.value
    if (currentPage.value) params.pageNumber = currentPage.value
    if (pageSize.value) params.perPage = pageSize.value
    params.sortDesc = sortDescWrapper.value ? true : false
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
        if (res.total > 0) {
          const pageExists = currentPage.value <= Math.ceil(res.total / pageSize.value)
          if (!pageExists) {
            currentPage.value = Math.ceil(res.total / pageSize.value)
          }
        }
        fetchedData.value = res.data
      }
    } catch (error) {
      totalItems.value = 0
      fetchedData.value = []
      notifyError({ message: $t('message.error.general') + error })
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
    const dynamicScrollThreshold = Math.max(target.clientHeight, 100) / (pageSize.value || 0)

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
  function updateRoute(
    paramKey: string,
    paramValue: any,
    return_new_url: boolean = false,
    url: string | undefined = undefined
  ): string | undefined {
    let fullRoute = router.currentRoute.value.fullPath
    if (url) {
      fullRoute = url
    }
    if (fullRoute.includes(paramKey)) {
      //const newFullUrl = fullRoute.replace(/sortBy=[^&]+/, `sortBy=${columnKey}`)
      const newFullUrl = fullRoute.replace(
        new RegExp(`${paramKey}=[^&]*`),
        `${paramKey}=${paramValue}`
      )
      if (return_new_url) {
        return newFullUrl
      }
      router.push(newFullUrl)
      return 'ok'
    }
    return undefined
  }

  function applySort(columnKey: string) {
    sortByWrapper.value = columnKey
    updateRoute('sortBy', columnKey)
    fetchDataWrapper()
  }

  function handleSortChange({ prop, order }: { column: any; prop: string; order: any }) {
    sortByWrapper.value = prop
    sortDescWrapper.value = order === 'descending'
    const url = updateRoute('sortBy', prop, true)
    updateRoute('sortDesc', sortDescWrapper.value, false, url)
    fetchDataWrapper()
  }

  function toggleSortOrder() {
    sortDescWrapper.value = !sortDescWrapper.value
    updateRoute('sortDesc', sortDescWrapper.value)
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
      console.error(`CellRenderer: col-data not found in: ${JSON.stringify(attributes)}`)
      return <el-text>{$t('undefined')}</el-text>
    }
    if (colData.cellRenderer) {
      return colData.cellRenderer({ rowData })
    }
    return <el-text>{rowData[colData.key]}</el-text>
  }

  const HeaderCellRenderer = (attributes: any): VNode => {
    const colData = attributes['col-data'] || attributes.colData
    if (!colData) {
      console.warn(`HeaderCellRenderer: col-data not found in: ${JSON.stringify(attributes)}`)
      return <el-text>{$t('undefined')}</el-text>
    }
    if (colData.headerCellRenderer) {
      return colData.headerCellRenderer()
    }
    return <el-text>{colData.title}</el-text>
  }
  const ActionsRenderer = (attributes: any): VNode => {
    const rowData = attributes['row-data'] || attributes.rowData
    return (
      <div>
        {props.actionConfig ? (
          <el-button
            link
            title={$t('configuration')}
            onClick={() => handleConfigClick(rowData)}
            class={activeButton.value === 'config-' + rowData.clientId ? 'is-active' : ''}
          >
            <IIcon icon={icons.settings} />
          </el-button>
        ) : null}
        {props.actionLog ? (
          <el-button
            link
            title={$t('logs')}
            onClick={() => handleLogClick(rowData)}
            class={activeButton.value === 'log-' + rowData.clientId ? 'is-active' : ''}
          >
            <IIcon icon={icons.log} />
          </el-button>
        ) : null}
        {props.actionClone ? (
          <el-button
            link
            title={$t('clone')}
            disabled={storeConfigapp().config?.read_only}
            onClick={() => handleCloneClick(rowData)}
            class={activeButton.value === 'clone-' + rowData.clientId ? 'is-active' : ''}
          >
            <IIcon icon={icons.client} />
          </el-button>
        ) : null}

        {props.hasClientActions ? (
          <DDClientActions
            disabled={storeConfigapp().config?.read_only}
            client-ids={[rowData.clientId]}
          />
        ) : null}
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
                const colObj = props.tableColumn.find((col: any) => col.key === rowKey)

                if (rowKey == undefined || rowKey == 'rowactions' || rowKey == 'actionRequest') {
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
                const colObj = props.tableColumn.find((col: any) => col.key === rowKey)
                if (rowKey.startsWith('_')) {
                  return
                }
                const rowValue = scope.row.value
                const renderer = colObj.cellRenderer
                if (colObj.key == 'actions') {
                  return <ActionsRenderer rowData={rowData} colData={colObj}></ActionsRenderer>
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
    sortByWrapper,
    sortDescWrapper,
    contextMenuVisible,
    contextMenuStyle,
    contextMenuRow,
    prepareParams,
    fetchDataWrapper,
    refreshTable,
    showContextMenu,
    handleClickOutside,
    debouncedHandleScroll,
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
