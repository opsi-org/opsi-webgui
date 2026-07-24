<!--
  This file is part of opsi-webgui application.
  opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
  Copyright (c) uib GmbH <info@uib.de> 2026
  All rights reserved.
  License: AGPL-3.0

  GroupsActionsTreeNode - Recursive tree node for group hierarchy with context actions.
-->
<template>
  <div class="group-tree-node" :class="{ 'group-tree-node-root': isRootLevel }">
    <div
      :class="[
        'flex items-center gap-1 px-1.5 py-1 rounded transition-colors group/node',
        isSelected
          ? 'bg-primary/8 border border-primary/25 shadow-sm'
          : 'hover:bg-(--color-surface-hover)',
      ]"
      :style="{ paddingLeft: `${indentPx}px` }"
    >
      <!-- Tree connector lines -->
      <span
        v-for="i in treeDepth"
        :key="i"
        class="tree-guide-line"
        :style="{ left: `${8 + (i - 1) * 16}px` }"
      />
      <CoreAppButton
        v-if="hasChildren"
        variant="ghost"
        color="neutral"
        size="xs"
        class="w-5! h-5! p-0! shrink-0"
        :aria-label="String(isExpanded ? $t('common.collapse') : $t('common.expand'))"
        :class="
          isExpanded
            ? 'text-(--color-primary) bg-primary/10'
            : 'text-(--color-text-muted) hover:text-(--color-text) hover:bg-(--color-surface-hover)'
        "
        @click.stop="$emit('toggle', group.id)"
      >
        <CoreAppIcon
          :name="icons.chevronRight"
          class="w-3.5 h-3.5 transition-transform duration-200"
          :class="{ 'rotate-90': isExpanded }"
        />
      </CoreAppButton>
      <span v-else class="w-5 flex items-center justify-center shrink-0">
        <span class="w-1.5 h-1.5 rounded-full bg-(--color-text-muted)/40" />
      </span>
      <button
        type="button"
        class="flex items-center gap-1 flex-1 min-w-0 text-left bg-transparent border-0 p-0 cursor-pointer"
        @click="handleClick"
      >
        <CoreAppIcon
          :name="group.isSpecial ? icons.group : hasChildren ? icons.group : icons.group"
          class="w-3.5 h-3.5 shrink-0 transition-colors"
          :class="
            isSelected
              ? 'text-(--color-primary)'
              : group.isSpecial
                ? 'text-(--color-text-muted)'
                : 'text-(--color-text)'
          "
        />
        <CoreAppTooltip
          v-if="group.label === 'not_assigned'"
          :text="$t('clients.directoryNotAssigned')"
        >
          <span
            class="text-xs flex-1 truncate transition-colors cursor-help"
            :class="[
              isSelected ? 'font-medium text-(--color-text)' : '',
              group.isSpecial ? 'text-(--color-text-muted) italic' : '',
            ]"
          >
            {{ group.label }}
          </span>
        </CoreAppTooltip>
        <span
          v-else
          class="text-xs flex-1 truncate transition-colors"
          :class="[
            isSelected ? 'font-medium text-(--color-text)' : '',
            group.isSpecial ? 'text-(--color-text-muted) italic' : '',
          ]"
        >
          {{ group.label }}
        </span>
        <span
          v-if="(group.members?.length || 0) > 0"
          class="text-xs tabular-nums px-1 py-0 rounded-full bg-(--color-surface-hover) text-(--color-text)"
        >
          {{ (group.members || []).length }}
        </span>
      </button>
      <div
        v-if="group.isSpecial && group.label !== 'not_assigned'"
        class="opacity-0 group-hover/node:opacity-100 flex gap-1 transition-opacity"
        @click.stop
      >
        <CoreAppButton
          size="xs"
          variant="ghost"
          color="neutral"
          class="h-5! min-h-5! px-1!"
          :title="$t('groups.subgroup')"
          :aria-label="String($t('groups.subgroup'))"
          :disabled="groupDisabled"
          @click="$emit('create-subgroup', group.id)"
        >
          <CoreAppStackedIcons
            :primary-icon="icons.group"
            :secondary-icon="icons.addBold"
            size="xs"
            badge
            badge-color="none"
          />
        </CoreAppButton>
      </div>
      <div
        v-else-if="!group.isSpecial"
        class="opacity-0 group-hover/node:opacity-100 flex gap-1 transition-opacity"
        @click.stop
      >
        <CoreAppButton
          :icon="icons.add"
          size="xs"
          variant="ghost"
          color="neutral"
          class="h-5! min-h-5! px-1!"
          :title="$t('groups.membersAdd')"
          :aria-label="String($t('groups.membersAdd'))"
          :disabled="groupDisabled"
          @click="$emit('add-members', group)"
        />
        <CoreAppButton
          size="xs"
          variant="ghost"
          color="neutral"
          class="h-5! min-h-5! px-1!"
          :title="$t('groups.subgroup')"
          :aria-label="String($t('groups.subgroup'))"
          :disabled="groupDisabled"
          @click="$emit('create-subgroup', group.id)"
        >
          <CoreAppStackedIcons
            :primary-icon="icons.group"
            :secondary-icon="icons.addBold"
            size="xs"
            badge
            badge-color="none"
          />
        </CoreAppButton>
        <CoreAppButton
          :icon="icons.pencil"
          size="xs"
          variant="ghost"
          color="neutral"
          class="h-5! min-h-5! px-1!"
          :title="$t('common.edit')"
          :aria-label="String($t('common.edit'))"
          :disabled="groupDisabled"
          @click="$emit('edit', group)"
        />
        <CoreAppButton
          :icon="icons.delete"
          size="xs"
          variant="ghost"
          color="neutral"
          class="h-5! min-h-5! px-1!"
          :title="$t('common.delete')"
          :aria-label="String($t('common.delete'))"
          :disabled="groupDisabled"
          @click="$emit('delete', group)"
        />
      </div>
    </div>
    <Transition name="tree-expand">
      <div v-if="hasChildren && isExpanded" class="children-container">
        <GroupsActionsTreeNode
          v-for="child in visibleChildren"
          :key="child.id"
          :group="child"
          :selected-id="selectedId"
          :expanded-ids="expandedIds"
          :group-type="groupType"
          :is-root-level="false"
          :root-id="rootId"
          @select="$emit('select', $event)"
          @toggle="$emit('toggle', $event)"
          @create-subgroup="$emit('create-subgroup', $event)"
          @edit="$emit('edit', $event)"
          @delete="$emit('delete', $event)"
          @add-members="$emit('add-members', $event)"
        />
        <CoreAppButton
          v-if="hasMoreChildren"
          variant="ghost"
          color="primary"
          size="xs"
          block
          class="py-1.5!"
          :style="{ paddingLeft: `${(props.group.level || 0) * 16 + 24}px` }"
          @click="childrenLimit += CHILDREN_PAGE_SIZE"
        >
          {{ $t('common.showMore') }} ({{ (group.children?.length || 0) - childrenLimit }}
          {{ $t('common.remaining') }})
        </CoreAppButton>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
  import type { GroupTreeNodeData } from '~/types'

  interface Props {
    group: GroupTreeNodeData
    selectedId?: string | null
    expandedIds: Set<string>
    groupType: 'clients' | 'products'
    isRootLevel?: boolean
    rootId?: string
  }

  const props = withDefaults(defineProps<Props>(), {
    isRootLevel: false,
    rootId: 'groups',
  })

  const emit = defineEmits<{
    (e: 'select', group: GroupTreeNodeData): void
    (e: 'toggle', groupId: string): void
    (e: 'create-subgroup', parentId: string): void
    (e: 'edit', group: GroupTreeNodeData): void
    (e: 'delete', group: GroupTreeNodeData): void
    (e: 'add-members', group: GroupTreeNodeData): void
  }>()

  const icons = useIcons()
  const { t: $t } = useI18n()
  const { isReadOnly } = useUserPermissions()

  const groupDisabled = computed(() => isReadOnly.value)

  const CHILDREN_PAGE_SIZE = 100
  const childrenLimit = ref(CHILDREN_PAGE_SIZE)

  const hasChildren = computed(() => Boolean(props.group.children?.length))
  const isExpanded = computed(() => props.expandedIds.has(props.group.id))
  const isSelected = computed(() => props.selectedId === props.group.id)

  // Reset limit when node is collapsed and re-expanded
  watch(isExpanded, (expanded) => {
    if (expanded) childrenLimit.value = CHILDREN_PAGE_SIZE
  })

  const visibleChildren = computed(() => {
    const children = props.group.children || []
    if (children.length <= CHILDREN_PAGE_SIZE) return children
    return children.slice(0, childrenLimit.value)
  })

  const hasMoreChildren = computed(() => {
    const children = props.group.children || []
    return children.length > childrenLimit.value
  })

  const indentPx = computed(() => {
    const level = props.group.level || 0
    return 8 + level * 16
  })

  const treeDepth = computed(() => {
    const level = props.group.level || 0
    return level > 0 ? level : 0
  })

  function handleClick() {
    emit('select', props.group)
  }
</script>

<style scoped>
  .group-tree-node {
    user-select: none;
    position: relative;
  }

  .children-container {
    margin-left: 0;
    position: relative;
  }

  /* Tree connector guide lines */
  .tree-guide-line {
    position: absolute;
    top: 0;
    bottom: 0;
    width: 1px;
    background-color: var(--color-border);
    opacity: 0.4;
    pointer-events: none;
  }

  /* Expand/collapse animation */
  .tree-expand-enter-active {
    transition: all 0.2s ease-out;
    overflow: hidden;
  }

  .tree-expand-leave-active {
    transition: all 0.15s ease-in;
    overflow: hidden;
  }

  .tree-expand-enter-from,
  .tree-expand-leave-to {
    opacity: 0;
    max-height: 0;
  }

  .tree-expand-enter-to,
  .tree-expand-leave-from {
    opacity: 1;
    max-height: 2000px;
  }
</style>
