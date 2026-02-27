<!--
This file is part of opsi-webgui application.
opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
Copyright (c) uib GmbH <info@uib.de> 2025
All rights reserved.
License: AGPL-3.0
-->
<template>
    <LayoutsDetailPanel :showPanel="!!selectedClient" @close="selectedClient = null">
        <template #main>
            <LayoutsPageLayout v-model="filterQuery" show-search :search-placeholder="String($t('typeToFilter'))"
                show-refresh :loading="loading" @refresh="fetchClients">
                <template #actions>
                    <UButton v-if="selectedClients.length > 0" :icon="icons.product" color="primary" size="sm"
                        @click="navigateTo('/clients/products/LocalbootProduct')">
                        {{ $t('products') }} ({{ selectedClients.length }})
                    </UButton>
                    <NuxtLink to="/clients/create">
                        <UButton :icon="icons.add" color="primary" size="sm">
                            <span class="hidden sm:inline">{{ $t('addNew') }}</span>
                        </UButton>
                    </NuxtLink>
                </template>

                <template #stats>
                    <div class="flex items-center gap-4 text-sm">
                        <span class="text-[var(--color-text-muted)]">
                            {{ $t('total') }}: <span class="font-medium text-[var(--color-text)]">{{
                                clients.length }}</span>
                        </span>
                        <span v-if="selectedClients.length > 0" class="text-opsi-blue">
                            {{ $t('selected') }}: {{ selectedClients.length }}
                        </span>
                    </div>
                </template>

                <!-- Error state -->
                <div v-if="error"
                    class="mb-4 p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg">
                    {{ error }}
                </div>

                <!-- Enhanced Table with full height -->
                <SharedEnhancedTable :rows="filteredClients" :columns="columns" :loading="loading" :row-key="'clientId'"
                    :actions="tableActions" :selectable="true" :filterable="false" :column-toggle="true"
                    :show-refresh="false" :clickable="true" :infinite-scroll="true" :page-size="50" class="min-h-0"
                    @select="handleRowSelect" @selection-change="handleSelectionChange">
                    <template #description-data="{ row }">
                        {{ (row as Client).description || '-' }}
                    </template>
                    <template #macAddress-data="{ row }">
                        <span class="font-mono text-xs">{{ (row as Client).macAddress || '-' }}</span>
                    </template>
                    <template #ipAddress-data="{ row }">
                        <span class="font-mono text-xs">{{ (row as Client).ipAddress || '-' }}</span>
                    </template>
                    <template #lastSeen-data="{ row }">
                        {{ (row as Client).lastSeen ? new Date((row as Client).lastSeen as string).toLocaleString() :
                            '-' }}
                    </template>
                    <template #uefi-data="{ row }">
                        <SharedStatusBadge v-if="(row as Client).uefi" status="info" :label="'UEFI'" />
                        <span v-else class="text-[var(--color-text-muted)]">-</span>
                    </template>
                </SharedEnhancedTable>
            </LayoutsPageLayout>
        </template>

        <template #title>{{ selectedClient?.clientId }}</template>
        <template #panel>
            <div v-if="selectedClient" class="space-y-4">
                <div class="space-y-3">
                    <div class="flex items-start gap-2">
                        <span class="text-sm text-[var(--color-text-muted)] w-24 shrink-0">{{ $t('clientId') }}:</span>
                        <span class="font-medium break-all">{{ selectedClient.clientId }}</span>
                    </div>
                    <div class="flex items-start gap-2">
                        <span class="text-sm text-[var(--color-text-muted)] w-24 shrink-0">{{ $t('description')
                            }}:</span>
                        <span>{{ selectedClient.description || '-' }}</span>
                    </div>
                    <div class="flex items-start gap-2">
                        <span class="text-sm text-[var(--color-text-muted)] w-24 shrink-0">{{ $t('macAddress')
                            }}:</span>
                        <span class="font-mono text-xs">{{ selectedClient.macAddress || '-' }}</span>
                    </div>
                    <div class="flex items-start gap-2">
                        <span class="text-sm text-[var(--color-text-muted)] w-24 shrink-0">{{ $t('ipAddress') }}:</span>
                        <span class="font-mono text-xs">{{ selectedClient.ipAddress || '-' }}</span>
                    </div>
                    <div class="flex items-start gap-2">
                        <span class="text-sm text-[var(--color-text-muted)] w-24 shrink-0">{{ $t('lastSeen') }}:</span>
                        <span>{{ selectedClient.lastSeen ? new Date(selectedClient.lastSeen).toLocaleString() : '-'
                            }}</span>
                    </div>
                    <div class="flex items-center gap-2">
                        <span class="text-sm text-[var(--color-text-muted)] w-24 shrink-0">{{ $t('uefi') }}:</span>
                        <SharedStatusBadge v-if="selectedClient.uefi" status="info" :label="'UEFI'" />
                        <span v-else>-</span>
                    </div>
                </div>
                <div class="flex flex-wrap gap-2 pt-4 border-t border-[var(--color-border)]">
                    <UButton size="sm" :icon="icons.config" color="primary"
                        @click="navigateTo(`/clients/config/${selectedClient.clientId}`)">
                        {{ $t('configuration') }}
                    </UButton>
                    <UButton size="sm" :icon="icons.log" variant="outline" color="neutral"
                        @click="navigateTo(`/clients/logs/${selectedClient.clientId}`)">
                        {{ $t('logs') }}
                    </UButton>
                    <UButton size="sm" :icon="icons.clone" variant="outline" color="neutral"
                        @click="navigateTo(`/clients/clone/${selectedClient.clientId}`)">
                        {{ $t('clone') }}
                    </UButton>
                </div>
            </div>
        </template>
    </LayoutsDetailPanel>
</template>

<script setup lang="ts">
import type { TableColumn, TableAction } from '~/types/table.types'
import type { Client } from '~/types/api/client.types'
import { useStateStore } from '~/stores/stateStore'

definePageMeta({ layout: 'default' })

const icons = useIcons()
const { t: $t } = useI18n()
const { getClients, getDepotIds } = useApiHelpers()
const stateStore = useStateStore()

const loading = ref(false)
const error = ref<string | null>(null)
const selectedClient = ref<Client | null>(null)
const clients = ref<Client[]>([])
const selectedClients = ref<Client[]>([])
const filterQuery = ref('')

const columns: TableColumn<Client>[] = [
    { key: 'clientId', label: String($t('clientId')), sortable: true, alwaysVisible: true },
    { key: 'description', label: String($t('description')), sortable: true, class: 'hidden md:table-cell' },
    { key: 'macAddress', label: String($t('macAddress')), sortable: true, class: 'hidden lg:table-cell', visible: false },
    { key: 'ipAddress', label: String($t('ipAddress')), sortable: true, class: 'hidden lg:table-cell', visible: false },
    { key: 'lastSeen', label: String($t('lastSeen')), sortable: true, class: 'hidden xl:table-cell' },
    { key: 'uefi', label: 'UEFI', sortable: true, class: 'hidden xl:table-cell', visible: false },
]

const tableActions: TableAction<Client>[] = [
    {
        icon: icons.config,
        label: String($t('configuration')),
        handler: (row) => navigateTo(`/clients/config/${row.clientId}`)
    },
    {
        icon: icons.log,
        label: String($t('logs')),
        handler: (row) => navigateTo(`/clients/logs/${row.clientId}`)
    },
    {
        icon: icons.clone,
        label: String($t('clone')),
        handler: (row) => navigateTo(`/clients/clone/${row.clientId}`)
    }
]

async function fetchClients() {
    loading.value = true
    error.value = null
    try {
        // Ensure we have depots selected (will default to configserver if needed)
        await stateStore.ensureDepotsSelected()

        if (stateStore.depots.length === 0) {
            // Still no depots - need to fetch them first
            const depotResult = await getDepotIds()
            const firstDepot = depotResult.data?.[0]
            if (firstDepot) {
                stateStore.setDepots([firstDepot])
            } else {
                error.value = String($t('message.noServerSelected'))
                return
            }
        }

        const params: Record<string, unknown> = {
            selectedDepots: stateStore.selectedDepotsParam
        }

        const result = await getClients(params)
        if (result.error) {
            error.value = result.error.message
        } else if (result.data) {
            clients.value = result.data as Client[]
        }
    } catch (e) {
        error.value = (e as Error).message
    } finally {
        loading.value = false
    }
}

// Client-side filtering for responsiveness
const filteredClients = computed(() => {
    if (!filterQuery.value) return clients.value
    const q = filterQuery.value.toLowerCase()
    return clients.value.filter(c =>
        c.clientId.toLowerCase().includes(q) ||
        (c.description?.toLowerCase().includes(q)) ||
        (c.macAddress?.toLowerCase().includes(q)) ||
        (c.ipAddress?.toLowerCase().includes(q))
    )
})

function handleRowSelect(row: Client) {
    selectedClient.value = row
}

function handleSelectionChange(rows: Client[]) {
    selectedClients.value = rows
}

onMounted(() => {
    fetchClients()
})
</script>
