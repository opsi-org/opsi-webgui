<!--
This file is part of opsi-webgui application.
opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
Copyright (c) uib GmbH <info@uib.de> 2025
All rights reserved.
License: AGPL-3.0
-->
<template>
    <div class="space-y-4 h-full">
        <!-- Header with Tabs -->
        <CommonPageHeader :title="String($t('groups'))" :loading="loading" show-refresh @refresh="fetchGroups">
            <template #tabs>
                <CommonTabsNav v-model="activeGroupType" :tabs="groupTypes" />
            </template>
            <template #actions>
                <UButton :icon="icons.add" color="primary" size="sm">
                    <span class="hidden sm:inline">{{ $t('group-add') }}</span>
                </UButton>
            </template>
        </CommonPageHeader>

        <!-- Error State -->
        <div v-if="error" class="p-4 bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-lg">
            {{ error }}
        </div>

        <div class="flex flex-col md:flex-row gap-4 h-full min-h-0">
            <!-- Tree sidebar -->
            <UCard class="w-full md:w-72 shrink-0">
                <template #header>
                    <div class="flex items-center justify-between">
                        <span class="text-sm font-medium">{{ activeGroupType === 'clients' ? $t('client-group') :
                            $t('product-group') }}</span>
                        <UButton :icon="icons.add" size="xs" variant="ghost" color="neutral" />
                    </div>
                </template>
                <div v-if="loading" class="py-4 text-center">
                    <UIcon name="i-heroicons-arrow-path" class="w-5 h-5 animate-spin text-[var(--color-text-muted)]" />
                </div>
                <div v-else class="space-y-1">
                    <div v-for="g in currentGroups" :key="g.id" @click="selectedGroup = g"
                        class="flex items-center gap-2 px-2 py-2 rounded cursor-pointer transition-colors"
                        :class="selectedGroup?.id === g.id ? 'bg-opsi-blue/10 text-opsi-blue' : 'hover:bg-[var(--color-surface)] dark:hover:bg-[var(--color-surface-hover)]'">
                        <UIcon :name="icons.group" class="w-4 h-4 shrink-0" />
                        <span class="text-sm flex-1 truncate">{{ g.name }}</span>
                        <span class="text-xs text-[var(--color-text-muted)]">({{ g.count }})</span>
                    </div>
                    <div v-if="currentGroups.length === 0"
                        class="text-sm text-[var(--color-text-muted)] px-2 py-4 text-center">
                        {{ $t('noGroupsFound') || 'No groups found' }}
                    </div>
                </div>
            </UCard>

            <!-- Group details -->
            <div class="flex-1 min-w-0">
                <UCard v-if="selectedGroup" class="h-full">
                    <template #header>
                        <div class="flex items-center justify-between">
                            <span class="font-medium">{{ selectedGroup.name }}</span>
                            <div class="flex gap-1">
                                <UButton :icon="icons.edit" variant="ghost" color="neutral" size="xs" />
                                <UButton :icon="icons.delete" variant="ghost" size="xs" color="error" />
                            </div>
                        </div>
                    </template>
                    <div class="space-y-4">
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
                            <h4 class="text-sm font-medium mb-3">{{ $t('groupMembers') || 'Group Members' }}</h4>
                            <div class="space-y-1">
                                <div v-for="member in selectedGroup.members" :key="member"
                                    class="flex items-center gap-2 text-sm px-2 py-1.5 bg-[var(--color-surface)] dark:bg-[var(--color-surface)] rounded">
                                    <UIcon :name="activeGroupType === 'clients' ? icons.client : icons.product"
                                        class="w-4 h-4 text-[var(--color-text-muted)]" />
                                    {{ member }}
                                </div>
                                <div v-if="selectedGroup.members.length === 0"
                                    class="text-sm text-[var(--color-text-muted)] py-2 text-center">
                                    {{ $t('noMembers') || 'No members' }}
                                </div>
                            </div>
                        </div>
                    </div>
                </UCard>
                <UCard v-else class="h-full flex items-center justify-center">
                    <div class="text-center text-[var(--color-text-muted)] py-8">
                        <UIcon :name="icons.group" class="w-12 h-12 mx-auto mb-3 opacity-50" />
                        <p>{{ $t('message.noItemsSelected') }}</p>
                    </div>
                </UCard>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'default' })

interface GroupItem {
    id: string
    name: string
    description: string
    count: number
    members: string[]
}

const icons = useIcons()
const { t: $t } = useI18n()
const { getHostGroups, getProductGroups } = useApiHelpers()

const activeGroupType = ref<'clients' | 'products'>('clients')
const selectedGroup = ref<GroupItem | null>(null)
const loading = ref(false)
const error = ref<string | null>(null)
const clientGroups = ref<GroupItem[]>([])
const productGroups = ref<GroupItem[]>([])

const groupTypes = [
    { label: String($t('client-group')), value: 'clients' },
    { label: String($t('product-group')), value: 'products' },
]

const currentGroups = computed(() => {
    return activeGroupType.value === 'clients' ? clientGroups.value : productGroups.value
})

// Helper to flatten tree structure to list
function flattenGroupTree(tree: Record<string, unknown>, result: GroupItem[] = []): GroupItem[] {
    if (!tree) return result

    // Handle tree node
    if (tree.id || tree.text) {
        const id = (tree.id || tree.text) as string
        const name = (tree.text || tree.id || id) as string
        const children = (tree.children || []) as Record<string, unknown>[]
        const objects = (tree.objects || tree.data || []) as string[]

        result.push({
            id,
            name,
            description: (tree.description || '') as string,
            count: objects.length || children.length || 0,
            members: objects.slice(0, 10) // Show first 10 members
        })

        // Recurse into children
        if (children && Array.isArray(children)) {
            for (const child of children) {
                flattenGroupTree(child, result)
            }
        }
    }

    // Handle root with children array
    if (tree.children && Array.isArray(tree.children) && !tree.id && !tree.text) {
        for (const child of (tree.children as Record<string, unknown>[])) {
            flattenGroupTree(child, result)
        }
    }

    return result
}

const fetchGroups = async () => {
    loading.value = true
    error.value = null
    try {
        // Fetch both types of groups
        const [hostGroupsRes, productGroupsRes] = await Promise.all([
            getHostGroups(),
            getProductGroups()
        ])

        if (hostGroupsRes.error) {
            console.error('Failed to fetch host groups:', hostGroupsRes.error)
        } else if (hostGroupsRes.data) {
            clientGroups.value = flattenGroupTree(hostGroupsRes.data.data || hostGroupsRes.data)
        }

        if (productGroupsRes.error) {
            console.error('Failed to fetch product groups:', productGroupsRes.error)
        } else if (productGroupsRes.data) {
            productGroups.value = flattenGroupTree(productGroupsRes.data.data || productGroupsRes.data)
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
        error.value = err instanceof Error ? err.message : $t('errorFetchingGroups')
    } finally {
        loading.value = false
    }
}

// Reset selection when switching group types
watch(activeGroupType, () => {
    selectedGroup.value = null
})

onMounted(() => {
    fetchGroups()
})
</script>
