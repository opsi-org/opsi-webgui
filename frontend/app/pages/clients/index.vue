<template>
	<LayoutsDetailPanel :showPanel="!!panelClient" @close="panelClient = null; panelType = null">
		<template #main>
			<LayoutsPageLayout show-refresh :loading="loading" @refresh="fetchClients">
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
					<UButton v-if="selectionStore.selectedClients.length > 0" :icon="icons.product" color="primary"
						size="sm" @click="navigateTo('/clients/products/LocalbootProduct')">
						{{ $t('products') }}
					</UButton>
					<NuxtLink to="/clients/add">
						<UButton :icon="icons.add" color="primary" size="sm">
							<span class="hidden sm:inline">{{ $t('addNew') }}</span>
						</UButton>
					</NuxtLink>
				</template>

				<UAlert v-if="error" color="error" :title="$t('error')" :description="error" class="mb-4"
					:close-button="{ icon: icons.close, color: 'error', variant: 'link' }" @close="error = null" />

				<!-- Inline action status bar -->
				<div v-if="actionStatus" class="mb-3">
					<UAlert :color="actionStatus.type" :title="actionStatus.title" :description="actionStatus.message"
						variant="subtle"
						:close-button="{ icon: icons.close, color: actionStatus.type, variant: 'link' }"
						@close="actionStatus = null" />
				</div>

				<SharedDataTable :rows="clients" :columns="columns" :loading="loading" table-id="clients"
					row-key="clientId" :selectable="true" :filterable="true" :show-refresh="false" :clickable="true"
					:selected-keys="selectionStore.selectedClients" @row-activate="handleRowActivate"
					@selection-change="handleSelectionChange" @refresh="fetchClients">
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
						{{ (row as Client).lastSeen ? new Date((row as Client).lastSeen as string).toLocaleString() :
							'-' }}
					</template>
					<template #cell-uefi="{ row }">
						<SharedStatusBadge v-if="(row as Client).uefi" status="info" label="UEFI" />
						<span v-else class="text-(--color-text-muted)">-</span>
					</template>
					<template #cell-depotId="{ row }">
						<span class="text-xs">{{ (row as Client).depotId || '-' }}</span>
					</template>
					<template #cell-version_outdated="{ row }">
						<ClientsStatisticBadge :value="(row as Client).version_outdated"
							:icon="icons.productsOutdatedLocal" :tooltip="$t('version_outdated_localboot')"
							status="warning" />
					</template>
					<template #cell-version_outdated_netboot="{ row }">
						<ClientsStatisticBadge :value="(row as Client).version_outdated_netboot"
							:icon="icons.productsOutdatedNet" :tooltip="$t('version_outdated_netboot')"
							status="warning" />
					</template>
					<template #cell-installationStatus_unknown="{ row }">
						<ClientsStatisticBadge :value="(row as Client).installationStatus_unknown"
							:icon="icons.productInstallationStatusUnknown" :tooltip="$t('installationStatus_unknown')"
							status="warning" />
					</template>
					<template #cell-installationStatus_installed="{ row }">
						<ClientsStatisticBadge :value="(row as Client).installationStatus_installed"
							:icon="icons.productInstallationStatusInstalled"
							:tooltip="$t('installationStatus_installed')" status="success" />
					</template>
					<template #cell-actionResult_successful="{ row }">
						<ClientsStatisticBadge :value="(row as Client).actionResult_successful"
							:icon="icons.productActionResultSuccessful" :tooltip="$t('actionResult_successful')"
							status="success" />
					</template>
					<template #cell-actionResult_failed="{ row }">
						<ClientsStatisticBadge :value="(row as Client).actionResult_failed"
							:icon="icons.productsFailedActionResult" :tooltip="$t('actionResult_failed')"
							status="error" />
					</template>
					<template #cell-reachable="{ row }">
						<ClientsReachableBadge :client-id="(row as Client).clientId"
							:reachable="reachableStatus[(row as Client).clientId]"
							:loading="reachableLoading[(row as Client).clientId]"
							@check="checkReachability((row as Client).clientId)" />
					</template>
					<template #row-actions="{ row }">
						<ClientsRowActionsDropdown :client-id="(row as Client).clientId"
							@open-config="openPanel(row as Client, 'config')"
							@open-logs="openPanel(row as Client, 'logs')"
							@open-clone="openPanel(row as Client, 'clone')" @action-complete="handleActionComplete" />
					</template>
				</SharedDataTable>
			</LayoutsPageLayout>
		</template>

		<template #title>{{ panelClient?.clientId }}</template>
		<template #panel>
			<div v-if="panelClient">
				<HostsConfigView v-if="panelType === 'config'" :host-id="panelClient.clientId" host-type="client"
					:tab="panelTab" panel-mode @update:tab="panelTab = $event" />
				<ClientsLogsView v-if="panelType === 'logs'" :client-id="panelClient.clientId" panel-mode />
				<ClientsCloneView v-if="panelType === 'clone'" :source-id="panelClient.clientId" panel-mode
					@saved="fetchClients" />
			</div>
		</template>
	</LayoutsDetailPanel>
</template>

<script setup lang="ts">
import type { DataTableColumnDef } from '~/composables/useDataTableSettings'
import type { Client } from '~/types'
import { useSelectionStore } from '~/stores/selectionStore'

definePageMeta({ layout: 'default' })

const icons = useIcons()
const { t: $t } = useI18n()
const { getClients, getServerIds, checkClientReachable } = useApiHelpers()
const selectionStore = useSelectionStore()

const loading = ref(false)
const error = ref<string | null>(null)
const clients = ref<Client[]>([])
const panelClient = ref<Client | null>(null)
const panelType = ref<'config' | 'logs' | 'clone' | null>(null)
const panelTab = ref('parameters')
const reachableStatus = ref<Record<string, boolean | undefined>>({})
const reachableLoading = ref<Record<string, boolean>>({})
const actionStatus = ref<{ type: 'success' | 'error' | 'warning' | 'info'; title: string; message: string } | null>(null)

const { isConnected: mbConnected, autoRefreshEnabled, changesDetected, manualRefresh } = useAutoRefreshClients(fetchClients)

const columns: DataTableColumnDef[] = [
	{ key: 'clientId', label: String($t('clientId')), sortable: true, alwaysVisible: true },
	{ key: 'version_outdated', label: String($t('version_outdated_localboot')), headerIcon: icons.productsOutdatedLocal, sortable: true, class: 'text-center w-10', minWidth: '50px' },
	{ key: 'version_outdated_netboot', label: String($t('version_outdated_netboot')), headerIcon: icons.productsOutdatedNet, sortable: true, class: 'text-center w-10', minWidth: '50px' },
	{ key: 'installationStatus_installed', label: String($t('installationStatus_installed')), headerIcon: icons.productInstallationStatusInstalled, sortable: true, class: 'text-center w-10', minWidth: '50px' },
	{ key: 'installationStatus_unknown', label: String($t('installationStatus_unknown')), headerIcon: icons.productInstallationStatusUnknown, sortable: true, visible: false, class: 'text-center w-10', minWidth: '50px' },
	{ key: 'actionResult_failed', label: String($t('actionResult_failed')), headerIcon: icons.productsFailedActionResult, sortable: true, class: 'text-center w-10', minWidth: '50px' },
	{ key: 'actionResult_successful', label: String($t('actionResult_successful')), headerIcon: icons.productActionResultSuccessful, sortable: true, visible: false, class: 'text-center w-10', minWidth: '50px' },
	{ key: 'reachable', label: String($t('reachable')), headerIcon: icons.clientReachable, sortable: false, class: 'text-center w-10', minWidth: '50px' },
	{ key: 'description', label: String($t('description')), sortable: true },
	{ key: 'lastSeen', label: String($t('lastSeen')), sortable: true },
	{ key: 'macAddress', label: String($t('macAddress')), sortable: true, visible: false },
	{ key: 'ipAddress', label: String($t('ipAddress')), sortable: true, visible: false },
	{ key: 'depotId', label: String($t('server')), sortable: true, visible: false },
	{ key: 'uefi', label: 'UEFI', sortable: true, visible: false },
]

function openPanel(client: Client, type: 'config' | 'logs' | 'clone') {
	panelClient.value = client
	panelType.value = type
}

/** Single-select row click: select this client + open config panel */
function handleRowActivate(row: Client) {
	selectionStore.setClients([row.clientId], 'table')
	openPanel(row, 'config')
}

function handleSelectionChange(_rows: Client[], keys: string[]) {
	selectionStore.setClients(keys, 'table')
}

async function checkReachability(clientId: string) {
	reachableLoading.value[clientId] = true
	try {
		const result = await checkClientReachable([clientId])
		if (result.data) reachableStatus.value[clientId] = result.data[clientId]
	} catch { /* */ }
	finally { reachableLoading.value[clientId] = false }
}

function handleActionComplete(action: string, success: boolean) {
	// Show inline status instead of toast
	if (success) {
		actionStatus.value = {
			type: 'success',
			title: String($t('success')),
			message: String($t(`actionCompleted.${action}`, action))
		}
	} else {
		actionStatus.value = {
			type: 'error',
			title: String($t('error')),
			message: String($t(`actionFailed.${action}`, action))
		}
	}
	// Auto-dismiss only success messages after 5 seconds, errors stay until manually closed
	if (success) {
		setTimeout(() => { actionStatus.value = null }, 5000)
	}
	if ((action === 'delete' || action === 'rename') && success) fetchClients()
}

async function fetchClients() {
	loading.value = true
	error.value = null
	try {
		await selectionStore.ensureServersSelected()
		if (selectionStore.selectedServers.length === 0) {
			const depotResult = await getServerIds()
			const first = depotResult.data?.[0]
			if (first) selectionStore.setServers([first])
			else { error.value = String($t('message.noServerSelected')); return }
		}
		const result = await getClients({
			selectedDepots: selectionStore.selectedServersParam,
			selectedClients: `[${selectionStore.selectedClients.join(',')}]`,
		})
		if (result.error) error.value = result.error.message
		else if (result.data) {
			clients.value = result.data as Client[]
			// Auto-check reachability for visible clients
			checkAllReachability(result.data as Client[])
		}
	} catch (e) { error.value = (e as Error).message }
	finally { loading.value = false }
}

async function checkAllReachability(clientList: Client[]) {
	const ids = clientList.map(c => c.clientId)
	if (ids.length === 0) return
	// Mark all as loading
	for (const id of ids) reachableLoading.value[id] = true
	try {
		const result = await checkClientReachable(ids)
		if (result.data) {
			for (const [id, status] of Object.entries(result.data)) {
				reachableStatus.value[id] = status
			}
		}
	} catch { /* silently fail */ }
	finally {
		for (const id of ids) reachableLoading.value[id] = false
	}
}

watch(() => selectionStore.selectedServers, fetchClients, { deep: true })

onMounted(fetchClients)
</script>
