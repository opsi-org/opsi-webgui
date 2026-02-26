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
        <CommonPageHeader :title="String($t('groups'))">
            <template #tabs>
                <CommonTabsNav v-model="activeGroupType" :tabs="groupTypes" />
            </template>
            <template #actions>
                <UButton :icon="icons.add" color="primary" size="sm">
                    <span class="hidden sm:inline">{{ $t('group-add') }}</span>
                </UButton>
            </template>
        </CommonPageHeader>

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
                <div class="space-y-1">
                    <div v-for="g in currentGroups" :key="g.id" @click="selectedGroup = g"
                        class="flex items-center gap-2 px-2 py-2 rounded cursor-pointer transition-colors"
                        :class="selectedGroup?.id === g.id ? 'bg-opsi-blue/10 text-opsi-blue' : 'hover:bg-[var(--color-surface)] dark:hover:bg-[var(--color-surface-hover)]'">
                        <UIcon :name="icons.group" class="w-4 h-4 shrink-0" />
                        <span class="text-sm flex-1 truncate">{{ g.name }}</span>
                        <span class="text-xs text-[var(--color-text-muted)]">({{ g.count }})</span>
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

const icons = useIcons()
const { $t } = useNuxtApp()

const activeGroupType = ref('clients')
const selectedGroup = ref<typeof clientGroups.value[0] | null>(null)

const groupTypes = [
    { label: String($t('client-group')), value: 'clients' },
    { label: String($t('product-group')), value: 'products' },
]

const clientGroups = ref([
    { id: 'clientdirectory', name: 'All Clients', description: 'Root group containing all clients', count: 42, members: ['client1.domain.local', 'client2.domain.local', 'laptop1.domain.local'] },
    { id: 'workstations', name: 'Workstations', description: 'Desktop workstations', count: 30, members: ['client1.domain.local', 'client2.domain.local'] },
    { id: 'servers', name: 'Servers', description: 'Server machines', count: 8, members: ['server-test.domain.local'] },
    { id: 'laptops', name: 'Laptops', description: 'Mobile devices', count: 4, members: ['laptop1.domain.local'] },
])

const productGroups = ref([
    { id: 'all-products', name: 'All Products', description: 'Root group containing all products', count: 120, members: ['opsi-client-agent', 'hwaudit', 'swaudit'] },
    { id: 'system-tools', name: 'System Tools', description: 'System maintenance tools', count: 15, members: ['hwaudit', 'swaudit'] },
    { id: 'office', name: 'Office Software', description: 'Office applications', count: 8, members: ['libreoffice'] },
])

const currentGroups = computed(() => {
    return activeGroupType.value === 'clients' ? clientGroups.value : productGroups.value
})

// Reset selection when switching group types
watch(activeGroupType, () => {
    selectedGroup.value = null
})
</script>
