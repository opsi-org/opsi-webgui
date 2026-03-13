<!--
This file is part of opsi-webgui application.
opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
Copyright (c) uib GmbH <info@uib.de> 2026
All rights reserved.
License: AGPL-3.0
-->
<template>
    <LayoutsPageLayout :loading="loading" :showSearch="false" @refresh="fetchGroups">
        <template #tabs>
            <SharedTabsNav v-model="activeGroupType" :tabs="groupTypes" />
        </template>
        <template #actions>
            <UButton :icon="icons.add" color="primary" size="sm" @click="openCreateModal()">
                <span class="hidden sm:inline">{{ $t('group-add') }}</span>
            </UButton>
        </template>

        <!-- Error State -->
        <UAlert v-if="error" color="error" :title="$t('error')" :description="error"
            :close-button="{ icon: icons.close, color: 'error', variant: 'link' }" @close="error = null" class="mb-4" />

        <div ref="containerRef" class="flex h-full min-h-0 relative" style="min-height: 400px;">
            <!-- Tree sidebar (resizable) -->
            <div :style="{ width: isMobile ? '100%' : `${sidebarWidthPercent}%` }"
                class="shrink-0 border-r border-(--color-border) bg-white dark:bg-(--color-surface) flex flex-col transition-[width] duration-100"
                :class="{
                    'absolute inset-0 z-20': isMobile,
                    'hidden': isMobile && !showSidebar
                }">
                <div class="p-3 border-b border-(--color-border) flex items-center justify-between">
                    <span class="text-sm font-medium">{{ activeGroupType === 'clients' ? $t('client-group') :
                        $t('product-group') }}</span>
                    <UButton :icon="icons.add" size="xs" variant="ghost" color="neutral" @click="openCreateModal()" />
                </div>
                <div v-if="loading" class="py-4 text-center">
                    <UIcon name="i-heroicons-arrow-path" class="w-5 h-5 animate-spin text-(--color-text-muted)" />
                </div>
                <div v-else class="flex-1 overflow-auto p-2 space-y-1">
                    <!-- Tree view for groups with subgroups -->
                    <GroupTreeNodeItem v-for="g in treeGroups" :key="g.id" :group="g" :selected-id="selectedGroup?.id"
                        :expanded-ids="expandedGroupIds" @select="selectGroup" @toggle="toggleExpand"
                        @create-subgroup="openCreateModal" @edit="openEditModal" @delete="confirmDeleteGroup" />
                    <div v-if="treeGroups.length === 0" class="text-sm text-(--color-text-muted) px-2 py-4 text-center">
                        {{ $t('noGroupsFound') }}
                    </div>
                </div>
            </div>

            <!-- Resize handle (desktop only) -->
            <div v-if="!isMobile" @mousedown="startResize"
                class="w-1 cursor-col-resize bg-transparent hover:bg-opsi-blue/30 active:bg-opsi-blue/50 transition-colors shrink-0 relative group">
                <div
                    class="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-16 bg-gray-300 dark:bg-gray-600 rounded group-hover:bg-opsi-blue transition-colors" />
            </div>

            <!-- Group details panel -->
            <div class="flex-1 min-w-0 bg-(--color-background) overflow-auto">
                <div v-if="selectedGroup" class="h-full flex flex-col">
                    <div
                        class="p-3 border-b border-(--color-border) flex items-center justify-between bg-white dark:bg-(--color-surface)">
                        <span class="font-medium">{{ selectedGroup.name }}</span>
                        <div class="flex gap-1">
                            <UButton :icon="icons.add" variant="ghost" color="neutral" size="xs"
                                :title="$t('addSubgroup')" @click="openCreateModal(selectedGroup.id)" />
                            <UButton :icon="icons.edit" variant="ghost" color="neutral" size="xs" :title="$t('edit')"
                                @click="openEditModal(selectedGroup)" />
                            <UButton :icon="icons.delete" variant="ghost" size="xs" color="error" :title="$t('delete')"
                                @click="confirmDeleteGroup(selectedGroup)" />
                        </div>
                    </div>
                    <div class="flex-1 overflow-auto p-4 space-y-4">
                        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <span class="text-sm text-(--color-text-muted)">{{ $t('groupId') }}</span>
                                <p class="font-medium">{{ selectedGroup.id }}</p>
                            </div>
                            <div>
                                <span class="text-sm text-(--color-text-muted)">{{ activeGroupType === 'clients' ?
                                    $t('clients') : $t('products') }}</span>
                                <p class="font-medium">{{ selectedGroup.count }}</p>
                            </div>
                            <div v-if="selectedGroup.parentGroupId">
                                <span class="text-sm text-(--color-text-muted)">{{ $t('parentGroup') }}</span>
                                <p class="font-medium">{{ selectedGroup.parentGroupId }}</p>
                            </div>
                            <div class="sm:col-span-2">
                                <span class="text-sm text-(--color-text-muted)">{{ $t('description') }}</span>
                                <p>{{ selectedGroup.description || '-' }}</p>
                            </div>
                        </div>

                        <div class="pt-4 border-t border-(--color-border)">
                            <div class="flex items-center justify-between mb-3">
                                <h4 class="text-sm font-medium">{{ $t('groupMembers') }}</h4>
                                <UButton v-if="selectedGroup.members.length > 0" :icon="icons.delete" size="xs"
                                    variant="ghost" color="error" :title="$t('removeAllMembers')"
                                    @click="confirmRemoveAllMembers">
                                    {{ $t('removeAll') }}
                                </UButton>
                            </div>
                            <div class="space-y-1">
                                <div v-for="member in selectedGroup.members" :key="member"
                                    class="flex items-center gap-2 text-sm px-2 py-1.5 bg-(--color-surface) rounded group">
                                    <UIcon :name="activeGroupType === 'clients' ? icons.client : icons.product"
                                        class="w-4 h-4 text-(--color-text-muted)" />
                                    <span class="flex-1 truncate">{{ member }}</span>
                                    <UButton :icon="icons.close" size="xs" variant="ghost" color="error"
                                        class="opacity-0 group-hover:opacity-100 transition-opacity"
                                        @click="removeMemberFromGroup(member)" />
                                </div>
                                <div v-if="selectedGroup.members.length === 0"
                                    class="text-sm text-(--color-text-muted) py-4 text-center">
                                    {{ $t('noMembers') }}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div v-else class="h-full flex items-center justify-center">
                    <div class="text-center text-(--color-text-muted) py-8">
                        <UIcon :name="icons.group" class="w-12 h-12 mx-auto mb-3 opacity-50" />
                        <p>{{ $t('message.noItemsSelected') }}</p>
                    </div>
                </div>
            </div>
        </div>

        <!-- Create/Edit Group Modal -->
        <UModal v-model:open="showGroupModal">
            <template #content>
                <UCard>
                    <template #header>
                        <div class="flex items-center gap-2">
                            <UIcon :name="isEditing ? icons.edit : icons.add" class="w-5 h-5 text-opsi-blue" />
                            <span class="font-medium">{{ isEditing ? $t('editGroup') : $t('createGroup') }}</span>
                        </div>
                    </template>
                    <form @submit.prevent="saveGroup" class="space-y-4">
                        <UFormField :label="$t('groupId')" required>
                            <UInput v-model="groupForm.groupId" :placeholder="$t('groupId')" :disabled="isEditing"
                                class="w-full" />
                        </UFormField>
                        <UFormField v-if="groupForm.parentGroupId || !isEditing" :label="$t('parentGroup')">
                            <USelect v-model="groupForm.parentGroupId"
                                :items="parentGroupOptions.map(g => ({ label: g, value: g }))" :placeholder="$t('none')"
                                class="w-full" />
                        </UFormField>
                        <UFormField :label="$t('description')">
                            <UTextarea v-model="groupForm.description" :placeholder="$t('description')" :rows="3"
                                class="w-full" />
                        </UFormField>
                        <UFormField :label="$t('notes')">
                            <UTextarea v-model="groupForm.notes" :placeholder="$t('notes')" :rows="2" class="w-full" />
                        </UFormField>
                    </form>
                    <template #footer>
                        <div class="flex justify-end gap-2">
                            <UButton variant="ghost" color="neutral" @click="showGroupModal = false">{{ $t('cancel') }}
                            </UButton>
                            <UButton color="primary" :loading="saving" @click="saveGroup"
                                :disabled="!groupForm.groupId">
                                {{ isEditing ? $t('save') : $t('create') }}
                            </UButton>
                        </div>
                    </template>
                </UCard>
            </template>
        </UModal>

        <!-- Delete Confirmation Modal -->
        <UModal v-model:open="showDeleteModal">
            <template #content>
                <UCard>
                    <template #header>
                        <div class="flex items-center gap-2 text-red-600">
                            <UIcon name="i-heroicons-exclamation-triangle" class="w-5 h-5" />
                            <span class="font-medium">{{ $t('confirmDelete') }}</span>
                        </div>
                    </template>
                    <p class="text-sm">
                        {{ $t('message.confirmDeleteGroup', { groupId: groupToDelete?.id || '' }) }}
                    </p>
                    <template #footer>
                        <div class="flex justify-end gap-2">
                            <UButton variant="ghost" color="neutral" @click="showDeleteModal = false">{{ $t('cancel') }}
                            </UButton>
                            <UButton color="error" :loading="deleting" @click="deleteGroup">{{ $t('delete') }}</UButton>
                        </div>
                    </template>
                </UCard>
            </template>
        </UModal>
    </LayoutsPageLayout>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'default' })

interface GroupItem {
    id: string
    name: string
    description: string
    notes?: string
    count: number
    members: string[]
    parentGroupId?: string | null
}

const icons = useIcons()
const { t: $t } = useI18n()
const toast = useToast()
const {
    getHostGroups,
    getProductGroups,
    createHostGroup,
    createProductGroup,
    updateHostGroup,
    updateProductGroup,
    deleteHostGroup,
    deleteProductGroup,
    removeClientsFromGroup,
    removeProductsFromGroup
} = useApiHelpers()

const activeGroupType = ref<'clients' | 'products'>('clients')
const selectedGroup = ref<GroupItem | null>(null)
const loading = ref(false)
const error = ref<string | null>(null)
const clientGroups = ref<GroupItem[]>([])
const productGroups = ref<GroupItem[]>([])

// Modal state
const showGroupModal = ref(false)
const showDeleteModal = ref(false)
const isEditing = ref(false)
const saving = ref(false)
const deleting = ref(false)
const groupToDelete = ref<GroupItem | null>(null)
const groupForm = reactive({
    groupId: '',
    parentGroupId: '' as string | undefined,
    description: '',
    notes: ''
})

// Resizable panel state
const containerRef = ref<HTMLElement | null>(null)
const isMobile = ref(false)
const showSidebar = ref(true)
const sidebarWidthPercent = ref(25)
const isResizing = ref(false)
const minSidebarPercent = 15
const maxSidebarPercent = 50
const expandedGroupIds = ref<Set<string>>(new Set())

const groupTypes = [
    { label: String($t('client-group')), value: 'clients' },
    { label: String($t('product-group')), value: 'products' },
]

const currentGroups = computed(() => {
    return activeGroupType.value === 'clients' ? clientGroups.value : productGroups.value
})

// Build tree structure from flat list
interface GroupTreeItem extends GroupItem {
    children: GroupTreeItem[]
    level: number
}

const treeGroups = computed(() => {
    const groups = currentGroups.value
    const groupMap = new Map<string, GroupTreeItem>()
    const rootGroups: GroupTreeItem[] = []

    // First pass: Create tree items
    for (const g of groups) {
        groupMap.set(g.id, { ...g, children: [], level: 0 })
    }

    // Second pass: Build hierarchy
    for (const g of groups) {
        const treeItem = groupMap.get(g.id)!
        if (g.parentGroupId && groupMap.has(g.parentGroupId)) {
            const parent = groupMap.get(g.parentGroupId)!
            treeItem.level = parent.level + 1
            parent.children.push(treeItem)
        } else {
            rootGroups.push(treeItem)
        }
    }

    return rootGroups
})

function toggleExpand(groupId: string) {
    const newSet = new Set(expandedGroupIds.value)
    if (newSet.has(groupId)) {
        newSet.delete(groupId)
    } else {
        newSet.add(groupId)
    }
    expandedGroupIds.value = newSet
}

const parentGroupOptions = computed(() => {
    const groups = currentGroups.value
    const currentId = groupForm.groupId
    return groups.filter(g => g.id !== currentId).map(g => g.id)
})

// Select group and show sidebar on mobile
function selectGroup(group: GroupItem) {
    selectedGroup.value = group
    if (isMobile.value) {
        showSidebar.value = false
    }
}

// Group CRUD operations
function openCreateModal(parentGroupId?: string) {
    isEditing.value = false
    groupForm.groupId = ''
    groupForm.parentGroupId = parentGroupId
    groupForm.description = ''
    groupForm.notes = ''
    showGroupModal.value = true
}

function openEditModal(group: GroupItem) {
    isEditing.value = true
    groupForm.groupId = group.id
    groupForm.parentGroupId = group.parentGroupId || undefined
    groupForm.description = group.description
    groupForm.notes = group.notes || ''
    showGroupModal.value = true
}

async function saveGroup() {
    if (!groupForm.groupId) return

    saving.value = true
    try {
        const groupData = {
            groupId: groupForm.groupId,
            parentGroupId: groupForm.parentGroupId || undefined,
            description: groupForm.description || undefined,
            notes: groupForm.notes || undefined
        }

        if (isEditing.value) {
            // Update existing group
            const updateFn = activeGroupType.value === 'clients' ? updateHostGroup : updateProductGroup
            await updateFn(groupForm.groupId, {
                parent: groupForm.parentGroupId,
                description: groupForm.description,
                note: groupForm.notes
            })
            toast.add({ title: String($t('success')), description: String($t('message.groupUpdated')), color: 'success' })
        } else {
            // Create new group
            const createFn = activeGroupType.value === 'clients' ? createHostGroup : createProductGroup
            await createFn(groupData)
            toast.add({ title: String($t('success')), description: String($t('message.groupCreated')), color: 'success' })
        }

        showGroupModal.value = false
        await fetchGroups()
    } catch (e) {
        console.error('Failed to save group:', e)
        toast.add({
            title: String($t('error')),
            description: e instanceof Error ? e.message : String($t('message.failedToSaveGroup')),
            color: 'error'
        })
    } finally {
        saving.value = false
    }
}

function confirmDeleteGroup(group: GroupItem) {
    groupToDelete.value = group
    showDeleteModal.value = true
}

async function deleteGroup() {
    if (!groupToDelete.value) return

    deleting.value = true
    try {
        const deleteFn = activeGroupType.value === 'clients' ? deleteHostGroup : deleteProductGroup
        await deleteFn(groupToDelete.value.id)

        toast.add({ title: String($t('success')), description: String($t('message.groupDeleted')), color: 'success' })
        showDeleteModal.value = false

        if (selectedGroup.value?.id === groupToDelete.value.id) {
            selectedGroup.value = null
        }

        await fetchGroups()
    } catch (e) {
        console.error('Failed to delete group:', e)
        toast.add({
            title: String($t('error')),
            description: e instanceof Error ? e.message : String($t('message.failedToDeleteGroup')),
            color: 'error'
        })
    } finally {
        deleting.value = false
    }
}

async function removeMemberFromGroup(memberId: string) {
    if (!selectedGroup.value) return

    try {
        // For now, update the local state - API implementation may vary
        const removeFn = activeGroupType.value === 'clients' ? removeClientsFromGroup : removeProductsFromGroup
        await removeFn(selectedGroup.value.id)

        toast.add({ title: String($t('success')), description: String($t('message.memberRemoved')), color: 'success' })
        await fetchGroups()

        // Update selected group
        const updated = currentGroups.value.find(g => g.id === selectedGroup.value?.id)
        if (updated) selectedGroup.value = updated
    } catch (e) {
        console.error('Failed to remove member:', e)
        toast.add({ title: String($t('error')), description: String($t('message.failedToRemoveMember')), color: 'error' })
    }
}

async function confirmRemoveAllMembers() {
    if (!selectedGroup.value) return

    try {
        const removeFn = activeGroupType.value === 'clients' ? removeClientsFromGroup : removeProductsFromGroup
        await removeFn(selectedGroup.value.id)

        toast.add({ title: String($t('success')), description: String($t('message.allMembersRemoved')), color: 'success' })
        await fetchGroups()

        // Update selected group
        const updated = currentGroups.value.find(g => g.id === selectedGroup.value?.id)
        if (updated) selectedGroup.value = updated
    } catch (e) {
        console.error('Failed to remove all members:', e)
        toast.add({ title: String($t('error')), description: String($t('message.failedToRemoveMembers')), color: 'error' })
    }
}

// Resize handling
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

// Check for mobile on mount
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
    fetchGroups()
})

// Transform RPC tree data to flat GroupItem format
function flattenGroupTree(tree: Record<string, unknown>, parentId: string | null = null, result: Array<{ id: string; description: string; notes: string; parentGroupId: string | null }> = []): typeof result {
    if (!tree || typeof tree !== 'object') return result

    const nodeId = String(tree.id || tree.ident || '').split(';')[0] || ''
    const nodeText = String(tree.text || tree.name || nodeId)
    const nodeType = String(tree.type || '')
    const description = String(tree.description || '')
    const notes = String(tree.notes || '')

    // Skip root/special nodes and ObjectToGroup entries
    const isRoot = nodeText === 'clientdirectory' || nodeText === 'groups' || nodeId === 'clientdirectory' || nodeId === 'groups'
    const isObjectMapping = nodeType === 'ObjectToGroup'

    if (!isRoot && !isObjectMapping && nodeId) {
        result.push({ id: nodeId, description, notes, parentGroupId: parentId })
    }

    // Recursively process children
    const children = tree.children as Record<string, unknown> | unknown[] | undefined
    if (children) {
        const childEntries = Array.isArray(children) ? children : Object.values(children)
        for (const child of childEntries) {
            if (child && typeof child === 'object' && (child as Record<string, unknown>).type !== 'ObjectToGroup') {
                const newParentId = (!isRoot && !isObjectMapping && nodeId) ? nodeId : parentId
                flattenGroupTree(child as Record<string, unknown>, newParentId, result)
            }
        }
    }

    return result
}

// Extract members from tree data
function extractMembers(tree: Record<string, unknown>, currentGroupId?: string, result: Array<{ groupId: string; objectId: string }> = []): typeof result {
    if (!tree || typeof tree !== 'object') return result

    const nodeId = String(tree.id || tree.ident || '').split(';')[0] || currentGroupId || ''
    const nodeText = String(tree.text || tree.name || nodeId)
    const nodeType = String(tree.type || '')

    // If this node represents an object-to-group relationship, add it
    if (nodeType === 'ObjectToGroup' && currentGroupId) {
        const objectId = nodeText || nodeId
        if (objectId) {
            result.push({ groupId: currentGroupId, objectId })
        }
    }

    // Recursively process children
    const children = tree.children as Record<string, unknown> | unknown[] | undefined
    if (children) {
        const childEntries = Array.isArray(children) ? children : Object.values(children)
        const isRoot = nodeText === 'clientdirectory' || nodeText === 'groups' || nodeId === 'clientdirectory' || nodeId === 'groups'
        const groupIdToPass = (nodeType !== 'ObjectToGroup' && !isRoot && nodeId) ? nodeId : currentGroupId
        for (const child of childEntries) {
            if (child && typeof child === 'object') {
                extractMembers(child as Record<string, unknown>, groupIdToPass, result)
            }
        }
    }

    return result
}

// Transform RPC data to GroupItem format
function transformGroupData(groups: Array<{ id: string; description: string; notes: string; parentGroupId: string | null }>,
    members: Array<{ groupId: string; objectId: string }>): GroupItem[] {
    return groups.map(g => {
        const groupMembers = members.filter(m => m.groupId === g.id).map(m => m.objectId)
        return {
            id: g.id,
            name: g.id, // Use ID as name since that's what we have
            description: g.description || '',
            notes: g.notes || '',
            count: groupMembers.length,
            members: groupMembers.slice(0, 50), // Show first 50 members
            parentGroupId: g.parentGroupId
        }
    })
}

const fetchGroups = async () => {
    loading.value = true
    error.value = null
    try {
        // Fetch both types of groups via RPC (more reliable than REST endpoints)
        const [hostData, productData] = await Promise.all([
            getHostGroups(),
            getProductGroups()
        ])

        // Transform and set client groups
        if (hostData.data) {
            const tree = hostData.data.clientdirectory || hostData.data.groups
            if (tree && typeof tree === 'object') {
                const flatGroups = flattenGroupTree(tree as Record<string, unknown>)
                const members = extractMembers(tree as Record<string, unknown>)
                clientGroups.value = transformGroupData(flatGroups, members)
            }
        }

        // Transform and set product groups
        if (productData.data?.groups && typeof productData.data.groups === 'object') {
            const flatGroups = flattenGroupTree(productData.data.groups as Record<string, unknown>)
            const members = extractMembers(productData.data.groups as Record<string, unknown>)
            productGroups.value = transformGroupData(flatGroups, members)
        }

        // Set default placeholder if nothing returned
        if (clientGroups.value.length === 0) {
            clientGroups.value = [{ id: 'clientdirectory', name: 'All Clients', description: 'Root client group', count: 0, members: [] }]
        }
        if (productGroups.value.length === 0) {
            productGroups.value = [{ id: 'groups', name: 'All Products', description: 'Root product group', count: 0, members: [] }]
        }
    } catch (err: unknown) {
        console.error('Failed to fetch groups:', err)
        error.value = err instanceof Error ? err.message : String($t('errorFetchingGroups'))
    } finally {
        loading.value = false
    }
}

// Reset selection when switching group types
watch(activeGroupType, () => {
    selectedGroup.value = null
    if (isMobile.value) {
        showSidebar.value = true
    }
})
</script>
