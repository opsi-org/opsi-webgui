/**
This file is part of opsi-webgui application.
opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
Copyright (c) uib GmbH <info@uib.de> 2025
All rights reserved.
License: AGPL-3.0
*/

import { ref, computed, onMounted } from 'vue'
import type { Ref } from 'vue'

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

// Group Tree
type GroupNode = {
  id: string
  type?: string
  text: string
  parent?: string
  children?: GroupNode[]
  disabled?: boolean
}
export function useGroupTree(multiSelection: Ref<boolean>) {
  function transformNode(node: Record<string, unknown>): GroupNode {
    if (!node) return {} as GroupNode
    const nodeIsLeaf = node.type === 'ObjectToGroup'
    return {
      id: node.id as string,
      type: (node.type as string) || 'Group',
      text: node.text as string,
      parent: node.parent as string,
      disabled: !nodeIsLeaf && !multiSelection.value,
      children: node.children ? Object.values(node.children as object).map(transformNode) : [],
    }
  }

  function transformToNestedArray(data: Record<string, unknown>): GroupNode[] {
    if (!data) return []
    return Object.values(data).map((n) => transformNode(n as Record<string, unknown>))
  }

  function filterNodes(
    nodes: GroupNode[],
    searchFor: unknown[],
    key: string,
    returnKey?: string
  ): unknown[] {
    return nodes.reduce((acc: unknown[], node: GroupNode) => {
      if (key && searchFor.includes((node as Record<string, unknown>)[key]))
        acc.push(returnKey ? (node as Record<string, unknown>)[returnKey] : node)
      if (node.children) acc.push(...filterNodes(node.children, searchFor, key, returnKey))
      return acc
    }, [])
  }
  return { transformToNestedArray, filterNodes }
}

// Table Helper
export function useTableHelper<T extends Record<string, unknown>>(
  props: {
    [key: string]: unknown
    fetch: (params: Record<string, unknown>) => Promise<{ total?: number; data?: T[] }>
    sortBy?: string
    rowId?: string
    sortDesc?: boolean
    actionConfig?: (row: T) => string
    actionLog?: (row: T) => string
    actionClone?: (row: T) => string
  },
  currentPage: Ref<number>,
  pageSize: Ref<number>,
  fetchedData: Ref<T[]>,
  totalItems: Ref<number>,
  infiniteScrollDiv: Ref<HTMLElement | null>,
  activeButton: Ref<string>
) {
  const isLoading = ref(false)
  const filterQuery = ref('')
  const sortByWrapper = ref<string>(props.sortBy || props.rowId || '')
  const sortDescWrapper = ref<boolean>(!!props.sortDesc)
  const contextMenuVisible = ref(false)
  const contextMenuStyle = ref<Record<string, string>>({})
  const contextMenuRow = ref<T | null>(null)

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
    } catch {
      totalItems.value = 0
      fetchedData.value = []
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

  function showContextMenu(event: MouseEvent, row: T) {
    event.preventDefault()
    contextMenuRow.value = row
    contextMenuStyle.value = {
      top: `${event.clientY}px`,
      left: `${event.clientX}px`,
      position: 'absolute',
      zIndex: '1000',
    }
    contextMenuVisible.value = true
  }

  function handleCommand(rowData: T, command: string) {
    contextMenuVisible.value = false
    if (command === 'config') handleConfigClick(rowData)
    if (command === 'log') handleLogClick(rowData)
    if (command === 'clone') handleCloneClick(rowData)
  }

  function handleConfigClick(rowData: T) {
    if (!props.actionConfig) return
    activeButton.value = 'config-' + rowData[props.rowId as string]
    useRouter().push(props.actionConfig(rowData))
  }

  function handleLogClick(rowData: T) {
    if (!props.actionLog) return
    activeButton.value = 'log-' + rowData[props.rowId as string]
    useRouter().push(props.actionLog(rowData))
  }

  function handleCloneClick(rowData: T) {
    if (!props.actionClone) return
    activeButton.value = 'clone-' + rowData[props.rowId as string]
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
  function buildTree(data: Record<string, { configId: string }[]>) {
    const tree: Array<Record<string, unknown>> = []
    function traverse(
      nodes: Array<Record<string, unknown>>,
      segments: string[]
    ): Record<string, unknown> {
      let currentNodes = nodes
      let node: Record<string, unknown> | undefined
      for (const seg of segments) {
        node = currentNodes.find((n) => n.key === seg)
        if (!node) {
          node = { key: seg, label: seg, children: [] }
          currentNodes.push(node)
        }
        currentNodes = node.children as Array<Record<string, unknown>>
      }
      return node!
    }
    for (const synonym in data) {
      data[synonym]?.forEach((entry) => {
        const segments = entry.configId.split('.')
        const node = traverse(tree, segments)
        node.data = entry
      })
    }
    return tree
  }
  return { buildTree }
}
