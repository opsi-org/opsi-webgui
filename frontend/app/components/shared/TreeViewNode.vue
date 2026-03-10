<!--
This file is part of opsi-webgui application.
opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
Copyright (c) uib GmbH <info@uib.de> 2026
All rights reserved.
License: AGPL-3.0

TreeViewNode - Individual tree node component.
-->
<template>
	<li role="treeitem" :aria-expanded="hasChildren ? isExpanded : undefined" :aria-selected="isSelected"
		:aria-level="level + 1" :tabindex="isFocusable ? 0 : -1" :data-node-id="node.id" class="tree-node"
		@focus="$emit('focus-change', node.id)">

		<div :class="[
			'tree-node-content flex items-center gap-1 py-1.5 px-2 rounded cursor-pointer transition-colors',
			isSelected ? 'bg-opsi-blue/10 text-opsi-blue dark:bg-opsi-blue/20' : 'hover:bg-[var(--color-surface-hover)]',
			isFocusable ? 'ring-offset-1' : ''
		]" :style="{ paddingLeft: `${level * 16 + 8}px` }" @click="handleClick" @dblclick="handleDoubleClick">

			<!-- Expand/Collapse Toggle -->
			<button v-if="hasChildren" type="button"
				class="tree-toggle w-5 h-5 flex items-center justify-center text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-transform shrink-0"
				:class="{ 'rotate-90': isExpanded }" :aria-label="isExpanded ? 'Collapse' : 'Expand'"
				@click.stop="handleToggle" @keydown.enter.stop="handleToggle" @keydown.space.stop="handleToggle">
				<UIcon :name="icons.arrowRight" class="w-4 h-4" />
			</button>
			<span v-else class="w-5 shrink-0" />

			<!-- Node Icon -->
			<slot name="icon" :node="node" :is-expanded="isExpanded">
				<UIcon v-if="showIcons" :name="nodeIcon" class="w-4 h-4 shrink-0"
					:class="isSelected ? 'text-opsi-blue' : 'text-[var(--color-text-muted)]'" />
			</slot>

			<!-- Node Label -->
			<slot name="label" :node="node" :is-expanded="isExpanded">
				<span class="tree-label flex-1 truncate" :title="node.label">
					{{ node.label }}
				</span>
			</slot>

			<!-- Node Value (for editable config trees) -->
			<slot name="value" :node="node" :editable="editable" :on-change="handleValueChange">
				<div v-if="node.value !== undefined && !hasChildren" class="tree-value shrink-0 ml-2">
					<!-- Boolean value -->
					<UToggle v-if="node.valueType === 'boolean'" :model-value="Boolean(node.value)"
						:disabled="!editable || node.readonly" size="sm"
						@update:model-value="(v: boolean) => handleValueChange(v)" />

					<!-- Select value -->
					<USelect v-else-if="node.options?.length" :model-value="String(node.value)"
						:items="node.options.map(o => ({ label: String(o), value: String(o) }))"
						:disabled="!editable || node.readonly" size="xs" class="w-32"
						@update:model-value="handleValueChange" @click.stop />

					<!-- Text value -->
					<span v-else class="text-xs text-[var(--color-text-muted)] font-mono max-w-[150px] truncate">
						{{ formatValue(node.value) }}
					</span>
				</div>
			</slot>

			<!-- Modified indicator -->
			<UBadge v-if="node.modified" color="warning" variant="soft" size="xs" class="shrink-0">
				{{ $t('modified') }}
			</UBadge>

			<!-- Node Actions -->
			<slot name="actions" :node="node">
				<div v-if="node.actions?.length"
					class="tree-actions flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
					<UButton v-for="action in node.actions" :key="action.icon" :icon="action.icon" variant="ghost"
						color="neutral" size="xs" :title="action.label" @click.stop="action.handler?.(node)" />
				</div>
			</slot>
		</div>

		<!-- Children -->
		<Transition name="tree-collapse">
			<ul v-if="hasChildren && isExpanded" role="group" class="tree-children">
				<TreeViewNode v-for="child in node.children" :key="child.id" :node="{ ...child, parentId: node.id }"
					:level="level + 1" :expanded-nodes="expandedNodes" :selected-id="selectedId"
					:focusable-id="focusableId" :editable="editable" :show-icons="showIcons"
					@toggle="$emit('toggle', $event)" @select="$emit('select', $event)"
					@focus-change="$emit('focus-change', $event)" @edit="$emit('edit', $event)"
					@update:value="$emit('update:value', $event)">
					<template #icon="slotData">
						<slot name="icon" v-bind="slotData" />
					</template>
					<template #label="slotData">
						<slot name="label" v-bind="slotData" />
					</template>
					<template #value="slotData">
						<slot name="value" v-bind="slotData" />
					</template>
					<template #actions="slotData">
						<slot name="actions" v-bind="slotData" />
					</template>
				</TreeViewNode>
			</ul>
		</Transition>
	</li>
</template>

<script setup lang="ts">
import type { TreeNode } from '~/types/tree.types'

interface Props {
	node: TreeNode
	level?: number
	expandedNodes?: Set<string>
	selectedId?: string | null
	focusableId?: string | null
	editable?: boolean
	showIcons?: boolean
}

const props = withDefaults(defineProps<Props>(), {
	level: 0,
	expandedNodes: () => new Set(),
	selectedId: null,
	focusableId: null,
	editable: false,
	showIcons: true,
})

const emit = defineEmits<{
	(e: 'toggle', nodeId: string): void
	(e: 'select', node: TreeNode): void
	(e: 'focus-change', nodeId: string): void
	(e: 'edit', node: TreeNode): void
	(e: 'update:value', payload: { id: string; value: unknown }): void
}>()

defineSlots<{
	icon: (props: { node: TreeNode; isExpanded: boolean }) => unknown
	label: (props: { node: TreeNode; isExpanded: boolean }) => unknown
	value: (props: { node: TreeNode; editable: boolean; onChange: (v: unknown) => void }) => unknown
	actions: (props: { node: TreeNode }) => unknown
}>()

const icons = useIcons()
const { t: $t } = useI18n()

const hasChildren = computed(() => Boolean(props.node.children?.length))
const isExpanded = computed(() => props.expandedNodes.has(props.node.id))
const isSelected = computed(() => props.selectedId === props.node.id)
const isFocusable = computed(() => props.focusableId === props.node.id)

const nodeIcon = computed(() => {
	if (props.node.icon) return props.node.icon
	if (hasChildren.value) {
		return isExpanded.value ? icons.folderOpen : icons.folder
	}
	return icons.file
})

function formatValue(value: unknown): string {
	if (value === null || value === undefined) return '-'
	if (Array.isArray(value)) return value.join(', ')
	if (typeof value === 'boolean') return value ? 'true' : 'false'
	return String(value)
}

function handleClick() {
	emit('select', props.node)
}

function handleDoubleClick() {
	if (hasChildren.value) {
		handleToggle()
	} else if (props.editable && !props.node.readonly) {
		emit('edit', props.node)
	}
}

function handleToggle() {
	emit('toggle', props.node.id)
}

function handleValueChange(value: unknown) {
	emit('update:value', { id: props.node.id, value })
}
</script>

<style scoped>
.tree-node {
	outline: none;
}

.tree-node:focus-visible>.tree-node-content {
	outline: 2px solid var(--color-focus-ring);
	outline-offset: -2px;
}

.tree-node-content {
	min-height: 32px;
}

.tree-node-content:hover .tree-actions {
	opacity: 1;
}

.tree-toggle {
	transition: transform 0.15s ease;
}

.tree-collapse-enter-active,
.tree-collapse-leave-active {
	transition: all 0.2s ease;
	overflow: hidden;
}

.tree-collapse-enter-from,
.tree-collapse-leave-to {
	opacity: 0;
	max-height: 0;
}

.tree-collapse-enter-to,
.tree-collapse-leave-from {
	opacity: 1;
	max-height: 1000px;
}
</style>
