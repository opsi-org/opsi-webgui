<!--
This file is part of opsi-webgui application.
opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
Copyright (c) uib GmbH <info@uib.de> 2026
All rights reserved.
License: AGPL-3.0

GroupTreeView - Tree view with drag-and-drop support for groups management.
Supports both client groups and product groups with action buttons.
-->
<template>
	<div class="group-tree-view" role="tree" :aria-label="ariaLabel">
		<!-- Tree container -->
		<ul class="tree-list space-y-0.5" role="group">
			<GroupTreeNode v-for="node in nodes" :key="node.id" :node="node" :level="0" :expanded-nodes="expandedNodes"
				:selected-id="selectedId" :group-type="groupType" :draggable="draggable" :drag-target-id="dragTargetId"
				@toggle="handleToggle" @select="handleSelect" @action="handleAction" @drag-start="handleDragStart"
				@drag-end="handleDragEnd" @drag-over="handleDragOver" @drop="handleDrop" />
		</ul>

		<!-- Empty state -->
		<div v-if="nodes.length === 0" class="py-8 text-center">
			<UIcon :name="icons.group" class="w-12 h-12 mx-auto mb-3 opacity-40" aria-hidden="true" />
			<p class="text-sm text-(--color-text-muted)]">{{ emptyText || $t('noGroupsFound') }}</p>
		</div>
	</div>
</template>

<script setup lang="ts">
import type { GroupTreeNodeData, GroupAction } from '~/types/groups.types'

interface Props {
	nodes: GroupTreeNodeData[]
	expandedNodes: Set<string>
	selectedId: string | null
	groupType: 'clients' | 'products'
	draggable?: boolean
	ariaLabel?: string
	emptyText?: string
}

const props = withDefaults(defineProps<Props>(), {
	draggable: true,
	ariaLabel: 'Groups tree',
})

const emit = defineEmits<{
	(e: 'update:expandedNodes', nodes: Set<string>): void
	(e: 'update:selectedId', id: string | null): void
	(e: 'toggle', nodeId: string, expanded: boolean): void
	(e: 'select', node: GroupTreeNodeData): void
	(e: 'action', action: GroupAction, node: GroupTreeNodeData): void
	(e: 'drop', sourceId: string, targetId: string, position: 'inside' | 'before' | 'after'): void
}>()

const icons = useIcons()
const { t: $t } = useI18n()

// Drag state
const dragTargetId = ref<string | null>(null)
const draggedNodeId = ref<string | null>(null)

function handleToggle(nodeId: string) {
	const newExpanded = new Set(props.expandedNodes)
	const isExpanded = newExpanded.has(nodeId)
	if (isExpanded) {
		newExpanded.delete(nodeId)
	} else {
		newExpanded.add(nodeId)
	}
	emit('update:expandedNodes', newExpanded)
	emit('toggle', nodeId, !isExpanded)
}

function handleSelect(node: GroupTreeNodeData) {
	emit('update:selectedId', node.id)
	emit('select', node)
}

function handleAction(payload: { action: GroupAction; node: GroupTreeNodeData }) {
	emit('action', payload.action, payload.node)
}

function handleDragStart(nodeId: string) {
	draggedNodeId.value = nodeId
}

function handleDragEnd() {
	draggedNodeId.value = null
	dragTargetId.value = null
}

function handleDragOver(nodeId: string) {
	if (nodeId !== draggedNodeId.value) {
		dragTargetId.value = nodeId
	}
}

function handleDrop(targetId: string, position: 'inside' | 'before' | 'after') {
	if (draggedNodeId.value && draggedNodeId.value !== targetId) {
		emit('drop', draggedNodeId.value, targetId, position)
	}
	handleDragEnd()
}
</script>

<style scoped>
.group-tree-view {
	font-size: 0.875rem;
}

.tree-list {
	list-style: none;
	padding: 0;
	margin: 0;
}
</style>
