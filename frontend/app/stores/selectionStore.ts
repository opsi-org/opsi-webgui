import { defineStore } from 'pinia'
import type { GroupTreeNodeData } from '~/types'

export type SelectionSource = 'table' | 'quickpanel' | 'groups' | null

function transformApiToTree(
  data: Record<string, unknown>,
  groupType: 'client' | 'product',
  level = 0
): GroupTreeNodeData[] {
  if (!data || typeof data !== 'object') return []
  const processNode = (
    key: string,
    value: unknown,
    parentId?: string,
    nodeLevel = 0
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
      const entries = Array.isArray(children)
        ? children.map((c, i) => [String(i), c])
        : Object.entries(children)
      for (const [childKey, childValue] of entries) {
        const childObj = childValue as Record<string, unknown>
        if (childObj?.type === 'ObjectToGroup') {
          memberCount++
          const memberId = (childObj.text as string) || (childObj.id as string)?.split(';')[0]
          if (memberId) members.push(memberId)
        } else {
          const subNode = processNode(childKey as string, childValue, nodeId, nodeLevel + 1)
          if (subNode) childNodes.push(subNode)
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
      level: nodeLevel,
    }
  }
  const rootData = data as Record<string, unknown>
  if (rootData.id) {
    const rootNode = processNode(rootData.id as string, rootData, undefined, level)
    return rootNode ? [rootNode] : []
  }
  const nodes: GroupTreeNodeData[] = []
  for (const [key, value] of Object.entries(rootData)) {
    const node = processNode(key, value, undefined, level)
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
      'selectedServers',
      'selectedClients',
      'selectedProducts',
      'selectedClientGroups',
      'selectedProductGroups',
    ],
  },
  state: () => ({
    configServer: '',
    _initialized: false,
    selectedServers: [] as string[],
    selectedClients: [] as string[],
    selectedProducts: [] as string[],
    selectedClientGroups: [] as string[],
    selectedProductGroups: [] as string[],
    selectionSource: null as SelectionSource,
    clientGroupsTree: [] as GroupTreeNodeData[],
    clientGroupsLoading: false,
    clientGroupsError: null as string | null,
    clientGroupsExpanded: [] as string[],
    productGroupsTree: [] as GroupTreeNodeData[],
    productGroupsLoading: false,
    productGroupsError: null as string | null,
    productGroupsExpanded: [] as string[],
    clientGroupsLastFetch: null as number | null,
    productGroupsLastFetch: null as number | null,
  }),
  getters: {
    serverCount: (s) => s.selectedServers.length,
    clientCount: (s) => s.selectedClients.length,
    productCount: (s) => s.selectedProducts.length,
    hasAnySelection: (s) =>
      s.selectedServers.length > 0 ||
      s.selectedClients.length > 0 ||
      s.selectedProducts.length > 0 ||
      s.selectedClientGroups.length > 0 ||
      s.selectedProductGroups.length > 0,
    selectedServersParam: (s): string => `[${s.selectedServers.join(',')}]`,
    isInitialized: (s): boolean => s._initialized,
    clientGroupsNeedsRefresh: (s): boolean =>
      !s.clientGroupsLastFetch || s.clientGroupsTree.length === 0,
    productGroupsNeedsRefresh: (s): boolean =>
      !s.productGroupsLastFetch || s.productGroupsTree.length === 0,
  },
  actions: {
    setConfigServer(server: string) {
      this.configServer = server
      if (this.selectedServers.length === 0 && server) this.selectedServers = [server]
    },
    async ensureServersSelected() {
      if (this.selectedServers.length > 0) return true
      if (this.configServer) {
        this.selectedServers = [this.configServer]
        return true
      }
      return false
    },
    setInitialized(value: boolean) {
      this._initialized = value
    },

    setServers(servers: string[], source: SelectionSource = 'table') {
      this.selectedServers =
        servers.length === 0 && this.configServer ? [this.configServer] : servers
      this.selectionSource = source
    },
    toggleServer(serverId: string, source: SelectionSource = 'table') {
      const i = this.selectedServers.indexOf(serverId)
      if (i > -1) this.selectedServers.splice(i, 1)
      else this.selectedServers.push(serverId)
      this.selectionSource = source
    },
    clearServers() {
      this.selectedServers = this.configServer ? [this.configServer] : []
    },

    setClients(clients: string[], source: SelectionSource = 'table') {
      this.selectedClients = clients
      this.selectionSource = source
    },
    toggleClient(clientId: string, source: SelectionSource = 'table') {
      const i = this.selectedClients.indexOf(clientId)
      if (i > -1) this.selectedClients.splice(i, 1)
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
      const i = this.selectedProducts.indexOf(productId)
      if (i > -1) this.selectedProducts.splice(i, 1)
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
      const i = this.selectedClientGroups.indexOf(groupId)
      if (i > -1) this.selectedClientGroups.splice(i, 1)
      else this.selectedClientGroups.push(groupId)
    },
    clearClientGroups() {
      this.selectedClientGroups = []
    },

    setProductGroups(groups: string[]) {
      this.selectedProductGroups = groups
    },
    toggleProductGroup(groupId: string) {
      const i = this.selectedProductGroups.indexOf(groupId)
      if (i > -1) this.selectedProductGroups.splice(i, 1)
      else this.selectedProductGroups.push(groupId)
    },
    clearProductGroups() {
      this.selectedProductGroups = []
    },

    clearAll() {
      this.selectedServers = []
      this.selectedClients = []
      this.selectedProducts = []
      this.selectedClientGroups = []
      this.selectedProductGroups = []
      this.selectionSource = null
    },

    addClients(clientIds: string[], source: SelectionSource = 'groups') {
      for (const id of clientIds)
        if (!this.selectedClients.includes(id)) this.selectedClients.push(id)
      this.selectionSource = source
    },
    addProducts(productIds: string[], source: SelectionSource = 'groups') {
      for (const id of productIds)
        if (!this.selectedProducts.includes(id)) this.selectedProducts.push(id)
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
        const { getHostGroups } = useApiHelpers()
        const params: Record<string, unknown> = {}
        if (this.selectedServers.length > 0)
          params.selectedServers = `[${this.selectedServers.join(',')}]`
        const result = await getHostGroups(params)
        if (result.data) {
          this.clientGroupsTree = transformApiToTree(result.data, 'client')
          this.clientGroupsLastFetch = Date.now()
          const first = this.clientGroupsTree[0]
          if (first && !this.clientGroupsExpanded.includes(first.id))
            this.clientGroupsExpanded = [first.id]
        }
      } catch (e) {
        this.clientGroupsError = e instanceof Error ? e.message : 'Failed to load groups'
      } finally {
        this.clientGroupsLoading = false
      }
    },

    async fetchProductGroups(force = false) {
      if (!force && !this.productGroupsNeedsRefresh && this.productGroupsTree.length > 0) return
      this.productGroupsLoading = true
      this.productGroupsError = null
      try {
        const { getProductGroups } = useApiHelpers()
        const result = await getProductGroups()
        if (result.data) {
          const rawData = (result.data as Record<string, unknown>).groups || result.data
          this.productGroupsTree = transformApiToTree(rawData as Record<string, unknown>, 'product')
          this.productGroupsLastFetch = Date.now()
          const first = this.productGroupsTree[0]
          if (first && !this.productGroupsExpanded.includes(first.id))
            this.productGroupsExpanded = [first.id]
        }
      } catch (e) {
        this.productGroupsError = e instanceof Error ? e.message : 'Failed to load groups'
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
      const find = (nodes: GroupTreeNodeData[]): GroupTreeNodeData | null => {
        for (const n of nodes) {
          if (n.id === groupId) return n
          if (n.children) {
            const f = find(n.children)
            if (f) return f
          }
        }
        return null
      }
      return find(tree)?.members || []
    },
  },
})
