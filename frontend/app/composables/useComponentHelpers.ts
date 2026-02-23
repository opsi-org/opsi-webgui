/**
This file is part of opsi-webgui application.
opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
Copyright (c) uib GmbH <info@uib.de> 2025
All rights reserved.
License: AGPL-3.0
*/

import { ref, computed, onMounted } from 'vue'

// Notification
// export function useNotification() {
//   function notify(type: 'success' | 'error' | 'warning' | 'info', title: string, message: any) {
//     ElNotification[type]({
//       title,
//       message:
//         typeof message === 'object' ? h('pre', {}, JSON.stringify(message, null, 2)) : message,
//       duration: type === 'error' ? 0 : 5000,
//       showClose: true,
//     })
//   }
//   return {
//     notifySuccess: (title: string, message: any) => notify('success', title, message),
//     notifyError: (title: string, message: any) => notify('error', title, message),
//     notifyWarning: (title: string, message: any) => notify('warning', title, message),
//     notifyInfo: (title: string, message: any) => notify('info', title, message),
//   }
// }

// Dynamic Height
export function useDynamicHeight(reduceIds: string[], correction = 0) {
  const windowHeight = ref(window.innerHeight)
  const reduceHeightBy = ref(220)
  const maxVisibleHeight = computed(() => Math.min(windowHeight.value - reduceHeightBy.value, 3000))

  function setElHeights() {
    let total = 0
    for (const id of reduceIds) {
      const el = document.getElementById(id)
      if (el) total += el.clientHeight
    }
    reduceHeightBy.value = total + 70 + correction
  }

  function updateWindowValues() {
    setElHeights()
    windowHeight.value = window.innerHeight
  }
  onMounted(setElHeights)
  return { maxVisibleHeight, reduceHeightBy, updateWindowValues, setElHeights }
}

// Dynamic Table Height
// export function useDynamicTableHeight(
//   actualDataSize: Ref<number>,
//   pageSize: Ref<number>,
//   tableId: string,
//   refetchData: () => void
// ) {
//   const scrollDivHeight = ref(400)
//   const rowHeight = computed(() => 52.48)
//   const { maxVisibleHeight, updateWindowValues, setElHeights } = useDynamicHeight(
//     ['btop-header', 'globalBreadcrumb', `tableHeader-${tableId}`, `tableFooter-${tableId}`],
//     0,
//     refetchData
//   )
//   const visibleTableHeight = computed(() =>
//     actualDataSize.value < pageSize.value / 2 && maxVisibleHeight.value > 1000
//       ? Math.min(maxVisibleHeight.value / 2, 1000)
//       : maxVisibleHeight.value
//   )
//   const tableHeight = computed(() =>
//     actualDataSize.value < pageSize.value / 2
//       ? visibleTableHeight.value + scrollDivHeight.value
//       : actualDataSize.value * rowHeight.value + 200
//   )
//   return {
//     rowHeight,
//     scrollDivHeight,
//     visibleTableHeight,
//     tableHeight,
//     updateWindowValues,
//     setElHeights,
//   }
// }

// Group Tree
export function useGroupTree(multiSelection: Ref<boolean>) {
  function transformNode(node: any): any {
    if (!node) return {}
    const nodeIsLeaf = node.type === 'ObjectToGroup'
    const newNode: any = {
      id: node.id,
      type: node.type || 'Group',
      text: node.text,
      parent: node.parent,
      disabled: !nodeIsLeaf && !multiSelection.value,
      children: node.children ? Object.values(node.children).map(transformNode) : [],
    }
    return newNode
  }

  function transformToNestedArray(data: any): any[] {
    if (!data) return []
    return Object.values(data).map(transformNode)
  }

  function filterNodes(nodes: any[], searchFor: any[], key: string, returnKey?: string): any[] {
    return nodes.reduce((acc: any[], node: any) => {
      if (key && searchFor.includes(node[key])) acc.push(returnKey ? node[returnKey] : node)
      if (node.children) acc.push(...filterNodes(node.children, searchFor, key, returnKey))
      return acc
    }, [])
  }
  return { transformToNestedArray, filterNodes }
}

// Table Helper
export function useTableHelper(
  props: any,
  currentPage: Ref<number>,
  pageSize: Ref<number>,
  $emit: any,
  fetchedData: Ref<any[]>,
  totalItems: Ref<number>,
  isFirstPage: Ref<boolean>,
  isLastPage: Ref<boolean>,
  infiniteScrollDiv: Ref<any>,
  activeButton: Ref<string>,
  scrollDivHeight: Ref<number>
) {
  const isLoading = ref(false)
  const filterQuery = ref('')
  const sortByWrapper = ref<string>(props.sortBy || props.rowId)
  const sortDescWrapper = ref<boolean>(JSON.parse(String(props.sortDesc).toLowerCase()) || false)
  const contextMenuVisible = ref(false)
  const contextMenuStyle = ref({})
  const contextMenuRow = ref(null)

  function prepareParams() {
    return {
      sortBy: sortByWrapper.value,
      filterQuery: filterQuery.value,
      pageNumber: currentPage.value,
      perPage: pageSize.value,
      sortDesc: sortDescWrapper.value,
    }
  }

  async function fetchDataWrapper() {
    isLoading.value = true
    try {
      const res = await props.fetch(prepareParams())
      totalItems.value = res?.total || 0
      fetchedData.value = res?.data || []
    } catch (error) {
      totalItems.value = 0
      fetchedData.value = []
      // useNotification().notifyError('Fetch Error', error)
    } finally {
      isLoading.value = false
      scrollToTopOfTable()
    }
  }

  function scrollToTopOfTable() {
    if (infiniteScrollDiv.value) {
      infiniteScrollDiv.value.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  function showContextMenu(event: any, row: any) {
    event.preventDefault()
    contextMenuRow.value = row
    contextMenuStyle.value = {
      top: `${event.clientY}px`,
      left: `${event.clientX}px`,
      position: 'absolute',
      zIndex: 1000,
    }
    contextMenuVisible.value = true
  }

  function handleCommand(rowData: any, command: string) {
    contextMenuVisible.value = false
    if (command === 'config') handleConfigClick(rowData)
    if (command === 'log') handleLogClick(rowData)
    if (command === 'clone') handleCloneClick(rowData)
  }

  function handleConfigClick(rowData: any) {
    if (!props.actionConfig) return
    activeButton.value = 'config-' + rowData[props.rowId]
    useRouter().push(props.actionConfig(rowData))
  }

  function handleLogClick(rowData: any) {
    if (!props.actionLog) return
    activeButton.value = 'log-' + rowData[props.rowId]
    useRouter().push(props.actionLog(rowData))
  }

  function handleCloneClick(rowData: any) {
    if (!props.actionClone) return
    activeButton.value = 'clone-' + rowData[props.rowId]
    useRouter().push(props.actionClone(rowData))
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
    scrollToTopOfTable,
    showContextMenu,
    handleCommand,
    handleConfigClick,
    handleLogClick,
    handleCloneClick,
  }
}

// Config Tree
export function useConfigTree() {
  function buildTree(data: any, maxDepth = 2, minEntries = 2) {
    const tree: any[] = []
    function traverse(nodes: any[], segments: string[]): any {
      let currentNodes = nodes
      let node: any
      for (const seg of segments) {
        node = currentNodes.find((n: any) => n.key === seg)
        if (!node) {
          node = { key: seg, label: seg, children: [] }
          currentNodes.push(node)
        }
        currentNodes = node.children
      }
      return node
    }
    for (const synonym in data) {
      data[synonym]?.forEach((entry: any) => {
        const segments = entry.configId.split('.')
        const node = traverse(tree, segments)
        node.data = entry
      })
    }
    return tree
  }
  return { buildTree }
}
