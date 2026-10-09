<!--
  This file is part of the OPSI-WebGUI application.
  OPSI-WebGUI is the web-based management interface for OPSI.
  https://opsi.org/en/

  Copyright (c) UIB GmbH info@uib.de 2026
  All rights reserved.
  License: AGPL-3.0

  GroupsMainView - Client and product group management with tree view, member editing, and CRUD actions.
-->
<template>
  <LayoutsPageLayout
    class="opsi-compact-page groups-dense"
    :loading="loading"
    :showFilter="false"
    show-refresh
    @refresh="fetchCurrentGroups"
  >
    <template #tabs>
      <div class="flex items-center gap-2">
        <CoreAppTabsNav v-model="activeGroupType" :tabs="groupTypes" />
        <Transition name="fade">
          <div
            v-if="statusMessage"
            :class="[
              'flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm border',
              statusMessage.type === 'success'
                ? 'bg-success/10 border-success/35 text-(--color-text)'
                : 'bg-error/10 border-error/35 text-(--color-text)',
            ]"
            :role="statusMessage.type === 'error' ? 'alert' : 'status'"
            :aria-live="statusMessage.type === 'error' ? 'assertive' : 'polite'"
            aria-atomic="true"
          >
            <CoreAppIcon
              :name="statusMessage.type === 'success' ? icons.checkCircle : icons.xCircle"
              :class="['w-4 h-4 shrink-0', statusMessage.type === 'success' ? 'text-(--color-success)' : 'text-(--color-error)']"
            />
            <span>{{ statusMessage.text }}</span>
            <CoreAppButton
              variant="ghost"
              color="neutral"
              size="xs"
              class="ml-1 opacity-60 hover:opacity-100"
              :aria-label="String($t('common.close'))"
              @click="statusMessage = null"
            >
              <CoreAppIcon :name="icons.x" class="w-3.5 h-3.5" />
            </CoreAppButton>
          </div>
        </Transition>
      </div>
    </template>

    <div ref="containerRef" class="groups-dense flex h-full min-h-0 relative" style="min-height: 400px">
      <div
        :style="{ width: isMobile ? '100%' : `${sidebarWidthPercent}%` }"
        class="shrink-0 border-r border-(--color-border) bg-(--color-background) flex flex-col transition-[width] duration-100"
        :class="{
          'absolute inset-0 z-20': isMobile,
          hidden: isMobile && !showSidebar,
        }"
      >
        <div class="p-2 border-b border-(--color-border) space-y-1">
          <div class="flex items-center justify-between">
            <span class="text-sm font-medium text-(--color-text)">{{
              activeGroupType === 'clients' ? $t('groups.client') : $t('groups.product')
            }}</span>
            <CoreAppTooltip
              v-if="
                (activeGroupType === 'clients' && isHostGroupAccessRestricted) ||
                (activeGroupType === 'products' && isProductGroupAccessRestricted)
              "
              :text="
                activeGroupType === 'clients'
                  ? $t('opsiConfig.serverFeatures.hostGroupAccess.disabled')
                  : $t('opsiConfig.serverFeatures.productGroupAccess.disabled')
              "
            >
              <CoreAppBadge color="warning" variant="subtle" size="xs" class="cursor-help">
                {{ $t('auth.restricted') }}
              </CoreAppBadge>
            </CoreAppTooltip>
          </div>
          <CoreAppFilterInput v-model="searchQuery" size="xs" input-class="w-full" />
        </div>
        <div v-if="loading" class="py-4 text-center">
          <CoreAppLoadingSpinner size="sm" />
        </div>
        <div v-else class="flex-1 overflow-auto p-1 space-y-0.5">
          <template v-for="rootGroup in filteredTreeGroups" :key="rootGroup.id">
            <div
              class="flex items-center justify-between font-heading text-xs text-(--color-text) px-1 py-1 mt-1.5 first:mt-0.5 select-none"
            >
              <CoreAppButton
                type="button"
                variant="ghost"
                color="neutral"
                class="flex! items-center! gap-1! flex-1! min-w-0! text-left! bg-transparent! border-0! p-0! cursor-pointer!"
                @click="toggleCollapsedSection(rootGroup.id)"
                @dragover="handleRootDragOver(rootGroup.id, $event)"
                @drop.prevent="handleRootGroupDrop(rootGroup.id, $event)"
              >
                <CoreAppIcon
                  :name="collapsedSections.has(rootGroup.id) ? icons.chevronRight : icons.chevronDown"
                  class="w-3.5 h-3.5 text-(--color-text-muted)"
                />
                <CoreAppTooltip
                  :text="
                    rootGroup.label === 'groups'
                      ? $t(activeGroupType === 'clients' ? 'groups.tooltip' : 'groups.productTooltip')
                      : rootGroup.label === 'clientdirectory'
                        ? $t('clients.directoryTooltip')
                        : ''
                  "
                >
                  <span class="cursor-help border-b border-dashed border-(--color-text-muted)/40">{{
                    rootGroup.label === 'groups'
                      ? $t('groups.title')
                      : rootGroup.label === 'clientdirectory'
                        ? $t('clients.directory')
                        : rootGroup.label
                  }}</span>
                </CoreAppTooltip>
              </CoreAppButton>
              <CoreAppButton
                size="xs"
                variant="ghost"
                color="neutral"
                class="h-5! min-h-5! px-1!"
                :title="$t('groups.create')"
                :aria-label="String($t('groups.create'))"
                @click.stop="openCreateModal(rootGroup.id)"
              >
                <CoreAppIcon :name="icons.group" class="w-3.5 h-3.5" />
              </CoreAppButton>
            </div>
            <template v-if="!collapsedSections.has(rootGroup.id)">
              <GroupsActionsTreeNode
                v-for="g in rootGroup.children || []"
                :key="g.id"
                :group="g"
                :selected-id="selectedGroup?.id"
                :expanded-ids="expandedGroupIds"
                :group-type="activeGroupType"
                :dragged-group-id="draggedGroupId"
                :invalid-drop-target-ids="invalidDropTargetIds"
                :dragged-member-group-type="draggedMemberGroupType"
                :dragged-member-source-group-id="draggedMemberSourceGroupId"
                :member-drop-target-id="memberDropTargetId"
                :is-root-level="false"
                :root-id="rootGroup.id"
                @select="selectGroup"
                @toggle="toggleExpand"
                @create-subgroup="openCreateModal"
                @edit="openEditModal"
                @delete="confirmDeleteGroup"
                @add-members="openAddMembers"
                @move-group="moveGroup"
                @drag-group-start="draggedGroupId = $event"
                @drag-group-end="draggedGroupId = null"
                @add-members-drop="addDroppedMembers"
                @member-drop-target="memberDropTargetId = $event"
              />
            </template>
          </template>
          <div v-if="filteredTreeGroups.length === 0 && !loading" class="text-sm text-(--color-text-muted) px-2 py-4 text-center">
            {{ $t('common.noResults') }}
          </div>
        </div>
      </div>

      <!-- eslint-disable-next-line vuejs-accessibility/no-static-element-interactions -- pointer-only drag resize handle; not keyboard operable by design -->
      <div
        v-if="!isMobile"
        @mousedown="startResize"
        class="w-1 cursor-col-resize bg-transparent hover:bg-opsi-blue/30 active:bg-opsi-blue/50 transition-colors shrink-0 relative group"
      >
        <div
          class="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-16 bg-(--color-border) rounded group-hover:bg-opsi-blue transition-colors"
        />
      </div>

      <div class="flex-1 min-w-0 min-h-0 bg-(--color-background) overflow-hidden">
        <div class="h-full min-h-0 flex flex-col">
          <div class="p-2 border-b border-(--color-border) flex items-center justify-between bg-(--color-background)">
            <div class="flex items-center gap-2 min-w-0 flex-1">
              <CoreAppButton
                v-if="isMobile"
                :icon="icons.back"
                variant="ghost"
                color="neutral"
                size="xs"
                :aria-label="String($t('common.back'))"
                :title="String($t('common.back'))"
                @click="closeMobileGroupPanel"
              />
              <span class="font-medium text-(--color-text) min-w-0 truncate">
                {{
                  isAddingMembers
                    ? $t('groups.membersAdd')
                    : isCreatingGroup
                      ? createForm.parentGroupId
                        ? $t('groups.subgroup')
                        : $t('groups.create')
                      : isEditingGroup
                        ? $t('groups.edit')
                        : selectedGroup
                          ? $t('groups.selected', { groupName: selectedGroup.label })
                          : globalMembersTitle
                }}
              </span>
              <CoreAppHoverPopover
                v-if="!isAddingMembers && !isPanelFormOpen && !isReadOnly"
                :aria-label="String($t('groups.dragHelp'))"
                align="start"
                content-class="max-w-64"
                class="shrink-0"
              >
                <CoreAppButton
                  variant="ghost"
                  color="neutral"
                  size="xs"
                  class="size-7 shrink-0 justify-center p-0"
                  :aria-label="String($t('groups.dragHelp'))"
                >
                  <CoreAppIcon name="lucide:info" mode="svg" class="size-4 shrink-0" />
                </CoreAppButton>
                <template #content>
                  <p class="m-0 text-sm text-(--color-text)">
                    {{ $t('groups.dragMembersHelp') }}
                  </p>
                </template>
              </CoreAppHoverPopover>
              <span
                v-if="(isAddingMembers && memberTargetGroup) || (isCreatingGroup && createForm.parentGroupId) || isEditingGroup"
                class="text-xs text-(--color-text-muted) truncate"
              >
                {{ isAddingMembers ? memberTargetGroup?.label : isCreatingGroup ? createForm.parentGroupId : editForm.groupId }}
              </span>
              <span v-if="!isAddingMembers && !isPanelFormOpen && selectedGroup?.isSpecial" class="text-xs text-(--color-text-muted)">
                ({{ $t('diag.systemGroup') }})
              </span>
            </div>
            <CoreAppButton v-if="isPanelFormOpen" variant="ghost" color="neutral" size="xs" class="shrink-0" @click="cancelPanelForm">
              {{ $t('common.back') }}
            </CoreAppButton>
            <CoreAppButton v-else-if="isAddingMembers" variant="ghost" color="neutral" size="xs" class="shrink-0" @click="cancelAddMembers">
              {{ $t('common.back') }}
            </CoreAppButton>
            <div class="flex gap-1" v-else-if="selectedGroup && !selectedGroup.isSpecial">
              <CoreAppButton
                :icon="icons.add"
                variant="ghost"
                color="neutral"
                size="xs"
                :title="$t('groups.membersAdd')"
                @click="selectedGroup && openAddMembers(selectedGroup)"
                :disabled="!selectedGroup || isReadOnly"
              />
              <CoreAppButton
                variant="ghost"
                color="neutral"
                size="xs"
                :title="$t('groups.subgroup')"
                :aria-label="String($t('groups.subgroup'))"
                @click="selectedGroup && openCreateModal(selectedGroup.id)"
                :disabled="!selectedGroup || isReadOnly"
              >
                <CoreAppIcon :name="icons.group" class="w-4 h-4" />
              </CoreAppButton>
              <CoreAppButton
                :icon="icons.pencil"
                variant="ghost"
                color="neutral"
                size="xs"
                :title="$t('common.edit')"
                @click="selectedGroup && openEditModal(selectedGroup)"
                :disabled="!selectedGroup || isReadOnly"
              />
              <CoreAppButton
                :icon="icons.delete"
                variant="ghost"
                size="xs"
                color="neutral"
                :title="$t('common.delete')"
                @click="selectedGroup && confirmDeleteGroup(selectedGroup)"
                :disabled="!selectedGroup || isReadOnly"
              />
            </div>
            <div
              class="flex gap-1"
              v-else-if="selectedGroup?.isSpecial && selectedGroup.label !== 'not_assigned' && activeGroupType === 'clients'"
            >
              <CoreAppButton
                variant="ghost"
                color="neutral"
                size="xs"
                :title="$t('groups.subgroup')"
                @click="selectedGroup && openCreateModal(selectedGroup.id)"
                :disabled="isReadOnly"
              >
                <CoreAppIcon :name="icons.group" class="w-4 h-4" />
              </CoreAppButton>
            </div>
          </div>

          <div v-if="isCreatingGroup" class="flex-1 min-h-0 overflow-auto p-3 flex flex-col">
            <CoreAppForm @submit="doCreateGroup" class="h-full min-h-0 flex flex-col space-y-4">
              <CoreAppAlertInline
                v-if="modalStatusMessage"
                :title="$t('common.error')"
                :description="modalStatusMessage"
                color="error"
                variant="subtle"
                closable
                compact
                @close="modalStatusMessage = null"
              />
              <CoreAppFormField :label="$t('groups.id')" required>
                <CoreAppInput v-model="createForm.groupId" class="w-full" />
              </CoreAppFormField>
              <CoreAppFormField :label="$t('common.description')">
                <CoreAppTextarea v-model="createForm.description" :rows="2" class="w-full" />
              </CoreAppFormField>
              <CoreAppFormField :label="$t('common.notes')">
                <CoreAppTextarea v-model="createForm.notes" :rows="2" class="w-full" />
              </CoreAppFormField>
              <div :class="createAddMembersEnabled ? 'flex-1 min-h-0 flex flex-col' : ''">
                <div :class="createAddMembersEnabled ? 'flex-1 min-h-0 flex flex-col space-y-2' : 'space-y-2'">
                  <div class="shrink-0 flex items-center gap-2 select-none">
                    <CoreAppCheckbox
                      :model-value="createAddMembersEnabled"
                      :aria-label="String($t('groups.membersAdd'))"
                      @update:model-value="toggleCreateAddMembers"
                    />
                    <button
                      type="button"
                      class="text-sm text-(--color-text) text-left bg-transparent border-0 p-0 cursor-pointer"
                      @click="toggleCreateAddMembers(!createAddMembersEnabled)"
                    >
                      {{ $t('groups.membersAdd') }}
                      <span class="text-(--color-text-muted)">({{ $t('common.optional') }})</span>
                    </button>
                  </div>
                  <div v-if="createAddMembersEnabled" class="flex-1 min-h-0 flex flex-col gap-2">
                    <CoreAppFilterInput
                      v-model="createMembersSearch"
                      size="sm"
                      :placeholder="$t('groups.membersSearch')"
                      class="shrink-0"
                    />
                    <div class="flex-1 min-h-32 min-w-0 border border-(--color-border) rounded-lg overflow-hidden flex flex-col">
                      <div
                        v-if="filteredCreateMembers.length > 0"
                        class="shrink-0 flex items-center gap-1.5 px-3 py-2 border-b border-(--color-border)"
                      >
                        <CoreAppCheckbox
                          :model-value="
                            filteredCreateMembers.length > 0 && filteredCreateMembers.every((item) => createSelectedMembers.includes(item))
                          "
                          :indeterminate="
                            filteredCreateMembers.some((item) => createSelectedMembers.includes(item)) &&
                            !filteredCreateMembers.every((item) => createSelectedMembers.includes(item))
                          "
                          :aria-label="String($t('common.selectAll'))"
                          @update:model-value="toggleSelectAllCreateMembers"
                        />
                        <span class="text-xs text-(--color-text-muted)">
                          {{
                            createSelectedMembers.length > 0
                              ? `${createSelectedMembers.length} ${$t('common.selected')}`
                              : $t('common.selectAll')
                          }}
                        </span>
                      </div>
                      <div class="flex-1 min-h-0 overflow-y-auto">
                        <div
                          v-for="item in displayedCreateMembers"
                          :key="`create-${item}`"
                          class="flex items-center gap-2 px-3 py-2 hover:bg-(--color-surface-hover) border-b border-(--color-border) last:border-b-0 text-(--color-text)"
                          :class="createSelectedMembers.includes(item) ? 'bg-opsi-blue/5' : ''"
                        >
                          <CoreAppCheckbox
                            :model-value="createSelectedMembers.includes(item)"
                            :aria-label="item"
                            @update:model-value="toggleCreateMemberSelection(item)"
                          />
                          <button
                            type="button"
                            class="text-sm truncate text-left bg-transparent border-0 p-0 flex-1 cursor-pointer"
                            @click.prevent="toggleCreateMemberSelection(item, $event)"
                          >
                            {{ item }}
                          </button>
                        </div>
                        <CoreAppButton
                          v-if="hasMoreCreateMembers"
                          variant="ghost"
                          color="primary"
                          size="xs"
                          block
                          class="py-2!"
                          @click="showMoreCreateMembers"
                        >
                          {{ $t('common.showMore') }} ({{ filteredCreateMembers.length - createMemberDisplayLimit }}
                          {{ $t('common.remaining') }})
                        </CoreAppButton>
                        <div v-if="filteredCreateMembers.length === 0" class="text-sm text-(--color-text-muted) py-3 text-center">
                          {{ createMembersSearch ? $t('common.noResults') : $t('common.noData') }}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CoreAppForm>
          </div>
          <div v-else-if="isEditingGroup" class="flex-1 min-h-0 overflow-auto p-3">
            <CoreAppForm @submit="doEditGroup" class="space-y-4">
              <CoreAppAlertInline
                v-if="modalStatusMessage"
                :title="$t('common.error')"
                :description="modalStatusMessage"
                color="error"
                variant="subtle"
                closable
                compact
                @close="modalStatusMessage = null"
              />
              <CoreAppFormField :label="$t('groups.parent')" class="add-border">
                <CoreAppSelectMenu
                  v-model="editForm.parentGroupId"
                  :items="editParentGroupSelectItems"
                  :placeholder="$t('common.none')"
                  class="w-full"
                />
              </CoreAppFormField>
              <CoreAppFormField :label="$t('common.description')">
                <CoreAppTextarea v-model="editForm.description" :rows="2" class="w-full" />
              </CoreAppFormField>
              <CoreAppFormField :label="$t('common.notes')">
                <CoreAppTextarea v-model="editForm.notes" :rows="2" class="w-full" />
              </CoreAppFormField>
            </CoreAppForm>
          </div>

          <!-- eslint-disable-next-line vuejs-accessibility/no-static-element-interactions -- keyboard navigation container for available members -->
          <div
            v-else-if="isAddingMembers"
            class="flex-1 min-h-0 overflow-auto px-2 pb-2 pt-0 outline-none"
            tabindex="-1"
            @keydown="handleAddMembersKeydown"
          >
            <CoreAppAlertInline
              v-if="modalStatusMessage"
              :title="$t('common.error')"
              :description="modalStatusMessage"
              color="error"
              variant="subtle"
              closable
              compact
              @close="modalStatusMessage = null"
            />
            <div class="sticky top-0 z-20 bg-(--color-background) pt-2 pb-1.5 border-b border-(--color-border)">
              <CoreAppFilterInput
                v-model="availableMembersSearch"
                size="sm"
                :placeholder="$t('groups.membersSearch')"
                input-class="w-full mb-2"
              />
              <div class="flex items-center justify-between px-1">
                <div class="flex items-center gap-1.5">
                  <CoreAppCheckbox
                    :model-value="
                      filteredAvailableMembers.length > 0 && filteredAvailableMembers.every((item) => selectedNewMembersSet.has(item))
                    "
                    :indeterminate="
                      filteredAvailableMembers.some((item) => selectedNewMembersSet.has(item)) &&
                      !filteredAvailableMembers.every((item) => selectedNewMembersSet.has(item))
                    "
                    :aria-label="String($t('common.selectAll'))"
                    @update:model-value="toggleSelectAllNewMembers"
                  />
                  <span class="text-xs text-(--color-text-muted)">{{ $t('common.selectAll') }}</span>
                </div>
                <span class="text-xs text-(--color-text-muted)">{{ selectedNewMembers.length }} {{ $t('common.selected') }}</span>
              </div>
            </div>
            <div v-if="loadingMembers || loadingAddTarget" class="py-8 text-center"><CoreAppLoadingSpinner size="sm" /></div>
            <template v-else>
              <!-- eslint-disable-next-line vuejs-accessibility/no-static-element-interactions -- pointer-only drag source; checkbox and button handle keyboard selection -->
              <div
                v-for="member in displayedAvailableMembers"
                :key="member"
                class="flex items-center gap-1.5 text-sm px-1 py-1 rounded hover:bg-(--color-surface-hover) cursor-pointer select-none"
                :class="selectedNewMembersSet.has(member) ? 'bg-opsi-blue/5' : ''"
                :draggable="!isReadOnly"
                @dragstart="handleMemberDragStart(member, $event)"
                @dragend="clearMemberDrag"
              >
                <CoreAppCheckbox
                  :model-value="selectedNewMembersSet.has(member)"
                  class="shrink-0"
                  :aria-label="member"
                  @click.stop
                  @update:model-value="toggleNewMemberSelection(member)"
                />
                <CoreAppIcon
                  :name="activeGroupType === 'clients' ? icons.client : icons.product"
                  class="w-4 h-4 text-(--color-text-muted) shrink-0"
                />
                <button
                  type="button"
                  class="flex-1 min-w-0 truncate text-left text-(--color-text) bg-transparent border-0 p-0 cursor-pointer"
                  @click="toggleNewMemberSelection(member, $event)"
                >
                  {{ member }}
                </button>
              </div>
              <div v-if="filteredAvailableMembers.length === 0" class="text-sm text-(--color-text-muted) py-4 text-center">
                {{ availableMembersSearch ? $t('common.noResults') : $t('common.noData') }}
              </div>
              <CoreAppButton
                v-else-if="hasMoreAvailableMembers"
                variant="ghost"
                color="primary"
                size="xs"
                block
                class="py-2!"
                @click="showMoreAvailableMembers"
              >
                {{ $t('common.showMore') }} ({{ filteredAvailableMembers.length - availableMemberDisplayLimit }}
                {{ $t('common.remaining') }})
              </CoreAppButton>
            </template>
          </div>
          <div v-if="isCreatingGroup || isEditingGroup" class="flex justify-end gap-2 p-2 border-t border-(--color-border)">
            <CoreAppButton
              color="primary"
              :icon="isCreatingGroup ? icons.add : icons.check"
              :loading="saving"
              :disabled="saving || (isCreatingGroup && !createForm.groupId.trim())"
              @click="isCreatingGroup ? doCreateGroup() : doEditGroup()"
            >
              {{ isCreatingGroup ? $t('common.create') : $t('common.save') }}
            </CoreAppButton>
          </div>
          <div v-else-if="isAddingMembers" class="shrink-0 flex justify-end gap-2 p-2 border-t border-(--color-border)">
            <CoreAppButton
              color="primary"
              :icon="icons.add"
              :loading="addingMembers"
              :disabled="addingMembers || !addTargetLoaded || isReadOnly || selectedNewMembers.length === 0"
              @click="addSelectedMembers"
            >
              {{ $t('common.add') }} ({{ selectedNewMembers.length }})
            </CoreAppButton>
          </div>
          <!-- eslint-disable-next-line vuejs-accessibility/no-static-element-interactions -- keyboard navigation container for member list (roving focus) -->
          <div v-else class="flex-1 overflow-auto px-2 pb-2 pt-0 outline-none" tabindex="-1" @keydown="handleMemberListKeydown">
            <div class="border-(--color-border) bg-(--color-background)">
              <div
                class="sticky top-0 z-20 bg-(--color-background) pt-2 pb-1.5 border-b border-(--color-border)"
                style="background-color: var(--color-background)"
              >
                <div class="flex items-center justify-between mb-1.5">
                  <h2 class="text-xs font-heading uppercase tracking-wide text-(--color-text) m-0">
                    {{ memberListTitle }}
                    <span class="text-(--color-text-muted) font-normal">({{ allMembers.length }})</span>
                  </h2>
                  <div class="flex items-center gap-2">
                    <CoreAppButton
                      v-if="selectedGroup && selectedMembers.length > 0 && !selectedGroup.isSpecial"
                      :icon="icons.delete"
                      size="xs"
                      variant="soft"
                      color="error"
                      :disabled="isReadOnly"
                      @click="removeSelectedMembers"
                    >
                      {{ $t('common.remove') }} ({{ selectedMembers.length }})
                    </CoreAppButton>
                    <CoreAppButton
                      v-if="selectedGroup && allMembers.length > 0 && !selectedGroup.isSpecial"
                      :icon="icons.delete"
                      size="xs"
                      variant="ghost"
                      color="neutral"
                      :disabled="isReadOnly"
                      :title="$t('groups.membersRemoveAll')"
                      @click="confirmRemoveAllMembers"
                    >
                      {{ $t('common.removeAll') }}
                    </CoreAppButton>
                  </div>
                </div>
                <CoreAppFilterInput
                  v-if="allMembers.length > 5"
                  v-model="memberSearchQuery"
                  :placeholder="$t('common.filter')"
                  size="sm"
                  input-class="w-full mb-2"
                />
                <div v-if="filteredMembers.length > 0 && canSelectMembers" class="flex items-center gap-1.5 px-1 py-0.5 mb-0.5">
                  <CoreAppCheckbox
                    :model-value="selectedMembers.length === filteredMembers.length && filteredMembers.length > 0"
                    :indeterminate="selectedMembers.length > 0 && selectedMembers.length < filteredMembers.length"
                    :aria-label="String($t('common.selectAll'))"
                    @update:model-value="toggleSelectAllMembers"
                  />
                  <span class="text-xs text-(--color-text-muted)">
                    {{
                      selectedMembers.length > 0
                        ? `${selectedMembers.length}
                                        ${$t('common.selected')}`
                        : $t('common.selectAll')
                    }}
                    <kbd
                      class="ml-1 px-1 py-0.5 text-xs text-(--color-text) bg-(--color-surface-hover) rounded border border-(--color-border)"
                      >Ctrl+A</kbd
                    >
                    <kbd
                      class="ml-1 px-1 py-0.5 text-xs text-(--color-text) bg-(--color-surface-hover) rounded border border-(--color-border)"
                      >Shift+Click</kbd
                    >
                  </span>
                </div>
              </div>
              <div class="space-y-0">
                <!-- eslint-disable-next-line vuejs-accessibility/click-events-have-key-events, vuejs-accessibility/no-static-element-interactions -- row click supplements the keyboard-accessible checkbox -->
                <div
                  v-for="member in displayedMembers"
                  :key="member"
                  class="flex items-center gap-1.5 text-sm px-1 py-0.5 rounded transition-colors hover:bg-(--color-surface-hover) group/member cursor-pointer select-none"
                  :class="selectedMembersSet.has(member) ? 'bg-opsi-blue/5' : ''"
                  :draggable="canSelectMembers && !isReadOnly"
                  @click="toggleMemberSelection(member, $event)"
                  @dragstart="handleMemberDragStart(member, $event)"
                  @dragend="clearMemberDrag"
                >
                  <CoreAppCheckbox
                    v-if="canSelectMembers"
                    :model-value="selectedMembersSet.has(member)"
                    class="shrink-0"
                    @click.stop
                    :aria-label="member"
                    @update:model-value="toggleMemberSelection(member)"
                  />
                  <CoreAppIcon
                    :name="activeGroupType === 'clients' ? icons.client : icons.product"
                    class="w-4 h-4 text-(--color-text-muted) shrink-0"
                  />
                  <span class="flex-1 truncate text-(--color-text)">{{ member }}</span>
                  <CoreAppButton
                    v-if="selectedGroup && !selectedGroup.isSpecial"
                    :icon="icons.delete"
                    size="xs"
                    variant="ghost"
                    color="neutral"
                    :title="$t('common.remove')"
                    class="shrink-0"
                    @click.stop="removeSingleMember(member)"
                  />
                </div>
                <div v-if="loadingSelectedGroupMembers || (!selectedGroup && loadingMembers)" class="py-8 text-center">
                  <CoreAppLoadingSpinner size="sm" />
                </div>
                <div v-else-if="filteredMembers.length === 0" class="text-sm text-(--color-text-muted) py-4 text-center">
                  {{ memberSearchQuery ? $t('common.noResults') : emptyMemberListMessage }}
                </div>
                <CoreAppButton
                  v-else-if="hasMoreMembers"
                  variant="ghost"
                  color="primary"
                  size="xs"
                  block
                  class="py-2!"
                  @click="showMoreMembers"
                >
                  {{ $t('common.showMore') }} ({{ filteredMembers.length - memberDisplayLimit }} {{ $t('common.remaining') }})
                </CoreAppButton>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <CoreAppModal v-model:open="showDeleteModal">
      <template #content>
        <CoreAppCard>
          <template #header>
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-3">
                <CoreAppIcon :name="icons.delete" class="w-5 h-5" />
                <h3 class="text-sm font-heading uppercase tracking-wide text-(--color-text) m-0">
                  {{ $t('common.delete') }}
                </h3>
                <p class="text-sm text-(--color-text-muted)">{{ groupToDelete?.id }}</p>
              </div>
              <CoreAppButton :icon="icons.x" variant="ghost" color="neutral" size="xs" @click="showDeleteModal = false" />
            </div>
          </template>
          <p class="text-sm text-(--color-text)">
            {{ $t('groups.delete', { groupId: groupToDelete?.id || '' }) }}
          </p>
          <CoreAppAlertInline
            v-if="modalStatusMessage"
            :title="$t('common.error')"
            :description="modalStatusMessage"
            color="error"
            variant="subtle"
            closable
            compact
            class="mt-3"
            @close="modalStatusMessage = null"
          />
          <template #footer>
            <div class="flex justify-end gap-2">
              <CoreAppButton variant="outline" color="primary" @click="showDeleteModal = false">{{ $t('common.cancel') }} </CoreAppButton>
              <CoreAppButton color="error" :loading="deleting" @click="deleteGroup" :icon="icons.delete">
                {{ $t('common.delete') }}</CoreAppButton
              >
            </div>
          </template>
        </CoreAppCard>
      </template>
    </CoreAppModal>
  </LayoutsPageLayout>
</template>

<script setup lang="ts">
  import type { GroupTreeNodeData } from '~/types'
  import { useSelectionStore } from '~/stores/selectionStore'
  import { useUiStore } from '~/stores/uiStore'

  const icons = useIcons()
  const { t: $t } = useI18n()
  const route = useRoute()
  const router = useRouter()
  const selectionStore = useSelectionStore()
  const uiStore = useUiStore()
  const { isReadOnly, isHostGroupAccessRestricted, isProductGroupAccessRestricted } = useUserPermissions()
  const {
    getClientIds,
    getServerIds,
    getServersProducts,
    createHostGroup,
    createProductGroup,
    updateHostGroup,
    updateProductGroup,
    deleteHostGroup,
    deleteProductGroup,
    addClientsToGroup,
    addProductsToGroup,
    removeClientsFromGroup,
    removeProductsFromGroup,
    removeClientFromGroups,
    removeProductFromGroup,
  } = useApiHelpers()
  const {
    clientGroupsTree,
    clientGroupsLoading,
    productGroupsTree,
    productGroupsLoading,
    fetchClientGroups: cachedFetchClientGroups,
    fetchProductGroups: cachedFetchProductGroups,
    fetchGroupChildrenLazy,
    fetchProductGroupChildrenLazy,
  } = useCachedData()

  const activeGroupType = ref<'clients' | 'products'>('clients')
  const selectedGroup = ref<GroupTreeNodeData | null>(null)
  const loading = computed(() => clientGroupsLoading.value || productGroupsLoading.value)
  const loadingMembers = ref(false)
  const loadingSelectedGroupMembers = ref(false)

  const availableClients = shallowRef<string[]>([])
  const availableProducts = shallowRef<string[]>([])
  const cachedDepotIds = ref<string[]>([])

  const searchQuery = ref('')
  const debouncedSearchQuery = ref('')
  let _searchDebounce: ReturnType<typeof setTimeout> | null = null
  watch(searchQuery, (q) => {
    if (_searchDebounce) clearTimeout(_searchDebounce)
    _searchDebounce = setTimeout(() => {
      debouncedSearchQuery.value = q
    }, 180)
  })
  const memberSearchQuery = ref('')

  const statusMessage = ref<{ type: 'success' | 'error'; text: string } | null>(null)
  const modalStatusMessage = ref<string | null>(null)
  let statusTimer: ReturnType<typeof setTimeout> | null = null

  function showStatus(type: 'success' | 'error', text: string) {
    const modalOpen = isCreatingGroup.value || isEditingGroup.value || showDeleteModal.value || isAddingMembers.value
    if (type === 'error' && modalOpen) {
      modalStatusMessage.value = text
      return
    }
    if (type === 'success') {
      modalStatusMessage.value = null
    }
    if (statusTimer) clearTimeout(statusTimer)
    statusMessage.value = { type, text }
    statusTimer = setTimeout(() => {
      statusMessage.value = null
    }, 5000)
  }

  const isCreatingGroup = ref(false)
  const isEditingGroup = ref(false)
  const isPanelFormOpen = computed(() => isCreatingGroup.value || isEditingGroup.value)
  let panelFormPreviousSidebar = false
  const showDeleteModal = ref(false)
  const isAddingMembers = ref(false)
  const loadingAddTarget = ref(false)
  const addTargetLoaded = ref(false)
  let addTargetRequest = 0
  let addMembersPreviousSidebar = false
  const saving = ref(false)
  const deleting = ref(false)
  const addingMembers = ref(false)
  const groupToDelete = ref<GroupTreeNodeData | null>(null)
  const memberTargetGroup = ref<GroupTreeNodeData | null>(null)

  const createForm = reactive({
    groupId: '',
    parentGroupId: '',
    description: '',
    notes: '',
  })

  const editForm = reactive({
    groupId: '',
    parentGroupId: undefined as string | undefined,
    description: '',
    notes: '',
  })

  const availableMembersSearch = ref('')
  const selectedNewMembers = ref<string[]>([])
  const selectedNewMembersSet = computed(() => new Set(selectedNewMembers.value))
  const selectedMembers = ref<string[]>([])
  const lastClickedMember = ref<string | null>(null)
  const lastClickedNewMember = ref<string | null>(null)
  const createAddMembersEnabled = ref(false)
  const createMembersSearch = ref('')
  const createSelectedMembers = ref<string[]>([])
  const lastClickedCreateMember = ref<string | null>(null)

  const containerRef = ref<HTMLElement | null>(null)
  const isMobile = ref(false)
  const showSidebar = ref(true)
  const sidebarWidthPercent = computed({
    get: () => uiStore.layout.groupsSidebarWidthPercent,
    set: (value: number) => {
      uiStore.layout.groupsSidebarWidthPercent = value
    },
  })
  const isResizing = ref(false)
  const minSidebarPercent = 20
  const maxSidebarPercent = 65
  const expandedGroupIds = ref<Set<string>>(new Set())
  const collapsedSections = ref<Set<string>>(new Set())
  const draggedGroupId = ref<string | null>(null)
  const draggedMemberIds = ref<string[]>([])
  const draggedMemberGroupType = ref<'clients' | 'products' | null>(null)
  const draggedMemberSourceGroupId = ref<string | null>(null)
  const memberDropTargetId = ref<string | null>(null)
  const invalidDropTargetIds = computed(() => {
    if (!draggedGroupId.value) return new Set<string>()
    return new Set([draggedGroupId.value, ...getChildGroupIds(currentTreeGroups.value, draggedGroupId.value)])
  })

  const groupTypes = [
    { label: String($t('groups.client')), value: 'clients' },
    { label: String($t('groups.product')), value: 'products' },
  ]

  const currentTreeGroups = computed((): GroupTreeNodeData[] => {
    if (activeGroupType.value === 'clients') {
      return clientGroupsTree.value
    }
    return productGroupsTree.value
  })

  const filteredTreeGroups = computed(() => {
    if (!debouncedSearchQuery.value.trim()) return currentTreeGroups.value
    const query = debouncedSearchQuery.value.toLowerCase()
    return filterTree(currentTreeGroups.value, query)
  })

  function filterTree(nodes: GroupTreeNodeData[], query: string): GroupTreeNodeData[] {
    const result: GroupTreeNodeData[] = []
    for (const node of nodes) {
      const matches = (node.label || node.id).toLowerCase().includes(query)
      const filteredChildren = node.children?.length ? filterTree(node.children, query) : []
      if (matches || filteredChildren.length > 0) {
        result.push(filteredChildren.length > 0 ? { ...node, children: filteredChildren } : node)
      }
    }
    return result
  }

  watch(debouncedSearchQuery, (q) => {
    if (!q.trim()) return
    const query = q.toLowerCase()
    const newIds = new Set(expandedGroupIds.value)
    let changed = false
    function expandMatching(nodes: GroupTreeNodeData[]) {
      for (const node of nodes) {
        if (node.children?.length) {
          const hasMatch = node.children.some((c) => (c.label || c.id).toLowerCase().includes(query))
          if (hasMatch && !newIds.has(node.id)) {
            newIds.add(node.id)
            changed = true
          }
          expandMatching(node.children)
        }
      }
    }
    expandMatching(currentTreeGroups.value)
    if (changed) expandedGroupIds.value = newIds
  })

  const MEMBER_DISPLAY_LIMIT = 200
  const memberDisplayLimit = ref(MEMBER_DISPLAY_LIMIT)
  const availableMemberDisplayLimit = ref(MEMBER_DISPLAY_LIMIT)
  const createMemberDisplayLimit = ref(MEMBER_DISPLAY_LIMIT)

  const allMembers = computed(() => {
    if (selectedGroup.value) return selectedGroup.value.members || []
    return activeGroupType.value === 'clients' ? availableClients.value : availableProducts.value
  })

  const canSelectMembers = computed(
    () => !selectedGroup.value || selectedGroup.value.label === 'not_assigned' || !selectedGroup.value.isSpecial,
  )

  const globalMembersTitle = computed(() => (activeGroupType.value === 'clients' ? String($t('clients.all')) : String($t('products.all'))))
  const memberListTitle = computed(() =>
    selectedGroup.value
      ? String($t('groups.members'))
      : activeGroupType.value === 'clients'
        ? String($t('clients.title'))
        : String($t('products.title')),
  )
  const emptyMemberListMessage = computed(() =>
    selectedGroup.value
      ? String($t('groups.membersNone'))
      : activeGroupType.value === 'clients'
        ? String($t('groups.clientsNone'))
        : String($t('groups.productsNone')),
  )

  const filteredMembers = computed(() => {
    const members = allMembers.value
    if (!memberSearchQuery.value.trim()) return members
    const query = memberSearchQuery.value.toLowerCase()
    return members.filter((m) => m.toLowerCase().includes(query))
  })

  const displayedMembers = computed(() => filteredMembers.value.slice(0, memberDisplayLimit.value))

  // O(1) Set for member selection lookups — avoids O(n²) includes() on every render
  const selectedMembersSet = computed(() => new Set(selectedMembers.value))
  const hasMoreMembers = computed(() => filteredMembers.value.length > memberDisplayLimit.value)

  function showMoreMembers() {
    memberDisplayLimit.value += MEMBER_DISPLAY_LIMIT
  }

  const filteredAvailableMembers = computed(() => {
    if (!memberTargetGroup.value) return []
    const currentMembers = new Set(memberTargetGroup.value.members || [])
    const allAvailable = activeGroupType.value === 'clients' ? availableClients.value : availableProducts.value
    let available = allAvailable.filter((m) => !currentMembers.has(m))

    if (availableMembersSearch.value.trim()) {
      const query = availableMembersSearch.value.toLowerCase()
      available = available.filter((m) => m.toLowerCase().includes(query))
    }
    return available
  })

  const displayedAvailableMembers = computed(() => filteredAvailableMembers.value.slice(0, availableMemberDisplayLimit.value))
  const hasMoreAvailableMembers = computed(() => filteredAvailableMembers.value.length > availableMemberDisplayLimit.value)

  function showMoreAvailableMembers() {
    availableMemberDisplayLimit.value += MEMBER_DISPLAY_LIMIT
  }

  watch(availableMembersSearch, () => {
    availableMemberDisplayLimit.value = MEMBER_DISPLAY_LIMIT
  })

  const filteredCreateMembers = computed(() => {
    const allAvailable = activeGroupType.value === 'clients' ? availableClients.value : availableProducts.value
    let available = allAvailable
    if (createMembersSearch.value.trim()) {
      const query = createMembersSearch.value.toLowerCase()
      available = available.filter((m) => m.toLowerCase().includes(query))
    }
    return available
  })
  const displayedCreateMembers = computed(() => filteredCreateMembers.value.slice(0, createMemberDisplayLimit.value))
  const hasMoreCreateMembers = computed(() => filteredCreateMembers.value.length > createMemberDisplayLimit.value)

  function showMoreCreateMembers() {
    createMemberDisplayLimit.value += MEMBER_DISPLAY_LIMIT
  }

  watch(createMembersSearch, () => {
    createMemberDisplayLimit.value = MEMBER_DISPLAY_LIMIT
  })

  const editParentGroupSelectItems = computed(() => {
    if (!editForm.groupId) return []
    const items: { label: string; value: string }[] = []
    const currentId = editForm.groupId
    const childIds = getChildGroupIds(currentTreeGroups.value, currentId)

    function walk(nodes: GroupTreeNodeData[], depth: number) {
      for (const node of nodes) {
        if (node.id !== currentId && node.id !== 'not_assigned' && !childIds.has(node.id)) {
          const indent = '\u00A0\u00A0\u00A0\u00A0'.repeat(depth)
          const label =
            node.id === 'groups' ? String($t('groups.title')) : node.id === 'clientdirectory' ? String($t('clients.directory')) : node.id
          items.push({ label: `${indent}${label}`, value: node.id })
        }
        if (node.children?.length) {
          walk(node.children, depth + 1)
        }
      }
    }
    walk(currentTreeGroups.value, 0)
    return items
  })

  function getChildGroupIds(nodes: GroupTreeNodeData[], parentId: string): Set<string> {
    const result = new Set<string>()

    function findAndCollect(nodes: GroupTreeNodeData[]) {
      for (const node of nodes) {
        if (node.id === parentId) {
          collectAll(node.children || [])
          return
        }
        if (node.children?.length) {
          findAndCollect(node.children)
        }
      }
    }

    function collectAll(nodes: GroupTreeNodeData[]) {
      for (const node of nodes) {
        result.add(node.id)
        if (node.children?.length) collectAll(node.children)
      }
    }

    findAndCollect(nodes)
    return result
  }

  function expandGroupAndParents(groupId: string) {
    const newSet = new Set(expandedGroupIds.value)
    newSet.add(groupId)
    expandedGroupIds.value = newSet
  }

  function toggleCollapsedSection(groupId: string) {
    if (collapsedSections.value.has(groupId)) {
      collapsedSections.value.delete(groupId)
      return
    }
    collapsedSections.value.add(groupId)
  }

  async function ensureGroupLoaded(groupId: string) {
    if (activeGroupType.value === 'clients') {
      await fetchGroupChildrenLazy(groupId, selectionStore.selectedServers)
    } else {
      await fetchProductGroupChildrenLazy(groupId)
    }
    return findGroupById(currentTreeGroups.value, groupId)
  }

  async function toggleExpand(groupId: string) {
    const newSet = new Set(expandedGroupIds.value)
    if (newSet.has(groupId)) {
      newSet.delete(groupId)
    } else {
      newSet.add(groupId)
      await ensureGroupLoaded(groupId)
      if (selectedGroup.value?.id === groupId) {
        selectedGroup.value = findGroupById(currentTreeGroups.value, groupId)
      }
    }
    expandedGroupIds.value = newSet
  }

  async function selectGroup(group: GroupTreeNodeData) {
    const wasActionOpen = isAddingMembers.value || isPanelFormOpen.value
    if (isAddingMembers.value) cancelAddMembers()
    if (isPanelFormOpen.value) cancelPanelForm()
    if (selectedGroup.value?.id === group.id && !wasActionOpen) {
      selectedGroup.value = null
      selectedMembers.value = []
      void ensureAvailableMembers()
      const newSet = new Set(expandedGroupIds.value)
      newSet.delete(group.id)
      expandedGroupIds.value = newSet
      return
    }
    loadingSelectedGroupMembers.value = true
    try {
      selectedGroup.value = findGroupById(currentTreeGroups.value, group.id) || group
      memberSearchQuery.value = ''
      selectedMembers.value = []
      memberDisplayLimit.value = MEMBER_DISPLAY_LIMIT
      expandGroupAndParents(group.id)
      if (isMobile.value) {
        showSidebar.value = false
      }
      const updatedGroup = await ensureGroupLoaded(group.id)
      if (updatedGroup && selectedGroup.value?.id === group.id) {
        selectedGroup.value = updatedGroup
      }
    } finally {
      loadingSelectedGroupMembers.value = false
    }
  }

  function closeMobileGroupPanel() {
    if (isAddingMembers.value) {
      cancelAddMembers()
      if (selectedGroup.value) return
    }
    if (isPanelFormOpen.value) cancelPanelForm()
    selectedGroup.value = null
    showSidebar.value = true
  }

  function toggleMemberSelection(member: string, event?: MouseEvent | KeyboardEvent) {
    if (event?.shiftKey && lastClickedMember.value) {
      const list = filteredMembers.value
      const from = list.indexOf(lastClickedMember.value)
      const to = list.indexOf(member)
      if (from >= 0 && to >= 0) {
        const start = Math.min(from, to)
        const end = Math.max(from, to)
        const range = list.slice(start, end + 1)
        const currentSet = selectedMembersSet.value
        const allSelected = range.every((m) => currentSet.has(m))
        if (allSelected) {
          const rangeSet = new Set(range)
          selectedMembers.value = selectedMembers.value.filter((m) => !rangeSet.has(m))
        } else {
          const newSet = new Set([...selectedMembers.value, ...range])
          selectedMembers.value = [...newSet]
        }
        lastClickedMember.value = member
        return
      }
    }
    const idx = selectedMembers.value.indexOf(member)
    if (idx >= 0) {
      selectedMembers.value.splice(idx, 1)
    } else {
      selectedMembers.value.push(member)
    }
    lastClickedMember.value = member
  }

  function handleMemberDragStart(member: string, event: DragEvent) {
    if ((!isAddingMembers.value && !canSelectMembers.value) || isReadOnly.value || !event.dataTransfer) return
    const selection = isAddingMembers.value ? selectedNewMembers.value : selectedMembers.value
    const members = selection.includes(member) ? selection : [member]
    draggedMemberIds.value = [...new Set(members)]
    draggedMemberGroupType.value = activeGroupType.value
    draggedMemberSourceGroupId.value = isAddingMembers.value ? null : selectedGroup.value?.id || null
    memberDropTargetId.value = null
    event.dataTransfer.effectAllowed = 'copy'
  }

  function clearMemberDrag() {
    draggedMemberIds.value = []
    draggedMemberGroupType.value = null
    draggedMemberSourceGroupId.value = null
    memberDropTargetId.value = null
  }

  async function addDroppedMembers(targetGroup: GroupTreeNodeData) {
    if (targetGroup.id === draggedMemberSourceGroupId.value) return
    const expectedGroupType = activeGroupType.value === 'clients' ? 'HostGroup' : 'ProductGroup'
    if (targetGroup.isSpecial || targetGroup.type !== expectedGroupType || isReadOnly.value) return
    const memberIds = draggedMemberIds.value
    if (memberIds.length === 0) return

    addingMembers.value = true
    try {
      const hydratedTarget = await ensureGroupLoaded(targetGroup.id)
      const existingMembers = new Set(hydratedTarget?.members || targetGroup.members || [])
      const newMembers = memberIds.filter((memberId) => !existingMembers.has(memberId))
      if (newMembers.length === 0) return

      const addFn = activeGroupType.value === 'clients' ? addClientsToGroup : addProductsToGroup
      const result = await addFn(targetGroup.id, newMembers)
      if (result?.error) throw result.error

      showStatus('success', String($t('notify.members.added.group', { count: newMembers.length, group: targetGroup.label })))
      await fetchCurrentGroups()
      if (isAddingMembers.value && memberTargetGroup.value?.id === targetGroup.id) {
        memberTargetGroup.value = (await ensureGroupLoaded(targetGroup.id)) || memberTargetGroup.value
        const added = new Set(newMembers)
        selectedNewMembers.value = selectedNewMembers.value.filter((member) => !added.has(member))
      }
    } catch (e) {
      showStatus('error', e instanceof Error ? e.message : String($t('notify.error')))
    } finally {
      addingMembers.value = false
    }
  }

  function toggleNewMemberSelection(item: string, event?: MouseEvent | KeyboardEvent) {
    if (event?.shiftKey && lastClickedNewMember.value) {
      const list = filteredAvailableMembers.value
      const from = list.indexOf(lastClickedNewMember.value)
      const to = list.indexOf(item)
      if (from >= 0 && to >= 0) {
        const start = Math.min(from, to)
        const end = Math.max(from, to)
        const range = list.slice(start, end + 1)
        const allSelected = range.every((m) => selectedNewMembersSet.value.has(m))
        if (allSelected) {
          selectedNewMembers.value = selectedNewMembers.value.filter((m) => !range.includes(m))
        } else {
          const newSet = new Set([...selectedNewMembers.value, ...range])
          selectedNewMembers.value = [...newSet]
        }
        lastClickedNewMember.value = item
        return
      }
    }
    const idx = selectedNewMembers.value.indexOf(item)
    if (idx >= 0) {
      selectedNewMembers.value.splice(idx, 1)
    } else {
      selectedNewMembers.value.push(item)
    }
    lastClickedNewMember.value = item
  }

  function toggleSelectAllMembers() {
    if (selectedMembers.value.length === filteredMembers.value.length) {
      selectedMembers.value = []
    } else {
      selectedMembers.value = [...filteredMembers.value]
    }
  }

  async function removeSelectedMembers() {
    if (!selectedGroup.value || selectedGroup.value.isSpecial || selectedMembers.value.length === 0) return

    try {
      const groupId = selectedGroup.value.id
      const members = [...selectedMembers.value]
      const BATCH_SIZE = 10
      for (let i = 0; i < members.length; i += BATCH_SIZE) {
        const batch = members.slice(i, i + BATCH_SIZE)
        await Promise.all(
          batch.map((memberId) =>
            activeGroupType.value === 'clients' ? removeClientFromGroups(memberId, [groupId]) : removeProductFromGroup(groupId, memberId),
          ),
        )
      }

      showStatus('success', String($t('notify.host.removed.group', { client: `${members.length}` })))
      selectedMembers.value = []
      await fetchCurrentGroups()
      const updated = findGroupById(currentTreeGroups.value, selectedGroup.value.id)
      if (updated) selectedGroup.value = updated
    } catch (e) {
      showStatus('error', e instanceof Error ? e.message : String($t('notify.error')))
    }
  }

  function handleMemberListKeydown(e: KeyboardEvent) {
    if ((e.ctrlKey || e.metaKey) && e.key === 'a') {
      const target = e.target as HTMLElement
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return
      e.preventDefault()
      toggleSelectAllMembers()
    }
  }

  function toggleSelectAllNewMembers() {
    const visible = filteredAvailableMembers.value
    if (visible.every((member) => selectedNewMembersSet.value.has(member))) {
      const current = new Set(visible)
      selectedNewMembers.value = selectedNewMembers.value.filter((member) => !current.has(member))
    } else {
      selectedNewMembers.value = [...new Set([...selectedNewMembers.value, ...visible])]
    }
  }

  function handleAddMembersKeydown(e: KeyboardEvent) {
    if ((e.ctrlKey || e.metaKey) && e.key === 'a') {
      const target = e.target as HTMLElement
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return
      e.preventDefault()
      toggleSelectAllNewMembers()
    }
  }

  async function fetchCurrentGroups() {
    try {
      if (activeGroupType.value === 'clients') {
        await cachedFetchClientGroups(true, selectionStore.selectedServers)
      } else {
        await cachedFetchProductGroups(true)
      }
      if (selectedGroup.value) {
        const selectedGroupId = selectedGroup.value.id
        const updatedGroup = findGroupById(currentTreeGroups.value, selectedGroupId)
        if (!updatedGroup) {
          selectedGroup.value = null
        } else {
          selectedGroup.value = updatedGroup
          const hydratedGroup = await ensureGroupLoaded(selectedGroupId)
          if (hydratedGroup && selectedGroup.value?.id === selectedGroupId) {
            selectedGroup.value = hydratedGroup
          }
        }
      }
    } catch (err) {
      showStatus('error', err instanceof Error ? err.message : String($t('groups.error')))
    }
  }

  async function ensureDepotIds(): Promise<string[]> {
    if (cachedDepotIds.value.length > 0) return cachedDepotIds.value
    const { data } = await getServerIds()
    if (data && Array.isArray(data)) {
      cachedDepotIds.value = data
    }
    return cachedDepotIds.value
  }

  async function fetchAvailableClients() {
    loadingMembers.value = true
    try {
      const depotIds = await ensureDepotIds()
      const { data } = await getClientIds(depotIds)
      if (data && Array.isArray(data)) {
        availableClients.value = [...new Set(data)]
      }
    } catch {
      // silently ignore
    } finally {
      loadingMembers.value = false
    }
  }

  async function fetchAvailableProducts() {
    loadingMembers.value = true
    try {
      const depotIds = await ensureDepotIds()
      const result = await getServersProducts(depotIds, 'LocalbootProduct')
      if (result.data && Array.isArray(result.data)) {
        availableProducts.value = [...new Set(result.data.map((p) => p.productId))]
      }
    } catch {
      // silently ignore
    } finally {
      loadingMembers.value = false
    }
  }

  async function ensureAvailableMembers() {
    if (activeGroupType.value === 'clients' && availableClients.value.length === 0) {
      await fetchAvailableClients()
    } else if (activeGroupType.value === 'products' && availableProducts.value.length === 0) {
      await fetchAvailableProducts()
    }
  }

  function cancelPanelForm() {
    isCreatingGroup.value = false
    isEditingGroup.value = false
    modalStatusMessage.value = null
    if (isMobile.value) showSidebar.value = panelFormPreviousSidebar
  }

  function openCreateModal(parentGroupId?: string) {
    if (isReadOnly.value) return
    if (isAddingMembers.value) cancelAddMembers()
    if (!isPanelFormOpen.value) panelFormPreviousSidebar = showSidebar.value
    createForm.groupId = ''
    createForm.parentGroupId = parentGroupId || ''
    createForm.description = ''
    createForm.notes = ''
    createAddMembersEnabled.value = false
    createMembersSearch.value = ''
    createMemberDisplayLimit.value = MEMBER_DISPLAY_LIMIT
    createSelectedMembers.value = []
    lastClickedCreateMember.value = null
    modalStatusMessage.value = null
    isEditingGroup.value = false
    isCreatingGroup.value = true
    if (isMobile.value) showSidebar.value = false
  }

  async function toggleCreateAddMembers(value: boolean) {
    createAddMembersEnabled.value = value
    if (!value) {
      createSelectedMembers.value = []
      createMembersSearch.value = ''
      return
    }
    if (activeGroupType.value === 'clients' && availableClients.value.length === 0) {
      await fetchAvailableClients()
    }
    if (activeGroupType.value === 'products' && availableProducts.value.length === 0) {
      await fetchAvailableProducts()
    }
  }

  function toggleCreateMemberSelection(item: string, event?: MouseEvent | KeyboardEvent) {
    if (event?.shiftKey && lastClickedCreateMember.value) {
      const list = filteredCreateMembers.value
      const from = list.indexOf(lastClickedCreateMember.value)
      const to = list.indexOf(item)
      if (from >= 0 && to >= 0) {
        const start = Math.min(from, to)
        const end = Math.max(from, to)
        const range = list.slice(start, end + 1)
        const allSelected = range.every((m) => createSelectedMembers.value.includes(m))
        if (allSelected) {
          createSelectedMembers.value = createSelectedMembers.value.filter((m) => !range.includes(m))
        } else {
          const newSet = new Set([...createSelectedMembers.value, ...range])
          createSelectedMembers.value = [...newSet]
        }
        lastClickedCreateMember.value = item
        return
      }
    }
    const idx = createSelectedMembers.value.indexOf(item)
    if (idx >= 0) {
      createSelectedMembers.value.splice(idx, 1)
    } else {
      createSelectedMembers.value.push(item)
    }
    lastClickedCreateMember.value = item
  }

  function toggleSelectAllCreateMembers() {
    const visibleMembers = filteredCreateMembers.value
    const allVisibleSelected = visibleMembers.every((member) => createSelectedMembers.value.includes(member))
    if (allVisibleSelected) {
      createSelectedMembers.value = createSelectedMembers.value.filter((member) => !visibleMembers.includes(member))
    } else {
      createSelectedMembers.value = [...new Set([...createSelectedMembers.value, ...visibleMembers])]
    }
  }

  function openEditModal(group: GroupTreeNodeData) {
    if (group.isSpecial || isReadOnly.value) return
    if (isAddingMembers.value) cancelAddMembers()
    if (!isPanelFormOpen.value) panelFormPreviousSidebar = showSidebar.value
    editForm.groupId = group.id
    editForm.parentGroupId = group.parentId || undefined
    editForm.description = group.description || ''
    editForm.notes = group.notes || ''
    modalStatusMessage.value = null
    isCreatingGroup.value = false
    isEditingGroup.value = true
    if (isMobile.value) showSidebar.value = false
  }

  async function doCreateGroup() {
    const groupId = createForm.groupId.trim()
    if (!groupId) return

    const targetIdLower = groupId.toLowerCase()
    const stack = [...currentTreeGroups.value]
    while (stack.length > 0) {
      const node = stack.pop()
      if (!node) break
      if (node.id.toLowerCase() === targetIdLower) {
        showStatus('error', `Group "${groupId}" already exists.`)
        return
      }
      if (node.children?.length) stack.push(...node.children)
    }

    saving.value = true
    try {
      const parentId = createForm.parentGroupId || undefined
      const createFn = activeGroupType.value === 'clients' ? createHostGroup : createProductGroup
      const createResult = await createFn({
        groupId,
        parentGroupId: parentId,
        description: createForm.description || undefined,
        notes: createForm.notes || undefined,
      })
      if (createResult?.error) throw createResult.error

      let memberAddError: unknown = null
      if (createAddMembersEnabled.value && createSelectedMembers.value.length > 0) {
        const addFn = activeGroupType.value === 'clients' ? addClientsToGroup : addProductsToGroup
        try {
          const addResult = await addFn(groupId, createSelectedMembers.value)
          if (addResult?.error) throw addResult.error
        } catch (err) {
          memberAddError = err
        }
      }

      isCreatingGroup.value = false
      await fetchCurrentGroups()

      if (parentId && parentId !== 'groups' && parentId !== 'clientdirectory') {
        await ensureGroupLoaded(parentId)
      }
      selectedGroup.value = findGroupById(currentTreeGroups.value, groupId)
      if (selectedGroup.value) expandGroupAndParents(groupId)
      if (isMobile.value) showSidebar.value = false

      if (memberAddError) {
        const details = memberAddError instanceof Error ? memberAddError.message : String($t('notify.error'))
        showStatus('error', `Group "${groupId}" created, but adding members failed: ${details}`)
      } else if (createAddMembersEnabled.value && createSelectedMembers.value.length > 0) {
        showStatus('success', `Group "${groupId}" created and ${createSelectedMembers.value.length} members added.`)
      } else {
        showStatus('success', String($t('notify.group.created', { group: groupId })))
      }
    } catch (e) {
      showStatus('error', e instanceof Error ? e.message : String($t('notify.error')))
    } finally {
      saving.value = false
    }
  }

  async function doEditGroup() {
    if (!editForm.groupId) return

    saving.value = true
    try {
      const parentId = editForm.parentGroupId || undefined
      const updateFn = activeGroupType.value === 'clients' ? updateHostGroup : updateProductGroup
      const updateResult = await updateFn(editForm.groupId, {
        parent: parentId,
        description: editForm.description || undefined,
        note: editForm.notes || undefined,
      })
      if (updateResult?.error) throw updateResult.error
      const editedGroupId = editForm.groupId
      isEditingGroup.value = false
      await fetchCurrentGroups()
      const updatedGroup = findGroupById(currentTreeGroups.value, editedGroupId)
      if (updatedGroup) {
        selectedGroup.value = updatedGroup
        expandGroupAndParents(editedGroupId)
      }
      if (isMobile.value) showSidebar.value = false
      showStatus('success', String($t('notify.group.updated', { group: editedGroupId })))
    } catch (e) {
      showStatus('error', e instanceof Error ? e.message : String($t('notify.error')))
    } finally {
      saving.value = false
    }
  }

  async function moveGroup(data: { groupId: string; parentId: string }) {
    if (data.groupId === data.parentId) return
    if (getChildGroupIds(currentTreeGroups.value, data.groupId).has(data.parentId)) {
      showStatus('error', String($t('groups.move.invalidTarget')))
      return
    }

    saving.value = true
    try {
      const updateFn = activeGroupType.value === 'clients' ? updateHostGroup : updateProductGroup
      await updateFn(data.groupId, { parent: data.parentId === 'groups' ? undefined : data.parentId })
      showStatus('success', String($t('notify.group.updated', { group: data.groupId })))
      await fetchCurrentGroups()
    } catch (e) {
      showStatus('error', e instanceof Error ? e.message : String($t('notify.error')))
    } finally {
      saving.value = false
    }
  }

  function handleRootGroupDrop(rootId: string, event: DragEvent) {
    if (!isGroupDropTarget(rootId) || isInvalidRootDrop(rootId)) return
    const groupId = event.dataTransfer?.getData('text/group-id')
    if (groupId) void moveGroup({ groupId, parentId: rootId })
  }

  function handleRootDragOver(rootId: string, event: DragEvent) {
    if (!isGroupDropTarget(rootId) || isInvalidRootDrop(rootId)) {
      if (event.dataTransfer) event.dataTransfer.dropEffect = 'none'
      return
    }
    event.preventDefault()
    if (event.dataTransfer) event.dataTransfer.dropEffect = 'move'
  }

  function isInvalidRootDrop(rootId: string): boolean {
    if (!draggedGroupId.value) return false
    return rootId === draggedGroupId.value || getChildGroupIds(currentTreeGroups.value, draggedGroupId.value).has(rootId)
  }

  function isGroupDropTarget(rootId: string): boolean {
    return rootId === 'groups' || (activeGroupType.value === 'clients' && rootId === 'clientdirectory')
  }

  function confirmDeleteGroup(group: GroupTreeNodeData) {
    if (group.isSpecial) return
    groupToDelete.value = group
    modalStatusMessage.value = null
    showDeleteModal.value = true
  }

  async function deleteGroup() {
    if (!groupToDelete.value) return

    deleting.value = true
    try {
      const deleteFn = activeGroupType.value === 'clients' ? deleteHostGroup : deleteProductGroup
      await deleteFn(groupToDelete.value.id)

      showStatus('success', String($t('notify.group.deleted', { group: groupToDelete.value.id })))
      showDeleteModal.value = false

      if (selectedGroup.value?.id === groupToDelete.value.id) {
        selectedGroup.value = null
      }

      await fetchCurrentGroups()
    } catch (e) {
      showStatus('error', e instanceof Error ? e.message : String($t('notify.error')))
    } finally {
      deleting.value = false
    }
  }

  function cancelAddMembers() {
    addTargetRequest++
    isAddingMembers.value = false
    loadingAddTarget.value = false
    addTargetLoaded.value = false
    memberTargetGroup.value = null
    selectedNewMembers.value = []
    lastClickedNewMember.value = null
    availableMembersSearch.value = ''
    modalStatusMessage.value = null
    if (isMobile.value) showSidebar.value = addMembersPreviousSidebar
  }

  async function openAddMembers(group: GroupTreeNodeData) {
    if (group.isSpecial || isReadOnly.value) return
    if (isPanelFormOpen.value) cancelPanelForm()
    const request = ++addTargetRequest
    if (!isAddingMembers.value) addMembersPreviousSidebar = showSidebar.value
    isAddingMembers.value = true
    loadingAddTarget.value = true
    addTargetLoaded.value = false
    selectedNewMembers.value = []
    availableMembersSearch.value = ''
    modalStatusMessage.value = null
    memberTargetGroup.value = group
    if (isMobile.value) showSidebar.value = false
    try {
      const loaded = await ensureGroupLoaded(group.id)
      if (request !== addTargetRequest) return
      memberTargetGroup.value = loaded || group
      await ensureAvailableMembers()
      if (request === addTargetRequest) addTargetLoaded.value = true
    } catch (error) {
      if (request === addTargetRequest) {
        modalStatusMessage.value = error instanceof Error ? error.message : String($t('notify.error'))
      }
    } finally {
      if (request === addTargetRequest) loadingAddTarget.value = false
    }
  }

  async function addSelectedMembers() {
    if (
      !isAddingMembers.value ||
      !addTargetLoaded.value ||
      !memberTargetGroup.value ||
      selectedNewMembers.value.length === 0 ||
      isReadOnly.value ||
      addingMembers.value
    )
      return

    const targetId = memberTargetGroup.value.id
    const targetLabel = memberTargetGroup.value.label
    const members = [...selectedNewMembers.value]
    const request = addTargetRequest
    addingMembers.value = true
    try {
      const addFn = activeGroupType.value === 'clients' ? addClientsToGroup : addProductsToGroup
      const result = await addFn(targetId, members)
      if (result?.error) throw result.error
      if (request !== addTargetRequest) return
      await fetchCurrentGroups()
      if (request !== addTargetRequest) return
      const target = await ensureGroupLoaded(targetId)
      if (request !== addTargetRequest) return
      selectedGroup.value = target || findGroupById(currentTreeGroups.value, targetId)
      if (!selectedGroup.value) throw new Error(String($t('groups.error')))
      memberSearchQuery.value = ''
      selectedMembers.value = []
      memberDisplayLimit.value = MEMBER_DISPLAY_LIMIT
      expandGroupAndParents(targetId)
      cancelAddMembers()
      if (isMobile.value) showSidebar.value = false
      showStatus('success', String($t('notify.members.added.group', { count: members.length, group: targetLabel })))
    } catch (e) {
      if (request === addTargetRequest) showStatus('error', e instanceof Error ? e.message : String($t('notify.error')))
    } finally {
      addingMembers.value = false
    }
  }

  async function removeSingleMember(memberId: string) {
    if (!selectedGroup.value || selectedGroup.value.isSpecial) return

    try {
      if (activeGroupType.value === 'clients') {
        await removeClientFromGroups(memberId, [selectedGroup.value.id])
      } else {
        await removeProductFromGroup(selectedGroup.value.id, memberId)
      }

      showStatus('success', String($t('notify.host.removed.group', { client: memberId })))
      await fetchCurrentGroups()

      const updated = findGroupById(currentTreeGroups.value, selectedGroup.value.id)
      if (updated) selectedGroup.value = updated
    } catch (e) {
      showStatus('error', e instanceof Error ? e.message : String($t('notify.error')))
    }
  }

  async function confirmRemoveAllMembers() {
    if (!selectedGroup.value || selectedGroup.value.isSpecial) return

    try {
      const removeFn = activeGroupType.value === 'clients' ? removeClientsFromGroup : removeProductsFromGroup
      await removeFn(selectedGroup.value.id)

      showStatus('success', String($t('notify.host.removed.group', { client: selectedGroup.value.label })))
      await fetchCurrentGroups()

      const updated = findGroupById(currentTreeGroups.value, selectedGroup.value.id)
      if (updated) selectedGroup.value = updated
    } catch (e) {
      showStatus('error', e instanceof Error ? e.message : String($t('notify.error')))
    }
  }

  function findGroupById(nodes: GroupTreeNodeData[], id: string): GroupTreeNodeData | null {
    for (const node of nodes) {
      if (node.id === id) return node
      if (node.children?.length) {
        const found = findGroupById(node.children, id)
        if (found) return found
      }
    }
    return null
  }

  function startResize(e: MouseEvent) {
    e.preventDefault()
    isResizing.value = true
    const startX = e.clientX
    const containerWidth = containerRef.value?.clientWidth || window.innerWidth
    const startPercent = sidebarWidthPercent.value

    const onMove = (e: MouseEvent) => {
      const delta = e.clientX - startX
      const deltaPercent = (delta / containerWidth) * 100
      const newPercent = Math.min(maxSidebarPercent, Math.max(minSidebarPercent, startPercent + deltaPercent))
      sidebarWidthPercent.value = Math.round(newPercent)
    }

    const onUp = () => {
      isResizing.value = false
      document.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseup', onUp)
    }

    document.addEventListener('mousemove', onMove)
    document.addEventListener('mouseup', onUp)
  }

  onMounted(() => {
    const checkMobile = () => {
      isMobile.value = window.innerWidth < 768
      if (isMobile.value) {
        showSidebar.value = true
      }
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    onUnmounted(() => window.removeEventListener('resize', checkMobile))

    const groupTab = route.query.groupTab as string | undefined
    if (groupTab === 'clients' || groupTab === 'products') {
      activeGroupType.value = groupTab
    }

    if (activeGroupType.value === 'clients') {
      cachedFetchClientGroups(false, selectionStore.selectedServers)
    } else {
      cachedFetchProductGroups()
    }
    void ensureAvailableMembers()
  })

  watch(activeGroupType, (newType) => {
    if (isAddingMembers.value) cancelAddMembers()
    if (isPanelFormOpen.value) cancelPanelForm()
    router.replace({ query: { ...(route.query as Record<string, string>), groupTab: newType } })
    selectedGroup.value = null
    searchQuery.value = ''
    memberSearchQuery.value = ''
    statusMessage.value = null

    if (isMobile.value) {
      showSidebar.value = true
    }

    if (newType === 'clients') {
      cachedFetchClientGroups(false, selectionStore.selectedServers)
    } else {
      cachedFetchProductGroups()
    }
    void ensureAvailableMembers()
  })

  watch(
    () => selectionStore.selectedServers.join(','),
    () => {
      if (isAddingMembers.value) cancelAddMembers()
      if (isPanelFormOpen.value) cancelPanelForm()
      if (activeGroupType.value === 'clients') {
        fetchCurrentGroups()
      }
    },
  )

  defineShortcuts({
    ctrl_enter: {
      usingInput: true,
      handler: (e) => {
        e.preventDefault()
        if (isReadOnly.value) return
        if (isCreatingGroup.value && createForm.groupId.trim()) {
          void doCreateGroup()
        }
        if (isEditingGroup.value) {
          void doEditGroup()
        }
        if (showDeleteModal.value) {
          deleteGroup()
        }
        if (isAddingMembers.value && selectedNewMembers.value.length !== 0) {
          void addSelectedMembers()
        }
      },
    },
    ctrl_escape: {
      usingInput: true,
      handler: (e) => {
        e.preventDefault()
        if (isPanelFormOpen.value) {
          cancelPanelForm()
        }
        if (showDeleteModal.value) {
          showDeleteModal.value = false
        }
        if (isAddingMembers.value) {
          cancelAddMembers()
        }
      },
    },
  })
</script>

<style scoped>
  .fade-enter-active,
  .fade-leave-active {
    transition: opacity 0.3s ease;
  }

  .fade-enter-from,
  .fade-leave-to {
    opacity: 0;
  }
</style>
