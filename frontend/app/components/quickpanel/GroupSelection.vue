<!--
This file is part of opsi-webgui application.
opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
Copyright (c) uib GmbH <info@uib.de> 2026
All rights reserved.
License: AGPL-3.0
-->
<template>
	<div class="space-y-2">
		<UButton v-if="selected.length" @click="clearGroups" size="xs" block color="neutral" variant="ghost">
			Clear All ({{ selected.length }})
		</UButton>
		<div v-if="loading" class="flex justify-center py-4">
			<UIcon name="i-heroicons-arrow-path" class="w-4 h-4 animate-spin" />
		</div>
		<div v-else-if="groups.length" class="space-y-1 max-h-64 overflow-y-auto">
			<label v-for="group in groups" :key="group.id"
				class="flex items-center gap-2 p-1.5 rounded hover:bg-(--color-surface)] cursor-pointer">
				<input type="checkbox" :checked="selected.includes(group.id)" @change="toggleGroup(group.id)"
					class="rounded text-opsi-blue border-(--color-border)]" />
				<span class="text-xs truncate flex-1"
					:class="group.isSpecial ? 'italic text-(--color-text-muted)]' : ''">
					{{ group.name }}
				</span>
				<UBadge v-if="group.memberCount" size="xs" variant="soft" color="neutral">
					{{ group.memberCount }}
				</UBadge>
			</label>
		</div>
		<div v-else class="text-center py-4 text-xs text-(--color-text-muted)]">
			{{ $t('noGroupsFound') }}
		</div>
	</div>
</template>

<script setup lang="ts">
interface GroupItem {
	id: string
	name: string
	isSpecial?: boolean
	memberCount?: number
}

interface Props {
	groupType: 'client' | 'product'
}

const props = defineProps<Props>()
const stateStore = useStateStore()
const { apiGet, getProductGroups } = useApiHelpers()
const { t: $t } = useI18n()
const groups = ref<GroupItem[]>([])
const loading = ref(false)

const selected = computed(() =>
	props.groupType === 'client' ? stateStore.selectedClientGroups : stateStore.selectedProductGroups
)

const toggleGroup = (id: string) => {
	const current = [...selected.value]
	const idx = current.indexOf(id)
	if (idx > -1) current.splice(idx, 1)
	else current.push(id)
	props.groupType === 'client' ? stateStore.setClientGroups(current) : stateStore.setProductGroups(current)
}

const clearGroups = () =>
	props.groupType === 'client' ? stateStore.clearClientGroups() : stateStore.clearProductGroups()

// Flatten tree to get all group IDs
function flattenTree(node: Record<string, unknown>, result: GroupItem[] = []): GroupItem[] {
	if (!node || typeof node !== 'object') return result

	const nodeId = (node.id as string)?.split(';')[0] || ''
	const nodeText = (node.text as string) || nodeId
	const nodeType = node.type as string
	const isSpecial = nodeText === 'not_assigned' || nodeId.includes('not_assigned')
	const isRoot = nodeText === 'clientdirectory' || nodeText === 'groups'

	// Only add actual groups, not ObjectToGroup or root nodes
	if (nodeType !== 'ObjectToGroup' && !isRoot && nodeId) {
		// Count members (children that are ObjectToGroup)
		let memberCount = 0
		if (node.children && typeof node.children === 'object') {
			for (const child of Object.values(node.children as Record<string, unknown>)) {
				if ((child as Record<string, unknown>)?.type === 'ObjectToGroup') {
					memberCount++
				}
			}
		}

		result.push({
			id: nodeId,
			name: nodeText,
			isSpecial,
			memberCount,
		})
	}

	// Process children
	if (node.children && typeof node.children === 'object') {
		for (const child of Object.values(node.children as Record<string, unknown>)) {
			if ((child as Record<string, unknown>)?.type !== 'ObjectToGroup') {
				flattenTree(child as Record<string, unknown>, result)
			}
		}
	}

	return result
}

onMounted(async () => {
	loading.value = true
	try {
		if (props.groupType === 'client') {
			const selectedDepots = stateStore.selectedDepots.length > 0 ? stateStore.selectedDepots : []
			const result = await apiGet<{ groups?: Record<string, unknown>; clientdirectory?: Record<string, unknown> }>(
				`/opsidata/hosts/groups?selectedDepots=[${selectedDepots.join(',')}]`
			)
			if (result.data?.clientdirectory) {
				groups.value = flattenTree(result.data.clientdirectory as Record<string, unknown>)
			} else if (result.data?.groups) {
				groups.value = flattenTree(result.data.groups as Record<string, unknown>)
			}
		} else {
			const result = await getProductGroups()
			if (result.data?.groups) {
				groups.value = flattenTree(result.data.groups as Record<string, unknown>)
			}
		}
		// Sort alphabetically, but keep not_assigned at the end
		groups.value.sort((a, b) => {
			if (a.isSpecial && !b.isSpecial) return 1
			if (!a.isSpecial && b.isSpecial) return -1
			return a.name.localeCompare(b.name)
		})
	} catch (e) {
		console.error('[GroupSelection] Failed to fetch groups:', e)
	} finally {
		loading.value = false
	}
})
</script>