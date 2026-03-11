<!--
This file is part of opsi-webgui application.
opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
Copyright (c) uib GmbH <info@uib.de> 2026
All rights reserved.
License: AGPL-3.0

GroupSelectionTreeNode - Individual tree node for group selection in Quick Panel.
Supports checkbox selection and hierarchical navigation.
-->
<template>
	<div class="tree-node">
		<!-- Node content -->
		<div :class="[
			'flex items-center gap-1.5 py-1.5 px-2 rounded cursor-pointer transition-all duration-150',
			isSelected
				? 'bg-opsi-blue/10 border border-opsi-blue/30'
				: 'hover:bg-(--color-surface-hover) border border-transparent',
			node.isSpecial ? 'opacity-60' : '',
		]" :style="{ paddingLeft: `${level * 12 + 8}px` }" @click="handleClick">
			<!-- Expand/Collapse Toggle -->
			<button v-if="hasChildren" type="button"
				class="w-4 h-4 flex items-center justify-center text-(--color-text-muted) hover:text-(--color-text) transition-transform shrink-0"
				:class="{ 'rotate-90': isExpanded }" @click.stop="$emit('toggle', node.id)">
				<UIcon name="i-heroicons-chevron-right" class="w-3.5 h-3.5" />
			</button>
			<span v-else class="w-4 shrink-0" />

			<!-- Checkbox -->
			<input v-if="!node.isRoot" type="checkbox" :checked="isSelected" @change.stop="$emit('select', node.id)"
				@click.stop class="rounded border-(--color-border) text-opsi-blue focus:ring-opsi-blue shrink-0" />

			<!-- Node Label -->
			<span class="flex-1 truncate text-xs"
				:class="node.isSpecial ? 'italic text-(--color-text-muted)' : 'font-medium'" :title="node.label">
				{{ node.label }}
			</span>

			<!-- Member count badge -->
			<span v-if="node.memberCount !== undefined && node.memberCount > 0"
				class="text-[10px] text-(--color-text-muted) shrink-0">
				{{ node.memberCount }}
			</span>
		</div>

		<!-- Children -->
		<div v-if="hasChildren && isExpanded" class="tree-children">
			<GroupSelectionTreeNode v-for="child in node.children" :key="child.id" :node="child" :level="level + 1"
				:selected-ids="selectedIds" :expanded-ids="expandedIds" @toggle="$emit('toggle', $event)"
				@select="$emit('select', $event)" />
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
	node: TreeNode
	level?: number
	selectedIds: Set<string>
	expandedIds: Set<string>
}

const props = withDefaults(defineProps<Props>(), {
	level: 0,
})

const emit = defineEmits<{
	(e: 'toggle', nodeId: string): void
	(e: 'select', nodeId: string): void
}>()

const hasChildren = computed(() => Boolean(props.node.children?.length))
const isExpanded = computed(() => props.expandedIds.has(props.node.id))
const isSelected = computed(() => props.selectedIds.has(props.node.id))

function handleClick() {
	if (!props.node.isRoot) {
		emit('select', props.node.id)
	}
	// Also expand/collapse if has children
	if (hasChildren.value) {
		emit('toggle', props.node.id)
	}
}
</script>
