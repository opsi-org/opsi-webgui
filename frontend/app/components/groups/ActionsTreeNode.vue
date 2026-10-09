<!--
  This file is part of the OPSI-WebGUI application.
  OPSI-WebGUI is the web-based management interface for OPSI.
  https://opsi.org/en/

  Copyright (c) UIB GmbH info@uib.de 2026
  All rights reserved.
  License: AGPL-3.0

  GroupsActionsTreeNode - Recursive tree node for group hierarchy with context actions.
-->
<template>
  <div class="group-tree-node" :class="{ 'group-tree-node-root': isRootLevel }">
    <!-- eslint-disable-next-line vuejs-accessibility/no-static-element-interactions -- draggable tree row -->
    <div
      :class="[
        'flex items-center gap-1 px-1.5 py-1 rounded transition-colors group/node',
        isSelected ? 'bg-primary/8 border border-primary/25 shadow-sm' : 'hover:bg-(--color-surface-hover)',
        isDragging ? 'opacity-50' : '',
        isDropTarget ? 'ring-1 ring-primary bg-primary/8' : '',
        isMemberDropTarget ? 'ring-1 ring-(--color-success) bg-success/10' : '',
        isMemberSourceGroup ? 'opacity-50 cursor-not-allowed [&_button]:cursor-not-allowed' : '',
      ]"
      :style="{ paddingLeft: `${indentPx}px` }"
      :draggable="canDrag"
      @dragstart="handleDragStart"
      @dragover.stop="handleDragOver"
      @dragleave="isDropTarget = false"
      @drop.stop="handleDrop"
      @dragend="handleDragEnd"
    >
      <!-- Tree connector lines -->
      <span v-for="i in treeDepth" :key="i" class="tree-guide-line" :style="{ left: `${8 + (i - 1) * 16}px` }" />
      <CoreAppButton
        v-if="hasChildren"
        variant="ghost"
        color="neutral"
        size="xs"
        class="w-5! h-5! p-0! shrink-0 flex items-center justify-center"
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
      <CoreAppButton
        type="button"
        variant="ghost"
        color="neutral"
        class="flex! items-center! gap-1! flex-1! min-w-0! text-left! bg-transparent! border-0! p-0! cursor-pointer!"
        @click="handleClick"
      >
        <CoreAppIcon
          :name="group.isSpecial ? icons.group : hasChildren ? icons.group : icons.group"
          class="w-3.5 h-3.5 shrink-0 transition-colors"
          :class="isSelected ? 'text-(--color-primary)' : group.isSpecial ? 'text-(--color-text-muted)' : 'text-(--color-text)'"
        />
        <CoreAppTooltip v-if="group.label === 'not_assigned'" :text="$t('clients.directoryNotAssigned')">
          <span
            class="text-xs flex-1 truncate transition-colors cursor-help"
            :class="[isSelected ? 'font-medium text-(--color-text)' : '', group.isSpecial ? 'text-(--color-text-muted) italic' : '']"
          >
            {{ group.label }}
          </span>
        </CoreAppTooltip>
        <span
          v-else
          class="text-xs flex-1 truncate transition-colors"
          :class="[isSelected ? 'font-medium text-(--color-text)' : '', group.isSpecial ? 'text-(--color-text-muted) italic' : '']"
        >
          {{ group.label }}
        </span>
      </CoreAppButton>
      <div v-if="group.isSpecial && group.label !== 'not_assigned'" class="flex gap-1" @click.stop>
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
          <CoreAppIcon :name="icons.group" class="w-3.5 h-3.5" />
        </CoreAppButton>
      </div>
      <div v-else-if="!group.isSpecial" class="flex gap-1" @click.stop>
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
          <CoreAppIcon :name="icons.group" class="w-3.5 h-3.5" />
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
          :dragged-group-id="draggedGroupId"
          :invalid-drop-target-ids="invalidDropTargetIds"
          :dragged-member-group-type="draggedMemberGroupType"
          :dragged-member-source-group-id="draggedMemberSourceGroupId"
          :member-drop-target-id="memberDropTargetId"
          :is-root-level="false"
          :root-id="rootId"
          @select="$emit('select', $event)"
          @toggle="$emit('toggle', $event)"
          @create-subgroup="$emit('create-subgroup', $event)"
          @edit="$emit('edit', $event)"
          @delete="$emit('delete', $event)"
          @add-members="$emit('add-members', $event)"
          @move-group="$emit('move-group', $event)"
          @drag-group-start="$emit('drag-group-start', $event)"
          @drag-group-end="$emit('drag-group-end')"
          @add-members-drop="$emit('add-members-drop', $event)"
          @member-drop-target="$emit('member-drop-target', $event)"
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
          {{ $t('common.showMore') }} ({{ (group.children?.length || 0) - childrenLimit }} {{ $t('common.remaining') }})
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
    draggedGroupId?: string | null
    invalidDropTargetIds?: Set<string>
    draggedMemberGroupType?: 'clients' | 'products' | null
    draggedMemberSourceGroupId?: string | null
    memberDropTargetId?: string | null
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
    (e: 'move-group', data: { groupId: string; parentId: string }): void
    (e: 'drag-group-start', groupId: string): void
    (e: 'drag-group-end'): void
    (e: 'add-members-drop', group: GroupTreeNodeData): void
    (e: 'member-drop-target', groupId: string | null): void
  }>()

  const icons = useIcons()
  const { t: $t } = useI18n()
  const { isReadOnly } = useUserPermissions()

  const groupDisabled = computed(() => isReadOnly.value)
  const canDrag = computed(() => !props.group.isSpecial && !groupDisabled.value)
  const canDrop = computed(() => props.group.label !== 'not_assigned' && !groupDisabled.value)
  const isMemberSourceGroup = computed(() => props.draggedMemberSourceGroupId === props.group.id)
  const canAcceptMembers = computed(
    () =>
      Boolean(props.draggedMemberGroupType) &&
      props.draggedMemberGroupType === props.groupType &&
      !isMemberSourceGroup.value &&
      !props.group.isSpecial &&
      !groupDisabled.value,
  )
  const isInvalidDropTarget = computed(() => props.invalidDropTargetIds?.has(props.group.id) ?? false)
  const isDragging = ref(false)
  const isDropTarget = ref(false)
  const isMemberDropTarget = computed(() => props.memberDropTargetId === props.group.id)

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

  function handleDragStart(event: DragEvent) {
    if (!canDrag.value || !event.dataTransfer) return
    event.dataTransfer.effectAllowed = 'move'
    event.dataTransfer.setData('text/group-id', props.group.id)
    isDragging.value = true
    emit('drag-group-start', props.group.id)
  }

  function handleDragOver(event: DragEvent) {
    if (props.draggedMemberGroupType) {
      if (!canAcceptMembers.value || !event.dataTransfer) {
        if (event.dataTransfer) event.dataTransfer.dropEffect = 'none'
        emit('member-drop-target', null)
        return
      }
      event.preventDefault()
      event.dataTransfer.dropEffect = 'copy'
      emit('member-drop-target', props.group.id)
      return
    }
    if (!canDrop.value || isInvalidDropTarget.value || !event.dataTransfer) {
      if (event.dataTransfer) event.dataTransfer.dropEffect = 'none'
      isDropTarget.value = false
      return
    }
    event.preventDefault()
    event.dataTransfer.dropEffect = 'move'
    isDropTarget.value = true
  }

  function handleDrop(event: DragEvent) {
    isDropTarget.value = false
    emit('member-drop-target', null)
    if (props.draggedMemberGroupType) {
      if (canAcceptMembers.value) emit('add-members-drop', props.group)
      return
    }
    const groupId = event.dataTransfer?.getData('text/group-id')
    if (!canDrop.value || isInvalidDropTarget.value || !groupId || groupId === props.group.id) return
    emit('move-group', { groupId, parentId: props.group.id })
  }

  function handleDragEnd() {
    isDragging.value = false
    isDropTarget.value = false
    emit('member-drop-target', null)
    emit('drag-group-end')
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
