<!--
This file is part of opsi-webgui application.
opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
Copyright (c) uib GmbH <info@uib.de> 2026
All rights reserved.
License: AGPL-3.0

Servers page - Servers table with configuration panel for selected server.
-->
<template>
    <LayoutsDetailPanel :showPanel="!!selectedServer" @close="handlePanelClose">
        <template #main>
            <LayoutsPageLayout v-model="filterQuery" show-search :search-placeholder="String($t('typeToFilter'))"
                show-refresh :loading="loading" @refresh="fetchServers">
                <template #stats>
                    <div class="flex items-center gap-4 text-sm">
                        <span class="text-(--color-text-muted)">
                            {{ $t('total') }}: <span class="font-medium text-(--color-text)">{{
                                servers.length }}</span>
                        </span>
                    </div>
                </template>

                <UAlert v-if="error" color="error" :title="$t('error')" :description="error" class="mb-4"
                    :close-button="{ icon: icons.close, color: 'error', variant: 'link' }" @close="error = null" />

                <!-- Servers Table -->
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
        <template v-if="selectedPanelType === 'config'" #panelActions>
            <SharedUnsavedChangesModal :config-ref="panelConfigRef" size="xs" @save-all="panelConfigRef?.saveAll?.()"
                @discard-all="panelConfigRef?.discardAll?.()" />
        </template>
        <template #panel>
            <div v-if="selectedServer" class="space-y-4">
                <!-- Panel Content -->
                <div v-if="selectedPanelType === 'config'" class="flex flex-col gap-2">
                    <SharedTabsNav v-model="panelActiveTab" :tabs="panelConfigTabs" />
                    <HostsConfigTabs ref="panelConfigRef" :host-id="selectedServer.depotId" host-type="server"
                        :tab="panelActiveTab" :show-tabs="false" :show-change-banner="false" :panel-mode="true" />
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

const icons = useIcons()
const { t: $t } = useI18n()

const { getDepots } = useApiHelpers()
const stateStore = useStateStore()

const loading = ref(false)
const error = ref<string | null>(null)
const selectedServer = ref<Server | null>(null)
const servers = ref<Server[]>([])
const filterQuery = ref('')
const selectedPanelType = ref<'config' | null>(null)
const panelConfigRef = ref<any>(null)
const panelActiveTab = ref<string>('parameters')
const panelConfigTabs = computed(() => [
    { label: String($t('parameters')), value: 'parameters' },
    { label: String($t('attributes')), value: 'attributes' },
])

function switchPanelType(type: 'config') {
    if (type !== selectedPanelType.value && panelConfigRef.value?.hasAnyChanges) {
        panelConfigRef.value.discardAll()
    }
    selectedPanelType.value = type
}

function handlePanelClose() {
    if (panelConfigRef.value?.hasAnyChanges) {
        panelConfigRef.value.discardAll()
    }
    selectedServer.value = null
    selectedPanelType.value = null
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
            if (panelConfigRef.value?.hasAnyChanges && row.depotId !== selectedServer.value?.depotId) {
                panelConfigRef.value.discardAll()
            }
            selectedServer.value = row
            switchPanelType('config')
        }
    }
]

const filteredServers = computed(() => {
    if (!filterQuery.value) return servers.value
    const q = filterQuery.value.toLowerCase()
    return servers.value.filter(s =>
        s.depotId.toLowerCase().includes(q) ||
        (s.description?.toLowerCase().includes(q))
    )
})

function handleRowSelect(row: Server) {
    if (panelConfigRef.value?.hasAnyChanges && row.depotId !== selectedServer.value?.depotId) {
        panelConfigRef.value.discardAll()
    }
    selectedServer.value = row
    if (selectedPanelType.value !== null) {
        selectedPanelType.value = null
    }
}

const getServerType = (row: unknown): string => (row as Server).type || ''

async function fetchServers() {
    loading.value = true
    error.value = null
    try {
        const result = await getDepots({})
        if (result.error) {
            error.value = result.error.message
        } else if (result.data) {
            servers.value = result.data
            const configServer = result.data.find(d => d.type === 'OpsiConfigserver')
            if (configServer) {
                stateStore.setConfigServer(configServer.depotId)
            } else if (result.data[0] && stateStore.depots.length === 0) {
                stateStore.setDepots([result.data[0].depotId])
            }
        }
    } catch (e) {
        error.value = (e as Error).message
    } finally {
        loading.value = false
    }
}

onMounted(() => {
    fetchServers()
})
</script>
