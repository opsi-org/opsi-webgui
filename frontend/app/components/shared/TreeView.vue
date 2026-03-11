<!--
This file is part of opsi-webgui application.
opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
Copyright (c) uib GmbH <info@uib.de> 2026
All rights reserved.
License: AGPL-3.0

TreeView - tree view component.
-->
<template>
	<div class="tree-view" role="tree" :aria-label="ariaLabel" @keydown="handleKeydown">
		<ul class="tree-list" role="group">
			<TreeViewNode v-for="node in nodes" :key="node.id" :node="node" :level="0" :expanded-nodes="expandedNodes"
				:selected-id="selectedId" :focusable-id="focusableId" :editable="editable" :show-icons="showIcons"
				@toggle="handleToggle" @select="handleSelect" @focus-change="handleFocusChange" @edit="handleEdit"
				@update:value="handleValueUpdate">
				<template #icon="slotProps">
					<slot name="icon" v-bind="slotProps" />
				</template>
				<template #label="slotProps">
					<slot name="label" v-bind="slotProps" />
				</template>
				<template #value="slotProps">
					<slot name="value" v-bind="slotProps" />
				</template>
				<template #actions="slotProps">
					<slot name="actions" v-bind="slotProps" />
				</template>
			</TreeViewNode>
		</ul>

		<!-- Empty state -->
		<div v-if="nodes.length === 0" class="tree-empty py-6 text-center">
			<UIcon :name="icons.folder" class="w-10 h-10 mx-auto mb-2 opacity-40" />
			<p class="text-sm text-(--color-text-muted)">{{ $t('noItemsFound') }}</p>
		</div>
	</div>
</template>

<script setup lang="ts">
import type { TreeNode } from '~/types/tree.types'

interface Props {
	nodes: TreeNode[]
	expandedNodes?: Set<string>
	selectedId?: string | null
	ariaLabel?: string
	editable?: boolean
	showIcons?: boolean
	emptyIcon?: string
	emptyText?: string
}

const props = withDefaults(defineProps<Props>(), {
	expandedNodes: () => new Set(),
	selectedId: null,
	ariaLabel: 'Tree view',
	editable: false,
	showIcons: true,
})

const emit = defineEmits<{
	(e: 'update:expandedNodes', nodes: Set<string>): void
	(e: 'update:selectedId', id: string | null): void
	(e: 'toggle', nodeId: string, expanded: boolean): void
	(e: 'select', node: TreeNode): void
	(e: 'edit', node: TreeNode): void
	(e: 'update:value', nodeId: string, value: unknown): void
}>()

const icons = useIcons()
const { t: $t } = useI18n()

const focusableId = ref<string | null>(props.nodes[0]?.id || null)

const flatVisibleNodes = computed<TreeNode[]>(() => {
	const result: TreeNode[] = []
	const traverse = (nodes: TreeNode[]) => {
		for (const node of nodes) {
			result.push(node)
			if (node.children?.length && props.expandedNodes.has(node.id)) {
				traverse(node.children)
			}
		}
	}
	traverse(props.nodes)
	return result
})

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

function handleSelect(node: TreeNode) {
	emit('update:selectedId', node.id)
	emit('select', node)
}

function handleFocusChange(nodeId: string) {
	focusableId.value = nodeId
}

function handleEdit(node: TreeNode) {
	emit('edit', node)
}

function handleValueUpdate(nodeId: string, value: unknown) {
	emit('update:value', nodeId, value)
}

function handleKeydown(event: KeyboardEvent) {
	const nodes = flatVisibleNodes.value
	const currentIndex = nodes.findIndex(n => n.id === focusableId.value)
	if (currentIndex === -1 || nodes.length === 0) return

	const currentNode = nodes[currentIndex]!

	switch (event.key) {
		case 'ArrowDown': {
			event.preventDefault()
			const nextNode = nodes[currentIndex + 1]
			if (nextNode) focusableId.value = nextNode.id
			break
		}

		case 'ArrowUp': {
			event.preventDefault()
			const prevNode = nodes[currentIndex - 1]
			if (prevNode) focusableId.value = prevNode.id
			break
		}

		case 'ArrowRight': {
			event.preventDefault()
			if (currentNode.children?.length) {
				if (!props.expandedNodes.has(currentNode.id)) {
					handleToggle(currentNode.id)
				} else {
					const childNode = nodes[currentIndex + 1]
					if (childNode) focusableId.value = childNode.id
				}
			}
			break
		}

		case 'ArrowLeft':
			event.preventDefault()
			if (currentNode.children?.length && props.expandedNodes.has(currentNode.id)) {
				handleToggle(currentNode.id)
			} else if (currentNode.parentId) {
				focusableId.value = currentNode.parentId
			}
			break

		case 'Enter':
		case ' ':
			event.preventDefault()
			handleSelect(currentNode)
			break

		case 'Home': {
			event.preventDefault()
			const firstNode = nodes[0]
			if (firstNode) focusableId.value = firstNode.id
			break
		}

		case 'End': {
			event.preventDefault()
			const lastNode = nodes[nodes.length - 1]
			if (lastNode) focusableId.value = lastNode.id
			break
		}
	}
}
</script>

<style scoped>
.tree-view {
	font-size: 0.875rem;
}

.tree-list {
	list-style: none;
	padding: 0;
	margin: 0;
}
</style>
