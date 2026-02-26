<!--
This file is part of opsi-webgui application.
opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
Copyright (c) uib GmbH <info@uib.de> 2025
All rights reserved.
License: AGPL-3.0
-->
<template>
    <CommonDetailPanel :showPanel="!!selectedServer" @close="selectedServer = null">
        <template #main>
            <div class="space-y-4">
                <!-- Header -->
                <CommonPageHeader :title="String($t('servers'))" v-model="search" show-search
                    :search-placeholder="String($t('filter'))" show-refresh :loading="loading"
                    @refresh="fetchServers" />

                <!-- Error state -->
                <div v-if="error" class="p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg">
                    {{ error }}
                </div>

                <!-- Table -->
                <CommonDataTable :rows="filtered" :columns="columns" :loading="loading" :page-size="20"
                    @select="(row) => selectedServer = row as unknown as Server">
                    <template #type-data="{ row }">
                        <CommonStatusBadge :status="getServerType(row) === 'OpsiConfigserver' ? 'info' : 'neutral'"
                            :label="String(getServerType(row) === 'OpsiConfigserver' ? $t('configserver') : $t('depot'))" />
                    </template>
                    <template #actions-data="{ row }">
                        <UButton :icon="icons.config" variant="ghost" color="neutral" size="xs"
                            @click.stop="navigateTo(`/servers/config/${getServerId(row)}`)" />
                    </template>
                </CommonDataTable>
            </div>
        </template>

        <template #title>{{ selectedServer?.depotId }}</template>
        <template #panel>
            <div v-if="selectedServer" class="space-y-4">
                <div class="space-y-2">
                    <div><span class="text-sm text-[var(--color-text-muted)]">{{ $t('serverId') || 'Server ID'
                    }}:</span> <span class="ml-2 font-medium">{{ selectedServer.depotId }}</span></div>
                    <div><span class="text-sm text-[var(--color-text-muted)]">{{ $t('description') }}:</span> <span
                            class="ml-2">{{ selectedServer.description || '-' }}</span></div>
                    <div>
                        <span class="text-sm text-[var(--color-text-muted)]">{{ $t('type') }}:</span>
                        <CommonStatusBadge class="ml-2"
                            :status="selectedServer.type === 'OpsiConfigserver' ? 'info' : 'neutral'"
                            :label="String(selectedServer.type === 'OpsiConfigserver' ? $t('configserver') : $t('depot'))" />
                    </div>
                    <div v-if="selectedServer.depotRemoteUrl">
                        <span class="text-sm text-[var(--color-text-muted)]">{{ $t('depotRemoteUrl') }}:</span>
                        <span class="ml-2 font-mono text-xs break-all">{{ selectedServer.depotRemoteUrl }}</span>
                    </div>
                </div>
                <div class="flex gap-2 pt-4 border-t border-[var(--color-border)]">
                    <UButton size="sm" :icon="icons.config" color="primary"
                        @click="navigateTo(`/servers/config/${selectedServer.depotId}`)">
                        {{ $t('configuration') }}</UButton>
                </div>
            </div>
        </template>
    </CommonDetailPanel>
</template>

<script setup lang="ts">
import { useStateStore } from '~/stores/stateStore'

definePageMeta({ layout: 'default' })

interface Server {
    depotId: string
    description: string
    type: string
    depotRemoteUrl: string
    depotWebdavUrl: string
    repositoryRemoteUrl: string
    workbenchRemoteUrl: string
}

const icons = useIcons()
const { t: $t } = useI18n()
const { getDepots } = useApiHelpers()
const stateStore = useStateStore()

const search = ref('')
const loading = ref(false)
const error = ref<string | null>(null)
const selectedServer = ref<Server | null>(null)
const servers = ref<Server[]>([])

const columns = [
    { key: 'depotId', label: String($t('serverId') || 'Server ID') },
    { key: 'description', label: String($t('description')), class: 'hidden md:table-cell' },
    { key: 'type', label: String($t('type')), class: 'hidden sm:table-cell' },
    { key: 'actions', label: String($t('actions')) },
]

const filtered = computed(() => {
    if (!search.value) return servers.value
    const q = search.value.toLowerCase()
    return servers.value.filter(s =>
        s.depotId.toLowerCase().includes(q) ||
        s.description?.toLowerCase().includes(q)
    )
})

async function fetchServers() {
    loading.value = true
    error.value = null
    try {
        const result = await getDepots()
        if (result.error) {
            error.value = result.error.message
        } else if (result.data) {
            servers.value = result.data
            // Auto-select first depot if none selected
            if (stateStore.depots.length === 0 && result.data.length > 0) {
                const firstDepot = result.data[0]
                if (firstDepot) {
                    stateStore.setDepots([firstDepot.depotId])
                }
            }
        }
    } catch (e) {
        error.value = (e as Error).message
    } finally {
        loading.value = false
    }
}

// Helper functions for type-safe row access
const getServerType = (row: unknown): string => {
    return (row as Record<string, unknown>).type as string || ''
}

const getServerId = (row: unknown): string => {
    return (row as Record<string, unknown>).depotId as string || ''
}

onMounted(() => {
    fetchServers()
})
</script>
