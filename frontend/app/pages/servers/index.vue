<template>
    <LayoutsDetailPanel :showPanel="!!panelServer" @close="panelServer = null; panelType = null">
        <template #main>
            <LayoutsPageLayout show-refresh :loading="loading" @refresh="fetchServers">
                <template #actions>
                    <div class="flex items-center gap-1.5 mr-2">
                        <span v-if="mbConnected" class="w-2 h-2 rounded-full bg-green-500"
                            :title="$t('messageBusConnected')" />
                        <span v-else class="w-2 h-2 rounded-full bg-red-400" :title="$t('messageBusDisconnected')" />
                        <label class="flex items-center gap-1 cursor-pointer text-xs text-(--color-text-muted)">
                            <input type="checkbox" v-model="autoRefreshEnabled"
                                class="rounded border-gray-300 text-opsi-blue focus:ring-opsi-blue w-3.5 h-3.5" />
                            {{ $t('autoRefresh') }}
                        </label>
                    </div>
                    <UButton v-if="changesDetected && !autoRefreshEnabled" :icon="icons.refresh" color="warning"
                        variant="soft" size="xs" @click="manualRefresh">
                        {{ $t('changesDetected') }}
                    </UButton>
                </template>

                <UAlert v-if="error" color="error" :title="$t('error')" :description="error" class="mb-4"
                    :close-button="{ icon: icons.close, color: 'error', variant: 'link' }" @close="error = null" />

                <SharedDataTable :rows="servers" :columns="columns" :loading="loading" table-id="servers"
                    row-key="depotId" :selectable="true" :filterable="true" :show-refresh="false" :clickable="true"
                    :selected-keys="selectionStore.selectedServers" @row-activate="handleRowActivate"
                    @selection-change="handleSelectionChange" @refresh="fetchServers">
                    <template #cell-type="{ row }">
                        <SharedStatusBadge :status="(row as Server).type === 'OpsiConfigserver' ? 'info' : 'neutral'"
                            :label="String((row as Server).type === 'OpsiConfigserver' ? $t('configserver') : $t('server'))" />
                    </template>
                    <template #cell-description="{ row }">
                        {{ (row as Server).description || '-' }}
                    </template>
                    <template #row-actions="{ row }">
                        <UButton :icon="icons.config" variant="ghost" color="neutral" size="xs"
                            :title="$t('configuration')" @click.stop="openConfig(row as Server)" />
                    </template>
                </SharedDataTable>
            </LayoutsPageLayout>
        </template>

        <template #title>{{ panelServer?.depotId }}</template>
        <template #panel>
            <div v-if="panelServer">
                <HostsConfigView v-if="panelType === 'config'" :host-id="panelServer.depotId" host-type="server"
                    :tab="panelTab" panel-mode @update:tab="panelTab = $event" />
            </div>
        </template>
    </LayoutsDetailPanel>
</template>

<script setup lang="ts">
import type { DataTableColumnDef } from '~/composables/useDataTableSettings'
import type { Server } from '~/types'
import { useSelectionStore } from '~/stores/selectionStore'

definePageMeta({ layout: 'default' })

const icons = useIcons()
const { t: $t } = useI18n()
const { getServers } = useApiHelpers()
const selectionStore = useSelectionStore()
const { isConnected: mbConnected, autoRefreshEnabled, changesDetected, manualRefresh } = useAutoRefresh(fetchServers)

const loading = ref(false)
const error = ref<string | null>(null)
const servers = ref<Server[]>([])
const panelServer = ref<Server | null>(null)
const panelType = ref<'config' | null>(null)
const panelTab = ref('parameters')

const columns: DataTableColumnDef[] = [
    { key: 'depotId', label: String($t('serverId')), sortable: true, alwaysVisible: true },
    { key: 'description', label: String($t('description')), sortable: true },
    { key: 'type', label: String($t('type')), sortable: true },
    { key: 'ip', label: String($t('ipAddress')), sortable: true, visible: false },
]

function openConfig(row: Server) {
    panelServer.value = row
    panelType.value = 'config'
}

/** Single-select row click: select + open config panel */
function handleRowActivate(row: Server) {
    selectionStore.setServers([row.depotId], 'table')
    openConfig(row)
}

function handleSelectionChange(_rows: Server[], keys: string[]) {
    selectionStore.setServers(keys, 'table')
}

async function fetchServers() {
    loading.value = true
    error.value = null
    try {
        const result = await getServers({})
        if (result.error) { error.value = result.error.message; return }
        if (result.data) {
            servers.value = result.data as Server[]
            const cs = result.data.find(d => d.type === 'OpsiConfigserver')
            if (cs) selectionStore.setConfigServer(cs.depotId)
            else if (result.data[0] && selectionStore.selectedServers.length === 0)
                selectionStore.setServers([result.data[0].depotId])
        }
    } catch (e) { error.value = (e as Error).message }
    finally { loading.value = false }
}

onMounted(fetchServers)
</script>
