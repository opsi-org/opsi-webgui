<template>
    <LayoutsDetailPanel :showPanel="!!panelServer" @close="closePanel">
        <template #main>
            <LayoutsPageLayout show-refresh :loading="loading" @refresh="fetchServers">
                <template #actions>
                    <UButton v-if="changesDetected && !autoRefreshEnabled" :icon="icons.refresh" color="warning"
                        variant="soft" size="xs" @click="manualRefresh" :title="lastChangeDescription">
                        {{ $t('changesDetected') }}
                    </UButton>
                </template>

                <SharedAlertInline v-if="error" color="error" :title="$t('error')" :description="error" class="mb-4" closable
                    @close="error = null" />

                <SharedDataTable :rows="servers" :columns="columns" :loading="loading" table-id="servers"
                    row-key="depotId" :selectable="true" :filterable="true" :show-refresh="false" :clickable="true"
                    :total-items="totalItems" :selected-keys="selectionStore.selectedServers"
                    @row-activate="handleRowActivate" @selection-change="handleSelectionChange"
                    @page-change="handlePageChange" @refresh="fetchServers">
                    <template #cell-type="{ row }">
                        <SharedStatusBadge :status="(row as Server).type === 'OpsiConfigserver' ? 'info' : 'neutral'"
                            :label="String((row as Server).type || '-')" />
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

        <template #title>
            <span class="flex items-center gap-2">
                <UIcon :name="icons.server" class="w-4 h-4 text-opsi-blue shrink-0" />
                {{ panelServer?.depotId }}
            </span>
        </template>
        <template #subtitle>{{ $t('configuration') }}</template>
        <template #panel>
            <div v-if="panelServer">
                <HostsConfigTabs v-if="panelType === 'config'" ref="configTabsRef" :host-id="panelServer.depotId"
                    host-type="server" :tab="panelTab" panel-mode :readonly="isReadOnly || !hasServerWriteAccess" @update:tab="panelTab = $event" />
            </div>

            <SharedNavigationGuardModal v-model="showLeaveWarning" @cancel="cancelPanelLeave"
                @confirm="confirmPanelLeave" />
        </template>
    </LayoutsDetailPanel>
</template>

<script setup lang="ts">
import type { DataTableColumnDef } from '~/composables/useDataTableSettings'
import type { PageChangeParams } from '~/components/shared/DataTable.vue'
import type { Server } from '~/types'
import { useSelectionStore } from '~/stores/selectionStore'

definePageMeta({ layout: 'default' })

const icons = useIcons()
const { t: $t } = useI18n()
const { getServers } = useApiHelpers()
const selectionStore = useSelectionStore()
const router = useRouter()
const route = useRoute()
const { isReadOnly, hasServerWriteAccess } = useFeatureFlags()
const { autoRefreshEnabled, changesDetected, lastChangeDescription, manualRefresh } = useAutoRefresh(fetchServers)

const loading = ref(false)
const error = ref<string | null>(null)
const servers = ref<Server[]>([])
const totalItems = ref(0)
const panelServer = ref<Server | null>(null)
const panelType = ref<'config' | null>(null)
const panelTab = ref('parameters')
const lastPageParams = ref<PageChangeParams | null>(null)
const configTabsRef = ref<any>(null)
const showLeaveWarning = ref(false)
const pendingPanelAction = ref<(() => void) | null>(null)
let resolveRouteLeave: ((ok: boolean) => void) | null = null

// Route-level guard: intercepts navigation away from this page when the panel has unsaved changes
onBeforeRouteLeave(() => {
    if (!configTabsRef.value?.hasAnyChanges) return true
    showLeaveWarning.value = true
    return new Promise<boolean>((resolve) => {
        resolveRouteLeave = resolve
    })
})

const columns: DataTableColumnDef[] = [
    { key: 'depotId', label: String($t('serverId')), labelKey: 'serverId', sortable: true, alwaysVisible: true },
    { key: 'description', label: String($t('description')), labelKey: 'description', sortable: true },
    { key: 'type', label: String($t('type')), labelKey: 'type', sortable: true },
    { key: 'ip', label: String($t('ipAddress')), labelKey: 'ipAddress', sortable: true, visible: false },
]

function openConfig(row: Server) {
    panelServer.value = row
    panelType.value = 'config'
    router.replace({ query: { ...route.query, server: row.depotId, view: 'panel' } })
}

function doClosePanel() {
    panelServer.value = null
    panelType.value = null
    const { server: _s, view: _v, ...rest } = route.query
    router.replace({ query: rest })
}

function closePanel() {
    checkUnsavedAndDo(() => doClosePanel())
}

function checkUnsavedAndDo(action: () => void) {
    if (configTabsRef.value?.hasAnyChanges) {
        pendingPanelAction.value = action
        showLeaveWarning.value = true
        return
    }
    action()
}

function confirmPanelLeave() {
    configTabsRef.value?.discardAll?.()
    showLeaveWarning.value = false
    if (resolveRouteLeave) {
        resolveRouteLeave(true)
        resolveRouteLeave = null
    }
    if (pendingPanelAction.value) {
        pendingPanelAction.value()
        pendingPanelAction.value = null
    }
}

function cancelPanelLeave() {
    showLeaveWarning.value = false
    if (resolveRouteLeave) {
        resolveRouteLeave(false)
        resolveRouteLeave = null
    }
    pendingPanelAction.value = null
}

/** Single-select row click: open config panel but keep config server selected */
function handleRowActivate(row: Server) {
    checkUnsavedAndDo(() => openConfig(row))
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

onMounted(async () => {
    await fetchServers()
    // Open panel from URL if server specified
    const serverId = route.query.server as string | undefined
    if (serverId && route.query.view === 'panel') {
        const s = servers.value.find(sv => sv.depotId === serverId)
        if (s) openConfig(s)
    }
})
</script>
