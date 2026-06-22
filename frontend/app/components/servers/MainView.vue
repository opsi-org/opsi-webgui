<!--
  This file is part of opsi-webgui application.
  opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
  Copyright (c) uib GmbH <info@uib.de> 2026
  All rights reserved.
  License: AGPL-3.0

  ServersMainView - Server table with detail panel.
-->
<template>
    <LayoutsPageLayout show-refresh :loading="loading" :show-panel="!!panelServer" @refresh="fetchServers"
        @close-panel="closePanel">
        <template #actions>
            <CoreAppButton v-if="changesDetected && !autoRefreshEnabled" :icon="icons.refresh" color="warning"
                variant="soft" size="xs" @click="manualRefresh" :title="lastChangeDescription">
                {{ $t('bus.changes') }}
            </CoreAppButton>
        </template>

        <CoreAppErrorBanner :error="error" @close="error = null" />

        <CoreAppDataTable :rows="servers" :columns="columns" :loading="loading" table-id="servers" row-key="depotId"
            :selectable="true" :filterable="true" :show-refresh="false" :clickable="true" :total-items="totalItems"
            :selected-keys="selectionStore.selectedServers" :active-key="panelServer?.depotId"
            @row-activate="handleRowActivate" @selection-change="handleSelectionChange" @page-change="handlePageChange"
            @refresh="fetchServers">
            <template #cell-depotId="{ row }">
                <CoreAppIcon :name="(row as Server).type === 'OpsiConfigserver' ? icons.serverStack : icons.server"
                    class="w-3.5 h-3.5 text-(--color-text-muted) mr-2" />
                <span :class="(row as Server).type === 'OpsiConfigserver' ? 'font-bold' : ''">{{
                    (row as Server).depotId
                    }}</span>
            </template>
            <template #cell-type="{ row }">
                <CoreAppStatusBadge :status="(row as Server).type === 'OpsiConfigserver' ? 'info' : 'neutral'"
                    :label="String((row as Server).type || '-')" />
            </template>
            <template #cell-description="{ row }">
                {{ (row as Server).description || '-' }}
            </template>
            <template #row-actions="{ row }">
                <CoreAppButton :icon="icons.config" variant="ghost" size="xs" :title="$t('config.title')"
                    :color="panelServer?.depotId === (row as Server).depotId ? 'primary' : 'neutral'"
                    :class="panelServer?.depotId === (row as Server).depotId ? 'bg-(--color-primary-soft-bg)! text-(--color-primary-soft-text)!' : ''"
                    @click.stop="openConfig(row as Server)" />
            </template>
        </CoreAppDataTable>

        <template #panel-title>
            <span class="flex items-center gap-2">
                <CoreAppIcon :name="icons.server" class="w-4 h-4 shrink-0" />
                {{ panelServer?.depotId }}
            </span>
        </template>
        <template #panel-subtitle>{{ $t('config.title') }}</template>
        <template #panel>
            <div v-if="panelServer" class="h-full">
                <HostsConfigTabs v-if="panelType === 'config'" ref="configTabsRef" :host-id="panelServer.depotId"
                    host-type="server" :tab="panelTab" panel-mode :readonly="isReadOnly || !hasServerWriteAccess"
                    @update:tab="panelTab = $event" />
            </div>

            <CoreAppNavigationGuardModal v-model="showLeaveWarning" @cancel="cancelPanelLeave"
                @confirm="confirmPanelLeave" />
        </template>
    </LayoutsPageLayout>
</template>

<script setup lang="ts">
import type { DataTableColumnDef } from '~/composables/useDataTableSettings'
import type { PageChangeParams } from '~/components/core/AppDataTable.vue'
import type { Server } from '~/types'
import { useSelectionStore } from '~/stores/selectionStore'

const icons = useIcons()
const { t: $t } = useI18n()
const { getServers } = useApiHelpers()
const selectionStore = useSelectionStore()
const router = useRouter()
const route = useRoute()
const { isReadOnly, hasServerWriteAccess } = useUserPermissions()
const { autoRefreshEnabled, changesDetected, lastChangeDescription, manualRefresh } = useAutoRefresh(fetchServers)

const loading = ref(false)
const error = ref<string | null>(null)
const servers = ref<Server[]>([])
const totalItems = ref(0)
const panelServer = ref<Server | null>(null)
const panelType = ref<'config' | null>(null)
const panelTab = ref('parameters')
const lastPageParams = ref<PageChangeParams | null>(null)
const configTabsRef = ref<{ hasAnyChanges: boolean; discardAll: () => void } | null>(null)

const { showLeaveWarning, checkUnsavedAndDo, confirmLeave: confirmPanelLeave, cancelLeave: cancelPanelLeave, setPanelQuery, clearPanelQuery } = usePanelRouter({
    entityQueryKey: 'server',
    hasUnsavedChanges: () => configTabsRef.value?.hasAnyChanges ?? false,
    discardAllChanges: () => configTabsRef.value?.discardAll?.(),
    additionalQueryKeys: ['configType'],
})

const columns: DataTableColumnDef[] = [
    { key: 'depotId', label: String($t('fields.serverId')), labelKey: 'fields.serverId', sortable: true, alwaysVisible: true },
    { key: 'description', label: String($t('common.description')), labelKey: 'common.description', sortable: true },
    { key: 'type', label: String($t('common.type')), labelKey: 'common.type', sortable: true },
    { key: 'ip', label: String($t('fields.ip')), labelKey: 'fields.ip', sortable: true, visible: false },
]

function doOpenConfig(row: Server) {
    panelServer.value = row
    panelType.value = 'config'
    setPanelQuery(row.depotId, { configType: panelTab.value })
}

function openConfig(row: Server) {
    checkUnsavedAndDo(() => doOpenConfig(row))
}

function doClosePanel() {
    panelServer.value = null
    panelType.value = null
    clearPanelQuery()
}

function closePanel() {
    checkUnsavedAndDo(() => doClosePanel())
}

function handleRowActivate(row: Server) {
    checkUnsavedAndDo(() => doOpenConfig(row))
}

function handleSelectionChange(_rows: Server[], keys: string[]) {
    selectionStore.setServers(keys, 'table')
}

function handlePageChange(params: PageChangeParams) {
    lastPageParams.value = params
    fetchServers(params)
}

async function fetchServers(params?: PageChangeParams) {
    loading.value = true
    error.value = null
    try {
        const p: Record<string, unknown> = {}
        if (params) {
            p.pageNumber = params.pageNumber
            p.perPage = params.perPage
            p.sortBy = params.sortBy
            p.sortDesc = params.sortDesc
            p.filterQuery = params.filterQuery
        }
        const result = await getServers(p)
        if (result.error) { error.value = result.error.message; return }
        if (result.data) {
            servers.value = result.data as Server[]
            if (result.total !== null) totalItems.value = result.total
            const cs = result.data.find(d => d.type === 'OpsiConfigserver')
            if (cs) {
                selectionStore.setConfigServer(cs.depotId)
                if (selectionStore.selectedServers.length === 0) {
                    selectionStore.setServers([cs.depotId])
                }
            }
            else if (result.data[0] && selectionStore.selectedServers.length === 0)
                selectionStore.setServers([result.data[0].depotId])
        }
    } catch (e) { error.value = (e as Error).message }
    finally { loading.value = false }
}

watch(panelTab, (newTab) => {
    if (panelType.value === 'config' && panelServer.value) {
        router.replace({ query: { ...route.query as Record<string, string>, configType: newTab } })
    }
})

onMounted(async () => {
    await fetchServers()
    const serverId = route.query.server as string | undefined
    const configType = route.query.configType as string | undefined
    if (configType) {
        const normalized = configType === 'attribute' ? 'attributes' : configType === 'parameter' ? 'parameters' : configType
        if (normalized === 'parameters' || normalized === 'attributes') {
            panelTab.value = normalized
        }
    }
    if (serverId && route.query.view === 'panel') {
        const s = servers.value.find(sv => sv.depotId === serverId)
        if (s) doOpenConfig(s)
    }
})
</script>
