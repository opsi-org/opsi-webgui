<!--
This file is part of opsi-webgui application.
opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
Copyright (c) uib GmbH <info@uib.de> 2026
All rights reserved.
License: AGPL-3.0

GroupTreeNode - Individual tree node with actions and drag-and-drop support.
-->
<template>
	<li role="treeitem" :aria-expanded="hasChildren ? isExpanded : undefined" :aria-selected="isSelected"
		:aria-level="level + 1" :data-node-id="node.id" class="tree-node" :draggable="canDrag" @dragstart="onDragStart"
		@dragend="onDragEnd" @dragover.prevent="onDragOver" @dragleave="onDragLeave" @drop.prevent="onDrop">
		<!-- Node content -->
		<div :class="[
			'tree-node-content group flex items-center gap-1 py-1.5 px-2 rounded cursor-pointer transition-all duration-150',
			isSelected
				? 'bg-opsi-blue/10 text-opsi-blue dark:bg-opsi-blue/20'
				: 'hover:bg-(--color-surface-hover)]',
			isDragOver ? 'ring-2 ring-opsi-blue ring-offset-1 bg-opsi-blue/5' : '',
			node.isSpecial ? 'opacity-60' : '',
		]" :style="{ paddingLeft: `${level * 16 + 8}px` }" @click="handleClick">
			<!-- Drag Handle -->
			<div v-if="canDrag"
				class="drag-handle w-4 h-4 flex items-center justify-center cursor-grab opacity-0 group-hover:opacity-50 hover:opacity-100 transition-opacity shrink-0"
				@mousedown.stop>
				<UIcon :name="icons.drag" class="w-3 h-3" />
			</div>

			<!-- Expand/Collapse Toggle -->
			<button v-if="hasChildren" type="button"
				class="tree-toggle w-5 h-5 flex items-center justify-center text-(--color-text-muted)] hover:text-(--color-text)] transition-transform shrink-0"
				:class="{ 'rotate-90': isExpanded }" :aria-label="isExpanded ? 'Collapse' : 'Expand'"
				@click.stop="handleToggle">
				<UIcon :name="icons.arrowRight" class="w-4 h-4" />
			</button>
			<span v-else class="w-5 shrink-0" />

			<!-- Node Icon -->
			<UIcon :name="nodeIcon" class="w-4 h-4 shrink-0"
				:class="isSelected ? 'text-opsi-blue' : 'text-(--color-text-muted)]'" aria-hidden="true" />

			<!-- Node Label -->
			<span class="tree-label flex-1 truncate font-medium" :title="node.label">
				{{ node.label }}
			</span>

			<!-- Member count badge -->
			<UBadge v-if="node.memberCount !== undefined" :color="node.memberCount > 0 ? 'neutral' : 'neutral'"
				variant="soft" size="xs" class="shrink-0">
				{{ node.memberCount }}
			</UBadge>

			<!-- Node Actions (visible on hover) -->
			<div class="tree-actions flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
				@click.stop>
				<!-- Add subgroup -->
				<UButton v-if="canAddSubgroup" :icon="icons.add" variant="ghost" color="neutral" size="xs"
					:title="$t('group-add')" @click="emitAction('addSubgroup')" />

				<!-- Edit group -->
				<UButton v-if="canEdit" :icon="icons.edit" variant="ghost" color="neutral" size="xs" :title="$t('edit')"
					@click="emitAction('edit')" />

				<!-- Manage members -->
				<UButton v-if="canManageMembers" :icon="groupType === 'clients' ? icons.client : icons.product"
					variant="ghost" color="neutral" size="xs"
					:title="groupType === 'clients' ? $t('client-add') : $t('product-add')"
					@click="emitAction('manageMembers')" />

				<!-- Remove all members -->
				<UButton v-if="canRemoveAllMembers && node.memberCount && node.memberCount > 0" :icon="icons.userMinus"
					variant="ghost" color="warning" size="xs"
					:title="groupType === 'clients' ? $t('client-delete') : $t('product-delete')"
					@click="emitAction('removeAllMembers')" />

				<!-- Copy members (client groups only) -->
				<UButton v-if="groupType === 'clients' && canCopy && node.memberCount && node.memberCount > 0"
					:icon="icons.copy" variant="ghost" color="neutral" size="xs" :title="$t('copy')"
					@click="emitAction('copy')" />

				<!-- Delete group -->
				<UButton v-if="canDelete" :icon="icons.delete" variant="ghost" color="error" size="xs"
					:title="$t('delete')" @click="emitAction('delete')" />
			</div>
		</div>

		<!-- Children -->
		<Transition name="tree-collapse">
			<ul v-if="hasChildren && isExpanded" role="group" class="tree-children">
				<GroupTreeNode v-for="child in node.children" :key="child.id" :node="child" :level="level + 1"
					:expanded-nodes="expandedNodes" :selected-id="selectedId" :group-type="groupType"
					:draggable="draggable" :drag-target-id="dragTargetId" @toggle="$emit('toggle', $event)"
					@select="$emit('select', $event)" @action="(payload) => $emit('action', payload)"
					@drag-start="$emit('drag-start', $event)" @drag-end="$emit('drag-end')"
					@drag-over="$emit('drag-over', $event)" @drop="(payload) => $emit('drop', payload)" />
			</ul>
		</Transition>
	</li>
</template>

<script setup lang="ts">
import type { GroupTreeNodeData, GroupAction } from '~/types/groups.types'

interface Props {
	node: GroupTreeNodeData
	level?: number
	expandedNodes: Set<string>
	selectedId: string | null
	groupType: 'clients' | 'products'
	draggable?: boolean
	dragTargetId?: string | null
}

const props = withDefaults(defineProps<Props>(), {
	level: 0,
	draggable: true,
	dragTargetId: null,
})

const emit = defineEmits<{
	(e: 'toggle', nodeId: string): void
	(e: 'select', node: GroupTreeNodeData): void
	(e: 'action', payload: { action: GroupAction; node: GroupTreeNodeData }): void
	(e: 'drag-start', nodeId: string): void
	(e: 'drag-end'): void
	(e: 'drag-over', nodeId: string): void
	(e: 'drop', payload: { targetId: string; position: 'inside' | 'before' | 'after' }): void
}>()

const icons = useIcons()
const { t: $t } = useI18n()

// Computed
const hasChildren = computed(() => Boolean(props.node.children?.length))
const isExpanded = computed(() => props.expandedNodes.has(props.node.id))
const isSelected = computed(() => props.selectedId === props.node.id)
const isDragOver = computed(() => props.dragTargetId === props.node.id)

const nodeIcon = computed(() => {
	if (props.node.isSpecial) return icons.lock
	if (hasChildren.value) {
		return isExpanded.value ? icons.folderOpen : icons.folder
	}
	return icons.group
})

// Permission checks
const canDrag = computed(() => props.draggable && !props.node.isSpecial && !props.node.isRoot)
const canAddSubgroup = computed(() => !props.node.isSpecial && props.node.type !== 'ObjectToGroup')
const canEdit = computed(() => !props.node.isSpecial && !props.node.isRoot && props.node.type !== 'ObjectToGroup')
const canManageMembers = computed(() => !props.node.isSpecial && props.node.type !== 'ObjectToGroup')
const canRemoveAllMembers = computed(() => !props.node.isSpecial && props.node.type !== 'ObjectToGroup')
const canCopy = computed(() => !props.node.isSpecial && props.node.type !== 'ObjectToGroup')
const canDelete = computed(() => !props.node.isSpecial && !props.node.isRoot && props.node.type !== 'ObjectToGroup')

// Event handlers
function handleClick() {
	emit('select', props.node)
	// Auto-expand on click
	if (hasChildren.value && !isExpanded.value) {
		emit('toggle', props.node.id)
	}
}

function handleToggle() {
	emit('toggle', props.node.id)
}

function emitAction(action: GroupAction) {
	emit('action', { action, node: props.node })
}

// Drag and drop handlers
function onDragStart(e: DragEvent) {
	if (!canDrag.value) {
		e.preventDefault()
		return
	}
	e.dataTransfer?.setData('text/plain', props.node.id)
	emit('drag-start', props.node.id)
}

function onDragEnd() {
	emit('drag-end')
}

function onDragOver() {
	if (!props.node.isSpecial) {
		emit('drag-over', props.node.id)
	}
}

function onDragLeave() {
	// Clear drag target if leaving this node
}

function onDrop(e: DragEvent) {
	e.stopPropagation()
	if (props.node.isSpecial) return
	emit('drop', { targetId: props.node.id, position: 'inside' })
}
</script>

<style scoped>
.tree-node {
	outline: none;
}

.tree-node-content {
	min-height: 36px;
}

.tree-collapse-enter-active,
.tree-collapse-leave-active {
	transition: all 0.2s ease;
	overflow: hidden;
}

.tree-collapse-enter-from,
.tree-collapse-leave-to {
	opacity: 0;
	transform: translateY(-8px);
}

.drag-handle {
	cursor: grab;
}

.drag-handle:active {
	cursor: grabbing;
}
</style>
