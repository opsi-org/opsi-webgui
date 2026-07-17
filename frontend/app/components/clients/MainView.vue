<!--
  This file is part of opsi-webgui application.
  opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
  Copyright (c) uib GmbH <info@uib.de> 2026
  All rights reserved.
  License: AGPL-3.0

  ClientsMainView - Client table with detail panel, filtering, and batch operations.
-->
<template>
	<CoreAppNavigationGuardModal v-model="showLeaveWarning" @cancel="cancelPanelLeave" @confirm="confirmPanelLeave" />

	<LayoutsPageLayout show-refresh :loading="loading" :show-panel="!!panelClient || !!panelType"
		@refresh="fetchClients" @close-panel="closePanel">
		<template #actions>
			<CoreAppButton v-if="changesDetected && !autoRefreshEnabled" :icon="icons.refresh" color="warning"
				variant="soft" size="xs" @click="manualRefresh" :title="lastChangeDescription">
				{{ $t('bus.changes') }}
			</CoreAppButton>
			<CoreAppButton v-if="selectionStore.selectedClients.length > 0" :icon="icons.product" color="primary"
				size="sm" @click="openProductsPanel" :disabled="isReadOnly" :aria-label="String($t('products.title'))" data-testid="clients-open-products-panel">
				{{ $t('products.title') }}
			</CoreAppButton>
			<CoreAppButton :icon="icons.add" color="primary" size="sm" @click="openAddPanel"
				:disabled="isReadOnly || !canCreateClients" :aria-label="String($t('common.new'))">
				<span class="hidden sm:inline">{{ $t('common.new') }}</span>
			</CoreAppButton>
		</template>

		<CoreAppErrorBanner :error="error" @close="error = null" />

		<CoreAppDataTable :rows="clients" :columns="columns" :loading="loading" table-id="clients" row-key="clientId"
			:selectable="true" :filterable="true" :show-refresh="false" :total-items="totalItems"
			:selected-keys="selectionStore.selectedClients" :active-key="panelClient?.clientId"
			:sort-by-selection-enabled="sortBySelectionEnabled" @row-activate="handleRowActivate"
			@selection-change="handleSelectionChange" @page-change="handlePageChange" @refresh="fetchClients">
			<template #cell-clientId="{ row }">
				<div class="flex items-center gap-1.5">

					<CoreAppIcon v-if="blockedClients.has((row as Client).ipAddress || '')" :name="icons.lock"
						class="w-3.5 h-3.5 text-(--color-error-soft-text) shrink-0" :title="$t('clients.blocked')" />
					<CoreAppIcon v-else :name="icons.client" class="w-4 h-4 shrink-0 text-neutral-400" />
					<span>{{ (row as Client).clientId }}</span>
				</div>
			</template>
			<template #cell-description="{ row }">
				{{ (row as Client).description || '-' }}
			</template>
			<template #cell-macAddress="{ row }">
				<span class="text-sm text-(--color-text)">{{ (row as Client).macAddress || '-' }}</span>
			</template>
			<template #cell-ipAddress="{ row }">
				<span class="text-sm text-(--color-text)">{{ (row as Client).ipAddress || '-' }}</span>
			</template>
			<template #cell-lastSeen="{ row }">
				{{ (row as Client).lastSeen ? new Date((row as Client).lastSeen as string).toLocaleString() :
					'-' }}
			</template>
			<template #cell-uefi="{ row }">
				<CoreAppStatusBadge v-if="(row as Client).uefi" status="info" label="UEFI" />
				<span v-else class="text-(--color-text-muted)">-</span>
			</template>
			<template #cell-version_outdated="{ row }">
				<CoreAppStatusBadge :value="(row as Client).version_outdated" :icon="icons.productsOutdated" label="L"
					:tooltip="$t('products.outdated.localboot')" status="warning" clickable
					@click="openProductsPanelForClient(row as Client, 'version_outdated')" />
			</template>
			<template #cell-version_outdated_netboot="{ row }">
				<CoreAppStatusBadge :value="(row as Client).version_outdated_netboot" :icon="icons.productsOutdated"
					label="N" :tooltip="$t('products.outdated.netboot')" status="warning" clickable
					@click="openProductsPanelForClient(row as Client, 'version_outdated', 'netboot')" />
			</template>
			<template #cell-actionRequest_set="{ row }">
				<CoreAppStatusBadge :value="(row as Client).actionRequest_set"
					:icon="icons.onDemand" :tooltip="$t('actions.request')"
					status="info" clickable
					@click="openProductsPanelForClient(row as Client, 'actionRequest')" />
			</template>
			<template #cell-installationStatus_installed="{ row }">
				<CoreAppStatusBadge :value="(row as Client).installationStatus_installed"
					:icon="icons.productInstallationStatusInstalled" :tooltip="$t('products.statusInstalled')"
					status="success" clickable
					@click="openProductsPanelForClient(row as Client, 'installationStatus')" />
			</template>
			<template #cell-actionResult_successful="{ row }">
				<CoreAppStatusBadge :value="(row as Client).actionResult_successful"
					:icon="icons.productActionResultSuccessful" :tooltip="$t('actions.success')" status="success"
					clickable @click="openProductsPanelForClient(row as Client, 'actionResult')" />
			</template>
			<template #cell-actionResult_failed="{ row }">
				<CoreAppStatusBadge :value="(row as Client).actionResult_failed"
					:icon="icons.productsFailedActionResult" :tooltip="$t('actions.failed')" status="error" clickable
					@click="openProductsPanelForClient(row as Client, 'actionResult')" />
			</template>
			<template #cell-reachable="{ row }">
				<ClientsReachableBadge :client-id="(row as Client).clientId"
					:reachable="reachableStatus[(row as Client).clientId]" />
			</template>
			<template #row-actions="{ row }">
				<ClientsRowActionsDropdown :client-id="(row as Client).clientId"
					:active-action="panelClient?.clientId === (row as Client).clientId ? (panelType as 'config' | 'logs' | 'clone' | null) : null"
					@open-config="openPanel(row as Client, 'config')" @open-logs="openPanel(row as Client, 'logs')"
					@open-clone="openPanel(row as Client, 'clone')" @action-complete="handleActionComplete" />
			</template>
		</CoreAppDataTable>

		<template #panel-title>
			<span class="flex items-center gap-2">
				<CoreAppIcon
					:name="panelType === 'products' ? icons.product : panelType === 'add' ? icons.add : icons.client"
					class="w-4 h-4 text-(--color-text-muted) shrink-0" />
				<template v-if="panelType === 'products'">{{ $t('products.title') }}</template>
				<template v-else-if="panelType === 'add'">{{ $t('common.new') }}</template>
				<template v-else>{{ panelClient?.clientId }}</template>
			</span>
		</template>
		<template #panel-subtitle>
			<template v-if="panelType === 'config'">{{ $t('config.title') }}</template>
			<template v-else-if="panelType === 'logs'">{{ $t('logs.title') }}</template>
			<template v-else-if="panelType === 'clone'">{{ $t('clients.clone.title') }}</template>
		</template>
		<template #panel>
			<div v-if="panelClient" class="h-full flex flex-col min-h-0">
				<HostsConfigTabs v-if="panelType === 'config'" ref="configTabsRef" :host-id="panelClient.clientId"
					host-type="client" :tab="panelTab" panel-mode :readonly="isReadOnly"
					@update:tab="panelTab = $event" />
				<ClientsLogsView v-if="panelType === 'logs'" :client-id="panelClient.clientId" panel-mode />
				<ClientsCloneForm v-if="panelType === 'clone'" ref="cloneFormRef" :source-id="panelClient.clientId"
					panel-mode @saved="fetchClients" />
			</div>
			<template v-if="panelType === 'products'">
				<ProductsMainView ref="productsTableRef" panel-mode
					:product-type="panelProductType === 'netboot' ? 'NetbootProduct' : 'LocalbootProduct'"
					:initial-sort-column="productsSortColumn">
					<template #tabs>
						<CoreAppTabsNav v-model="panelProductType" :tabs="panelProductTypes" />
					</template>
				</ProductsMainView>
			</template>
			<ClientsAddForm v-if="panelType === 'add'" panel-mode @saved="handleAddSaved" />
		</template>
	</LayoutsPageLayout>
</template>

<script setup lang="ts">
import type { DataTableColumnDef } from '~/composables/useDataTableSettings'
import type { PageChangeParams } from '~/components/core/AppDataTable.vue'
import type { Client } from '~/types'
import { useSelectionStore } from '~/stores/selectionStore'
import { useMessageBusStore } from '~/stores/messageBusStore'
import { storeToRefs } from 'pinia'

const icons = useIcons()
const { t: $t } = useI18n()
const { getClients, getServerIds, getBlockedClients } = useApiHelpers()
const selectionStore = useSelectionStore()
const messageBusStore = useMessageBusStore()
const { lastMsg: messageBusLastMsg } = storeToRefs(messageBusStore)
const router = useRouter()
const route = useRoute()
const { isReadOnly, canCreateClients } = useUserPermissions()

const loading = ref(false)
const error = ref<string | null>(null)
const clients = ref<Client[]>([])
const totalItems = ref(0)
const panelClient = ref<Client | null>(null)
const panelType = ref<'config' | 'logs' | 'clone' | 'products' | 'add' | null>(null)
const panelTab = ref('parameters')
const panelProductType = ref('localboot')
const panelProductTypes = [
	{ label: String($t('products.localboot')), value: 'localboot' },
	{ label: String($t('products.netboot')), value: 'netboot' },
]
const reachableStatus = ref<Record<string, boolean | undefined>>({})
const blockedClients = ref<Set<string>>(new Set())
const lastPageParams = ref<PageChangeParams | null>(null)
const productsSortColumn = ref<string | undefined>(undefined)
const configTabsRef = ref<{ hasAnyChanges?: boolean; discardAll?: () => void } | null>(null)
const productsTableRef = ref<{ hasUnsavedChanges?: boolean; discardAllChanges?: () => void } | null>(null)
const cloneFormRef = ref<{ hasChanges?: boolean } | null>(null)
const showLeaveWarning = ref(false)
const pendingPanelAction = ref<(() => void) | null>(null)
let resolveRouteLeave: ((ok: boolean) => void) | null = null

onBeforeRouteLeave(() => {
	const hasChanges = configTabsRef.value?.hasAnyChanges
		|| productsTableRef.value?.hasUnsavedChanges
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
	{ key: 'clientId', label: String($t('clients.id')), labelKey: 'clients.id', sortable: true, alwaysVisible: true },
	{ key: 'version_outdated', label: String($t('products.outdated.localboot')), labelKey: 'products.outdated.localboot', headerIcon: icons.productsOutdated, sortable: true, class: 'text-center w-10', minWidth: '50px' },
	{ key: 'version_outdated_netboot', label: String($t('products.outdated.netboot')), labelKey: 'products.outdated.netboot', headerIcon: icons.productsOutdated, sortable: true, class: 'text-center w-10', minWidth: '50px' },
	{ key: 'installationStatus_installed', label: String($t('products.statusInstalled')), labelKey: 'products.statusInstalled', headerIcon: icons.productInstallationStatusInstalled, sortable: true, class: 'text-center w-10', minWidth: '50px' },
	{ key: 'actionRequest_set', label: String($t('actions.request')), labelKey: 'actions.request', headerIcon: icons.onDemand, sortable: true, class: 'text-center w-10', minWidth: '50px' },
	{ key: 'actionResult_failed', label: String($t('actions.failed')), labelKey: 'actions.failed', headerIcon: icons.productsFailedActionResult, sortable: true, class: 'text-center w-10', minWidth: '50px' },
	{ key: 'actionResult_successful', label: String($t('actions.success')), labelKey: 'actions.success', headerIcon: icons.productActionResultSuccessful, sortable: true, visible: false, class: 'text-center w-10', minWidth: '50px' },
	{ key: 'reachable', label: String($t('clients.reachable.status')), labelKey: 'clients.reachable.status', headerIcon: icons.clientReachable, sortable: false, class: 'text-center w-10', minWidth: '50px' },
	{ key: 'description', label: String($t('common.description')), labelKey: 'common.description', sortable: true },
	{ key: 'lastSeen', label: String($t('fields.lastSeen')), labelKey: 'fields.lastSeen', sortable: true },
	{ key: 'macAddress', label: String($t('fields.mac')), labelKey: 'fields.mac', sortable: true, visible: false },
	{ key: 'ipAddress', label: String($t('fields.ip')), labelKey: 'fields.ip', sortable: true, visible: false },
	{ key: 'uefi', label: 'UEFI', sortable: true, visible: false },
]

function doOpenPanel(client: Client, type: 'config' | 'logs' | 'clone') {
	panelClient.value = client
	panelType.value = type
	const query: Record<string, string> = { ...route.query as Record<string, string>, client: client.clientId, view: 'panel', panelType: type }
	if (type === 'config') query.configType = panelTab.value
	router.replace({ query })
}

function openPanel(client: Client, type: 'config' | 'logs' | 'clone') {
	checkUnsavedAndDo(() => doOpenPanel(client, type))
}

function openProductsPanel() {
	checkUnsavedAndDo(() => {
		panelClient.value = null
		panelType.value = 'products'
		router.replace({ query: { ...route.query, view: 'panel', panelType: 'products' } })
	})
}

function openAddPanel() {
	checkUnsavedAndDo(() => {
		panelClient.value = null
		panelType.value = 'add'
		router.replace({ query: { ...route.query, view: 'panel', panelType: 'add' } })
	})
}

function openProductsPanelForClient(client: Client, sortColumn: string, productType?: 'localboot' | 'netboot') {
	selectionStore.setClients([client.clientId], 'table')
	productsSortColumn.value = sortColumn
	panelProductType.value = productType || 'localboot'
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
		const { client: _c, view: _v, panelType: _pt, configType: _ct, ...rest } = route.query
		router.replace({ query: rest })
	})
}

function checkUnsavedAndDo(action: () => void) {
	const hasConfigChanges = configTabsRef.value?.hasAnyChanges
	const hasProductChanges = productsTableRef.value?.hasUnsavedChanges
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
	productsTableRef.value?.discardAllChanges?.()
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

function handleRowActivate(row: Client) {
	checkUnsavedAndDo(() => {
		selectionStore.setClients([row.clientId], 'table')
		doOpenPanel(row, 'config')
	})
}

function handleSelectionChange(_rows: Client[], keys: string[]) {
	selectionStore.setClients(keys, 'table')
}

function handleActionComplete(action: string, success: boolean) {
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
		const effectiveParams = params ?? lastPageParams.value ?? undefined
		await selectionStore.ensureServersSelected()
		if (selectionStore.selectedServers.length === 0) {
			const depotResult = await getServerIds()
			const first = depotResult.data?.[0]
			if (first) selectionStore.setServers([first])
			else { error.value = String($t('servers.noSelection')); return }
		}
		const p: Record<string, unknown> = {
			selectedDepots: selectionStore.selectedServersParam,
			selectedClients: `[${selectionStore.selectedClients.join(',')}]`,
		}
		if (effectiveParams) {
			p.pageNumber = effectiveParams.pageNumber
			p.perPage = effectiveParams.perPage
			p.sortBy = effectiveParams.sortBy
			p.sortDesc = effectiveParams.sortDesc
			p.filterQuery = effectiveParams.filterQuery
		}
		const result = await getClients(p)
		if (result.error) error.value = result.error.message
		else if (result.data) {
			const newData = result.data as Client[]
			if (result.total !== null) totalItems.value = result.total
			if (effectiveParams && effectiveParams.pageNumber > 1 && lastPageParams.value) {
				const existingIds = new Set(clients.value.map(c => c.clientId))
				const unique = newData.filter(c => !existingIds.has(c.clientId))
				clients.value = [...clients.value, ...unique]
			} else {
				clients.value = newData
			}
		}
	} catch (e) { error.value = (e as Error).message }
	finally { loading.value = false }
}

async function fetchBlockedClients() {
	try {
		const result = await getBlockedClients()
		if (result.data) {
			const blockedIps = Array.isArray(result.data) ? result.data : Object.keys(result.data)
			blockedClients.value = new Set(blockedIps)
		}
	} catch { /* silently fail */ }
}

function extractHostId(msg: unknown): string | undefined {
	if (!msg || typeof msg !== 'object') return undefined
	const visited = new Set<unknown>()
	const queue: unknown[] = [msg]

	while (queue.length > 0) {
		const current = queue.shift()
		if (!current || typeof current !== 'object' || visited.has(current)) continue
		visited.add(current)

		if (Array.isArray(current)) {
			queue.push(...current)
			continue
		}

		const record = current as Record<string, unknown>
		for (const [key, value] of Object.entries(record)) {
			if (typeof value === 'string' && /(hostId|host_id|clientId|client_id|objectId|object_id)$/i.test(key)) {
				return value
			}
			if (value && typeof value === 'object') queue.push(value)
		}
	}

	return undefined
}

watch(messageBusLastMsg, (msg) => {
	if (!msg || typeof msg !== 'object') return
	const type = (msg as Record<string, unknown>).type
	if (typeof type !== 'string') return

	if (type === 'event:host_connected' || type === 'host_connected') {
		const hostId = extractHostId(msg)
		if (hostId) reachableStatus.value[hostId] = true
	}

	if (type === 'event:host_disconnected' || type === 'host_disconnected') {
		const hostId = extractHostId(msg)
		if (hostId) reachableStatus.value[hostId] = false
	}
})

watch(() => selectionStore.selectedServers, () => {
	fetchClients()
	fetchBlockedClients()
}, { deep: true })

watch(panelTab, (newTab) => {
	if (panelType.value === 'config' && panelClient.value) {
		router.replace({ query: { ...route.query as Record<string, string>, configType: newTab } })
	}
})

onMounted(async () => {
	await Promise.all([fetchClients(), fetchBlockedClients()])
	const clientId = route.query.client as string | undefined
	const pType = route.query.panelType as 'config' | 'logs' | 'clone' | undefined
	const configType = route.query.configType as string | undefined
	if (configType) {
		const normalized = configType === 'attribute' ? 'attributes' : configType === 'parameter' ? 'parameters' : configType
		if (normalized === 'parameters' || normalized === 'attributes') {
			panelTab.value = normalized
		}
	}
	if (clientId && route.query.view === 'panel') {
		const c = clients.value.find(cl => cl.clientId === clientId)
		if (c) doOpenPanel(c, pType || 'config')
	}
})
</script>
