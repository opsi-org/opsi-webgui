<template>
	<div class="group-tree-node">
		<div :class="[
			'flex items-center gap-1.5 px-2 py-1.5 rounded cursor-pointer transition-colors group/node',
			isSelected ? 'font-heading hover:bg-(--color-surface-hover) border border-(--color-border)' : 'hover:bg-(--color-surface-hover)'
		]" :style="{ paddingLeft: `${indentPx}px` }" @click="handleClick">
			<button v-if="hasChildren" type="button"
				class="w-4 h-4 flex items-center justify-center text-(--color-text-muted) hover:text-(--color-text) transition-transform shrink-0"
				:class="{ 'rotate-90': isExpanded }" @click.stop="$emit('toggle', group.id)">
				<UIcon name="i-heroicons-chevron-right" class="w-3.5 h-3.5" />
			</button>
			<span v-else class="w-4 shrink-0" />
			<UIcon :name="icons.group" class="w-4 h-4 shrink-0"
				:class="group.isSpecial ? 'text-(--color-text-muted)' : ''" />
			<span class="text-sm flex-1 truncate" :class="group.isSpecial ? 'text-(--color-text-muted) italic' : ''">
				{{ group.name }}
			</span>
			<span v-if="group.count > 0" class="text-xs text-(--color-text-muted)">({{ group.count }})</span>
			<div v-if="group.isSpecial && group.name !== 'not_assigned'"
				class="opacity-0 group-hover/node:opacity-100 flex gap-0.5 transition-opacity" @click.stop>
				<UButton :icon="icons.add" size="xs" variant="ghost" color="neutral" :title="$t('addSubgroup')"
					@click="$emit('create-subgroup', group.id)" />
			</div>
			<div v-else-if="!group.isSpecial"
				class="opacity-0 group-hover/node:opacity-100 flex gap-0.5 transition-opacity" @click.stop>
				<UButton :icon="icons.add" size="xs" variant="ghost" color="neutral" :title="$t('addMembers')"
					@click="$emit('add-members', group)" />
				<UButton :icon="icons.group" size="xs" variant="ghost" color="neutral" :title="$t('addSubgroup')"
					@click="$emit('create-subgroup', group.id)" />
				<UButton :icon="icons.edit" size="xs" variant="ghost" color="neutral" :title="$t('edit')"
					@click="$emit('edit', group)" />
				<UButton :icon="icons.delete" size="xs" variant="ghost" color="error" :title="$t('delete')"
					@click="$emit('delete', group)" />
			</div>
		</div>
		<div v-if="hasChildren && isExpanded" class="children">
			<GroupsActionsTreeNode v-for="child in group.children" :key="child.id" :group="child"
				:selected-id="selectedId" :expanded-ids="expandedIds" :group-type="groupType" :is-root-level="false"
				:root-id="rootId" @select="$emit('select', $event)" @toggle="$emit('toggle', $event)"
				@create-subgroup="$emit('create-subgroup', $event)" @edit="$emit('edit', $event)"
				@delete="$emit('delete', $event)" @add-members="$emit('add-members', $event)" />
		</div>
	</div>
</template>

<script setup lang="ts">
import type { GroupTreeNode } from '~/types'

interface Props {
	group: GroupTreeNode
	selectedId?: string | null
	expandedIds: Set<string>
	groupType: 'clients' | 'products'
	isRootLevel?: boolean
	rootId?: string
}

const props = withDefaults(defineProps<Props>(), {
	isRootLevel: false,
	rootId: 'groups'
})

const emit = defineEmits<{
	(e: 'select', group: GroupTreeNode): void
	(e: 'toggle', groupId: string): void
	(e: 'create-subgroup', parentId: string): void
	(e: 'edit', group: GroupTreeNode): void
	(e: 'delete', group: GroupTreeNode): void
	(e: 'add-members', group: GroupTreeNode): void
}>()

const icons = useIcons()
const { t: $t } = useI18n()

const indentPx = computed(() => {
	const level = props.group.level || 0
	return 8 + level * 16
})

const hasChildren = computed(() => Boolean(props.group.children?.length))
const isExpanded = computed(() => props.expandedIds.has(props.group.id))
const isSelected = computed(() => props.selectedId === props.group.id)

function handleClick() {
	emit('select', props.group)
}
</script>

<style scoped>
.group-tree-node {
	user-select: none;
}

.children {
	margin-left: 0;
}
</style>
