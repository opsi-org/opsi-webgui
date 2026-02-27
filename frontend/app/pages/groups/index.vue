<!--
This file is part of opsi-webgui application.
opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
Copyright (c) uib GmbH <info@uib.de> 2025
All rights reserved.
License: AGPL-3.0
-->
<template>
    <LayoutsPageLayout :loading="loading" :showSearch="false" @refresh="fetchGroups">
        <template #tabs>
            <SharedTabsNav v-model="activeGroupType" :tabs="groupTypes" />
        </template>
        <template #actions>
            <UButton :icon="icons.add" color="primary" size="sm">
                <span class="hidden sm:inline">{{ $t('group-add') }}</span>
            </UButton>
        </template>

        <!-- Error State -->
        <div v-if="error" class="p-4 bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-lg">
            {{ error }}
        </div>

        <div ref="containerRef" class="flex h-full min-h-0 relative">
            <!-- Tree sidebar (resizable) -->
            <div :style="{ width: isMobile ? '100%' : `${sidebarWidthPercent}%` }"
                class="shrink-0 border-r border-[var(--color-border)] bg-white dark:bg-[var(--color-surface)] flex flex-col transition-[width] duration-100"
                :class="{ 'absolute inset-0 z-20': isMobile && !showSidebar ? 'hidden' : '' }">
                <div class="p-3 border-b border-[var(--color-border)] flex items-center justify-between">
                    <span class="text-sm font-medium">{{ activeGroupType === 'clients' ? $t('client-group') :
                        $t('product-group') }}</span>
                    <UButton :icon="icons.add" size="xs" variant="ghost" color="neutral" />
                </div>
                <div v-if="loading" class="py-4 text-center">
                    <UIcon name="i-heroicons-arrow-path" class="w-5 h-5 animate-spin text-[var(--color-text-muted)]" />
                </div>
                <div v-else class="flex-1 overflow-auto p-2 space-y-1">
                    <div v-for="g in currentGroups" :key="g.id" @click="selectGroup(g)"
                        class="flex items-center gap-2 px-2 py-2 rounded cursor-pointer transition-colors"
                        :class="selectedGroup?.id === g.id ? 'bg-opsi-blue/10 text-opsi-blue' : 'hover:bg-[var(--color-surface)] dark:hover:bg-[var(--color-surface-hover)]'">
                        <UIcon :name="icons.group" class="w-4 h-4 shrink-0" />
                        <span class="text-sm flex-1 truncate">{{ g.name }}</span>
                        <span class="text-xs text-[var(--color-text-muted)]">({{ g.count }})</span>
                    </div>
                    <div v-if="currentGroups.length === 0"
                        class="text-sm text-[var(--color-text-muted)] px-2 py-4 text-center">
                        {{ $t('noGroupsFound') }}
                    </div>
                </div>
            </div>

            <!-- Resize handle (desktop only) -->
            <div v-if="!isMobile" @mousedown="startResize"
                class="w-1 cursor-col-resize bg-transparent hover:bg-opsi-blue/30 active:bg-opsi-blue/50 transition-colors flex-shrink-0 relative group">
                <div
                    class="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-16 bg-gray-300 dark:bg-gray-600 rounded group-hover:bg-opsi-blue transition-colors" />
            </div>

            <!-- Group details panel -->
            <div class="flex-1 min-w-0 bg-[var(--color-background)] overflow-auto">
                <div v-if="selectedGroup" class="h-full flex flex-col">
                    <div
                        class="p-3 border-b border-[var(--color-border)] flex items-center justify-between bg-white dark:bg-[var(--color-surface)]">
                        <span class="font-medium">{{ selectedGroup.name }}</span>
                        <div class="flex gap-1">
                            <UButton :icon="icons.edit" variant="ghost" color="neutral" size="xs" />
                            <UButton :icon="icons.delete" variant="ghost" size="xs" color="error" />
                        </div>
                    </div>
                    <div class="flex-1 overflow-auto p-4 space-y-4">
                        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <span class="text-sm text-[var(--color-text-muted)]">{{ $t('groupId') }}</span>
                                <p class="font-medium">{{ selectedGroup.id }}</p>
                            </div>
                            <div>
                                <span class="text-sm text-[var(--color-text-muted)]">{{ activeGroupType === 'clients' ?
                                    $t('clients') : $t('products') }}</span>
                                <p class="font-medium">{{ selectedGroup.count }}</p>
                            </div>
                            <div class="sm:col-span-2">
                                <span class="text-sm text-[var(--color-text-muted)]">{{ $t('description') }}</span>
                                <p>{{ selectedGroup.description || '-' }}</p>
                            </div>
                        </div>

                        <div class="pt-4 border-t border-[var(--color-border)]">
                            <h4 class="text-sm font-medium mb-3">{{ $t('groupMembers') }}</h4>
                            <div class="space-y-1">
                                <div v-for="member in selectedGroup.members" :key="member"
                                    class="flex items-center gap-2 text-sm px-2 py-1.5 bg-[var(--color-surface)] dark:bg-[var(--color-surface)] rounded">
                                    <UIcon :name="activeGroupType === 'clients' ? icons.client : icons.product"
                                        class="w-4 h-4 text-[var(--color-text-muted)]" />
                                    {{ member }}
                                </div>
                                <div v-if="selectedGroup.members.length === 0"
                                    class="text-sm text-[var(--color-text-muted)] py-2 text-center">
                                    {{ $t('noMembers') }}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div v-else class="h-full flex items-center justify-center">
                    <div class="text-center text-[var(--color-text-muted)] py-8">
                        <UIcon :name="icons.group" class="w-12 h-12 mx-auto mb-3 opacity-50" />
                        <p>{{ $t('message.noItemsSelected') }}</p>
                    </div>
                </div>
            </div>
        </div>
    </LayoutsPageLayout>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'default' })

interface GroupItem {
    id: string
    name: string
    description: string
    count: number
    members: string[]
    parentGroupId?: string | null
}

const icons = useIcons()
const { t: $t } = useI18n()
const { getGroupsViaRpc, getHostGroups, getProductGroups } = useApiHelpers()

const activeGroupType = ref<'clients' | 'products'>('clients')
const selectedGroup = ref<GroupItem | null>(null)
const loading = ref(false)
const error = ref<string | null>(null)
const clientGroups = ref<GroupItem[]>([])
const productGroups = ref<GroupItem[]>([])

// Resizable panel state
const containerRef = ref<HTMLElement | null>(null)
const isMobile = ref(false)
const showSidebar = ref(true)
const sidebarWidthPercent = ref(25) // Default 25% width
const isResizing = ref(false)
const minSidebarPercent = 15
const maxSidebarPercent = 50

const groupTypes = [
    { label: String($t('client-group')), value: 'clients' },
    { label: String($t('product-group')), value: 'products' },
]

const currentGroups = computed(() => {
    return activeGroupType.value === 'clients' ? clientGroups.value : productGroups.value
})

// Select group and show sidebar on mobile
function selectGroup(group: GroupItem) {
    selectedGroup.value = group
    if (isMobile.value) {
        showSidebar.value = false
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

// Transform RPC data to GroupItem format
function transformGroupData(groups: Array<{ id: string; description: string; notes: string; parentGroupId: string | null }>,
    members: Array<{ groupId: string; objectId: string }>): GroupItem[] {
    return groups.map(g => {
        const groupMembers = members.filter(m => m.groupId === g.id).map(m => m.objectId)
        return {
            id: g.id,
            name: g.id, // Use ID as name since that's what we have
            description: g.description || g.notes || '',
            count: groupMembers.length,
            members: groupMembers.slice(0, 20), // Show first 20 members
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
            getGroupsViaRpc('HostGroup'),
            getGroupsViaRpc('ProductGroup')
        ])

        // Transform and set client groups
        clientGroups.value = transformGroupData(hostData.groups, hostData.members)
        // Transform and set product groups
        productGroups.value = transformGroupData(productData.groups, productData.members)

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
