<!--
This file is part of opsi-webgui application.
opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
Copyright (c) uib GmbH <info@uib.de> 2026
All rights reserved.
License: AGPL-3.0

Clients page - Clients table with detail panel for selected clients and selected action.
-->
<template>
    <LayoutsDetailPanel :showPanel="!!selectedClient" @close="handlePanelClose">
        <template #main>
            <LayoutsPageLayout show-refresh :loading="loading" @refresh="fetchClients">
                <template #actions>
                    <!-- Auto-refresh toggle with messagebus indicator -->
                    <div class="flex items-center gap-1.5 mr-2">
                        <span v-if="mbConnected" class="w-2 h-2 rounded-full bg-green-500"
                            title="MessageBus connected" />
                        <span v-else class="w-2 h-2 rounded-full bg-red-400" title="MessageBus disconnected" />
                        <label class="flex items-center gap-1 cursor-pointer text-xs text-(--color-text-muted)">
                            <input type="checkbox" v-model="autoRefreshEnabled"
                                class="rounded border-gray-300 text-opsi-blue focus:ring-opsi-blue w-3.5 h-3.5" />
                            {{ $t('autoRefresh') }}
                        </label>
                    </div>
                    <!-- Changes detected banner -->
                    <UButton v-if="changesDetected && !autoRefreshEnabled" :icon="icons.refresh" color="warning"
                        variant="soft" size="xs" @click="manualRefresh">
                        {{ $t('changesDetected') }}
                    </UButton>

                    <UButton v-if="selectedClients.length > 0" :icon="icons.product" color="primary" size="sm"
                        @click="navigateTo('/clients/products/LocalbootProduct')">
                        {{ $t('products') }}
                    </UButton>
                    <NuxtLink to="/clients/add">
                        <UButton :icon="icons.add" color="primary" size="sm">
                            <span class="hidden sm:inline">{{ $t('addNew') }}</span>
                        </UButton>
                    </NuxtLink>
                </template>

                <div v-if="error"
                    class="mb-4 p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg">
                    {{ error }}
                </div>

                <!-- Clients Table -->
                <SharedDataTable
                    :rows="clients"
                    :columns="columns"
                    :loading="loading"
                    table-id="clients"
                    row-key="clientId"
                    :selectable="true"
                    :filterable="true"
                    :show-refresh="false"
                    :clickable="true"
                    :selected-keys="selectedTableKeys"
                    @select="handleRowSelect"
                    @selection-change="handleSelectionChange"
                    @refresh="fetchClients"
                >
                    <template #cell-description="{ row }">
                        {{ (row as Client).description || '-' }}
                    </template>
                    <template #cell-macAddress="{ row }">
                        <span class="font-mono text-xs">{{ (row as Client).macAddress || '-' }}</span>
                    </template>
                    <template #cell-ipAddress="{ row }">
                        <span class="font-mono text-xs">{{ (row as Client).ipAddress || '-' }}</span>
                    </template>
                    <template #cell-lastSeen="{ row }">
                        {{ (row as Client).lastSeen ? new Date((row as Client).lastSeen as string).toLocaleString() : '-' }}
                    </template>
                    <template #cell-uefi="{ row }">
                        <SharedStatusBadge v-if="(row as Client).uefi" status="info" :label="'UEFI'" />
                        <span v-else class="text-(--color-text-muted)">-</span>
                    </template>

                    <!-- Statistics Columns -->
                    <template #cell-version_outdated="{ row }">
                        <StatisticBadge :value="(row as Client).version_outdated" :icon="icons.productsOutdatedLocal"
                            :tooltip="$t('version_outdated_localboot')" status="warning"
                            :link="`/clients/products/LocalbootProduct?sortBy=version&selectedClient=${(row as Client).clientId}`" />
                    </template>
                    <template #cell-version_outdated_netboot="{ row }">
                        <StatisticBadge :value="(row as Client).version_outdated_netboot"
                            :icon="icons.productsOutdatedNet" :tooltip="$t('version_outdated_netboot')" status="warning"
                            :link="`/clients/products/NetbootProduct?sortBy=version&selectedClient=${(row as Client).clientId}`" />
                    </template>
                    <template #cell-installationStatus_unknown="{ row }">
                        <StatisticBadge :value="(row as Client).installationStatus_unknown"
                            :icon="icons.productInstallationStatusUnknown" :tooltip="$t('installationStatus_unknown')"
                            status="warning"
                            :link="`/clients/products/LocalbootProduct?sortBy=installationStatus&selectedClient=${(row as Client).clientId}`" />
                    </template>
                    <template #cell-installationStatus_installed="{ row }">
                        <StatisticBadge :value="(row as Client).installationStatus_installed"
                            :icon="icons.productInstallationStatusInstalled"
                            :tooltip="$t('installationStatus_installed')" status="success"
                            :link="`/clients/products/LocalbootProduct?sortBy=installationStatus&selectedClient=${(row as Client).clientId}`" />
                    </template>
                    <template #cell-actionResult_successful="{ row }">
                        <StatisticBadge :value="(row as Client).actionResult_successful"
                            :icon="icons.productActionResultSuccessful" :tooltip="$t('actionResult_successful')"
                            status="success"
                            :link="`/clients/products/LocalbootProduct?sortBy=actionResult&selectedClient=${(row as Client).clientId}`" />
                    </template>
                    <template #cell-actionResult_failed="{ row }">
                        <StatisticBadge :value="(row as Client).actionResult_failed"
                            :icon="icons.productsFailedActionResult" :tooltip="$t('actionResult_failed')" status="error"
                            :link="`/clients/products/LocalbootProduct?sortBy=actionResult&selectedClient=${(row as Client).clientId}`" />
                    </template>
                    <template #cell-reachable="{ row }">
                        <ReachableBadge :client-id="(row as Client).clientId"
                            :reachable="reachableStatus[(row as Client).clientId]"
                            :loading="reachableLoading[(row as Client).clientId]"
                            @check="checkReachability((row as Client).clientId)" />
                    </template>

                    <!-- Row Actions (Client Actions Dropdown) -->
                    <template #row-actions="{ row }">
                        <ClientsRowActionsDropdown :client-id="(row as Client).clientId"
                            @open-config="openClientPanel((row as Client), 'config')"
                            @open-logs="openClientPanel((row as Client), 'logs')"
                            @open-clone="openClientPanel((row as Client), 'clone')"
                            @action-complete="handleActionComplete" />
                    </template>
                </SharedDataTable>
            </LayoutsPageLayout>
        </template>

        <template #title>{{ selectedClient?.clientId }}</template>

        <!-- Unsaved-changes controls  -->
        <template v-if="selectedPanelType === 'config'" #panelActions>
            <SharedUnsavedChangesModal :config-ref="panelConfigRef" size="xs" @save-all="panelConfigRef?.saveAll?.()"
                @discard-all="panelConfigRef?.discardAll?.()" />
        </template>

        <template #panel>
            <div v-if="selectedClient" class="space-y-4">
                <!-- Panel Content -->
                <div>
                    <div v-show="selectedPanelType === 'config'" class="flex flex-col gap-2">
                        <SharedTabsNav v-model="panelActiveTab" :tabs="panelConfigTabs" class="shrink-0" />
                        <HostsConfigTabs ref="panelConfigRef" :host-id="selectedClient.clientId" host-type="client"
                            :tab="panelActiveTab" :show-tabs="false" :show-change-banner="false" :panel-mode="true" />
                    </div>
                    <ClientsLogs v-show="selectedPanelType === 'logs'" :client-id="selectedClient.clientId" />
                    <ClientsClone v-show="selectedPanelType === 'clone'" :source-id="selectedClient.clientId"
                        @success="fetchClients" />
                </div>
            </div>
        </template>
    </LayoutsDetailPanel>
</template>

<script setup lang="ts">
import type { DataTableColumnDef } from '~/composables/useDataTableSettings'
import type { Client } from '~/types/api/client.types'
import { useStateStore } from '~/stores/stateStore'
import { useSelectionStore } from '~/stores/selectionStore'

definePageMeta({ layout: 'default' })

const icons = useIcons()
const { t: $t } = useI18n()
const toast = useToast()
const { getClients, getDepotIds, checkClientReachable } = useApiHelpers()
const stateStore = useStateStore()
const selectionStore = useSelectionStore()

const loading = ref(false)
const error = ref<string | null>(null)
const selectedClient = ref<Client | null>(null)
const clients = ref<Client[]>([])
const selectedPanelType = ref<'config' | 'logs' | 'clone' | null>(null)
const panelConfigRef = ref<any>(null)
const panelActiveTab = ref<string>('parameters')
const reachableStatus = ref<Record<string, boolean | undefined>>({})
const reachableLoading = ref<Record<string, boolean>>({})

// Messagebus auto-refresh integration
const { isConnected: mbConnected, autoRefreshEnabled, changesDetected, manualRefresh } = useAutoRefreshClients(fetchClients)

// Sync selected clients with selection store
const selectedClients = computed({
    get: () => clients.value.filter(c => selectionStore.selectedClients.includes(c.clientId)),
    set: (val: Client[]) => selectionStore.setClients(val.map(c => c.clientId), 'table')
})

// Selected keys for table sync
const selectedTableKeys = computed(() => selectionStore.selectedClients)

const panelConfigTabs = computed(() => [
    { label: String($t('parameters')), value: 'parameters' },
    { label: String($t('attributes')), value: 'attributes' },
])

function switchPanelType(type: 'config' | 'logs' | 'clone') {
    if (type !== selectedPanelType.value && panelConfigRef.value?.hasAnyChanges) {
        panelConfigRef.value.discardAll()
    }
    selectedPanelType.value = type
}

function handlePanelClose() {
    if (panelConfigRef.value?.hasAnyChanges) {
        panelConfigRef.value.discardAll()
    }
    selectedClient.value = null
    selectedPanelType.value = null
}

function openClientPanel(client: Client, type: 'config' | 'logs' | 'clone') {
    if (panelConfigRef.value?.hasAnyChanges && client.clientId !== selectedClient.value?.clientId) {
        panelConfigRef.value.discardAll()
    }
    selectedClient.value = client
    switchPanelType(type)
}

const columns: DataTableColumnDef[] = [
    { key: 'clientId', label: String($t('clientId')), sortable: true, alwaysVisible: true },
    { key: 'description', label: String($t('description')), sortable: true, class: 'hidden md:table-cell' },
    { key: 'macAddress', label: String($t('macAddress')), sortable: true, class: 'hidden lg:table-cell', visible: false },
    { key: 'ipAddress', label: String($t('ipAddress')), sortable: true, class: 'hidden lg:table-cell', visible: false },
    { key: 'lastSeen', label: String($t('lastSeen')), sortable: true, class: 'hidden xl:table-cell' },
    { key: 'uefi', label: 'UEFI', sortable: true, class: 'hidden xl:table-cell', visible: false },
    // Statistics columns
    { key: 'version_outdated', label: String($t('version_outdated_localboot')), sortable: true, visible: false, class: 'text-center w-12' },
    { key: 'version_outdated_netboot', label: String($t('version_outdated_netboot')), sortable: true, visible: false, class: 'text-center w-12' },
    { key: 'installationStatus_unknown', label: String($t('installationStatus_unknown')), sortable: true, visible: false, class: 'text-center w-12' },
    { key: 'installationStatus_installed', label: String($t('installationStatus_installed')), sortable: true, visible: false, class: 'text-center w-12' },
    { key: 'actionResult_successful', label: String($t('actionResult_successful')), sortable: true, visible: false, class: 'text-center w-12' },
    { key: 'actionResult_failed', label: String($t('actionResult_failed')), sortable: true, visible: false, class: 'text-center w-12' },
    { key: 'reachable', label: String($t('reachable')), sortable: true, visible: false, class: 'text-center w-12' },
]

async function fetchClients() {
    loading.value = true
    error.value = null
    try {
        await stateStore.ensureDepotsSelected()

        if (stateStore.depots.length === 0) {
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

async function checkReachability(clientId: string) {
    reachableLoading.value[clientId] = true
    try {
        const result = await checkClientReachable([clientId])
        if (result.data) {
            reachableStatus.value[clientId] = result.data[clientId]
        }
    } catch (e) {
        console.error('Failed to check reachability:', e)
    } finally {
        reachableLoading.value[clientId] = false
    }
}

function handleActionComplete(action: string, success: boolean) {
    if (action === 'delete' && success) {
        // Remove the deleted client from the list
        fetchClients()
    }
}

function handleRowSelect(row: Client) {
    // Row click now only toggles selection; detail panel opens via action buttons only
    selectionStore.toggleClient(row.clientId, 'table')
}

function handleSelectionChange(rows: Client[], keys: string[]) {
    selectedClients.value = rows
}

onMounted(() => {
    fetchClients()
})
</script>
