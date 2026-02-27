<!--
This file is part of opsi-webgui application.
opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
Copyright (c) uib GmbH <info@uib.de> 2025
All rights reserved.
License: AGPL-3.0
-->
<template>
    <LayoutsDetailPanel :showPanel="!!selectedServer" @close="selectedServer = null">
        <template #main>
            <LayoutsPageLayout v-model="filterQuery" show-search :search-placeholder="String($t('typeToFilter'))"
                show-refresh :loading="loading" @refresh="fetchServers">
                <template #stats>
                    <div class="flex items-center gap-4 text-sm">
                        <span class="text-[var(--color-text-muted)]">
                            {{ $t('total') }}: <span class="font-medium text-[var(--color-text)]">{{
                                servers.length }}</span>
                        </span>
                    </div>
                </template>

                <!-- Error state -->
                <div v-if="error"
                    class="mb-4 p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg">
                    {{ error }}
                </div>

                <!-- Enhanced Table -->
                <SharedEnhancedTable :rows="filteredServers" :columns="columns" :loading="loading" :row-key="'depotId'"
                    :actions="tableActions" :filterable="false" :column-toggle="true" :show-refresh="false"
                    :clickable="true" :infinite-scroll="true" :page-size="50" @select="handleRowSelect">
                    <template #type-data="{ row }">
                        <SharedStatusBadge :status="getServerType(row) === 'OpsiConfigserver' ? 'info' : 'neutral'"
                            :label="String(getServerType(row) === 'OpsiConfigserver' ? $t('configserver') : $t('depot'))" />
                    </template>
                    <template #description-data="{ row }">
                        {{ (row as Server).description || '-' }}
                    </template>
                </SharedEnhancedTable>
            </LayoutsPageLayout>
        </template>

        <template #title>{{ selectedServer?.depotId }}</template>
        <template #panel>
            <div v-if="selectedServer" class="space-y-4">
                <!-- Server Config View (shown in split panel) -->
                <div v-if="showConfig">
                    <div class="flex items-center justify-between pb-3 mb-3 border-b border-[var(--color-border)]">
                        <h3 class="font-medium">{{ $t('configuration') }}</h3>
                        <UButton size="xs" variant="ghost" :icon="icons.close" @click="showConfig = false" />
                    </div>

                    <!-- Config Category Tabs -->
                    <div class="flex flex-wrap gap-1 mb-3 -mx-1">
                        <button v-for="cat in configCategories" :key="cat" @click="activeConfigTab = cat"
                            class="px-2 py-1 text-xs rounded transition-colors"
                            :class="activeConfigTab === cat
                                ? 'bg-[var(--color-primary)] text-white'
                                : 'bg-[var(--color-surface)] hover:bg-[var(--color-surface-hover)] text-[var(--color-text-muted)]'">
                            {{ cat }}
                        </button>
                    </div>

                    <!-- Loading state -->
                    <div v-if="configLoading" class="flex items-center justify-center py-8">
                        <UIcon name="i-heroicons-arrow-path"
                            class="w-5 h-5 animate-spin text-[var(--color-text-muted)]" />
                    </div>

                    <!-- Config items -->
                    <div v-else class="space-y-2 max-h-[60vh] overflow-y-auto">
                        <div v-if="serverConfigs.length === 0"
                            class="text-sm text-[var(--color-text-muted)] py-4 text-center">
                            {{ $t('noConfigFound') }}
                        </div>
                        <div v-for="config in serverConfigs" :key="config.configId"
                            class="p-2 rounded bg-[var(--color-surface)] hover:bg-[var(--color-surface-hover)]">
                            <div class="flex items-start justify-between gap-2">
                                <div class="min-w-0 flex-1">
                                    <div class="text-xs text-[var(--color-text-muted)] font-medium truncate"
                                        :title="config.configId">
                                        {{ config.configId }}
                                    </div>
                                    <div class="font-mono text-xs mt-0.5 break-all">
                                        {{ formatConfigValue(config) }}
                                    </div>
                                    <div v-if="config.description"
                                        class="text-xs text-[var(--color-text-muted)] mt-1 italic">
                                        {{ config.description }}
                                    </div>
                                </div>
                                <UBadge v-if="config.type" size="xs" variant="soft" color="neutral">
                                    {{ config.type.replace('Config', '') }}
                                </UBadge>
                            </div>
                        </div>
                    </div>
                </div>
                <!-- Server Details (default view) -->
                <div v-else class="space-y-3">
                    <div class="flex items-start gap-2">
                        <span class="text-sm text-[var(--color-text-muted)] w-24 shrink-0">{{ $t('serverId')
                        }}:</span>
                        <span class="font-medium break-all">{{ selectedServer.depotId }}</span>
                    </div>
                    <div class="flex items-start gap-2">
                        <span class="text-sm text-[var(--color-text-muted)] w-24 shrink-0">{{ $t('description')
                        }}:</span>
                        <span>{{ selectedServer.description || '-' }}</span>
                    </div>
                    <div class="flex items-center gap-2">
                        <span class="text-sm text-[var(--color-text-muted)] w-24 shrink-0">{{ $t('type') }}:</span>
                        <SharedStatusBadge :status="selectedServer.type === 'OpsiConfigserver' ? 'info' : 'neutral'"
                            :label="String(selectedServer.type === 'OpsiConfigserver' ? $t('configserver') : $t('depot'))" />
                    </div>
                    <div v-if="selectedServer.depotRemoteUrl" class="flex items-start gap-2">
                        <span class="text-sm text-[var(--color-text-muted)] w-24 shrink-0">{{ $t('depotUrl')
                        }}:</span>
                        <span class="font-mono text-xs break-all">{{ selectedServer.depotRemoteUrl }}</span>
                    </div>
                    <div v-if="selectedServer.repositoryRemoteUrl" class="flex items-start gap-2">
                        <span class="text-sm text-[var(--color-text-muted)] w-24 shrink-0">{{ $t('repositoryUrl')
                        }}:</span>
                        <span class="font-mono text-xs break-all">{{ selectedServer.repositoryRemoteUrl }}</span>
                    </div>
                </div>
                <div class="flex gap-2 pt-4 border-t border-[var(--color-border)]">
                    <UButton size="sm" :icon="icons.config" color="primary" @click="showConfig = !showConfig">
                        {{ showConfig ? $t('details') : $t('configuration') }}
                    </UButton>
                </div>
            </div>
        </template>
    </LayoutsDetailPanel>
</template>

<script setup lang="ts">
import type { TableColumn, TableAction } from '~/types/table.types'
import type { Server } from '~/types/api/server.types'
import { useStateStore } from '~/stores/stateStore'

definePageMeta({ layout: 'default' })

interface ServerConfigItem {
    configId: string
    description: string
    type: string
    value: unknown
    possibleValues: string | string[]
    multiValue: boolean
    editable: boolean
}

type ServerConfigData = Record<string, ServerConfigItem[]>

const icons = useIcons()
const { t: $t } = useI18n()
const { getDepots, getServerConfig } = useApiHelpers()
const stateStore = useStateStore()

const loading = ref(false)
const configLoading = ref(false)
const error = ref<string | null>(null)
const selectedServer = ref<Server | null>(null)
const servers = ref<Server[]>([])
const filterQuery = ref('')
const showConfig = ref(false)
const serverConfigData = ref<ServerConfigData>({})
const activeConfigTab = ref<string>('general')

// Config categories from API
const configCategories = computed(() => {
    const data = serverConfigData.value
    const cats = Object.keys(data).filter(k => {
        const items = data[k]
        return items && items.length > 0
    })
    return cats.length > 0 ? cats : ['general']
})

// Current category's configs
const serverConfigs = computed<ServerConfigItem[]>(() => {
    return serverConfigData.value[activeConfigTab.value] || []
})

// Fetch server configuration from API
async function fetchServerConfig() {
    configLoading.value = true
    try {
        const result = await getServerConfig()
        if (result.error) {
            console.error('Failed to fetch server config:', result.error)
        } else if (result.data) {
            // Transform API response to match ServerConfigData type
            const transformed: ServerConfigData = {}
            for (const [key, items] of Object.entries(result.data)) {
                transformed[key] = items.map(item => ({
                    ...item,
                    possibleValues: typeof item.possibleValues === 'string'
                        ? (item.possibleValues ? [item.possibleValues] : [])
                        : item.possibleValues
                }))
            }
            serverConfigData.value = transformed
        }
    } catch (e) {
        console.error('Error fetching server config:', e)
    } finally {
        configLoading.value = false
    }
}

const columns: TableColumn<Server>[] = [
    { key: 'depotId', label: String($t('serverId')), sortable: true, alwaysVisible: true },
    { key: 'description', label: String($t('description')), sortable: true, class: 'hidden md:table-cell' },
    { key: 'type', label: String($t('type')), sortable: true, class: 'hidden sm:table-cell' },
]

const tableActions: TableAction<Server>[] = [
    {
        icon: icons.config,
        label: String($t('configuration')),
        handler: (row) => {
            selectedServer.value = row
            showConfig.value = true
        }
    }
]

// Client-side filtering
const filteredServers = computed(() => {
    if (!filterQuery.value) return servers.value
    const q = filterQuery.value.toLowerCase()
    return servers.value.filter(s =>
        s.depotId.toLowerCase().includes(q) ||
        (s.description?.toLowerCase().includes(q))
    )
})

function handleRowSelect(row: Server) {
    selectedServer.value = row
}

async function fetchServers() {
    loading.value = true
    error.value = null
    try {
        const result = await getDepots({})
        if (result.error) {
            error.value = result.error.message
        } else if (result.data) {
            servers.value = result.data
            // Find the configserver and set it, then default depot selection to it
            const configServer = result.data.find(d => d.type === 'OpsiConfigserver')
            if (configServer) {
                stateStore.setConfigServer(configServer.depotId)
            } else {
                const firstDepot = result.data[0]
                if (firstDepot && stateStore.depots.length === 0) {
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
    return (row as Server).type || ''
}

// Format config value for display
function formatConfigValue(config: ServerConfigItem): string {
    const val = config.value
    if (val === null || val === undefined) return '-'
    if (typeof val === 'boolean') return val ? 'true' : 'false'
    if (Array.isArray(val)) return val.join(', ') || '-'
    return String(val) || '-'
}

// Reset config view when server changes
watch(selectedServer, () => {
    showConfig.value = false
    activeConfigTab.value = 'general'
})

// Fetch server config when config panel is shown
watch(showConfig, (newVal) => {
    if (newVal && Object.keys(serverConfigData.value).length === 0) {
        fetchServerConfig()
    }
})

onMounted(() => {
    fetchServers()
})
</script>
