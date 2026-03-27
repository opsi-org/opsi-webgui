<template>
	<SharedNavigationGuardModal v-model="showLeaveWarning" @cancel="cancelPanelLeave" @confirm="confirmPanelLeave" />

	<LayoutsDetailPanel :showPanel="!!panelClient || !!panelType" @close="closePanel">
		<template #main>
			<LayoutsPageLayout show-refresh :loading="loading" @refresh="fetchClients">
				<template #actions>
					<UButton v-if="changesDetected && !autoRefreshEnabled" :icon="icons.refresh" color="warning"
						variant="soft" size="xs" @click="manualRefresh" :title="lastChangeDescription">
						{{ $t('changesDetected') }}
					</UButton>
					<UButton v-if="selectionStore.selectedClients.length > 0" :icon="icons.product" color="primary"
						size="sm" @click="openProductsPanel">
						{{ $t('products') }}
					</UButton>
					<UButton :icon="icons.add" color="primary" size="sm" @click="openAddPanel">
						<span class="hidden sm:inline">{{ $t('addNew') }}</span>
					</UButton>
				</template>

				<UAlert v-if="error" color="error" :title="$t('error')" :description="error" class="mb-4" close
					@update:open="error = null" />

				<div v-if="actionStatus" class="mb-3">
					<UAlert :color="actionStatus.type" :title="actionStatus.title" :description="actionStatus.message"
						variant="subtle" close @update:open="actionStatus = null" />
				</div>

				<SharedDataTable :rows="clients" :columns="columns" :loading="loading" table-id="clients"
					row-key="clientId" :selectable="true" :filterable="true" :show-refresh="false" :clickable="true"
					:total-items="totalItems" :selected-keys="selectionStore.selectedClients"
					:sort-by-selection-enabled="sortBySelectionEnabled" @row-activate="handleRowActivate"
					@selection-change="handleSelectionChange" @page-change="handlePageChange" @refresh="fetchClients">
					<template #cell-description="{ row }">
						{{ (row as Client).description || '-' }}
					</template>
					<template #cell-macAddress="{ row }">
						<span class="font-mono text-sm text-(--color-text)">{{ (row as Client).macAddress || '-'
						}}</span>
					</template>
					<template #cell-ipAddress="{ row }">
						<span class="font-mono text-sm text-(--color-text)">{{ (row as Client).ipAddress || '-'
						}}</span>
					</template>
					<template #cell-lastSeen="{ row }">
						{{ (row as Client).lastSeen ? new Date((row as Client).lastSeen as
							string).toLocaleString('en-US', {
								year: 'numeric', month: 'numeric', day: 'numeric', hour:
									'numeric', minute: '2-digit', second: '2-digit', hour12: true
							}) :
							'-' }}
					</template>
					<template #cell-uefi="{ row }">
						<SharedStatusBadge v-if="(row as Client).uefi" status="info" label="UEFI" />
						<span v-else class="text-(--color-text-muted)">-</span>
					</template>
					<template #cell-version_outdated="{ row }">
						<ClientsStatisticBadge :value="(row as Client).version_outdated"
							:icon="icons.productsOutdatedLocal" label="L" :tooltip="$t('version_outdated_localboot')"
							status="warning"
							@stat-click="openProductsPanelForClient(row as Client, 'version_outdated')" />
					</template>
					<template #cell-version_outdated_netboot="{ row }">
						<ClientsStatisticBadge :value="(row as Client).version_outdated_netboot"
							:icon="icons.productsOutdatedLocal" label="N" :tooltip="$t('version_outdated_netboot')" status="warning"
							@stat-click="openProductsPanelForClient(row as Client, 'version_outdated')" />
					</template>
					<template #cell-installationStatus_unknown="{ row }">
						<ClientsStatisticBadge :value="(row as Client).installationStatus_unknown"
							:icon="icons.productInstallationStatusUnknown" :tooltip="$t('installationStatus_unknown')"
							status="warning"
							@stat-click="openProductsPanelForClient(row as Client, 'installationStatus')" />
					</template>
					<template #cell-installationStatus_installed="{ row }">
						<ClientsStatisticBadge :value="(row as Client).installationStatus_installed"
							:icon="icons.productInstallationStatusInstalled"
							:tooltip="$t('installationStatus_installed')" status="success"
							@stat-click="openProductsPanelForClient(row as Client, 'installationStatus')" />
					</template>
					<template #cell-actionResult_successful="{ row }">
						<ClientsStatisticBadge :value="(row as Client).actionResult_successful"
							:icon="icons.productActionResultSuccessful" :tooltip="$t('actionResult_successful')"
							status="success" @stat-click="openProductsPanelForClient(row as Client, 'actionResult')" />
					</template>
					<template #cell-actionResult_failed="{ row }">
						<ClientsStatisticBadge :value="(row as Client).actionResult_failed"
							:icon="icons.productsFailedActionResult" :tooltip="$t('actionResult_failed')" status="error"
							@stat-click="openProductsPanelForClient(row as Client, 'actionResult')" />
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

		<template #title>
			<span class="flex items-center gap-2">
				<UIcon :name="panelType === 'products' ? icons.product : panelType === 'add' ? icons.add : icons.client"
					class="w-4 h-4 text-opsi-blue shrink-0" />
				<template v-if="panelType === 'products'">{{ $t('products') }}</template>
				<template v-else-if="panelType === 'add'">{{ $t('addNew') }}</template>
				<template v-else>{{ panelClient?.clientId }}</template>
			</span>
		</template>
		<template #subtitle>
			<template v-if="panelType === 'config'">{{ $t('configuration') }}</template>
			<template v-else-if="panelType === 'logs'">{{ $t('logs') }}</template>
			<template v-else-if="panelType === 'clone'">{{ $t('clone') }}</template>
		</template>
		<template #panel>
			<div v-if="panelClient">
				<HostsConfigTabs v-if="panelType === 'config'" ref="configTabsRef" :host-id="panelClient.clientId"
					host-type="client" :tab="panelTab" panel-mode @update:tab="panelTab = $event" />
				<ClientsLogsView v-if="panelType === 'logs'" :client-id="panelClient.clientId" panel-mode />
				<ClientsCloneForm v-if="panelType === 'clone'" ref="cloneFormRef" :source-id="panelClient.clientId"
					panel-mode @saved="fetchClients" />
			</div>
			<template v-if="panelType === 'products'">
				<ProductsMainView ref="productsTableRef"
					:product-type="panelProductType === 'netboot' ? 'NetbootProduct' : 'LocalbootProduct'"
					:initial-sort-column="productsSortColumn">
					<template #tabs>
						<SharedTabsNav v-model="panelProductType" :tabs="panelProductTypes" />
					</template>
				</ProductsMainView>
			</template>
			<ClientsAddForm v-if="panelType === 'add'" panel-mode @saved="handleAddSaved" />
		</template>
	</LayoutsDetailPanel>
</template>

<script setup lang="ts">
import type { DataTableColumnDef } from '~/composables/useDataTableSettings'
import type { PageChangeParams } from '~/components/shared/DataTable.vue'
import type { Client } from '~/types'
import { useSelectionStore } from '~/stores/selectionStore'

definePageMeta({ layout: 'default' })

const icons = useIcons()
const { t: $t } = useI18n()
const { getClients, getServerIds, checkClientReachable } = useApiHelpers()
const selectionStore = useSelectionStore()
const router = useRouter()
const route = useRoute()

const loading = ref(false)
const error = ref<string | null>(null)
const clients = ref<Client[]>([])
const totalItems = ref(0)
const panelClient = ref<Client | null>(null)
const panelType = ref<'config' | 'logs' | 'clone' | 'products' | 'add' | null>(null)
const panelTab = ref('parameters')
const panelProductType = ref('localboot')
const panelProductTypes = [
	{ label: String($t('localbootProducts')), value: 'localboot' },
	{ label: String($t('netbootProducts')), value: 'netboot' },
]
const reachableStatus = ref<Record<string, boolean | undefined>>({})
const reachableLoading = ref<Record<string, boolean>>({})
const actionStatus = ref<{ type: 'success' | 'error' | 'warning' | 'info'; title: string; message: string } | null>(null)
const lastPageParams = ref<PageChangeParams | null>(null)
const productsSortColumn = ref<string | undefined>(undefined)
const configTabsRef = ref<{ hasAnyChanges?: boolean; discardAll?: () => void } | null>(null)
const productsTableRef = ref<{ hasUnsavedChanges?: { value: boolean } } | null>(null)
const cloneFormRef = ref<{ hasChanges?: boolean } | null>(null)
const showLeaveWarning = ref(false)
const pendingPanelAction = ref<(() => void) | null>(null)
let resolveRouteLeave: ((ok: boolean) => void) | null = null

// Route-level guard: intercepts navigation away from this page when the panel has unsaved changes
onBeforeRouteLeave(() => {
	const hasChanges = configTabsRef.value?.hasAnyChanges
		|| productsTableRef.value?.hasUnsavedChanges?.value
		|| cloneFormRef.value?.hasChanges
	if (!hasChanges) return true
	showLeaveWarning.value = true
	return new Promise<boolean>((resolve) => {
		resolveRouteLeave = resolve
	})
})

const sortBySelectionEnabled = computed(() => selectionStore.selectionSource === 'quickpanel' && selectionStore.selectedClients.length > 0)

const { autoRefreshEnabled, changesDetected, lastChangeDescription, manualRefresh } = useAutoRefreshClients(fetchClients)

const columns: DataTableColumnDef[] = [
	{ key: 'clientId', label: String($t('clientId')), labelKey: 'clientId', sortable: true, alwaysVisible: true },
	{ key: 'version_outdated', label: String($t('version_outdated_localboot')), labelKey: 'version_outdated_localboot', headerIcon: icons.productsOutdatedLocal, sortable: true, class: 'text-center w-10', minWidth: '50px' },
	{ key: 'version_outdated_netboot', label: String($t('version_outdated_netboot')), labelKey: 'version_outdated_netboot', headerIcon: icons.productsOutdatedLocal, sortable: true, class: 'text-center w-10', minWidth: '50px' },
	{ key: 'installationStatus_installed', label: String($t('installationStatus_installed')), labelKey: 'installationStatus_installed', headerIcon: icons.productInstallationStatusInstalled, sortable: true, class: 'text-center w-10', minWidth: '50px' },
	{ key: 'installationStatus_unknown', label: String($t('installationStatus_unknown')), labelKey: 'installationStatus_unknown', headerIcon: icons.productInstallationStatusUnknown, sortable: true, visible: false, class: 'text-center w-10', minWidth: '50px' },
	{ key: 'actionResult_failed', label: String($t('actionResult_failed')), labelKey: 'actionResult_failed', headerIcon: icons.productsFailedActionResult, sortable: true, class: 'text-center w-10', minWidth: '50px' },
	{ key: 'actionResult_successful', label: String($t('actionResult_successful')), labelKey: 'actionResult_successful', headerIcon: icons.productActionResultSuccessful, sortable: true, visible: false, class: 'text-center w-10', minWidth: '50px' },
	{ key: 'reachable', label: String($t('reachable')), labelKey: 'reachable', headerIcon: icons.clientReachable, sortable: false, class: 'text-center w-10', minWidth: '50px' },
	{ key: 'description', label: String($t('description')), labelKey: 'description', sortable: true },
	{ key: 'lastSeen', label: String($t('lastSeen')), labelKey: 'lastSeen', sortable: true },
	{ key: 'macAddress', label: String($t('macAddress')), labelKey: 'macAddress', sortable: true, visible: false },
	{ key: 'ipAddress', label: String($t('ipAddress')), labelKey: 'ipAddress', sortable: true, visible: false },
	{ key: 'uefi', label: 'UEFI', sortable: true, visible: false },
]

function openPanel(client: Client, type: 'config' | 'logs' | 'clone') {
	panelClient.value = client
	panelType.value = type
	router.replace({ query: { ...route.query, client: client.clientId, view: 'panel', panelType: type } })
}

function openProductsPanel() {
	panelClient.value = null
	panelType.value = 'products'
	router.replace({ query: { ...route.query, view: 'panel', panelType: 'products' } })
}

function openAddPanel() {
	panelClient.value = null
	panelType.value = 'add'
	router.replace({ query: { ...route.query, view: 'panel', panelType: 'add' } })
}

function openProductsPanelForClient(client: Client, sortColumn: string) {
	selectionStore.setClients([client.clientId], 'table')
	productsSortColumn.value = sortColumn
	panelClient.value = null
	panelType.value = 'products'
	router.replace({ query: { ...route.query, view: 'panel', panelType: 'products', sortBy: sortColumn } })
}

function handleAddSaved() {
	closePanel()
	fetchClients()
}

function closePanel() {
	checkUnsavedAndDo(() => {
		panelClient.value = null
		panelType.value = null
		const { client: _c, view: _v, panelType: _pt, ...rest } = route.query
		router.replace({ query: rest })
	})
}

function checkUnsavedAndDo(action: () => void) {
	const hasConfigChanges = configTabsRef.value?.hasAnyChanges
	const hasProductChanges = productsTableRef.value?.hasUnsavedChanges?.value
	if (hasConfigChanges || hasProductChanges) {
		pendingPanelAction.value = action
		showLeaveWarning.value = true
		return
	}
	action()
}

function confirmPanelLeave() {
	showLeaveWarning.value = false
	configTabsRef.value?.discardAll?.()
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

/** Single-select row click: select this client + open config panel */
function handleRowActivate(row: Client) {
	checkUnsavedAndDo(() => {
		selectionStore.setClients([row.clientId], 'table')
		openPanel(row, 'config')
	})
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

function handlePageChange(params: PageChangeParams) {
	lastPageParams.value = params
	fetchClients(params)
}

async function fetchClients(params?: PageChangeParams) {
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
		const p: Record<string, unknown> = {
			selectedDepots: selectionStore.selectedServersParam,
			selectedClients: `[${selectionStore.selectedClients.join(',')}]`,
		}
		if (params) {
			p.pageNumber = params.pageNumber
			p.perPage = params.perPage
			p.sortBy = params.sortBy
			p.sortDesc = params.sortDesc
			p.filterQuery = params.filterQuery
		}
		const result = await getClients(p)
		if (result.error) error.value = result.error.message
		else if (result.data) {
			const newData = result.data as Client[]
			if (result.total !== null) totalItems.value = result.total
			if (params && params.pageNumber > 1 && lastPageParams.value) {
				const existingIds = new Set(clients.value.map(c => c.clientId))
				const unique = newData.filter(c => !existingIds.has(c.clientId))
				clients.value = [...clients.value, ...unique]
			} else {
				clients.value = newData
			}
			checkAllReachability(newData)
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

watch(() => selectionStore.selectedServers, () => fetchClients(), { deep: true })

onMounted(async () => {
	await fetchClients()
	// Open panel from URL if client specified
	const clientId = route.query.client as string | undefined
	const pType = route.query.panelType as 'config' | 'logs' | 'clone' | undefined
	if (clientId && route.query.view === 'panel') {
		const c = clients.value.find(cl => cl.clientId === clientId)
		if (c) openPanel(c, pType || 'config')
	}
})
</script>
