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
                    :add-label="String($t('addNew'))" show-refresh :loading="loading" @refresh="fetchClients" />

                <!-- Error state -->
                <div v-if="error" class="p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg">
                    {{ error }}
                </div>

                <!-- Table -->
                <CommonDataTable :rows="filtered" :columns="columns" :loading="loading" :page-size="20"
                    @select="(row) => selectedClient = row">
                    <template #description-data="{ row }">
                        {{ (row as any).description || '-' }}
                    </template>
                    <template #lastSeen-data="{ row }">
                        {{ (row as any).lastSeen ? new Date((row as any).lastSeen).toLocaleString() : '-' }}
                    </template>
                    <template #actions-data="{ row }">
                        <div class="flex items-center gap-1">
                            <UButton :icon="icons.config" variant="ghost" color="neutral" size="xs"
                                @click.stop="navigateTo(`/clients/config/${(row as any).clientId}`)" />
                            <UButton :icon="icons.log" variant="ghost" color="neutral" size="xs"
                                @click.stop="navigateTo(`/clients/logs/${(row as any).clientId}`)" />
                            <UButton :icon="icons.clone" variant="ghost" color="neutral" size="xs"
                                @click.stop="navigateTo(`/clients/clone/${(row as any).clientId}`)" />
                        </div>
                    </template>
                </CommonDataTable>
            </div>
        </template>

        <template #title>{{ selectedClient?.clientId }}</template>
        <template #panel>
            <div v-if="selectedClient" class="space-y-4">
                <div class="space-y-2">
                    <div><span class="text-sm text-[var(--color-text-muted)]">{{ $t('clientId') }}:</span> <span
                            class="ml-2 font-medium">{{ selectedClient.clientId }}</span></div>
                    <div><span class="text-sm text-[var(--color-text-muted)]">{{ $t('description') }}:</span> <span
                            class="ml-2">{{ selectedClient.description || '-' }}</span></div>
                    <div><span class="text-sm text-[var(--color-text-muted)]">{{ $t('macAddress') }}:</span> <span
                            class="ml-2 font-mono text-xs">{{ selectedClient.macAddress || '-' }}</span></div>
                    <div><span class="text-sm text-[var(--color-text-muted)]">{{ $t('ipAddress') }}:</span> <span
                            class="ml-2 font-mono text-xs">{{ selectedClient.ipAddress || '-' }}</span></div>
                    <div><span class="text-sm text-[var(--color-text-muted)]">{{ $t('lastSeen') }}:</span> <span
                            class="ml-2">{{ selectedClient.lastSeen ? new Date(selectedClient.lastSeen).toLocaleString()
                            : '-' }}</span></div>
                </div>
                <div class="flex flex-wrap gap-2 pt-4 border-t border-[var(--color-border)]">
                    <UButton size="sm" :icon="icons.config" color="primary"
                        @click="navigateTo(`/clients/config/${selectedClient.clientId}`)">
                        {{ $t('configuration') }}</UButton>
                    <UButton size="sm" :icon="icons.log" variant="outline" color="neutral"
                        @click="navigateTo(`/clients/logs/${selectedClient.clientId}`)">{{ $t('logs') }}</UButton>
                    <UButton size="sm" :icon="icons.clone" variant="outline" color="neutral"
                        @click="navigateTo(`/clients/clone/${selectedClient.clientId}`)">{{ $t('clone') }}</UButton>
                </div>
            </div>
        </template>
    </CommonDetailPanel>
</template>

<script setup lang="ts">
import { useStateStore } from '~/stores/stateStore'

definePageMeta({ layout: 'default' })

interface Client {
    clientId: string
    description: string
    macAddress: string
    ipAddress: string
    lastSeen: string
    depotId: string
    notes: string
    uefi: boolean
}

const icons = useIcons()
const { t: $t } = useI18n()
const { getClients, getDepotIds } = useApiHelpers()
const stateStore = useStateStore()

const search = ref('')
const loading = ref(false)
const error = ref<string | null>(null)
const selectedClient = ref<Client | null>(null)
const clients = ref<Client[]>([])

const columns = [
    { key: 'clientId', label: String($t('clientId')) },
    { key: 'description', label: String($t('description')), class: 'hidden md:table-cell' },
    { key: 'lastSeen', label: String($t('lastSeen')), class: 'hidden lg:table-cell' },
    { key: 'actions', label: String($t('actions')) },
]

const filtered = computed(() => {
    if (!search.value) return clients.value
    const q = search.value.toLowerCase()
    return clients.value.filter(c =>
        c.clientId.toLowerCase().includes(q) ||
        c.description?.toLowerCase().includes(q) ||
        c.macAddress?.toLowerCase().includes(q)
    )
})

async function fetchClients() {
    loading.value = true
    error.value = null
    try {
        // Ensure we have depots selected
        if (stateStore.depots.length === 0) {
            const depotResult = await getDepotIds()
            if (depotResult.data && Array.isArray(depotResult.data)) {
                stateStore.setDepots(depotResult.data)
            }
        }

        const params: Record<string, unknown> = {}
        if (stateStore.depots.length > 0) {
            params.selectedDepots = JSON.stringify(stateStore.depots)
        }

        const result = await getClients(params)
        if (result.error) {
            error.value = result.error.message
        } else if (result.data) {
            clients.value = result.data
        }
    } catch (e) {
        error.value = (e as Error).message
    } finally {
        loading.value = false
    }
}

onMounted(() => {
    fetchClients()
})
</script>
