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
            <LayoutsPageLayout show-refresh :loading="loading" @refresh="fetchServers">
                <UAlert v-if="error" color="error" :title="$t('error')" :description="error" class="mb-4"
                    :close-button="{ icon: icons.close, color: 'error', variant: 'link' }" @close="error = null" />

                <!-- Servers Table -->
                <SharedDataTable
                    :rows="servers"
                    :columns="columns"
                    :loading="loading"
                    table-id="servers"
                    row-key="depotId"
                    :actions="tableActions"
                    :selectable="false"
                    :filterable="true"
                    :show-refresh="false"
                    :clickable="true"
                    @select="handleRowSelect"
                    @refresh="fetchServers"
                >
                    <template #cell-type="{ row }">
                        <SharedStatusBadge
                            :status="getServerType(row) === 'OpsiConfigserver' ? 'info' : 'neutral'"
                            :label="String(getServerType(row) === 'OpsiConfigserver' ? $t('configserver') : $t('depot'))"
                        />
                    </template>
                    <template #cell-description="{ row }">
                        {{ (row as Server).description || '-' }}
                    </template>
                </SharedDataTable>
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
import type { DataTableAction } from '~/components/shared/DataTable.vue'
import type { DataTableColumnDef } from '~/composables/useDataTableSettings'
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

const columns: DataTableColumnDef[] = [
    { key: 'depotId', label: String($t('serverId')), sortable: true, alwaysVisible: true },
    { key: 'description', label: String($t('description')), sortable: true, class: 'hidden md:table-cell' },
    { key: 'type', label: String($t('type')), sortable: true, class: 'hidden sm:table-cell' },
]

const tableActions: DataTableAction<Server>[] = [
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
