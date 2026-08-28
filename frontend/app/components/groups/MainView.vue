<!--
  This file is part of opsi-webgui application.
  opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
  Copyright (c) uib GmbH <info@uib.de> 2026
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
                ? 'bg-(--color-success)/10 border-(--color-success)/35 text-(--color-text)'
                : 'bg-(--color-error)/10 border-(--color-error)/35 text-(--color-text)',
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
            <CoreAppButton
              v-if="activeGroupType === 'products'"
              size="xs"
              variant="ghost"
              color="neutral"
              @click="openCreateModal()"
              :title="$t('groups.create')"
              :aria-label="String($t('groups.create'))"
              :disabled="isReadOnly"
            >
              <CoreAppStackedIcons :primary-icon="icons.group" :secondary-icon="icons.addBold" size="sm" badge badge-color="none" />
            </CoreAppButton>
          </div>
          <CoreAppFilterInput v-model="searchQuery" size="xs" input-class="w-full" />
        </div>
        <div v-if="loading" class="py-4 text-center">
          <CoreAppLoadingSpinner size="sm" />
        </div>
        <div v-else class="flex-1 overflow-auto p-1 space-y-0.5">
          <template v-for="rootGroup in filteredTreeGroups" :key="rootGroup.id">
            <div
              v-if="activeGroupType === 'clients'"
              class="flex items-center justify-between font-heading text-xs text-(--color-text) px-1 py-1 mt-1.5 first:mt-0.5 select-none"
            >
              <button
                type="button"
                class="flex items-center gap-1 flex-1 min-w-0 text-left bg-transparent border-0 p-0 cursor-pointer"
                @click="toggleCollapsedSection(rootGroup.id)"
              >
                <CoreAppIcon
                  :name="collapsedSections.has(rootGroup.id) ? icons.chevronRight : icons.chevronDown"
                  class="w-3.5 h-3.5 text-(--color-text-muted)"
                />
                <CoreAppTooltip
                  :text="
                    rootGroup.label === 'groups'
                      ? $t('groups.tooltip')
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
              </button>
              <CoreAppButton
                size="xs"
                variant="ghost"
                color="neutral"
                class="h-5! min-h-5! px-1!"
                :title="$t('groups.create')"
                :aria-label="String($t('groups.create'))"
                @click.stop="openCreateModal(rootGroup.id)"
              >
                <CoreAppStackedIcons :primary-icon="icons.group" :secondary-icon="icons.addBold" size="xs" badge badge-color="none" />
              </CoreAppButton>
            </div>
            <template v-if="activeGroupType !== 'clients' || !collapsedSections.has(rootGroup.id)">
              <GroupsActionsTreeNode
                v-for="g in activeGroupType === 'clients' ? rootGroup.children : [rootGroup]"
                :key="g.id"
                :group="g"
                :selected-id="selectedGroup?.id"
                :expanded-ids="expandedGroupIds"
                :group-type="activeGroupType"
                :is-root-level="activeGroupType === 'products'"
                :root-id="rootGroup.id"
                @select="selectGroup"
                @toggle="toggleExpand"
                @create-subgroup="openCreateModal"
                @edit="openEditModal"
                @delete="confirmDeleteGroup"
                @add-members="openAddMembersModal"
              />
            </template>
          </template>
          <div v-if="filteredTreeGroups.length === 0 && !loading" class="text-sm text-(--color-text-muted) px-2 py-4 text-center">
            {{ searchQuery ? $t('common.noResults') : $t('groups.none') }}
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

      <div class="flex-1 min-w-0 bg-(--color-background) overflow-hidden">
        <div v-if="selectedGroup" class="h-full min-h-0 flex flex-col">
          <div class="p-2 border-b border-(--color-border) flex items-center justify-between bg-(--color-background)">
            <div class="flex items-center gap-2">
              <CoreAppButton v-if="isMobile" :icon="icons.back" variant="ghost" color="neutral" size="xs" @click="showSidebar = true" />
              <span class="font-medium text-(--color-text)">{{ selectedGroup.label }}</span>
              <span v-if="selectedGroup.isSpecial" class="text-xs text-(--color-text-muted)"> ({{ $t('diag.systemGroup') }}) </span>
            </div>
            <div class="flex gap-1" v-if="!selectedGroup.isSpecial">
              <CoreAppButton
                :icon="icons.add"
                variant="ghost"
                color="neutral"
                size="xs"
                :title="$t('groups.membersAdd')"
                @click="openAddMembersModal(selectedGroup)"
                :disabled="isReadOnly"
              />
              <CoreAppButton
                variant="ghost"
                color="neutral"
                size="xs"
                :title="$t('groups.subgroup')"
                @click="openCreateModal(selectedGroup.id)"
                :disabled="isReadOnly"
              >
                <CoreAppStackedIcons :primary-icon="icons.group" :secondary-icon="icons.addBold" size="sm" badge badge-color="none" />
              </CoreAppButton>
              <CoreAppButton
                :icon="icons.pencil"
                variant="ghost"
                color="neutral"
                size="xs"
                :title="$t('common.edit')"
                @click="openEditModal(selectedGroup)"
                :disabled="isReadOnly"
              />
              <CoreAppButton
                :icon="icons.delete"
                variant="ghost"
                size="xs"
                color="neutral"
                :title="$t('common.delete')"
                @click="confirmDeleteGroup(selectedGroup)"
                :disabled="isReadOnly"
              />
            </div>
            <div class="flex gap-1" v-else-if="selectedGroup.isSpecial && activeGroupType === 'clients'">
              <CoreAppButton
                variant="ghost"
                color="neutral"
                size="xs"
                :title="$t('groups.subgroup')"
                @click="openCreateModal(selectedGroup.id)"
                :disabled="isReadOnly"
              >
                <CoreAppStackedIcons :primary-icon="icons.group" :secondary-icon="icons.addBold" size="sm" badge badge-color="none" />
              </CoreAppButton>
            </div>
          </div>

          <!-- eslint-disable-next-line vuejs-accessibility/no-static-element-interactions -- keyboard navigation container for member list (roving focus) -->
          <div class="flex-1 overflow-auto px-2 pb-2 pt-0 outline-none" tabindex="-1" @keydown="handleMemberListKeydown">
            <div class="border-(--color-border) bg-(--color-background)">
              <div
                class="sticky top-0 z-20 bg-(--color-background) pt-2 pb-1.5 border-b border-(--color-border)"
                style="background-color: var(--color-background)"
              >
                <div class="flex items-center justify-between mb-1.5">
                  <h2 class="text-xs font-heading uppercase tracking-wide text-(--color-text) m-0">
                    {{ $t('groups.members') }}
                    <span class="text-(--color-text-muted) font-normal">({{ (selectedGroup.members || []).length }})</span>
                  </h2>
                  <div class="flex items-center gap-2">
                    <CoreAppButton
                      v-if="selectedMembers.length > 0 && !selectedGroup.isSpecial"
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
                      v-if="(selectedGroup.members?.length || 0) > 0 && !selectedGroup.isSpecial"
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
                  v-if="(selectedGroup.members?.length || 0) > 5"
                  v-model="memberSearchQuery"
                  :placeholder="$t('groups.membersFilter') + '...'"
                  size="sm"
                  input-class="w-full mb-2"
                />
                <div v-if="filteredMembers.length > 0 && !selectedGroup.isSpecial" class="flex items-center gap-1.5 px-1 py-0.5 mb-0.5">
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
                <!-- eslint-disable-next-line vuejs-accessibility/no-static-element-interactions -- interactive list rows with role/keyboard handlers on each item -->
                <div
                  v-for="member in displayedMembers"
                  :key="member"
                  class="flex items-center gap-1.5 text-sm px-1 py-0.5 rounded transition-colors hover:bg-(--color-surface-hover) group/member cursor-pointer select-none"
                  :class="selectedMembersSet.has(member) ? 'bg-opsi-blue/5' : ''"
                  role="button"
                  tabindex="0"
                  @click="toggleMemberSelection(member, $event)"
                  @keydown.enter="toggleMemberSelection(member)"
                  @keydown.space.prevent="toggleMemberSelection(member)"
                >
                  <CoreAppCheckbox
                    v-if="!selectedGroup.isSpecial"
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
                    v-if="!selectedGroup.isSpecial"
                    :icon="icons.delete"
                    size="xs"
                    variant="ghost"
                    color="neutral"
                    :title="$t('common.remove')"
                    class="opacity-0 group-hover/member:opacity-100 transition-opacity shrink-0"
                    @click.stop="removeSingleMember(member)"
                  />
                </div>
                <div v-if="loadingSelectedGroupMembers" class="py-8 text-center">
                  <CoreAppLoadingSpinner size="sm" />
                </div>
                <div v-else-if="filteredMembers.length === 0" class="text-sm text-(--color-text-muted) py-4 text-center">
                  {{ memberSearchQuery ? $t('common.noResults') : $t('groups.membersNone') }}
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

        <CoreAppEmptyState v-else :icon="icons.group" :message="String($t('common.noSelection'))">
          <template v-if="isMobile" #actions>
            <CoreAppButton :icon="icons.back" variant="ghost" color="neutral" size="sm" @click="showSidebar = true">
              {{ $t('common.back') }}
            </CoreAppButton>
          </template>
        </CoreAppEmptyState>
      </div>
    </div>

    <CoreAppModal v-model:open="showCreateModal">
      <template #content>
        <CoreAppCard>
          <template #header>
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-3">
                <CoreAppIcon :name="icons.group" class="w-5 h-5 text-(--color-text-muted)" />
                <h3 class="text-sm font-heading uppercase tracking-wide text-(--color-text) m-0">
                  {{ $t('groups.create') }}
                </h3>
                <p v-if="createForm.parentGroupId" class="text-sm text-(--color-text-muted)">
                  {{ createForm.parentGroupId }}
                </p>
              </div>
              <CoreAppButton :icon="icons.x" variant="ghost" color="neutral" size="xs" @click="showCreateModal = false" />
            </div>
          </template>
          <CoreAppForm @submit="doCreateGroup" class="space-y-5">
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
            <CoreAppFormField>
              <div class="space-y-2">
                <div class="flex items-center gap-2 select-none">
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

                <div v-if="createAddMembersEnabled" class="space-y-2">
                  <CoreAppFilterInput v-model="createMembersSearch" size="sm" :placeholder="$t('groups.membersSearch')" />
                  <div class="border border-(--color-border) rounded-lg overflow-hidden">
                    <div class="max-h-40 overflow-auto">
                      <span
                        v-for="item in filteredCreateMembers"
                        :key="`create-${item}`"
                        class="flex items-center gap-2 px-3 py-2 hover:bg-(--color-surface-hover) cursor-pointer border-b border-(--color-border) last:border-b-0 text-(--color-text)"
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
                      </span>
                      <div v-if="filteredCreateMembers.length === 0" class="text-sm text-(--color-text-muted) py-3 text-center">
                        {{ createMembersSearch ? $t('common.noResults') : $t('common.noData') }}
                      </div>
                    </div>
                  </div>
                  <div class="flex items-center justify-between text-xs text-(--color-text-muted)">
                    <button type="button" class="underline decoration-dotted" @click="toggleSelectAllCreateMembers">
                      {{ $t('common.selectAll') }}
                    </button>
                    <span>{{ createSelectedMembers.length }} {{ $t('common.selected') }}</span>
                  </div>
                </div>
              </div>
            </CoreAppFormField>
          </CoreAppForm>
          <template #footer>
            <div class="flex justify-end gap-2">
              <CoreAppButton variant="outline" color="primary" @click="showCreateModal = false">
                {{ $t('common.cancel') }}
              </CoreAppButton>
              <CoreAppButton color="primary" :loading="saving" @click="doCreateGroup" :disabled="!createForm.groupId" :icon="icons.add">
                {{ $t('common.create') }}
              </CoreAppButton>
            </div>
          </template>
        </CoreAppCard>
      </template>
    </CoreAppModal>

    <CoreAppModal v-model:open="showEditModal">
      <template #content>
        <CoreAppCard>
          <template #header>
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-3">
                <CoreAppIcon :name="icons.pencil" class="w-5 h-5 text-(--color-text-muted)" />
                <h3 class="text-sm font-heading uppercase tracking-wide text-(--color-text) m-0">
                  {{ $t('groups.edit') }}
                </h3>
                <p class="text-sm text-(--color-text-muted)">{{ editForm.groupId }}</p>
              </div>
              <CoreAppButton :icon="icons.x" variant="ghost" color="neutral" size="xs" @click="showEditModal = false" />
            </div>
          </template>
          <CoreAppForm @submit="doEditGroup" class="space-y-5">
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
              <CoreAppSelect
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
          <template #footer>
            <div class="flex justify-end gap-2">
              <CoreAppButton variant="outline" color="primary" @click="showEditModal = false">
                {{ $t('common.cancel') }}
              </CoreAppButton>
              <CoreAppButton color="primary" :loading="saving" @click="doEditGroup" :icon="icons.check">
                {{ $t('common.save') }}
              </CoreAppButton>
            </div>
          </template>
        </CoreAppCard>
      </template>
    </CoreAppModal>

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

    <CoreAppModal v-model:open="showAddMembersModal">
      <template #content>
        <CoreAppCard class="min-w-100">
          <template #header>
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-3">
                <CoreAppIcon :name="icons.add" class="w-5 h-5 text-(--color-text-muted)" />
                <h3 class="text-sm font-heading uppercase tracking-wide text-(--color-text) m-0">
                  {{ $t('groups.membersAdd') }}
                </h3>
                <p class="text-sm text-(--color-text-muted)">{{ memberTargetGroup?.label }}</p>
              </div>
              <CoreAppButton :icon="icons.x" variant="ghost" color="neutral" size="xs" @click="showAddMembersModal = false" />
            </div>
          </template>
          <!-- eslint-disable-next-line vuejs-accessibility/no-static-element-interactions -- keyboard navigation container for available members list -->
          <div class="space-y-3" tabindex="-1" @keydown="handleAddMembersKeydown">
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
            <CoreAppFilterInput v-model="availableMembersSearch" size="sm" />
            <div v-if="loadingMembers" class="py-4 text-center">
              <CoreAppLoadingSpinner size="sm" />
            </div>
            <template v-else>
              <div class="flex items-center justify-between px-1">
                <span class="flex items-center gap-2 cursor-pointer">
                  <CoreAppCheckbox
                    :model-value="selectedNewMembers.length === filteredAvailableMembers.length && filteredAvailableMembers.length > 0"
                    :indeterminate="selectedNewMembers.length > 0 && selectedNewMembers.length < filteredAvailableMembers.length"
                    :aria-label="String($t('common.selectAll'))"
                    @update:model-value="toggleSelectAllNewMembers"
                  />
                  <span class="text-xs text-(--color-text-muted)">
                    {{ $t('common.selectAll') }}
                    <kbd
                      class="ml-1 px-1 py-0.5 text-xs text-(--color-text) bg-(--color-surface-hover) rounded border border-(--color-border)"
                      >Ctrl+A</kbd
                    >
                    <kbd
                      class="ml-1 px-1 py-0.5 text-xs text-(--color-text) bg-(--color-surface-hover) rounded border border-(--color-border)"
                      >Shift+Click</kbd
                    >
                  </span>
                </span>
                <span class="text-xs text-(--color-text-muted)">{{ selectedNewMembers.length }} {{ $t('common.selected') }}</span>
              </div>
              <div class="border border-(--color-border) rounded-lg overflow-hidden">
                <div class="max-h-60 overflow-auto">
                  <span
                    v-for="item in filteredAvailableMembers"
                    :key="item"
                    class="flex items-center gap-2 px-3 py-2 hover:bg-(--color-surface-hover) cursor-pointer border-b border-(--color-border) last:border-b-0 text-(--color-text)"
                    :class="selectedNewMembers.includes(item) ? 'bg-opsi-blue/5' : ''"
                  >
                    <CoreAppCheckbox
                      :model-value="selectedNewMembers.includes(item)"
                      :aria-label="item"
                      @update:model-value="toggleNewMemberSelection(item)"
                    />
                    <button
                      type="button"
                      class="text-sm truncate text-left bg-transparent border-0 p-0 flex-1 cursor-pointer"
                      @click.prevent="toggleNewMemberSelection(item, $event)"
                    >
                      {{ item }}
                    </button>
                  </span>
                  <div v-if="filteredAvailableMembers.length === 0" class="text-sm text-(--color-text-muted) py-4 text-center">
                    {{ availableMembersSearch ? $t('common.noResults') : $t('common.noData') }}
                  </div>
                </div>
              </div>
            </template>
          </div>
          <template #footer>
            <div class="flex justify-end gap-2">
              <CoreAppButton variant="outline" color="primary" @click="showAddMembersModal = false">{{
                $t('common.cancel')
              }}</CoreAppButton>
              <CoreAppButton
                color="primary"
                :loading="addingMembers"
                @click="addSelectedMembers"
                :disabled="selectedNewMembers.length === 0"
                :icon="icons.add"
              >
                {{ $t('common.add') }} ({{ selectedNewMembers.length }})
              </CoreAppButton>
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

  const icons = useIcons()
  const { t: $t } = useI18n()
  const route = useRoute()
  const router = useRouter()
  const selectionStore = useSelectionStore()
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
    const modalOpen = showCreateModal.value || showEditModal.value || showDeleteModal.value || showAddMembersModal.value
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

  const showCreateModal = ref(false)
  const showEditModal = ref(false)
  const showDeleteModal = ref(false)
  const showAddMembersModal = ref(false)
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
  const { layout: workspaceLayout } = useWorkspaceLayout()
  const sidebarWidthPercent = computed({
    get: () => workspaceLayout.groupsSidebarWidthPercent,
    set: (value: number) => {
      workspaceLayout.groupsSidebarWidthPercent = value
    },
  })
  const isResizing = ref(false)
  const minSidebarPercent = 20
  const maxSidebarPercent = 65
  const expandedGroupIds = ref<Set<string>>(new Set())
  const collapsedSections = ref<Set<string>>(new Set())

  const groupTypes = [
    { label: String($t('groups.client')), value: 'clients' },
    { label: String($t('groups.product')), value: 'products' },
  ]

  const currentTreeGroups = computed((): GroupTreeNodeData[] => {
    if (activeGroupType.value === 'clients') {
      return clientGroupsTree.value
    }
    const tree = productGroupsTree.value
    if (tree.length === 1 && tree[0]?.isRoot) {
      return tree[0].children || []
    }
    return tree
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

  const filteredMembers = computed(() => {
    if (!selectedGroup.value) return []
    const members = selectedGroup.value.members || []
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
    return available.slice(0, 100)
  })

  const filteredCreateMembers = computed(() => {
    const allAvailable = activeGroupType.value === 'clients' ? availableClients.value : availableProducts.value
    let available = allAvailable
    if (createMembersSearch.value.trim()) {
      const query = createMembersSearch.value.toLowerCase()
      available = available.filter((m) => m.toLowerCase().includes(query))
    }
    return available.slice(0, 100)
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
          items.push({ label: `${indent}${node.id}`, value: node.id })
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
    if (selectedGroup.value?.id === group.id) {
      selectedGroup.value = null
      selectedMembers.value = []
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

  function toggleNewMemberSelection(item: string, event?: MouseEvent | KeyboardEvent) {
    if (event?.shiftKey && lastClickedNewMember.value) {
      const list = filteredAvailableMembers.value
      const from = list.indexOf(lastClickedNewMember.value)
      const to = list.indexOf(item)
      if (from >= 0 && to >= 0) {
        const start = Math.min(from, to)
        const end = Math.max(from, to)
        const range = list.slice(start, end + 1)
        const allSelected = range.every((m) => selectedNewMembers.value.includes(m))
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
    if (selectedNewMembers.value.length === filteredAvailableMembers.value.length) {
      selectedNewMembers.value = []
    } else {
      selectedNewMembers.value = [...filteredAvailableMembers.value]
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

  function openCreateModal(parentGroupId?: string) {
    createForm.groupId = ''
    createForm.parentGroupId = parentGroupId || ''
    createForm.description = ''
    createForm.notes = ''
    createAddMembersEnabled.value = false
    createMembersSearch.value = ''
    createSelectedMembers.value = []
    lastClickedCreateMember.value = null
    modalStatusMessage.value = null
    showCreateModal.value = true
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
    if (createSelectedMembers.value.length === filteredCreateMembers.value.length) {
      createSelectedMembers.value = []
    } else {
      createSelectedMembers.value = [...filteredCreateMembers.value]
    }
  }

  function openEditModal(group: GroupTreeNodeData) {
    if (group.isSpecial) return
    editForm.groupId = group.id
    editForm.parentGroupId = group.parentId || undefined
    editForm.description = group.description || ''
    editForm.notes = group.notes || ''
    modalStatusMessage.value = null
    showEditModal.value = true
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

      showCreateModal.value = false
      await fetchCurrentGroups()

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
      await updateFn(editForm.groupId, {
        parent: parentId,
        description: editForm.description || undefined,
        note: editForm.notes || undefined,
      })
      showStatus('success', String($t('notify.group.updated', { group: editForm.groupId })))
      showEditModal.value = false
      await fetchCurrentGroups()
    } catch (e) {
      showStatus('error', e instanceof Error ? e.message : String($t('notify.error')))
    } finally {
      saving.value = false
    }
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

  async function openAddMembersModal(group: GroupTreeNodeData) {
    if (group.isSpecial) return
    memberTargetGroup.value = group
    selectedNewMembers.value = []
    availableMembersSearch.value = ''
    modalStatusMessage.value = null
    showAddMembersModal.value = true
    if (activeGroupType.value === 'clients' && availableClients.value.length === 0) {
      await fetchAvailableClients()
    } else if (activeGroupType.value === 'products' && availableProducts.value.length === 0) {
      await fetchAvailableProducts()
    }
  }

  async function addSelectedMembers() {
    if (!memberTargetGroup.value || selectedNewMembers.value.length === 0) return

    addingMembers.value = true
    try {
      const addFn = activeGroupType.value === 'clients' ? addClientsToGroup : addProductsToGroup
      await addFn(memberTargetGroup.value.id, selectedNewMembers.value)

      showStatus('success', String($t('notify.client.added.group', { group: memberTargetGroup.value.label })))
      showAddMembersModal.value = false
      await fetchCurrentGroups()

      if (selectedGroup.value?.id === memberTargetGroup.value.id) {
        const updated = findGroupById(currentTreeGroups.value, selectedGroup.value.id)
        if (updated) selectedGroup.value = updated
      }
    } catch (e) {
      showStatus('error', e instanceof Error ? e.message : String($t('notify.error')))
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
  })

  watch(activeGroupType, (newType) => {
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
  })

  watch(
    () => selectionStore.selectedServers.join(','),
    () => {
      if (activeGroupType.value === 'clients') {
        fetchCurrentGroups()
      }
    },
  )
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
