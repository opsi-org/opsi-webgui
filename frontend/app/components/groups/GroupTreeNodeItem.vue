<!--
This file is part of opsi-webgui application.
opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
Copyright (c) uib GmbH <info@uib.de> 2026
All rights reserved.
License: AGPL-3.0

GroupTreeNodeItem - Recursive tree node component for displaying groups hierarchy.
Supports expand/collapse, selection, and inline actions.
-->
<template>
	<div class="group-tree-node">
		<!-- Node Row -->
		<div :class="[
			'flex items-center gap-1.5 px-2 py-2 rounded cursor-pointer transition-colors group',
			isSelected ? 'bg-opsi-blue/10 text-opsi-blue' : 'hover:bg-(--color-surface-hover)'
		]" :style="{ paddingLeft: `${(group.level || 0) * 16 + 8}px` }" @click="handleClick">
			<!-- Expand/Collapse Toggle -->
			<button v-if="hasChildren" type="button"
				class="w-4 h-4 flex items-center justify-center text-(--color-text-muted) hover:text-(--color-text) transition-transform shrink-0"
				:class="{ 'rotate-90': isExpanded }" @click.stop="$emit('toggle', group.id)">
				<UIcon name="i-heroicons-chevron-right" class="w-3.5 h-3.5" />
			</button>
			<span v-else class="w-4 shrink-0" />

			<!-- Group Icon -->
			<UIcon :name="hasChildren ? icons.folder : icons.group" class="w-4 h-4 shrink-0" />

			<!-- Group Name -->
			<span class="text-sm flex-1 truncate">{{ group.name }}</span>

			<!-- Member Count -->
			<span class="text-xs text-(--color-text-muted)">({{ group.count }})</span>

			<!-- Action Buttons -->
			<div class="opacity-0 group-hover:opacity-100 flex gap-0.5 transition-opacity" @click.stop>
				<UButton :icon="icons.add" size="xs" variant="ghost" color="neutral" :title="$t('addSubgroup')"
					@click="$emit('create-subgroup', group.id)" />
				<UButton :icon="icons.edit" size="xs" variant="ghost" color="neutral" :title="$t('edit')"
					@click="$emit('edit', group)" />
				<UButton :icon="icons.delete" size="xs" variant="ghost" color="error" :title="$t('delete')"
					@click="$emit('delete', group)" />
			</div>
		</div>

		<!-- Children (recursive) -->
		<div v-if="hasChildren && isExpanded" class="children">
			<GroupTreeNodeItem v-for="child in group.children" :key="child.id" :group="child" :selected-id="selectedId"
				:expanded-ids="expandedIds" @select="$emit('select', $event)" @toggle="$emit('toggle', $event)"
				@create-subgroup="$emit('create-subgroup', $event)" @edit="$emit('edit', $event)"
				@delete="$emit('delete', $event)" />
		</div>
	</div>
</template>

<script setup lang="ts">
interface GroupItem {
	id: string
	name: string
	description: string
	notes?: string
	count: number
	members: string[]
	parentGroupId?: string | null
	children?: GroupItem[]
	level?: number
}

interface Props {
	group: GroupItem
	selectedId?: string | null
	expandedIds: Set<string>
}

const props = defineProps<Props>()

const emit = defineEmits<{
	(e: 'select', group: GroupItem): void
	(e: 'toggle', groupId: string): void
	(e: 'create-subgroup', parentId: string): void
	(e: 'edit', group: GroupItem): void
	(e: 'delete', group: GroupItem): void
}>()

const icons = useIcons()
const { t: $t } = useI18n()

const hasChildren = computed(() => Boolean(props.group.children?.length))
const isExpanded = computed(() => props.expandedIds.has(props.group.id))
const isSelected = computed(() => props.selectedId === props.group.id)

function handleClick() {
	emit('select', props.group)
}
</script>
