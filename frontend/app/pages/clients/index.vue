<!--
This file is part of opsi-webgui application.
opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
Copyright (c) uib GmbH <info@uib.de> 2025
All rights reserved.
License: AGPL-3.0
-->
<template>
    <CommonDetailPanel :showPanel="!!selectedClient" @close="selectedClient = null">
        <template #main>
            <div class="space-y-4">
                <!-- Header -->
                <CommonPageHeader :title="String($t('clients'))" v-model="search" show-search
                    :search-placeholder="String($t('filter'))" add-link="/clients/create"
                    :add-label="String($t('addNew'))" show-refresh :loading="loading" @refresh="refresh" />

                <!-- Table -->
                <CommonDataTable :rows="filtered" :columns="columns" :loading="loading" :page-size="20"
                    @select="(row) => selectedClient = row">
                    <template #description-data="{ row }">
                        {{ (row as any).description || '-' }}
                    </template>
                    <template #online-data="{ row }">
                        <CommonStatusBadge :status="(row as any).online ? 'online' : 'offline'"
                            :label="String((row as any).online ? $t('on') || 'Online' : $t('off') || 'Offline')" />
                    </template>
                    <template #actions-data="{ row }">
                        <div class="flex items-center gap-1">
                            <UButton :icon="icons.config" variant="ghost" color="neutral" size="xs"
                                @click.stop="navigateTo(`/clients/config/${row.id}`)" />
                            <UButton :icon="icons.log" variant="ghost" color="neutral" size="xs"
                                @click.stop="navigateTo(`/clients/logs/${row.id}`)" />
                            <UButton :icon="icons.clone" variant="ghost" color="neutral" size="xs"
                                @click.stop="navigateTo(`/clients/clone/${row.id}`)" />
                        </div>
                    </template>
                </CommonDataTable>
            </div>
        </template>

        <template #title>{{ selectedClient?.id }}</template>
        <template #panel>
            <div v-if="selectedClient" class="space-y-4">
                <div class="space-y-2">
                    <div><span class="text-sm text-[var(--color-text-muted)]">{{ $t('clientId') }}:</span> <span
                            class="ml-2 font-medium">{{ selectedClient.id }}</span></div>
                    <div><span class="text-sm text-[var(--color-text-muted)]">{{ $t('description') }}:</span> <span
                            class="ml-2">{{ selectedClient.description || '-' }}</span></div>
                    <div><span class="text-sm text-[var(--color-text-muted)]">{{ $t('depot') }}:</span> <span
                            class="ml-2">{{ selectedClient.depot }}</span></div>
                    <div>
                        <span class="text-sm text-[var(--color-text-muted)]">{{ $t('status') }}:</span>
                        <CommonStatusBadge class="ml-2" :status="selectedClient.online ? 'online' : 'offline'"
                            :label="String(selectedClient.online ? $t('on') || 'Online' : $t('off') || 'Offline')" />
                    </div>
                </div>
                <div class="flex flex-wrap gap-2 pt-4 border-t border-[var(--color-border)]">
                    <UButton size="sm" :icon="icons.config" color="primary"
                        @click="navigateTo(`/clients/config/${selectedClient.id}`)">
                        {{ $t('configuration') }}</UButton>
                    <UButton size="sm" :icon="icons.log" variant="outline" color="neutral"
                        @click="navigateTo(`/clients/logs/${selectedClient.id}`)">{{ $t('logs') }}</UButton>
                    <UButton size="sm" :icon="icons.clone" variant="outline" color="neutral"
                        @click="navigateTo(`/clients/clone/${selectedClient.id}`)">{{ $t('clone') }}</UButton>
                </div>
            </div>
        </template>
    </CommonDetailPanel>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'default' })

const icons = useIcons()
const { $t } = useNuxtApp()

const search = ref('')
const loading = ref(false)
const selectedClient = ref<typeof clients.value[0] | null>(null)

const columns = [
    { key: 'id', label: String($t('clientId')) },
    { key: 'description', label: String($t('description')), class: 'hidden md:table-cell' },
    { key: 'online', label: String($t('status')), class: 'hidden sm:table-cell' },
    { key: 'actions', label: String($t('actions')) },
]

const clients = ref([
    { id: 'client1.domain.local', description: 'Workstation 1', depot: 'depot1.domain.local', online: true },
    { id: 'client2.domain.local', description: 'Workstation 2', depot: 'depot1.domain.local', online: false },
    { id: 'laptop1.domain.local', description: 'Marketing Laptop', depot: 'depot1.domain.local', online: true },
    { id: 'server-test.domain.local', description: 'Test Server', depot: 'depot1.domain.local', online: false },
])

const filtered = computed(() => {
    if (!search.value) return clients.value
    const q = search.value.toLowerCase()
    return clients.value.filter(c => c.id.toLowerCase().includes(q) || c.description?.toLowerCase().includes(q))
})

const refresh = async () => { loading.value = true; await new Promise(r => setTimeout(r, 500)); loading.value = false }
</script>
