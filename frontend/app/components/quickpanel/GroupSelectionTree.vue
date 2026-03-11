<!--
This file is part of opsi-webgui application.
opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
Copyright (c) uib GmbH <info@uib.de> 2026
All rights reserved.
License: AGPL-3.0

GroupSelectionTree - Tree view for selecting groups in Quick Panel.
Syncs selections with stateStore to filter tables.
Used for both client groups and product groups.
-->
<template>
	<div class="group-selection-tree">
		<!-- Loading state -->
		<div v-if="loading" class="flex justify-center py-6">
			<UIcon :name="icons.loading" class="w-5 h-5 animate-spin text-(--color-text-muted)" />
		</div>

		<!-- Empty state -->
		<div v-else-if="treeNodes.length === 0" class="text-center py-6 text-sm text-(--color-text-muted)">
			{{ groupType === 'client' ? $t('noClientGroupsFound') : $t('noProductGroupsFound') }}
		</div>

		<!-- Tree view -->
		<div v-else class="space-y-0.5 max-h-[35vh] overflow-y-auto pr-1">
			<GroupSelectionTreeNode v-for="node in treeNodes" :key="node.id" :node="node" :level="0"
				:selected-ids="selectedIds" :expanded-ids="expandedIds" @toggle="toggleExpand" @select="toggleSelect" />
		</div>
	</div>
</template>

<script setup lang="ts">
interface TreeNode {
	id: string
	label: string
	isSpecial?: boolean
	isRoot?: boolean
	memberCount?: number
	children?: TreeNode[]
}

interface Props {
	groupType: 'client' | 'product'
}

const props = defineProps<Props>()
const icons = useIcons()
const { t: $t } = useI18n()
const stateStore = useStateStore()
const { apiGet, getProductGroups } = useApiHelpers()

const loading = ref(false)
const treeNodes = ref<TreeNode[]>([])
const expandedIds = ref<Set<string>>(new Set())

// Selected IDs from store
const selectedIds = computed(() => new Set(
	props.groupType === 'client'
		? stateStore.selectedClientGroups
		: stateStore.selectedProductGroups
))

// Toggle node expansion
function toggleExpand(nodeId: string) {
	const newExpanded = new Set(expandedIds.value)
	if (newExpanded.has(nodeId)) {
		newExpanded.delete(nodeId)
	} else {
		newExpanded.add(nodeId)
	}
	expandedIds.value = newExpanded
}

// Toggle group selection
function toggleSelect(nodeId: string) {
	const current = props.groupType === 'client'
		? [...stateStore.selectedClientGroups]
		: [...stateStore.selectedProductGroups]

	const idx = current.indexOf(nodeId)
	if (idx > -1) {
		current.splice(idx, 1)
	} else {
		current.push(nodeId)
	}

	if (props.groupType === 'client') {
		stateStore.setClientGroups(current)
	} else {
		stateStore.setProductGroups(current)
	}
}

// Transform API data to tree nodes
function transformToTree(data: Record<string, unknown>, parentId: string | null = null): TreeNode[] {
	if (!data || typeof data !== 'object') return []

	const nodes: TreeNode[] = []

	const processNode = (key: string, value: unknown): TreeNode | null => {
		if (!value || typeof value !== 'object') return null

		const obj = value as Record<string, unknown>
		const rawId = (obj.id as string) || key
		const nodeId = rawId ? rawId.split(';')[0] : ''
		const nodeText = (obj.text as string) || nodeId || ''
		const nodeType = obj.type as string

		// Skip ObjectToGroup nodes and empty IDs
		if (nodeType === 'ObjectToGroup' || !nodeId) return null

		const isSpecial = nodeText === 'not_assigned' || nodeId.includes('not_assigned')
		const isRoot = nodeText === 'clientdirectory' || nodeText === 'groups' || nodeText === 'productgroups'

		// Count members and process children
		let memberCount = 0
		const childNodes: TreeNode[] = []

		if (obj.children && typeof obj.children === 'object') {
			const children = obj.children as Record<string, unknown> | unknown[]
			if (Array.isArray(children)) {
				for (const child of children) {
					const childObj = child as Record<string, unknown>
					if (childObj.type === 'ObjectToGroup') {
						memberCount++
					} else {
						const subNode = processNode(childObj.id as string || '', child)
						if (subNode) childNodes.push(subNode)
					}
				}
			} else {
				for (const [childKey, childValue] of Object.entries(children)) {
					const childObj = childValue as Record<string, unknown>
					if (childObj?.type === 'ObjectToGroup') {
						memberCount++
					} else {
						const subNode = processNode(childKey, childValue)
						if (subNode) childNodes.push(subNode)
					}
				}
			}
		}

		return {
			id: nodeId,
			label: nodeText,
			isSpecial,
			isRoot,
			memberCount,
			children: childNodes.length > 0 ? childNodes : undefined,
		}
	}

	// Process root level
	if ((data as Record<string, unknown>).id) {
		const rootNode = processNode((data as Record<string, unknown>).id as string, data)
		if (rootNode) nodes.push(rootNode)
	} else {
		for (const [key, value] of Object.entries(data)) {
			const node = processNode(key, value)
			if (node) nodes.push(node)
		}
	}

	return nodes
}

// Fetch groups data
async function fetchGroups() {
	loading.value = true
	try {
		if (props.groupType === 'client') {
			const selectedDepots = stateStore.selectedDepots.length > 0 ? stateStore.selectedDepots : []
			const result = await apiGet<{ groups?: Record<string, unknown>; clientdirectory?: Record<string, unknown> }>(
				`/opsidata/hosts/groups?selectedDepots=[${selectedDepots.join(',')}]`
			)
			const rawData = result.data?.clientdirectory || result.data?.groups
			if (rawData) {
				treeNodes.value = transformToTree(rawData as Record<string, unknown>)
				// Auto-expand first level
				const firstNode = treeNodes.value[0]
				if (firstNode) {
					expandedIds.value = new Set([firstNode.id])
				}
			}
		} else {
			const result = await getProductGroups()
			if (result.data?.groups) {
				treeNodes.value = transformToTree(result.data.groups as Record<string, unknown>)
				// Auto-expand first level
				const firstNode = treeNodes.value[0]
				if (firstNode) {
					expandedIds.value = new Set([firstNode.id)
				}
			}
		}
	} catch (e) {
		console.error('[GroupSelectionTree] Failed to fetch groups:', e)
		treeNodes.value = []
	} finally {
		loading.value = false
	}
}

// Re-fetch when depots change (for client groups)
watch(() => stateStore.selectedDepots, () => {
	if (props.groupType === 'client') {
		fetchGroups()
	}
}, { deep: true })

onMounted(() => {
	fetchGroups()
})
</script>
