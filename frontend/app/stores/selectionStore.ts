import { defineStore } from 'pinia'
import type { GroupTreeNodeData } from '~/types/groups.types'

export type SelectionSource = 'table' | 'quickpanel' | 'groups' | null

export interface SelectionStoreState {
  configServer: string
  _initialized: boolean
  selectedDepots: string[]
  selectedClients: string[]
  selectedProducts: string[]
  selectedClientGroups: string[]
  selectedProductGroups: string[]
  selectionSource: SelectionSource

  clientGroupsTree: GroupTreeNodeData[]
  clientGroupsLoading: boolean
  clientGroupsError: string | null
  clientGroupsExpanded: string[]

  productGroupsTree: GroupTreeNodeData[]
  productGroupsLoading: boolean
  productGroupsError: string | null
  productGroupsExpanded: string[]

  clientGroupsLastFetch: number | null
  productGroupsLastFetch: number | null
}

const CACHE_DURATION = 2 * 60 * 1000

function transformApiToTree(
  data: Record<string, unknown>,
  groupType: 'client' | 'product'
): GroupTreeNodeData[] {
  if (!data || typeof data !== 'object') return []

  const processNode = (
    key: string,
    value: unknown,
    parentId?: string
  ): GroupTreeNodeData | null => {
    if (!value || typeof value !== 'object') return null
    const obj = value as Record<string, unknown>
    const rawId = (obj.id as string) || key
    const nodeId = rawId ? rawId.split(';')[0] : ''
    const nodeText = (obj.text as string) || nodeId || ''
    const nodeType = obj.type as string
    if (nodeType === 'ObjectToGroup' || !nodeId) return null

    const isSpecial = nodeText === 'not_assigned' || nodeId.includes('not_assigned')
    const isRoot =
      nodeText === 'clientdirectory' || nodeText === 'groups' || nodeText === 'productgroups'

    let memberCount = 0
    const members: string[] = []
    const childNodes: GroupTreeNodeData[] = []

    if (obj.children && typeof obj.children === 'object') {
      const children = obj.children as Record<string, unknown> | unknown[]
      if (Array.isArray(children)) {
        for (const child of children) {
          const childObj = child as Record<string, unknown>
          if (childObj.type === 'ObjectToGroup') {
            memberCount++
            const memberId = (childObj.text as string) || (childObj.id as string)?.split(';')[0]
            if (memberId) members.push(memberId)
          } else {
            const subNode = processNode((childObj.id as string) || '', child, nodeId)
            if (subNode) childNodes.push(subNode)
          }
        }
      } else {
        for (const [childKey, childValue] of Object.entries(children)) {
          const childObj = childValue as Record<string, unknown>
          if (childObj?.type === 'ObjectToGroup') {
            memberCount++
            const memberId = (childObj.text as string) || (childObj.id as string)?.split(';')[0]
            if (memberId) members.push(memberId)
          } else {
            const subNode = processNode(childKey, childValue, nodeId)
            if (subNode) childNodes.push(subNode)
          }
        }
      }
    }

    return {
      id: nodeId,
      label: nodeText,
      parentId: parentId || null,
      type: groupType === 'client' ? 'HostGroup' : 'ProductGroup',
      memberCount,
      members,
      children: childNodes.length > 0 ? childNodes : undefined,
      isRoot,
      isSpecial,
    }
  }

  const rootData = data as Record<string, unknown>
  if (rootData.id) {
    const rootNode = processNode(rootData.id as string, rootData)
    return rootNode ? [rootNode] : []
  }
  const nodes: GroupTreeNodeData[] = []
  for (const [key, value] of Object.entries(rootData)) {
    const node = processNode(key, value)
    if (node) nodes.push(node)
  }
  return nodes
}

export const useSelectionStore = defineStore('selection', {
  persist: {
    key: 'opsi-webgui-selection',
    storage: localStorage,
    pick: [
      'configServer',
      '_initialized',
      'selectedDepots',
      'selectedClients',
      'selectedProducts',
      'selectedClientGroups',
      'selectedProductGroups',
    ],
  },
  state: (): SelectionStoreState => ({
    configServer: '',
    _initialized: false,
    selectedDepots: [],
    selectedClients: [],
    selectedProducts: [],
    selectedClientGroups: [],
    selectedProductGroups: [],
    selectionSource: null,

    clientGroupsTree: [],
    clientGroupsLoading: false,
    clientGroupsError: null,
    clientGroupsExpanded: [],

    productGroupsTree: [],
    productGroupsLoading: false,
    productGroupsError: null,
    productGroupsExpanded: [],

    clientGroupsLastFetch: null,
    productGroupsLastFetch: null,
  }),

  getters: {
    depotCount: (state) => state.selectedDepots.length,
    clientCount: (state) => state.selectedClients.length,
    productCount: (state) => state.selectedProducts.length,
    hasAnySelection: (state) =>
      state.selectedDepots.length > 0 ||
      state.selectedClients.length > 0 ||
      state.selectedProducts.length > 0 ||
      state.selectedClientGroups.length > 0 ||
      state.selectedProductGroups.length > 0,
    selectedDepotsParam: (state): string => `[${state.selectedDepots.join(',')}]`,
    isInitialized: (state): boolean => state._initialized,
    clientGroupsNeedsRefresh: (state): boolean =>
      !state.clientGroupsLastFetch || Date.now() - state.clientGroupsLastFetch > CACHE_DURATION,
    productGroupsNeedsRefresh: (state): boolean =>
      !state.productGroupsLastFetch || Date.now() - state.productGroupsLastFetch > CACHE_DURATION,
  },

  actions: {
    setConfigServer(server: string) {
      this.configServer = server
      if (this.selectedDepots.length === 0 && server) {
        this.selectedDepots = [server]
      }
    },

    async ensureDepotsSelected() {
      if (this.selectedDepots.length > 0) return true
      if (this.configServer) {
        this.selectedDepots = [this.configServer]
        return true
      }
      return false
    },

    setInitialized(value: boolean) {
      this._initialized = value
    },

    setDepots(depots: string[], source: SelectionSource = 'table') {
      if (depots.length === 0 && this.configServer) {
        this.selectedDepots = [this.configServer]
      } else {
        this.selectedDepots = depots
      }
      this.selectionSource = source
    },
    toggleDepot(depotId: string, source: SelectionSource = 'table') {
      const index = this.selectedDepots.indexOf(depotId)
      if (index > -1) this.selectedDepots.splice(index, 1)
      else this.selectedDepots.push(depotId)
      this.selectionSource = source
    },
    clearDepots() {
      if (this.configServer) this.selectedDepots = [this.configServer]
      else this.selectedDepots = []
    },

    setClients(clients: string[], source: SelectionSource = 'table') {
      this.selectedClients = clients
      this.selectionSource = source
    },
    toggleClient(clientId: string, source: SelectionSource = 'table') {
      const index = this.selectedClients.indexOf(clientId)
      if (index > -1) this.selectedClients.splice(index, 1)
      else this.selectedClients.push(clientId)
      this.selectionSource = source
    },
    clearClients() {
      this.selectedClients = []
    },

    setProducts(products: string[], source: SelectionSource = 'table') {
      this.selectedProducts = products
      this.selectionSource = source
    },
    toggleProduct(productId: string, source: SelectionSource = 'table') {
      const index = this.selectedProducts.indexOf(productId)
      if (index > -1) this.selectedProducts.splice(index, 1)
      else this.selectedProducts.push(productId)
      this.selectionSource = source
    },
    clearProducts() {
      this.selectedProducts = []
    },

    setClientGroups(groups: string[]) {
      this.selectedClientGroups = groups
    },
    toggleClientGroup(groupId: string) {
      const index = this.selectedClientGroups.indexOf(groupId)
      if (index > -1) this.selectedClientGroups.splice(index, 1)
      else this.selectedClientGroups.push(groupId)
    },
    clearClientGroups() {
      this.selectedClientGroups = []
    },

    setProductGroups(groups: string[]) {
      this.selectedProductGroups = groups
    },
    toggleProductGroup(groupId: string) {
      const index = this.selectedProductGroups.indexOf(groupId)
      if (index > -1) this.selectedProductGroups.splice(index, 1)
      else this.selectedProductGroups.push(groupId)
    },
    clearProductGroups() {
      this.selectedProductGroups = []
    },

    clearAll() {
      this.selectedDepots = []
      this.selectedClients = []
      this.selectedProducts = []
      this.selectedClientGroups = []
      this.selectedProductGroups = []
      this.selectionSource = null
    },

    addClients(clientIds: string[], source: SelectionSource = 'groups') {
      for (const id of clientIds) {
        if (!this.selectedClients.includes(id)) this.selectedClients.push(id)
      }
      this.selectionSource = source
    },
    addProducts(productIds: string[], source: SelectionSource = 'groups') {
      for (const id of productIds) {
        if (!this.selectedProducts.includes(id)) this.selectedProducts.push(id)
      }
      this.selectionSource = source
    },
    removeClients(clientIds: string[]) {
      this.selectedClients = this.selectedClients.filter((id) => !clientIds.includes(id))
    },
    removeProducts(productIds: string[]) {
      this.selectedProducts = this.selectedProducts.filter((id) => !productIds.includes(id))
    },

    async fetchClientGroups(force = false) {
      if (!force && !this.clientGroupsNeedsRefresh && this.clientGroupsTree.length > 0) return
      this.clientGroupsLoading = true
      this.clientGroupsError = null
      try {
        const { apiGet } = useApiHelpers()
        const params: Record<string, unknown> = {}
        if (this.selectedDepots.length > 0) {
          params.selectedDepots = `[${this.selectedDepots.join(',')}]`
        }
        const result = await apiGet<{
          groups?: Record<string, unknown>
          clientdirectory?: Record<string, unknown>
        }>('/opsidata/hosts/groups', params)
        if (result.data) {
          this.clientGroupsTree = transformApiToTree(
            result.data as Record<string, unknown>,
            'client'
          )
          this.clientGroupsLastFetch = Date.now()
          const firstNode = this.clientGroupsTree[0]
          if (firstNode && !this.clientGroupsExpanded.includes(firstNode.id)) {
            this.clientGroupsExpanded = [firstNode.id]
          }
        }
      } catch (error) {
        this.clientGroupsError = error instanceof Error ? error.message : 'Failed to load groups'
      } finally {
        this.clientGroupsLoading = false
      }
    },

    async fetchProductGroups(force = false) {
      if (!force && !this.productGroupsNeedsRefresh && this.productGroupsTree.length > 0) return
      this.productGroupsLoading = true
      this.productGroupsError = null
      try {
        const { apiGet } = useApiHelpers()
        const result = await apiGet<{
          groups?: Record<string, unknown>
        }>('/opsidata/products/groups')
        if (result.data) {
          const rawData = result.data.groups || result.data
          this.productGroupsTree = transformApiToTree(rawData as Record<string, unknown>, 'product')
          this.productGroupsLastFetch = Date.now()
          const firstNode = this.productGroupsTree[0]
          if (firstNode && !this.productGroupsExpanded.includes(firstNode.id)) {
            this.productGroupsExpanded = [firstNode.id]
          }
        }
      } catch (error) {
        this.productGroupsError = error instanceof Error ? error.message : 'Failed to load groups'
      } finally {
        this.productGroupsLoading = false
      }
    },

    toggleGroupExpand(groupType: 'client' | 'product', groupId: string) {
      const arr = groupType === 'client' ? this.clientGroupsExpanded : this.productGroupsExpanded
      const idx = arr.indexOf(groupId)
      if (idx > -1) arr.splice(idx, 1)
      else arr.push(groupId)
    },

    expandAllGroups(groupType: 'client' | 'product') {
      const tree = groupType === 'client' ? this.clientGroupsTree : this.productGroupsTree
      const allIds: string[] = []
      const collect = (nodes: GroupTreeNodeData[]) => {
        for (const n of nodes) {
          if (n.children?.length || n.members?.length) {
            allIds.push(n.id)
            if (n.children) collect(n.children)
          }
        }
      }
      collect(tree)
      if (groupType === 'client') this.clientGroupsExpanded = allIds
      else this.productGroupsExpanded = allIds
    },

    collapseAllGroups(groupType: 'client' | 'product') {
      const tree = groupType === 'client' ? this.clientGroupsTree : this.productGroupsTree
      const rootId = tree[0]?.id
      if (groupType === 'client') this.clientGroupsExpanded = rootId ? [rootId] : []
      else this.productGroupsExpanded = rootId ? [rootId] : []
    },

    getGroupMembers(groupId: string, groupType: 'client' | 'product'): string[] {
      const tree = groupType === 'client' ? this.clientGroupsTree : this.productGroupsTree
      const findGroup = (nodes: GroupTreeNodeData[]): GroupTreeNodeData | null => {
        for (const node of nodes) {
          if (node.id === groupId) return node
          if (node.children) {
            const found = findGroup(node.children)
            if (found) return found
          }
        }
        return null
      }
      return findGroup(tree)?.members || []
    },
  },
})
