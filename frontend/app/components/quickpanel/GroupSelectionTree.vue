<template>
	<div class="flex flex-col h-full min-h-0">
		<div class="flex items-center gap-1 mb-2 shrink-0">
			<SharedFilterInput v-model="searchQuery" size="xs" input-class="flex-1 min-w-0" />
			<UTooltip v-if="isGroupRestricted" :text="groupType === 'client' ? t('opsiConfig.serverFeatures.hostGroupAccess.disabled') : t('opsiConfig.serverFeatures.productGroupAccess.disabled')">
				<UBadge color="warning" variant="subtle" size="xs" class="cursor-help shrink-0">
					{{ t('restricted') }}
				</UBadge>
			</UTooltip>
			<UButton :icon="icons.refresh" size="xs" variant="ghost" color="neutral" :title="t('refresh')"
				@click="refresh" />
			<UButton :icon="allExpanded ? icons.chevronUp : icons.chevronDown" size="xs" variant="ghost" color="neutral"
				:title="allExpanded ? t('collapseAll') : t('expandAll')" @click="toggleExpandAll" />
			<UTooltip v-if="selectedCount > 0" :text="`${t('clearAll')} (${selectedCount})`">
				<UButton :icon="icons.xCircle" size="xs" variant="ghost" color="neutral" @click="clearAll" />
			</UTooltip>
		</div>

		<div v-if="loading && !hasData" class="flex items-center justify-center py-8">
			<SharedLoadingSpinner size="sm" />
		</div>
		<div v-else-if="errorMsg" class="text-xs text-(--color-error) py-2">{{ errorMsg }}</div>

		<div v-else class="flex-1 overflow-y-auto min-h-0">
			<template v-if="groupType === 'client'">
				<div v-for="section in clientSections" :key="section.id" class="mb-2">
					<div class="flex items-center justify-between px-1 py-1.5 mb-0.5 cursor-pointer hover:bg-(--color-surface-hover) rounded"
						@click="toggleSectionCollapse(section.id)">
						<div class="flex items-center gap-1.5">
							<UIcon :name="isSectionCollapsed(section.id) ? icons.chevronRight : icons.chevronDown"
								class="w-3.5 h-3.5 text-(--color-text-muted)" />
							<UTooltip v-if="sectionTooltip(section.id)" :text="sectionTooltip(section.id)">
								<span
									class="text-xs font-semibold text-(--color-text) cursor-help border-b border-dashed border-(--color-text-muted)/40">{{
										sectionLabel(section.id) }}</span>
							</UTooltip>
							<span v-else class="text-xs font-semibold text-(--color-text)">{{
								sectionLabel(section.id) }}</span>
						</div>
						<UBadge v-if="section.count > 0" size="xs" variant="subtle" color="neutral">{{ section.count }}
						</UBadge>
					</div>
					<template v-if="!isSectionCollapsed(section.id)">
						<div v-for="item in section.flatItems" :key="`${section.id}-${item.id}`"
							:style="{ paddingLeft: `${(item.depth * 14) + 6}px`, borderLeftWidth: item.depth > 0 ? '1px' : '0', marginLeft: item.depth > 0 ? `${((item.depth - 1) * 14) + 10}px` : '0' }"
							class="flex items-center gap-1.5 py-0.5 px-1 rounded text-sm hover:bg-(--color-surface-hover) cursor-pointer border-l-transparent hover:border-l-(--color-border)"
							:class="{ 'border-l-(--color-border)/40': item.depth > 0 }">
							<UButton v-if="item.hasChildren"
								:icon="item.isExpanded ? icons.chevronDown : icons.chevronRight" size="xs"
								variant="ghost" color="neutral" class="shrink-0 p-0! h-4! w-4!"
								@click.stop="toggleExpand(item.id)" />
							<span v-else class="w-4 shrink-0" />
							<UCheckbox :model-value="isItemChecked(item)" size="xs" @click.stop
								@update:model-value="handleItemClick(item)" />
							<UTooltip v-if="item.label === 'not_assigned'" :text="t('notAssignedTooltip')">
								<span
									class="truncate flex-1 cursor-help border-b border-dashed border-(--color-text-muted)/40"
									:class="item.isGroup ? 'font-medium' : ''">{{ item.label }}</span>
							</UTooltip>
							<span v-else class="truncate flex-1" :class="item.isGroup ? 'font-medium' : ''"
								@click="item.hasChildren ? toggleExpand(item.id) : handleItemClick(item)">{{ item.label
								}}</span>
							<UBadge v-if="item.isGroup && item.memberCount > 0" size="xs" variant="subtle"
								color="neutral">
								{{ item.memberCount }}</UBadge>
						</div>
						<div v-if="section.flatItems.length === 0"
							class="text-xs text-(--color-text-muted) py-1 px-2 italic">{{ t('noResults') }}</div>
					</template>
				</div>
			</template>

			<template v-else>
				<div v-for="item in productFlatItems" :key="item.id" :style="{ paddingLeft: `${item.depth * 16}px` }"
					class="flex items-center gap-1.5 py-0.5 px-1 rounded text-sm hover:bg-(--color-surface-hover) cursor-pointer">
					<UButton v-if="item.hasChildren" :icon="item.isExpanded ? icons.chevronDown : icons.chevronRight"
						size="xs" variant="ghost" color="neutral" class="shrink-0 p-0! h-4! w-4!"
						@click.stop="toggleExpand(item.id)" />
					<span v-else class="w-4 shrink-0" />
					<UCheckbox :model-value="isItemChecked(item)" size="xs" @click.stop
						@update:model-value="handleItemClick(item)" />
					<span class="truncate flex-1" :class="item.isGroup ? 'font-medium' : ''"
						@click="item.hasChildren ? toggleExpand(item.id) : handleItemClick(item)">{{ item.label
						}}</span>
					<UBadge v-if="item.isGroup && item.memberCount > 0" size="xs" variant="subtle" color="neutral">{{
						item.memberCount }}</UBadge>
				</div>
				<div v-if="productFlatItems.length === 0" class="text-xs text-(--color-text-muted) py-4 text-center">{{
					t('noResults') }}</div>
			</template>
		</div>


	</div>
</template>

<script setup lang="ts">
import type { GroupTreeNodeData } from '~/types'
import { useSelectionStore } from '~/stores/selectionStore'

const props = defineProps<{ groupType: 'client' | 'product'; active?: boolean }>()

const icons = useIcons()
const { t: i18nT } = useI18n()
const selectionStore = useSelectionStore()
const { isHostGroupAccessRestricted, isProductGroupAccessRestricted } = useUserPermissions()

const isGroupRestricted = computed(() =>
    props.groupType === 'client' ? isHostGroupAccessRestricted.value : isProductGroupAccessRestricted.value
)

const t = (key: string) => {
	const translated = i18nT(key)
	if (translated && translated !== key) return String(translated)
	return key.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase()).trim()
}

const searchQuery = ref('')
const allClientsList = ref<string[]>([])
const allClientsLoading = ref(false)
const collapsedSections = ref<Set<string>>(new Set(['groups', 'clientdirectory']))

function isSectionCollapsed(sectionId: string): boolean {
	return collapsedSections.value.has(sectionId) && !searchQuery.value
}

function toggleSectionCollapse(sectionId: string) {
	const newSet = new Set(collapsedSections.value)
	if (newSet.has(sectionId)) {
		newSet.delete(sectionId)
	} else {
		newSet.add(sectionId)
	}
	collapsedSections.value = newSet
}

const loading = computed(() =>
	props.groupType === 'client' ? selectionStore.clientGroupsLoading : selectionStore.productGroupsLoading
)
const errorMsg = computed(() =>
	props.groupType === 'client' ? selectionStore.clientGroupsError : selectionStore.productGroupsError
)
const rawTree = computed(() =>
	props.groupType === 'client' ? selectionStore.clientGroupsTree : selectionStore.productGroupsTree
)
const expandedIds = computed(() => {
	const ids = props.groupType === 'client' ? selectionStore.clientGroupsExpanded : selectionStore.productGroupsExpanded
	return new Set(ids)
})
const hasData = computed(() => rawTree.value.length > 0)

function sectionLabel(id: string): string {
	if (id === 'groups') return t('Groups')
	if (id === 'clientdirectory') return t('clientDirectory')
	return id
}

function sectionTooltip(id: string): string {
	if (id === 'groups') return t('groupsTooltip')
	if (id === 'clientdirectory') return t('clientDirectoryTooltip')
	return ''
}

// Pre-compute selection sets for O(1) lookups
const selectedItemsSet = computed(() => {
	const items = props.groupType === 'client' ? selectionStore.selectedClients : selectionStore.selectedProducts
	return new Set(items)
})
const selectedGroupsSet = computed(() => {
	const groups = props.groupType === 'client' ? selectionStore.selectedClientGroups : selectionStore.selectedProductGroups
	return new Set(groups)
})

interface FlatItem {
	id: string
	label: string
	depth: number
	isGroup: boolean
	memberCount: number
	members: string[]
	hasChildren: boolean
	isExpanded: boolean
}

function flattenNodes(nodes: GroupTreeNodeData[], depth: number, query: string): FlatItem[] {
	const result: FlatItem[] = []
	for (const node of nodes) {
		const label = node.label || node.id
		const labelMatch = !query || label.toLowerCase().includes(query)
		const hasGroupChildren = (node.children?.length || 0) > 0
		const hasMemberChildren = (node.members?.length || 0) > 0
		const isGroup = hasGroupChildren || hasMemberChildren || node.type === 'HostGroup' || node.type === 'ProductGroup'
		const isExpanded = expandedIds.value.has(node.id)

		const childItems = node.children ? flattenNodes(node.children, depth + 1, query) : []
		const memberItems: FlatItem[] = []
		if (node.members) {
			const members = node.members
			let matchCount = 0
			for (const m of members) {
				if (!query || m.toLowerCase().includes(query)) {
					// Limit visible members to avoid DOM overload
					if (matchCount < 200) {
						memberItems.push({
							id: m, label: m, depth: depth + 1, isGroup: false,
							memberCount: 0, members: [], hasChildren: false, isExpanded: false,
						})
					}
					matchCount++
				}
			}
		}

		const hasMatchingDescendants = childItems.length > 0 || memberItems.length > 0
		if (labelMatch || hasMatchingDescendants) {
			result.push({
				id: node.id, label, depth, isGroup,
				memberCount: node.memberCount || node.members?.length || 0,
				members: node.members || [],
				hasChildren: hasGroupChildren || hasMemberChildren,
				isExpanded: query ? true : isExpanded,
			})
			if (query ? true : isExpanded) {
				result.push(...childItems)
				result.push(...memberItems)
			}
		}
	}
	return result
}

const clientSections = computed(() => {
	if (props.groupType !== 'client') return []
	const q = searchQuery.value.toLowerCase()
	return rawTree.value.map(root => ({
		id: root.id,
		label: root.label || root.id,
		count: root.memberCount || root.members?.length || 0,
		flatItems: root.children ? flattenNodes(root.children, 0, q) : [],
	}))
})

const productFlatItems = computed(() => {
	if (props.groupType !== 'product') return []
	const q = searchQuery.value.toLowerCase()
	const root = rawTree.value
	const first = root.length === 1 ? root[0] : null
	const nodes = first?.children?.length ? first.children : root
	return flattenNodes(nodes, 0, q)
})

const selectedCount = computed(() =>
	props.groupType === 'client' ? selectionStore.selectedClients.length : selectionStore.selectedProducts.length
)

const allExpanded = computed(() => {
	const collectIds = (nodes: GroupTreeNodeData[]): string[] => {
		const ids: string[] = []
		for (const n of nodes) {
			if (n.children?.length || n.members?.length) {
				ids.push(n.id)
				if (n.children) ids.push(...collectIds(n.children))
			}
		}
		return ids
	}
	const allIds = collectIds(rawTree.value)
	return allIds.length > 0 && allIds.every(id => expandedIds.value.has(id))
})

function isItemChecked(item: FlatItem): boolean {
	if (item.isGroup) {
		if (item.members.length > 0) {
			return item.members.every(m => selectedItemsSet.value.has(m))
		}
		return selectedGroupsSet.value.has(item.id)
	}
	return selectedItemsSet.value.has(item.id)
}

function handleItemClick(item: FlatItem) {
	if (item.isGroup) {
		const isCurrentlyChecked = isItemChecked(item)
		if (props.groupType === 'client') {
			if (isCurrentlyChecked) {
				// Uncheck: remove group and its members
				if (selectionStore.selectedClientGroups.includes(item.id)) {
					selectionStore.toggleClientGroup(item.id)
				}
				if (item.members.length > 0) {
					selectionStore.removeClients(item.members)
				}
			} else {
				// Check: add group and its members
				if (!selectionStore.selectedClientGroups.includes(item.id)) {
					selectionStore.toggleClientGroup(item.id)
				}
				if (item.members.length > 0) {
					selectionStore.addClients(item.members, 'quickpanel')
				}
			}
		} else {
			if (isCurrentlyChecked) {
				if (selectionStore.selectedProductGroups.includes(item.id)) {
					selectionStore.toggleProductGroup(item.id)
				}
				if (item.members.length > 0) {
					selectionStore.removeProducts(item.members)
				}
			} else {
				if (!selectionStore.selectedProductGroups.includes(item.id)) {
					selectionStore.toggleProductGroup(item.id)
				}
				if (item.members.length > 0) {
					selectionStore.addProducts(item.members, 'quickpanel')
				}
			}
		}
	} else {
		if (props.groupType === 'client') selectionStore.toggleClient(item.id, 'quickpanel')
		else selectionStore.toggleProduct(item.id, 'quickpanel')
	}
}

function toggleExpand(nodeId: string) {
	selectionStore.toggleGroupExpand(props.groupType, nodeId)
}

function toggleExpandAll() {
	if (allExpanded.value) selectionStore.collapseAllGroups(props.groupType)
	else selectionStore.expandAllGroups(props.groupType)
}

function clearAll() {
	if (props.groupType === 'client') {
		selectionStore.clearClients()
		selectionStore.clearClientGroups()
	} else {
		selectionStore.clearProducts()
		selectionStore.clearProductGroups()
	}
}

function selectAll() {
	if (props.groupType === 'client') {
		const allIds = allClientsList.value.length > 0 ? allClientsList.value : []
		if (allIds.length > 0) selectionStore.addClients(allIds, 'quickpanel')
	} else {
		const allIds = collectAllMembers(rawTree.value)
		if (allIds.length > 0) selectionStore.addProducts(allIds, 'quickpanel')
	}
}

function collectAllMembers(nodes: GroupTreeNodeData[]): string[] {
	const result: string[] = []
	for (const node of nodes) {
		if (node.members) result.push(...node.members)
		if (node.children) result.push(...collectAllMembers(node.children))
	}
	return result
}

function refresh() {
	if (props.groupType === 'client') {
		selectionStore.fetchClientGroups(true)
		fetchAllClients()
	} else {
		selectionStore.fetchProductGroups(true)
	}
}

async function fetchAllClients() {
	if (props.groupType !== 'client') return
	allClientsLoading.value = true
	try {
		const { getClientIds } = useApiHelpers()
		const depots = selectionStore.selectedServers
		if (depots.length > 0) {
			const result = await getClientIds(depots)
			allClientsList.value = result.data || []
		}
	} catch { /* ignore */ } finally {
		allClientsLoading.value = false
	}
}

onMounted(() => {
	// Data is fetched lazily when the component becomes visible
	// See the watch on 'active' prop
})

watch(() => props.active, (isActive) => {
	if (isActive && !hasData.value && !loading.value) {
		if (props.groupType === 'client') {
			selectionStore.fetchClientGroups()
			fetchAllClients()
		} else {
			selectionStore.fetchProductGroups()
		}
	}
}, { immediate: true })
</script>
