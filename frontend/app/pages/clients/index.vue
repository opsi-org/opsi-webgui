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
            <LayoutsPageLayout v-model="filterQuery" show-search :search-placeholder="String($t('typeToFilter'))"
                show-refresh :loading="loading" @refresh="fetchClients">
                <template #actions>
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

                <template #stats>
                    <div class="flex items-center gap-4 text-sm">
                        <span class="text-[--color-text-muted)">
                            {{ $t('total') }}: <span class="font-medium text-[--color-text)">{{
                                clients.length }}</span>
                        </span>
                        <span v-if="selectedClients.length > 0" class="text-opsi-blue">
                            {{ $t('selected') }}: {{ selectedClients.length }}
                        </span>
                    </div>
                </template>

                <div v-if="error"
                    class="mb-4 p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg">
                    {{ error }}
                </div>

                <!-- Clients Table -->
                <SharedTable :rows="filteredClients" :columns="columns" :loading="loading" :row-key="'clientId'"
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
                        <span v-else class="text-[--color-text-muted)">-</span>
                    </template>

                    <!-- Statistics Columns -->
                    <template #version_outdated-data="{ row }">
                        <StatisticBadge :value="(row as Client).version_outdated" :icon="icons.productsOutdatedLocal"
                            :tooltip="$t('version_outdated_localboot')" status="warning"
                            :link="`/clients/products/LocalbootProduct?sortBy=version&selectedClient=${(row as Client).clientId}`" />
                    </template>
                    <template #version_outdated_netboot-data="{ row }">
                        <StatisticBadge :value="(row as Client).version_outdated_netboot"
                            :icon="icons.productsOutdatedNet" :tooltip="$t('version_outdated_netboot')" status="warning"
                            :link="`/clients/products/NetbootProduct?sortBy=version&selectedClient=${(row as Client).clientId}`" />
                    </template>
                    <template #installationStatus_unknown-data="{ row }">
                        <StatisticBadge :value="(row as Client).installationStatus_unknown"
                            :icon="icons.productInstallationStatusUnknown" :tooltip="$t('installationStatus_unknown')"
                            status="warning"
                            :link="`/clients/products/LocalbootProduct?sortBy=installationStatus&selectedClient=${(row as Client).clientId}`" />
                    </template>
                    <template #installationStatus_installed-data="{ row }">
                        <StatisticBadge :value="(row as Client).installationStatus_installed"
                            :icon="icons.productInstallationStatusInstalled"
                            :tooltip="$t('installationStatus_installed')" status="success"
                            :link="`/clients/products/LocalbootProduct?sortBy=installationStatus&selectedClient=${(row as Client).clientId}`" />
                    </template>
                    <template #actionResult_successful-data="{ row }">
                        <StatisticBadge :value="(row as Client).actionResult_successful"
                            :icon="icons.productActionResultSuccessful" :tooltip="$t('actionResult_successful')"
                            status="success"
                            :link="`/clients/products/LocalbootProduct?sortBy=actionResult&selectedClient=${(row as Client).clientId}`" />
                    </template>
                    <template #actionResult_failed-data="{ row }">
                        <StatisticBadge :value="(row as Client).actionResult_failed"
                            :icon="icons.productsFailedActionResult" :tooltip="$t('actionResult_failed')" status="error"
                            :link="`/clients/products/LocalbootProduct?sortBy=actionResult&selectedClient=${(row as Client).clientId}`" />
                    </template>
                    <template #reachable-data="{ row }">
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
                </SharedTable>
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
import type { TableColumn, TableAction } from '~/types/table.types'
import type { Client } from '~/types/api/client.types'
import { useStateStore } from '~/stores/stateStore'

definePageMeta({ layout: 'default' })

const icons = useIcons()
const { t: $t } = useI18n()
const router = useRouter()
const toast = useToast()
const { getClients, getDepotIds, checkClientReachable } = useApiHelpers()
const stateStore = useStateStore()

const loading = ref(false)
const error = ref<string | null>(null)
const selectedClient = ref<Client | null>(null)
const clients = ref<Client[]>([])
const selectedClients = ref<Client[]>([])
const filterQuery = ref('')
const selectedPanelType = ref<'config' | 'logs' | 'clone' | null>(null)
const panelConfigRef = ref<any>(null)
const panelActiveTab = ref<string>('parameters')
const reachableStatus = ref<Record<string, boolean | undefined>>({})
const reachableLoading = ref<Record<string, boolean>>({})

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

const columns: TableColumn<Client>[] = [
    { key: 'clientId', label: String($t('clientId')), sortable: true, alwaysVisible: true },
    { key: 'description', label: String($t('description')), sortable: true, class: 'hidden md:table-cell' },
    { key: 'macAddress', label: String($t('macAddress')), sortable: true, class: 'hidden lg:table-cell', visible: false },
    { key: 'ipAddress', label: String($t('ipAddress')), sortable: true, class: 'hidden lg:table-cell', visible: false },
    { key: 'lastSeen', label: String($t('lastSeen')), sortable: true, class: 'hidden xl:table-cell' },
    { key: 'uefi', label: 'UEFI', sortable: true, class: 'hidden xl:table-cell', visible: false },
    // Statistics columns
    { key: 'version_outdated', label: String($t('version_outdated_localboot')), sortable: true, visible: false, class: 'text-center w-12', icon: icons.productsOutdatedLocal },
    { key: 'version_outdated_netboot', label: String($t('version_outdated_netboot')), sortable: true, visible: false, class: 'text-center w-12', icon: icons.productsOutdatedNet },
    { key: 'installationStatus_unknown', label: String($t('installationStatus_unknown')), sortable: true, visible: false, class: 'text-center w-12', icon: icons.productInstallationStatusUnknown },
    { key: 'installationStatus_installed', label: String($t('installationStatus_installed')), sortable: true, visible: false, class: 'text-center w-12', icon: icons.productInstallationStatusInstalled },
    { key: 'actionResult_successful', label: String($t('actionResult_successful')), sortable: true, visible: false, class: 'text-center w-12', icon: icons.productActionResultSuccessful },
    { key: 'actionResult_failed', label: String($t('actionResult_failed')), sortable: true, visible: false, class: 'text-center w-12', icon: icons.productsFailedActionResult },
    { key: 'reachable', label: String($t('reachable')), sortable: true, visible: false, class: 'text-center w-12', icon: icons.clientReachable },
]

const tableActions: TableAction<Client>[] = [
    {
        icon: icons.config,
        label: String($t('configuration')),
        handler: (row) => {
            if (panelConfigRef.value?.hasAnyChanges && row.clientId !== selectedClient.value?.clientId) {
                panelConfigRef.value.discardAll()
            }
            selectedClient.value = row
            switchPanelType('config')
        }
    },
    {
        icon: icons.log,
        label: String($t('logs')),
        handler: (row) => {
            selectedClient.value = row
            switchPanelType('logs')
        }
    },
    {
        icon: icons.clone,
        label: String($t('clone')),
        handler: (row) => {
            selectedClient.value = row
            switchPanelType('clone')
        }
    }
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
    if (panelConfigRef.value?.hasAnyChanges && row.clientId !== selectedClient.value?.clientId) {
        panelConfigRef.value.discardAll()
    }
    selectedClient.value = row
    if (selectedPanelType.value !== 'logs' && selectedPanelType.value !== 'clone') {
        selectedPanelType.value = null
    }
}

function handleSelectionChange(rows: Client[]) {
    selectedClients.value = rows
}

onMounted(() => {
    fetchClients()
})
</script>
