<template>
    <LayoutsPageLayout :loading="loading" :showSearch="false" show-refresh @refresh="fetchCurrentGroups">
        <template #tabs>
            <div class="flex items-center gap-3">
                <SharedTabsNav v-model="activeGroupType" :tabs="groupTypes" />
                <Transition name="fade">
                    <div v-if="statusMessage" :class="[
                        'flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm',
                        statusMessage.type === 'success'
                            ? 'bg-(--color-opsi-success)/15 text-(--color-opsi-success)'
                            : 'bg-(--color-opsi-error)/15 text-(--color-opsi-error)'
                    ]">
                        <UIcon :name="statusMessage.type === 'success' ? icons.checkCircle : icons.exclamationCircle"
                            class="w-4 h-4 shrink-0" />
                        <span>{{ statusMessage.text }}</span>
                        <button type="button" class="ml-1 opacity-60 hover:opacity-100" @click="statusMessage = null">
                            <UIcon :name="icons.close" class="w-3.5 h-3.5" />
                        </button>
                    </div>
                </Transition>
            </div>
        </template>

        <div ref="containerRef" class="flex h-full min-h-0 relative" style="min-height: 400px;">
            <div :style="{ width: isMobile ? '100%' : `${sidebarWidthPercent}%` }"
                class="shrink-0 border-r border-(--color-border) bg-(--color-background) flex flex-col transition-[width] duration-100"
                :class="{
                    'absolute inset-0 z-20': isMobile,
                    'hidden': isMobile && !showSidebar
                }">
                <div class="p-3 border-b border-(--color-border) space-y-2">
                    <div class="flex items-center justify-between">
                        <span class="text-sm font-medium text-(--color-text)">{{ activeGroupType === 'clients' ?
                            $t('client-group') :
                            $t('product-group') }}</span>
                        <UButton v-if="activeGroupType === 'products'" :icon="icons.group" size="xs" variant="ghost"
                            color="neutral" @click="openCreateModal()" :title="$t('createGroup')" />
                    </div>
                    <UInput v-model="searchQuery" :placeholder="$t('typeToFilter')" size="sm"
                        :leading-icon="icons.filter" class="w-full" />
                </div>
                <div v-if="loading" class="py-4 text-center">
                    <UIcon :name="icons.loading" class="w-5 h-5 animate-spin text-(--color-text-muted)" />
                </div>
                <div v-else class="flex-1 overflow-auto p-2 space-y-0.5">
                    <template v-for="rootGroup in filteredTreeGroups" :key="rootGroup.id">
                        <div v-if="activeGroupType === 'clients'"
                            class="flex items-center justify-between text-sm font-semibold text-(--color-text) px-2 py-2 mt-3 first:mt-1 cursor-pointer select-none"
                            @click="collapsedSections.has(rootGroup.id) ? collapsedSections.delete(rootGroup.id) : collapsedSections.add(rootGroup.id)">
                            <div class="flex items-center gap-1.5">
                                <UIcon :name="collapsedSections.has(rootGroup.id) ? icons.arrowRight : icons.arrowDown"
                                    class="w-3.5 h-3.5 text-(--color-text-muted)" />
                                <UTooltip
                                    :text="rootGroup.label === 'groups' ? $t('groupsTooltip') : rootGroup.label === 'clientdirectory' ? $t('clientDirectoryTooltip') : ''">
                                    <span class="cursor-help border-b border-dashed border-(--color-text-muted)/40">{{
                                        rootGroup.label === 'groups' ? $t('Groups') : rootGroup.label ===
                                            'clientdirectory'
                                            ?
                                            $t('clientDirectory') : rootGroup.label }}</span>
                                </UTooltip>
                            </div>
                            <UButton :icon="icons.group" size="xs" variant="ghost" color="neutral"
                                :title="$t('createGroup')" @click.stop="openCreateModal(rootGroup.id)" />
                        </div>
                        <template v-if="activeGroupType !== 'clients' || !collapsedSections.has(rootGroup.id)">
                            <GroupsActionsTreeNode
                                v-for="g in (activeGroupType === 'clients' ? rootGroup.children : [rootGroup])"
                                :key="g.id" :group="g" :selected-id="selectedGroup?.id" :expanded-ids="expandedGroupIds"
                                :group-type="activeGroupType" :is-root-level="activeGroupType === 'products'"
                                :root-id="rootGroup.id" @select="selectGroup" @toggle="toggleExpand"
                                @create-subgroup="openCreateModal" @edit="openEditModal" @delete="confirmDeleteGroup"
                                @add-members="openAddMembersModal" />
                        </template>
                    </template>
                    <div v-if="filteredTreeGroups.length === 0 && !loading"
                        class="text-sm text-(--color-text-muted) px-2 py-4 text-center">
                        {{ searchQuery ? $t('noSearchResults') : $t('noGroupsFound') }}
                    </div>
                </div>
            </div>

            <div v-if="!isMobile" @mousedown="startResize"
                class="w-1 cursor-col-resize bg-transparent hover:bg-opsi-blue/30 active:bg-opsi-blue/50 transition-colors shrink-0 relative group">
                <div
                    class="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-16 bg-gray-300 dark:bg-gray-600 rounded group-hover:bg-opsi-blue transition-colors" />
            </div>

            <div class="flex-1 min-w-0 bg-(--color-background) overflow-auto">
                <div v-if="selectedGroup" class="h-full flex flex-col">
                    <div
                        class="p-3 border-b border-(--color-border) flex items-center justify-between bg-(--color-background)">
                        <div class="flex items-center gap-2">
                            <UButton v-if="isMobile" :icon="icons.back" variant="ghost" color="neutral" size="xs"
                                @click="showSidebar = true" />
                            <span class="font-medium text-(--color-text)">{{ selectedGroup.label }}</span>
                            <span v-if="selectedGroup.isSpecial" class="text-xs text-(--color-text-muted)">
                                ({{ $t('systemGroup') }})
                            </span>
                        </div>
                        <div class="flex gap-1" v-if="!selectedGroup.isSpecial">
                            <UButton :icon="icons.add" variant="ghost" color="neutral" size="xs"
                                :title="$t('addMembers')" @click="openAddMembersModal(selectedGroup)" />
                            <UButton :icon="icons.group" variant="ghost" color="neutral" size="xs"
                                :title="$t('addSubgroup')" @click="openCreateModal(selectedGroup.id)" />
                            <UButton :icon="icons.edit" variant="ghost" color="neutral" size="xs" :title="$t('edit')"
                                @click="openEditModal(selectedGroup)" />
                            <UButton :icon="icons.delete" variant="ghost" size="xs" color="neutral"
                                :title="$t('delete')" @click="confirmDeleteGroup(selectedGroup)" />
                        </div>
                        <div class="flex gap-1" v-else-if="selectedGroup.isSpecial && activeGroupType === 'clients'">
                            <UButton :icon="icons.add" variant="ghost" color="neutral" size="xs"
                                :title="$t('addSubgroup')" @click="openCreateModal(selectedGroup.id)" />
                        </div>
                    </div>

                    <div class="flex-1 overflow-auto p-4 space-y-4 outline-none" tabindex="-1"
                        @keydown="handleMemberListKeydown">
                        <div class="pt-4 border-(--color-border)">
                            <div class="flex items-center justify-between mb-3">
                                <h4 class="text-sm font-medium text-(--color-text)">
                                    {{ $t('groupMembers') }}
                                    <span class="text-(--color-text-muted) font-normal">({{ (selectedGroup.members ||
                                        []).length
                                        }})</span>
                                </h4>
                                <div class="flex items-center gap-2">
                                    <UButton v-if="selectedMembers.length > 0 && !selectedGroup.isSpecial"
                                        :icon="icons.delete" size="xs" variant="soft" color="error"
                                        @click="removeSelectedMembers">
                                        {{ $t('remove') }} ({{ selectedMembers.length }})
                                    </UButton>
                                    <UButton v-if="(selectedGroup.members?.length || 0) > 0 && !selectedGroup.isSpecial"
                                        :icon="icons.delete" size="xs" variant="ghost" color="neutral"
                                        :title="$t('removeAllMembers')" @click="confirmRemoveAllMembers">
                                        {{ $t('removeAll') }}
                                    </UButton>
                                </div>
                            </div>
                            <UInput v-if="(selectedGroup.members?.length || 0) > 5" v-model="memberSearchQuery"
                                :placeholder="$t('filterMembers') + '...'" size="sm" class="mb-2" />
                            <div v-if="filteredMembers.length > 0 && !selectedGroup.isSpecial"
                                class="flex items-center gap-2 px-2 py-1 mb-1">
                                <input type="checkbox"
                                    :checked="selectedMembers.length === filteredMembers.length && filteredMembers.length > 0"
                                    :indeterminate="selectedMembers.length > 0 && selectedMembers.length < filteredMembers.length"
                                    class="rounded text-opsi-blue" @change="toggleSelectAllMembers" />
                                <span class="text-xs text-(--color-text-muted)">
                                    {{ selectedMembers.length > 0 ? `${selectedMembers.length} ${$t('selected')}` :
                                        $t('selectAll') }}
                                    <kbd
                                        class="ml-1 px-1 py-0.5 text-[10px] bg-(--color-surface-hover) rounded border border-(--color-border)">Ctrl+A</kbd>
                                    <kbd
                                        class="ml-1 px-1 py-0.5 text-[10px] bg-(--color-surface-hover) rounded border border-(--color-border)">Shift+Click</kbd>
                                </span>
                            </div>
                            <div class="space-y-0 overflow-auto" style="max-height: 60vh;">
                                <div v-for="member in displayedMembers" :key="member"
                                    class="flex items-center gap-2 text-sm px-2 py-1.5 rounded transition-colors hover:bg-(--color-surface-hover) group/member cursor-pointer select-none"
                                    :class="selectedMembers.includes(member) ? 'bg-opsi-blue/5' : ''"
                                    @click="!selectedGroup.isSpecial && toggleMemberSelection(member, $event)">
                                    <input v-if="!selectedGroup.isSpecial" type="checkbox"
                                        :checked="selectedMembers.includes(member)"
                                        class="rounded text-opsi-blue shrink-0" @click.stop />
                                    <UIcon :name="activeGroupType === 'clients' ? icons.client : icons.product"
                                        class="w-4 h-4 text-(--color-text-muted) shrink-0" />
                                    <span class="flex-1 truncate text-(--color-text)">{{ member }}</span>
                                    <UButton v-if="!selectedGroup.isSpecial" :icon="icons.delete" size="xs"
                                        variant="ghost" color="neutral" :title="$t('remove')"
                                        class="opacity-0 group-hover/member:opacity-100 transition-opacity shrink-0"
                                        @click="removeSingleMember(member)" />
                                </div>
                                <div v-if="filteredMembers.length === 0"
                                    class="text-sm text-(--color-text-muted) py-4 text-center">
                                    {{ memberSearchQuery ? $t('noSearchResults') : $t('noMembers') }}
                                </div>
                                <button v-else-if="hasMoreMembers" type="button"
                                    class="w-full py-2 text-xs text-center text-(--color-primary) hover:bg-(--color-surface-hover) rounded transition-colors"
                                    @click="showMoreMembers">
                                    {{ $t('showMore') }} ({{ filteredMembers.length - memberDisplayLimit }} {{
                                        $t('remaining')
                                    }})
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <div v-else class="h-full flex items-center justify-center">
                    <div class="text-center text-(--color-text-muted) py-8">
                        <UButton v-if="isMobile" :icon="icons.back" variant="ghost" color="neutral" size="sm"
                            class="mb-3" @click="showSidebar = true">
                            {{ $t('back') }}
                        </UButton>
                        <UIcon :name="icons.group" class="w-12 h-12 mx-auto mb-3 opacity-50" />
                        <p>{{ $t('message.noItemsSelected') }}</p>
                    </div>
                </div>
            </div>
        </div>

        <UModal v-model:open="showCreateModal">
            <template #content>
                <UCard>
                    <template #header>
                        <div class="flex items-center justify-between">
                            <div class="flex items-center gap-3">
                                <UIcon :name="icons.group" class="w-5 h-5 text-opsi-blue" />
                                <h3 class="font-semibold text-(--color-text)">{{ $t('createGroup') }}</h3>
                                <p v-if="createForm.parentGroupId" class="text-sm text-(--color-text-muted)">
                                    {{ createForm.parentGroupId }}</p>
                            </div>
                            <UButton :icon="icons.close" variant="ghost" color="neutral" size="xs"
                                @click="showCreateModal = false" />
                        </div>
                    </template>
                    <form @submit.prevent="doCreateGroup" class="space-y-5">
                        <UFormField :label="$t('groupId')" required>
                            <UInput v-model="createForm.groupId" :placeholder="$t('groupId')" class="w-full"
                                autofocus />
                        </UFormField>
                        <UFormField :label="$t('description')">
                            <UTextarea v-model="createForm.description" :placeholder="$t('description')" :rows="2"
                                class="w-full" />
                        </UFormField>
                        <UFormField :label="$t('notes')">
                            <UTextarea v-model="createForm.notes" :placeholder="$t('notes')" :rows="2" class="w-full" />
                        </UFormField>
                    </form>
                    <template #footer>
                        <div class="flex justify-end gap-2">
                            <UButton variant="soft" color="neutral" @click="showCreateModal = false">
                                {{ $t('cancel') }}
                            </UButton>
                            <UButton color="primary" :loading="saving" @click="doCreateGroup"
                                :disabled="!createForm.groupId" :icon="icons.add">
                                {{ $t('create') }}
                            </UButton>
                        </div>
                    </template>
                </UCard>
            </template>
        </UModal>

        <UModal v-model:open="showEditModal">
            <template #content>
                <UCard>
                    <template #header>
                        <div class="flex items-center justify-between">
                            <div class="flex items-center gap-3">
                                <UIcon :name="icons.edit" class="w-5 h-5 text-opsi-blue" />
                                <h3 class="font-semibold text-(--color-text)">{{ $t('editGroup') }}</h3>
                                <p class="text-sm text-(--color-text-muted)">{{ editForm.groupId }}</p>
                            </div>
                            <UButton :icon="icons.close" variant="ghost" color="neutral" size="xs"
                                @click="showEditModal = false" />
                        </div>
                    </template>
                    <form @submit.prevent="doEditGroup" class="space-y-5">
                        <UFormField :label="$t('parentGroup')" class="add-border">
                            <USelect v-model="editForm.parentGroupId" :items="editParentGroupSelectItems"
                                :placeholder="$t('none')" class="w-full" />
                        </UFormField>
                        <UFormField :label="$t('description')">
                            <UTextarea v-model="editForm.description" :rows="2" class="w-full" />
                        </UFormField>
                        <UFormField :label="$t('notes')">
                            <UTextarea v-model="editForm.notes" :rows="2" class="w-full" />
                        </UFormField>
                    </form>
                    <template #footer>
                        <div class="flex justify-end gap-2">
                            <UButton variant="soft" color="neutral" @click="showEditModal = false">
                                {{ $t('cancel') }}
                            </UButton>
                            <UButton color="primary" :loading="saving" @click="doEditGroup" :icon="icons.save">
                                {{ $t('save') }}
                            </UButton>
                        </div>
                    </template>
                </UCard>
            </template>
        </UModal>

        <UModal v-model:open="showDeleteModal">
            <template #content>
                <UCard>
                    <template #header>
                        <div class="flex items-center justify-between">
                            <div class="flex items-center gap-3">
                                <UIcon :name="icons.delete" class="w-5 h-5 text-(--color-opsi-error)" />
                                <h3 class="font-semibold text-(--color-text)">{{ $t('confirmDelete') }}</h3>
                                <p class="text-sm text-(--color-text-muted)">{{ groupToDelete?.id }}</p>
                            </div>
                            <UButton :icon="icons.close" variant="ghost" color="neutral" size="xs"
                                @click="showDeleteModal = false" />
                        </div>
                    </template>
                    <p class="text-sm text-(--color-text)">
                        {{ $t('message.confirmDeleteGroup', { groupId: groupToDelete?.id || '' }) }}
                    </p>
                    <template #footer>
                        <div class="flex justify-end gap-2">
                            <UButton variant="soft" color="neutral" @click="showDeleteModal = false">{{ $t('cancel')
                                }}
                            </UButton>
                            <UButton color="neutral" :loading="deleting" @click="deleteGroup" :icon="icons.delete">{{
                                $t('delete') }}</UButton>
                        </div>
                    </template>
                </UCard>
            </template>
        </UModal>

        <UModal v-model:open="showAddMembersModal">
            <template #content>
                <UCard class="min-w-100">
                    <template #header>
                        <div class="flex items-center justify-between">
                            <div class="flex items-center gap-3">
                                <UIcon :name="icons.add" class="w-5 h-5 text-opsi-blue" />
                                <h3 class="font-semibold text-(--color-text)">{{ $t('addMembers') }}</h3>
                                <p class="text-sm text-(--color-text-muted)">{{ memberTargetGroup?.label }}</p>
                            </div>
                            <UButton :icon="icons.close" variant="ghost" color="neutral" size="xs"
                                @click="showAddMembersModal = false" />
                        </div>
                    </template>
                    <div class="space-y-3" tabindex="-1" @keydown="handleAddMembersKeydown">
                        <UInput v-model="availableMembersSearch" :placeholder="$t('typeToFilter')" size="sm"
                            :leading-icon="icons.filter" autofocus />
                        <div v-if="loadingMembers" class="py-4 text-center">
                            <UIcon :name="icons.loading" class="w-5 h-5 animate-spin text-(--color-text-muted)" />
                            <p class="text-sm text-(--color-text-muted) mt-2">{{ $t('message.loading') }}</p>
                        </div>
                        <template v-else>
                            <div class="flex items-center justify-between px-1">
                                <label class="flex items-center gap-2 cursor-pointer">
                                    <input type="checkbox"
                                        :checked="selectedNewMembers.length === filteredAvailableMembers.length && filteredAvailableMembers.length > 0"
                                        :indeterminate="selectedNewMembers.length > 0 && selectedNewMembers.length < filteredAvailableMembers.length"
                                        class="rounded text-opsi-blue" @change="toggleSelectAllNewMembers" />
                                    <span class="text-xs text-(--color-text-muted)">
                                        {{ $t('selectAll') }}
                                        <kbd
                                            class="ml-1 px-1 py-0.5 text-[10px] bg-(--color-surface-hover) rounded border border-(--color-border)">Ctrl+A</kbd>
                                        <kbd
                                            class="ml-1 px-1 py-0.5 text-[10px] bg-(--color-surface-hover) rounded border border-(--color-border)">Shift+Click</kbd>
                                    </span>
                                </label>
                                <span class="text-xs text-(--color-text-muted)">{{ selectedNewMembers.length }} {{
                                    $t('selected') }}</span>
                            </div>
                            <div class="border border-(--color-border) rounded-lg overflow-hidden">
                                <div class="max-h-60 overflow-auto">
                                    <label v-for="item in filteredAvailableMembers" :key="item"
                                        class="flex items-center gap-2 px-3 py-2 hover:bg-(--color-surface-hover) cursor-pointer border-b border-(--color-border) last:border-b-0 text-(--color-text)"
                                        :class="selectedNewMembers.includes(item) ? 'bg-opsi-blue/5' : ''"
                                        @click.prevent="toggleNewMemberSelection(item, $event)">
                                        <input type="checkbox" :checked="selectedNewMembers.includes(item)"
                                            class="rounded text-opsi-blue" />
                                        <span class="text-sm truncate">{{ item }}</span>
                                    </label>
                                    <div v-if="filteredAvailableMembers.length === 0"
                                        class="text-sm text-(--color-text-muted) py-4 text-center">
                                        {{ availableMembersSearch ? $t('noSearchResults') : $t('noItemsAvailable') }}
                                    </div>
                                </div>
                            </div>
                        </template>
                    </div>
                    <template #footer>
                        <div class="flex justify-end gap-2">
                            <UButton variant="soft" color="neutral" @click="showAddMembersModal = false">{{
                                $t('cancel') }}</UButton>
                            <UButton color="primary" :loading="addingMembers" @click="addSelectedMembers"
                                :disabled="selectedNewMembers.length === 0" :icon="icons.add">
                                {{ $t('add') }} ({{ selectedNewMembers.length }})
                            </UButton>
                        </div>
                    </template>
                </UCard>
            </template>
        </UModal>
    </LayoutsPageLayout>
</template>

<script setup lang="ts">
import type { GroupTreeNodeData } from '~/types'
import { useSelectionStore } from '~/stores/selectionStore'

definePageMeta({ layout: 'default' })

const icons = useIcons()
const { t: $t } = useI18n()
const selectionStore = useSelectionStore()
const {
    getClientIds,
    getServerIds,
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
    removeProductFromGroup
} = useApiHelpers()

const activeGroupType = ref<'clients' | 'products'>('clients')
const selectedGroup = ref<GroupTreeNodeData | null>(null)
const loading = computed(() => selectionStore.clientGroupsLoading || selectionStore.productGroupsLoading)
const loadingMembers = ref(false)

const availableClients = shallowRef<string[]>([])
const availableProducts = shallowRef<string[]>([])
const cachedDepotIds = ref<string[]>([])

const searchQuery = ref('')
const debouncedSearchQuery = ref('')
let _searchDebounce: ReturnType<typeof setTimeout> | null = null
watch(searchQuery, (q) => {
    if (_searchDebounce) clearTimeout(_searchDebounce)
    _searchDebounce = setTimeout(() => { debouncedSearchQuery.value = q }, 180)
})
const memberSearchQuery = ref('')

const statusMessage = ref<{ type: 'success' | 'error'; text: string } | null>(null)
let statusTimer: ReturnType<typeof setTimeout> | null = null

function showStatus(type: 'success' | 'error', text: string) {
    if (statusTimer) clearTimeout(statusTimer)
    statusMessage.value = { type, text }
    statusTimer = setTimeout(() => { statusMessage.value = null }, 5000)
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
    notes: ''
})

const editForm = reactive({
    groupId: '',
    parentGroupId: undefined as string | undefined,
    description: '',
    notes: ''
})

const availableMembersSearch = ref('')
const selectedNewMembers = ref<string[]>([])
const selectedMembers = ref<string[]>([])
const lastClickedMember = ref<string | null>(null)
const lastClickedNewMember = ref<string | null>(null)

const containerRef = ref<HTMLElement | null>(null)
const isMobile = ref(false)
const showSidebar = ref(true)
const sidebarWidthPercent = ref(25)
const isResizing = ref(false)
const minSidebarPercent = 15
const maxSidebarPercent = 50
const expandedGroupIds = ref<Set<string>>(new Set())
const collapsedSections = ref<Set<string>>(new Set())

const groupTypes = [
    { label: String($t('client-group')), value: 'clients' },
    { label: String($t('product-group')), value: 'products' },
]

const currentTreeGroups = computed((): GroupTreeNodeData[] => {
    if (activeGroupType.value === 'clients') {
        return selectionStore.clientGroupsTree
    }
    // For products, the store stores [rootGroupsNode]; we want its children
    const tree = selectionStore.productGroupsTree
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

// Auto-expand matching groups when debounced search query changes
watch(debouncedSearchQuery, (q) => {
    if (!q.trim()) return
    const query = q.toLowerCase()
    const ids = expandedGroupIds.value
    let changed = false
    function expandMatching(nodes: GroupTreeNodeData[]) {
        for (const node of nodes) {
            if (node.children?.length) {
                const hasMatch = node.children.some(c => (c.label || c.id).toLowerCase().includes(query))
                if (hasMatch && !ids.has(node.id)) { ids.add(node.id); changed = true }
                expandMatching(node.children)
            }
        }
    }
    expandMatching(currentTreeGroups.value)
    if (changed) expandedGroupIds.value = new Set(ids)
})

const MEMBER_DISPLAY_LIMIT = 200
const memberDisplayLimit = ref(MEMBER_DISPLAY_LIMIT)

const filteredMembers = computed(() => {
    if (!selectedGroup.value) return []
    const members = selectedGroup.value.members || []
    if (!memberSearchQuery.value.trim()) return members
    const query = memberSearchQuery.value.toLowerCase()
    return members.filter(m => m.toLowerCase().includes(query))
})

const displayedMembers = computed(() => filteredMembers.value.slice(0, memberDisplayLimit.value))
const hasMoreMembers = computed(() => filteredMembers.value.length > memberDisplayLimit.value)

function showMoreMembers() {
    memberDisplayLimit.value += MEMBER_DISPLAY_LIMIT
}

const filteredAvailableMembers = computed(() => {
    if (!memberTargetGroup.value) return []
    const currentMembers = new Set(memberTargetGroup.value.members || [])
    const allAvailable = activeGroupType.value === 'clients' ? availableClients.value : availableProducts.value
    let available = allAvailable.filter(m => !currentMembers.has(m))

    if (availableMembersSearch.value.trim()) {
        const query = availableMembersSearch.value.toLowerCase()
        available = available.filter(m => m.toLowerCase().includes(query))
    }
    return available.slice(0, 100)
})

const editParentGroupSelectItems = computed(() => {
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
    function findAndCollect(nodes: GroupTreeNodeData[], collecting: boolean) {
        for (const node of nodes) {
            if (node.id === parentId) {
                collectAll(node.children || [], result)
            } else if (node.children?.length) {
                findAndCollect(node.children, collecting)
            }
        }
    }

    function collectAll(nodes: GroupTreeNodeData[], set: Set<string>) {
        for (const node of nodes) {
            set.add(node.id)
            if (node.children?.length) collectAll(node.children, set)
        }
    }
    findAndCollect(nodes, false)
    return result
}

function expandGroupAndParents(groupId: string) {
    const newSet = new Set(expandedGroupIds.value)
    newSet.add(groupId)
    expandedGroupIds.value = newSet
}

function toggleExpand(groupId: string) {
    const newSet = new Set(expandedGroupIds.value)
    if (newSet.has(groupId)) {
        newSet.delete(groupId)
    } else {
        newSet.add(groupId)
    }
    expandedGroupIds.value = newSet
}

function selectGroup(group: GroupTreeNodeData) {
    if (selectedGroup.value?.id === group.id) {
        selectedGroup.value = null
        selectedMembers.value = []
        const newSet = new Set(expandedGroupIds.value)
        newSet.delete(group.id)
        expandedGroupIds.value = newSet
        return
    }
    selectedGroup.value = group
    memberSearchQuery.value = ''
    selectedMembers.value = []
    memberDisplayLimit.value = MEMBER_DISPLAY_LIMIT
    expandGroupAndParents(group.id)
    if (isMobile.value) {
        showSidebar.value = false
    }
}

function toggleMemberSelection(member: string, event?: MouseEvent) {
    if (event?.shiftKey && lastClickedMember.value) {
        const list = filteredMembers.value
        const from = list.indexOf(lastClickedMember.value)
        const to = list.indexOf(member)
        if (from >= 0 && to >= 0) {
            const start = Math.min(from, to)
            const end = Math.max(from, to)
            const range = list.slice(start, end + 1)
            const allSelected = range.every(m => selectedMembers.value.includes(m))
            if (allSelected) {
                selectedMembers.value = selectedMembers.value.filter(m => !range.includes(m))
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

function toggleNewMemberSelection(item: string, event?: MouseEvent) {
    if (event?.shiftKey && lastClickedNewMember.value) {
        const list = filteredAvailableMembers.value
        const from = list.indexOf(lastClickedNewMember.value)
        const to = list.indexOf(item)
        if (from >= 0 && to >= 0) {
            const start = Math.min(from, to)
            const end = Math.max(from, to)
            const range = list.slice(start, end + 1)
            const allSelected = range.every(m => selectedNewMembers.value.includes(m))
            if (allSelected) {
                selectedNewMembers.value = selectedNewMembers.value.filter(m => !range.includes(m))
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
        // Parallelize removal — batch concurrent API calls
        const BATCH_SIZE = 10
        for (let i = 0; i < members.length; i += BATCH_SIZE) {
            const batch = members.slice(i, i + BATCH_SIZE)
            await Promise.all(batch.map(memberId =>
                activeGroupType.value === 'clients'
                    ? removeClientFromGroups(memberId, [groupId])
                    : removeProductFromGroup(groupId, memberId)
            ))
        }

        showStatus('success', String($t('message.successfullyDeletedClientFromGroup', { client: `${members.length}` })))
        selectedMembers.value = []
        await fetchCurrentGroups()
        const updated = findGroupById(currentTreeGroups.value, selectedGroup.value.id)
        if (updated) selectedGroup.value = updated
    } catch (e) {
        console.error('Failed to remove selected members:', e)
        showStatus('error', e instanceof Error ? e.message : String($t('message.error.general')))
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
            await selectionStore.fetchClientGroups(true)
        } else {
            await selectionStore.fetchProductGroups(true)
        }
    } catch (err) {
        showStatus('error', err instanceof Error ? err.message : String($t('errorFetchingGroups')))
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
            availableClients.value = data
        }
    } catch (err) {
        console.error('Failed to fetch clients:', err)
    } finally {
        loadingMembers.value = false
    }
}

async function fetchAvailableProducts() {
    loadingMembers.value = true
    try {
        const depotIds = await ensureDepotIds()
        const { $customFetch } = useNuxtApp() as unknown as {
            $customFetch: <T>(url: string, opts?: { method?: string; body?: unknown }) => Promise<T>
        }
        const depotParam = encodeURIComponent(`[${depotIds.join(',')}]`)
        const data = await $customFetch<Array<{ productId: string }>>(`/opsidata/depots/products?selectedServers=${depotParam}&productType=LocalbootProduct`)
        if (data && Array.isArray(data)) {
            availableProducts.value = data.map(p => p.productId)
        }
    } catch (err) {
        console.error('Failed to fetch products:', err)
    } finally {
        loadingMembers.value = false
    }
}

function openCreateModal(parentGroupId?: string) {
    createForm.groupId = ''
    createForm.parentGroupId = parentGroupId || ''
    createForm.description = ''
    createForm.notes = ''
    showCreateModal.value = true
}

function openEditModal(group: GroupTreeNodeData) {
    if (group.isSpecial) return
    editForm.groupId = group.id
    editForm.parentGroupId = group.parentId || undefined
    editForm.description = group.description || ''
    editForm.notes = group.notes || ''
    showEditModal.value = true
}

async function doCreateGroup() {
    if (!createForm.groupId) return

    saving.value = true
    try {
        const parentId = createForm.parentGroupId || undefined
        const createFn = activeGroupType.value === 'clients' ? createHostGroup : createProductGroup
        await createFn({
            groupId: createForm.groupId,
            parentGroupId: parentId,
            description: createForm.description || undefined,
            notes: createForm.notes || undefined
        })
        showStatus('success', String($t('message.successfullyCreatedGroup', { group: createForm.groupId })))
        showCreateModal.value = false
        await fetchCurrentGroups()
    } catch (e) {
        console.error('Failed to create group:', e)
        showStatus('error', e instanceof Error ? e.message : String($t('message.error.general')))
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
            note: editForm.notes || undefined
        })
        showStatus('success', String($t('message.successfullyUpdatedGroup', { group: editForm.groupId })))
        showEditModal.value = false
        await fetchCurrentGroups()
    } catch (e) {
        console.error('Failed to update group:', e)
        showStatus('error', e instanceof Error ? e.message : String($t('message.error.general')))
    } finally {
        saving.value = false
    }
}

function confirmDeleteGroup(group: GroupTreeNodeData) {
    if (group.isSpecial) return
    groupToDelete.value = group
    showDeleteModal.value = true
}

async function deleteGroup() {
    if (!groupToDelete.value) return

    deleting.value = true
    try {
        const deleteFn = activeGroupType.value === 'clients' ? deleteHostGroup : deleteProductGroup
        await deleteFn(groupToDelete.value.id)

        showStatus('success', String($t('message.successfullyDeletedGroup', { group: groupToDelete.value.id })))
        showDeleteModal.value = false

        if (selectedGroup.value?.id === groupToDelete.value.id) {
            selectedGroup.value = null
        }

        await fetchCurrentGroups()
    } catch (e) {
        console.error('Failed to delete group:', e)
        showStatus('error', e instanceof Error ? e.message : String($t('message.error.general')))
    } finally {
        deleting.value = false
    }
}

async function openAddMembersModal(group: GroupTreeNodeData) {
    if (group.isSpecial) return
    memberTargetGroup.value = group
    selectedNewMembers.value = []
    availableMembersSearch.value = ''
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

        showStatus('success', String($t('message.successfullyAddedClientsToGroup', { group: memberTargetGroup.value.label })))
        showAddMembersModal.value = false
        await fetchCurrentGroups()

        if (selectedGroup.value?.id === memberTargetGroup.value.id) {
            const updated = findGroupById(currentTreeGroups.value, selectedGroup.value.id)
            if (updated) selectedGroup.value = updated
        }
    } catch (e) {
        console.error('Failed to add members:', e)
        showStatus('error', e instanceof Error ? e.message : String($t('message.error.general')))
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

        showStatus('success', String($t('message.successfullyDeletedClientFromGroup', { client: memberId })))
        await fetchCurrentGroups()

        const updated = findGroupById(currentTreeGroups.value, selectedGroup.value.id)
        if (updated) selectedGroup.value = updated
    } catch (e) {
        console.error('Failed to remove member:', e)
        showStatus('error', e instanceof Error ? e.message : String($t('message.error.general')))
    }
}

async function confirmRemoveAllMembers() {
    if (!selectedGroup.value || selectedGroup.value.isSpecial) return

    try {
        const removeFn = activeGroupType.value === 'clients' ? removeClientsFromGroup : removeProductsFromGroup
        await removeFn(selectedGroup.value.id)

        showStatus('success', String($t('message.successfullyDeletedClientFromGroup', { client: selectedGroup.value.label })))
        await fetchCurrentGroups()

        const updated = findGroupById(currentTreeGroups.value, selectedGroup.value.id)
        if (updated) selectedGroup.value = updated
    } catch (e) {
        console.error('Failed to remove all members:', e)
        showStatus('error', e instanceof Error ? e.message : String($t('message.error.general')))
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
    // Fetch groups from store (respects cache — only calls API if data is missing)
    if (activeGroupType.value === 'clients') {
        selectionStore.fetchClientGroups()
    } else {
        selectionStore.fetchProductGroups()
    }
})

// Auto-expand root nodes when store tree data changes
watch(() => selectionStore.clientGroupsTree, (tree) => {
    if (tree.length) {
        const ids = new Set(expandedGroupIds.value)
        tree.forEach(t => ids.add(t.id))
        expandedGroupIds.value = ids
    }
}, { immediate: true })

watch(() => selectionStore.productGroupsTree, (tree) => {
    if (tree.length) {
        const ids = new Set(expandedGroupIds.value)
        // For products, expand the children of the root "groups" node
        const root = tree.length === 1 && tree[0]?.isRoot ? tree[0] : null
        const nodes = root?.children?.length ? root.children : tree
        nodes.forEach(t => ids.add(t.id))
        expandedGroupIds.value = ids
    }
}, { immediate: true })

watch(activeGroupType, () => {
    selectedGroup.value = null
    searchQuery.value = ''
    memberSearchQuery.value = ''
    statusMessage.value = null

    if (isMobile.value) {
        showSidebar.value = true
    }

    // Ensure data is loaded (respects store cache)
    if (activeGroupType.value === 'clients') {
        selectionStore.fetchClientGroups()
    } else {
        selectionStore.fetchProductGroups()
    }
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
