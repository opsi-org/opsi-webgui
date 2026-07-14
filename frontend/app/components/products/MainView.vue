<!--
  This file is part of opsi-webgui application.
  opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
  Copyright (c) uib GmbH <info@uib.de> 2026
  All rights reserved.
  License: AGPL-3.0

  ProductsMainView - Product table with configuration panel and depot selection.
-->
<template>
	<CoreAppNavigationGuardModal v-model="showLeaveWarning" @cancel="cancelLeave" @confirm="confirmLeave" />

	<LayoutsPageLayout show-refresh :loading="loading" :show-panel="showConfigPanel" :allow-x-scroll="panelMode"
		@close-panel="closePanel" @refresh="fetchProducts">
		<template #tabs>
			<slot name="tabs" />
		</template>
		<template #actions>
			<CoreAppButton v-if="changesDetected && !autoRefreshEnabled" :icon="icons.refresh" color="warning"
				variant="soft" size="xs" @click="manualRefresh" :title="lastChangeDescription">
				{{ $t('bus.changes') }}
			</CoreAppButton>
			<ProductsQuickActionsDropdown :products="products" @applied="fetchProducts" class="w-70" />
			<CoreAppButton variant="outline" color="primary" size="sm" :icon="icons.onDemand"
				:title="String($t('products.processHelp'))" @click="processActionsOpen = true">
				{{ $t('actions.ondemand') }}
			</CoreAppButton>
		</template>

		<template #saveActions>
			<CoreAppUnsavedChangesModal :product-config-ref="productConfigTabsRef"
				:config-product-id="configProduct?.productId" mode="actionRequests"
				:selected-product-ids="selectedProductIds" :show-process-options="true"
				:client-ids="selectionStore.selectedClients" @save-all="handleSaveAll"
				@discard-all="discardActionRequestsOnly" />
		</template>

		<CoreAppErrorBanner :error="error" :show="!!(error || actionStatus)" @close="error = null">
			<CoreAppAlertInline v-if="actionStatus" :color="actionStatus.type" :title="actionStatus.title"
				:description="actionStatus.message" variant="subtle" closable compact @close="actionStatus = null" />
		</CoreAppErrorBanner>

		<ProductsProcessActionsModal v-model:open="processActionsOpen" :selected-product-ids="selectedProductIds"
			@executed="fetchProducts" />

		<CoreAppDataTable :rows="products" :columns="columns" :loading="loading" :table-id="tableId" row-key="productId"
			:selectable="true" :filterable="true" :show-refresh="false" :total-items="totalItems"
			:selected-keys="selectedTableKeys" :active-key="configProduct?.productId"
			:sort-by-selection-enabled="sortBySelectionEnabled" @row-activate="handleRowActivate"
			@selection-change="handleSelectionChange" @page-change="handlePageChange" @refresh="fetchProducts">

			<template #header-cell-actionRequest="{ sortColumn, sortDirection }">
				<ProductsActionRequestDropdown mode="header"
					:has-clients-selected="selectionStore.selectedClients.length > 0"
					:has-products-selected="selectionStore.selectedProducts.length > 0" :sort-column="sortColumn"
					:sort-direction="(sortDirection as 'asc' | 'desc')" @apply="handleBulkActionRequest" />
			</template>

			<template #cell-productId="{ row }">
				<div class="flex items-center gap-2">
					<img v-if="productIcons[(row as ProductRow).productId]"
						:src="productIcons[(row as ProductRow).productId]" :alt="(row as ProductRow).productId"
						loading="lazy" class="w-5 h-5 shrink-0 rounded object-contain"
						@error="($event.target as HTMLImageElement).style.display = 'none'" />
					<CoreAppIcon v-else :name="icons.product" class="w-4 h-4 shrink-0 text-neutral-400" />
					<CoreAppIcon v-if="(row as ProductRow).locked" :name="icons.lock"
						class="w-3.5 h-3.5 text-(--color-error) shrink-0" :title="$t('products.locked')" />
					<span class="text-small text-(--color-text)">{{ (row as ProductRow).productId
					}}</span>
				</div>
			</template>

			<template #cell-description="{ row }">
				<span class="block truncate max-w-[280px] text-small text-(--color-text)"
					:title="(row as ProductRow).description || undefined">
					{{ (row as ProductRow).description || '-' }}
				</span>
			</template>

			<template #cell-version="{ row }">
				<ProductsVersionCell :row="(row as ProductRow)" />
			</template>

			<template #cell-installationStatus="{ row }">
				<ProductsInstallationStatusBadge :status="(row as ProductRow).installationStatus"
					:status-details="(row as ProductRow).installationStatusDetails"
					:selected-clients="(row as ProductRow).selectedClients" />
			</template>

			<template #cell-actionResult="{ row }">
				<ProductsActionResultBadge :result="(row as ProductRow).actionResult"
					:result-details="(row as ProductRow).actionResultDetails"
					:selected-clients="(row as ProductRow).selectedClients" />
			</template>

			<template #cell-actionRequest="{ row }">
				<div class="flex items-center gap-1.5">
					<ProductsActionRequestDropdown :product-id="(row as ProductRow).productId"
						:current-request="(row as ProductRow).actionRequest"
						:available-actions="(row as ProductRow).actions || []"
						:disabled="isReadOnly || selectionStore.selectedClients.length === 0"
						:request-details="(row as ProductRow).actionRequestDetails"
						:selected-clients="(row as ProductRow).selectedClients"
						:pending-request="pendingActionRequests.get((row as ProductRow).productId)?.actionRequest"
						@change="handleActionRequestChange((row as ProductRow).productId, (row as ProductRow).actionRequest || 'none', $event)" />
					<CoreAppStatusBadge v-if="getLiveStatus((row as ProductRow).productId)"
						:status="getLiveStatus((row as ProductRow).productId)?.kind === 'error'
							? 'error'
							: getLiveStatus((row as ProductRow).productId)?.kind === 'updated'
								? 'success'
								: 'info'"
						:icon="getLiveStatus((row as ProductRow).productId)?.kind === 'error'
							? icons.xCircle
							: getLiveStatus((row as ProductRow).productId)?.kind === 'updated'
								? icons.checkCircle
								: getLiveStatus((row as ProductRow).productId)?.kind === 'processing'
									? icons.onDemand
									: icons.refresh"
						:label="getLiveStatus((row as ProductRow).productId)?.message"
						:tooltip="getLiveStatus((row as ProductRow).productId)?.tooltip"
						variant="soft" size="xs" />
				</div>
			</template>

			<template #cell-actionProgress="{ row }">
				<span class="text-small text-(--color-text)">
					{{ (row as ProductRow).actionProgress || '-' }}
				</span>
			</template>

			<template #cell-actionSequence="{ row }">
				<span class="text-small text-(--color-text)">
					{{ (row as ProductRow).actionSequence !== undefined && (row as ProductRow).actionSequence !== -1 ? (row as ProductRow).actionSequence : '-' }}
				</span>
			</template>

			<template #cell-lastAction="{ row }">
				<span class="text-small text-(--color-text)">
					{{ (row as ProductRow).lastAction || '-' }}
				</span>
			</template>

			<template #cell-advice="{ row }">
				<span class="block truncate max-w-[280px] text-small text-(--color-text)"
					:title="(row as ProductRow).advice || undefined">
					{{ (row as ProductRow).advice || '-' }}
				</span>
			</template>

			<template #cell-priority="{ row }">
				<span class="text-small text-(--color-text)">{{ (row as ProductRow).priority ?? '-' }}</span>
			</template>

			<template #cell-modificationTime="{ row }">
				<span class="text-small text-(--color-text)">
					{{ formatModificationTime((row as ProductRow).modificationTime) }}
				</span>
			</template>

			<template #row-actions="{ row }">
				<CoreAppButton :icon="icons.config" variant="ghost" color="neutral" size="xs"
					:title="$t('config.title')" @click.stop="openProductConfig(row as ProductRow)" />
			</template>
		</CoreAppDataTable>

		<template #panel-title>
			<span class="flex items-center gap-2">
				<CoreAppIcon :name="icons.product" class="w-4 h-4 shrink-0" />
				{{ configProduct?.productId }}
			</span>
		</template>
		<template #panel-subtitle>
			<div v-if="configProduct">{{ $t('config.title') }}</div>
		</template>

		<template #panel-actions>
			<CoreAppUnsavedChangesModal :product-config-ref="panelPropertyConfigRef"
				:config-product-id="configProduct?.productId" mode="properties" @save-all="handlePanelSave"
				@discard-all="handlePanelDiscard" />
		</template>

		<template #panel>
			<div v-if="configProduct?.productId" class="flex flex-col h-full">
				<ProductsConfigTabs ref="configPanelRef" :product-id="configProduct.productId" :panel-mode="true"
					class="flex-1" @saved="onConfigSaved" />
			</div>
		</template>
	</LayoutsPageLayout>
</template>

<script setup lang="ts">
import type { DataTableColumnDef } from '~/composables/useDataTableSettings'
import type { PageChangeParams } from '~/components/core/AppDataTable.vue'
import type { ProductRow, ProductType, ProductConfigTabsRef, ProductActionRequestChange, EditablePropertyValue } from '~/types'
import { useSelectionStore } from '~/stores/selectionStore'
import { useMessageBusStore } from '~/stores/messageBusStore'
import { storeToRefs } from 'pinia'

interface Props {
	productType: ProductType
	initialProductId?: string
	initialSortColumn?: string
	panelMode?: boolean
}

const props = defineProps<Props>()
const icons = useIcons()
const { t: $t } = useI18n()
const { getProducts, setClientProductActions, processActionRequests } = useApiHelpers()
const { productIcons: cachedProductIcons, fetchProductIcons } = useCachedData()
const selectionStore = useSelectionStore()
const messageBusStore = useMessageBusStore()
const { lastMsg: messageBusLastMsg } = storeToRefs(messageBusStore)
const { isReadOnly } = useUserPermissions()
const router = useRouter()
const route = useRoute()

type LiveStatusKind = 'saving' | 'processing' | 'updated' | 'error'
interface ProductLiveStatus {
	kind: LiveStatusKind
	message: string
	tooltip?: string
}

const selectedTableKeys = computed(() => selectionStore.selectedProducts)
const sortBySelectionEnabled = computed(() => selectionStore.selectionSource === 'quickpanel' && selectionStore.selectedProducts.length > 0)

const loading = ref(false)
const error = ref<string | null>(null)
const products = ref<ProductRow[]>([])
const totalItems = ref(0)
const configProduct = ref<ProductRow | null>(null)
const showConfigPanel = ref(false)
const actionStatus = ref<{ type: 'success' | 'error' | 'warning' | 'info'; title: string; message: string } | null>(null)
const pendingActionRequests = ref(new Map<string, ProductActionRequestChange>())
const savingActionRequests = ref(false)
const configTabsComponentRef = ref<InstanceType<typeof import('./ConfigTabs.vue').default> | null>(null)
const lastPageParams = ref<PageChangeParams | null>(null)
const productIcons = computed(() => (cachedProductIcons.value ?? {}) as Record<string, string>)
const processActionsOpen = ref(false)
const productLiveStatus = ref(new Map<string, ProductLiveStatus>())

const showLeaveWarning = ref(false)
const pendingAction = ref<(() => void) | null>(null)
let resolveRouteLeave: ((ok: boolean) => void) | null = null

function confirmLeave() {
	showLeaveWarning.value = false
	if (resolveRouteLeave) {
		resolveRouteLeave(true)
		resolveRouteLeave = null
	}
	if (pendingAction.value) {
		pendingAction.value()
		pendingAction.value = null
	}
}

function cancelLeave() {
	showLeaveWarning.value = false
	if (resolveRouteLeave) {
		resolveRouteLeave(false)
		resolveRouteLeave = null
	}
	pendingAction.value = null
}

onBeforeRouteLeave(() => {
	if (!hasUnsavedChanges.value) return true
	showLeaveWarning.value = true
	return new Promise<boolean>((resolve) => {
		resolveRouteLeave = resolve
	})
})

const tableId = computed(() => props.productType === 'NetbootProduct' ? 'products-netboot' : 'products-localboot')
const tableSettings = useDataTableSettings(tableId.value)
const selectedProductIds = computed(() => selectionStore.selectedProducts)

const productConfigTabsRef = computed<ProductConfigTabsRef | null>(() => {
	const tabs = configTabsComponentRef.value
	if (!tabs) {
		if (pendingActionRequests.value.size === 0) return null
		return {
			hasAnyChanges: pendingActionRequests.value.size > 0,
			isSaving: savingActionRequests.value,
			changedCount: pendingActionRequests.value.size,
			changedProperties: new Map<string, EditablePropertyValue>(),
			changedActionRequests: pendingActionRequests.value,
			saveAll: saveAllChanges,
			discardAll: discardAllChanges,
			discardSingleProperty: () => { },
			discardSingleActionRequest: (pid: string) => { pendingActionRequests.value.delete(pid) },
			getOriginalPropertyValue: () => undefined,
			fmtVal: (v: unknown) => v === null || v === undefined ? '-' : Array.isArray(v) ? v.join(', ') : String(v),
			refresh: fetchProducts,
		}
	}
	return {
		hasAnyChanges: tabs.hasAnyChanges || pendingActionRequests.value.size > 0,
		isSaving: (tabs.isSaving as unknown as boolean) || savingActionRequests.value,
		changedCount: (tabs.changedCount || 0) + pendingActionRequests.value.size,
		changedProperties: tabs.changedProperties as unknown as Map<string, EditablePropertyValue>,
		changedActionRequests: pendingActionRequests.value,
		saveAll: saveAllChanges, discardAll: discardAllChanges,
		discardSingleProperty: tabs.discardSingleProperty,
		discardSingleActionRequest: (pid: string) => { pendingActionRequests.value.delete(pid) },
		getOriginalPropertyValue: tabs.getOriginalPropertyValue,
		fmtVal: tabs.fmtVal, refresh: fetchProducts,
	}
})

const panelPropertyConfigRef = computed<ProductConfigTabsRef | null>(() => {
	const tabs = configTabsComponentRef.value
	if (!tabs) return null
	return {
		hasAnyChanges: tabs.hasAnyChanges as unknown as boolean,
		isSaving: tabs.isSaving as unknown as boolean,
		changedCount: tabs.changedCount as unknown as number,
		changedProperties: tabs.changedProperties as unknown as Map<string, EditablePropertyValue>,
		changedActionRequests: new Map(),
		saveAll: tabs.saveAll,
		discardAll: tabs.discardAll,
		discardSingleProperty: tabs.discardSingleProperty,
		discardSingleActionRequest: () => { },
		getOriginalPropertyValue: tabs.getOriginalPropertyValue,
		fmtVal: tabs.fmtVal,
		refresh: tabs.refresh,
	}
})

const hasUnsavedChanges = computed(() => productConfigTabsRef.value?.hasAnyChanges || false)

const { autoRefreshEnabled, changesDetected, lastChangeDescription, manualRefresh } = useAutoRefreshProducts(fetchProducts)

const columns: DataTableColumnDef[] = [
	{ key: 'productId', label: String($t('products.id')), labelKey: 'products.id', sortable: true, alwaysVisible: true },
	{ key: 'installationStatus', label: String($t('products.status')), labelKey: 'products.status', headerIcon: icons.productInstallationStatusInstalled, sortable: true, class: 'text-center w-16', align: 'center' },
	{ key: 'actionResult', label: String($t('actions.result')), labelKey: 'actions.result', headerIcon: icons.productActionResult, sortable: true, class: 'text-center w-16', align: 'center' },
	{ key: 'version', label: String($t('common.version')), labelKey: 'common.version', sortable: true },
	{ key: 'description', label: String($t('common.description')), labelKey: 'common.description', sortable: true },
	{ key: 'advice', label: String($t('products.advice')), labelKey: 'products.advice', sortable: true, visible: false },
	{ key: 'priority', label: String($t('common.priority')), labelKey: 'common.priority', sortable: true, visible: false },
	{ key: 'modificationTime', label: String($t('fields.modifiedAt')), labelKey: 'fields.modifiedAt', sortable: true, visible: false },
	{ key: 'actionProgress', label: String($t('actions.progress')), labelKey: 'actions.progress', sortable: true },
	{ key: 'actionSequence', label: String($t('actions.sequence')), labelKey: 'actions.sequence', sortable: true, visible: false },
	{ key: 'lastAction', label: String($t('actions.last')), labelKey: 'actions.last', sortable: true, visible: false },
	{ key: 'actionRequest', label: String($t('actions.request')), labelKey: 'actions.request', sortable: true, class: 'w-40', alwaysVisible: true, stickyRight: true },
]

function setLiveStatus(productIds: string[], status: ProductLiveStatus, ttlMs = 10000) {
	for (const productId of productIds) {
		productLiveStatus.value.set(productId, status)
	}
	if (ttlMs <= 0) return
	setTimeout(() => {
		for (const productId of productIds) {
			const current = productLiveStatus.value.get(productId)
			if (current && current.kind === status.kind && current.message === status.message) {
				productLiveStatus.value.delete(productId)
			}
		}
	}, ttlMs)
}

function getLiveStatus(productId: string): ProductLiveStatus | undefined {
	return productLiveStatus.value.get(productId)
}

function extractProductIdsFromMessage(payload: unknown): string[] {
	const ids = new Set<string>()
	const visited = new Set<unknown>()
	const visit = (value: unknown, keyHint = '') => {
		if (value === null || value === undefined) return
		if (typeof value === 'string') {
			if (/(^|_)(productid|product_id)$/.test(keyHint.toLowerCase())) {
				ids.add(value)
			}
			return
		}
		if (typeof value !== 'object') return
		if (visited.has(value)) return
		visited.add(value)
		if (Array.isArray(value)) {
			for (const item of value) visit(item, keyHint)
			return
		}
		for (const [key, nested] of Object.entries(value as Record<string, unknown>)) {
			visit(nested, key)
		}
	}
	visit(payload)
	return [...ids]
}

function openProductConfig(product: ProductRow) {
	if (configProduct.value && configProduct.value.productId !== product.productId && hasUnsavedChanges.value) {
		pendingAction.value = () => {
			discardAllChanges()
			doOpenProductConfig(product)
		}
		showLeaveWarning.value = true
		return
	}
	doOpenProductConfig(product)
}

function doOpenProductConfig(product: ProductRow) {
	configProduct.value = product
	showConfigPanel.value = true
	router.replace({ query: { ...route.query, product: product.productId, view: 'panel' } })
}

function formatModificationTime(value: string | undefined | null): string {
	if (!value) return '-'
	try {
		return new Date(value).toLocaleString()
	} catch {
		return value
	}
}

function closePanel() {
	if (configTabsComponentRef.value?.hasAnyChanges) {
		pendingAction.value = () => {
			doClosePanel()
		}
		showLeaveWarning.value = true
		return
	}
	doClosePanel()
}

function doClosePanel() {
	showConfigPanel.value = false
	configProduct.value = null
	nextTick(() => {
		const { product: _p, view: _v, ...rest } = route.query
		router.replace({ query: rest })
	})
}

function handleRowActivate(row: ProductRow) {
	if (configProduct.value && configProduct.value.productId !== row.productId && hasUnsavedChanges.value) {
		pendingAction.value = () => {
			discardAllChanges()
			selectionStore.setProducts([row.productId], 'table')
			doOpenProductConfig(row)
		}
		showLeaveWarning.value = true
		return
	}
	selectionStore.setProducts([row.productId], 'table')
	openProductConfig(row)
}

function handleSelectionChange(_rows: ProductRow[], keys: string[]) {
	selectionStore.setProducts(keys, 'table')
}

function handleActionRequestChange(productId: string, oldReq: string, newReq: string) {
	if (newReq === oldReq || (newReq === 'none' && !oldReq)) pendingActionRequests.value.delete(productId)
	else pendingActionRequests.value.set(productId, { productId, actionRequest: newReq, oldRequest: oldReq || 'none' })
}

function handleBulkActionRequest(actionRequest: string) {
	const selectedProducts = selectionStore.selectedProducts
	if (selectedProducts.length === 0) return
	for (const productId of selectedProducts) {
		const product = products.value.find(p => p.productId === productId)
		const oldReq = product?.actionRequest || 'none'
		if (actionRequest === oldReq || (actionRequest === 'none' && !oldReq)) {
			pendingActionRequests.value.delete(productId)
		} else {
			pendingActionRequests.value.set(productId, { productId, actionRequest, oldRequest: oldReq })
		}
	}
}

async function saveActionRequests(): Promise<{ type: 'success' | 'error' | 'warning'; message: string }> {
	if (pendingActionRequests.value.size === 0) return { type: 'success', message: String($t('notify.action.saved')) }
	if (selectionStore.selectedClients.length === 0) {
		return { type: 'error', message: String($t('clients.selectNone')) }
	}
	savingActionRequests.value = true
	const errors: string[] = []
	const savedIds: string[] = []
	try {
		const clientIds = selectionStore.selectedClients
		for (const [pid, change] of pendingActionRequests.value) {
			try {
				setLiveStatus([pid], { kind: 'saving', message: String($t('actions.live.saving')), tooltip: String($t('actions.request')) }, 0)
				const r = await setClientProductActions({ clientIds, productIds: [pid], actionRequest: change.actionRequest })
				if (r.error) throw r.error
				savedIds.push(pid)
				setLiveStatus([pid], { kind: 'updated', message: String($t('actions.live.updated')) }, 12000)
			} catch (e) {
				errors.push(`${pid}: ${e instanceof Error ? e.message : String(e)}`)
				setLiveStatus([pid], { kind: 'error', message: String($t('actions.live.failed')), tooltip: e instanceof Error ? e.message : String(e) }, 15000)
			}
		}
		for (const pid of savedIds) {
			pendingActionRequests.value.delete(pid)
		}
		await fetchProducts()
		if (errors.length > 0 && savedIds.length > 0) {
			return { type: 'warning', message: `${savedIds.length} saved, ${errors.length} failed: ${errors.join('; ')}` }
		} else if (errors.length > 0) {
			return { type: 'error', message: errors.join('; ') }
		} else {
			return { type: 'success', message: String($t('notify.action.saved')) }
		}
	} catch (e) {
		return { type: 'error', message: e instanceof Error ? e.message : String($t('notify.errorActionsSave')) }
	} finally { savingActionRequests.value = false }
}

async function handleSaveAll(processOnDemand?: boolean, onDemandOptions?: { productIds?: string[]; visibility?: string; clientIds?: string[] }, onResult?: (result: { type: 'success' | 'error' | 'warning'; message: string }) => void) {
	const result = await saveActionRequests()
	if (result.type === 'error') {
		onResult?.(result)
		return
	}
	if (processOnDemand) {
		const clientIds = onDemandOptions?.clientIds || selectionStore.selectedClients
		if (clientIds.length > 0) {
			try {
				const productIds = onDemandOptions?.productIds || undefined
				const processedIds = productIds && productIds.length > 0 ? productIds : selectedProductIds.value
				if (processedIds.length > 0) {
					setLiveStatus(processedIds, { kind: 'processing', message: String($t('actions.live.processing')) }, 0)
				}
				await processActionRequests(clientIds, productIds)
				if (processedIds.length > 0) {
					setLiveStatus(processedIds, { kind: 'updated', message: String($t('actions.live.updated')) }, 12000)
				}
				onResult?.({ type: 'success', message: String($t('notify.product.actions.executed')) })
			} catch (e) {
				const processedIds = onDemandOptions?.productIds && onDemandOptions.productIds.length > 0
					? onDemandOptions.productIds
					: selectedProductIds.value
				if (processedIds.length > 0) {
					setLiveStatus(processedIds, { kind: 'error', message: String($t('actions.live.failed')), tooltip: e instanceof Error ? e.message : String(e) }, 15000)
				}
				onResult?.({ type: 'error', message: e instanceof Error ? e.message : String($t('notify.errorActionsLoad')) })
			}
			return
		}
	}
	onResult?.(result)
}

async function handlePanelSave(_processOnDemand?: boolean, _options?: unknown, onResult?: (result: { type: 'success' | 'error' | 'warning'; message: string }) => void) {
	if (configTabsComponentRef.value?.hasAnyChanges) {
		try {
			await configTabsComponentRef.value.saveAll()
			onResult?.({ type: 'success', message: String($t('notify.host.params.saved')) })
		} catch (e) {
			onResult?.({ type: 'error', message: e instanceof Error ? e.message : String(e) })
		}
	}
}

function handlePanelDiscard() {
	configTabsComponentRef.value?.discardAll()
}

async function saveAllChanges() {
	if (configTabsComponentRef.value?.hasAnyChanges) await configTabsComponentRef.value.saveAll()
	if (pendingActionRequests.value.size > 0) await saveActionRequests()
}

function discardAllChanges() {
	configTabsComponentRef.value?.discardAll()
	pendingActionRequests.value.clear()
}

function discardActionRequestsOnly() {
	pendingActionRequests.value.clear()
}

function onConfigSaved() { fetchProducts() }

function handlePageChange(params: PageChangeParams) {
	lastPageParams.value = params
	fetchProducts(params)
}

function translateSortBy(sortBy: string): string {
	switch (sortBy) {
		case 'version':
			return '["client_version_outdated", "depot_version_diff", "not_on_all_depots"]'
		case 'version_outdated':
			return 'client_version_outdated'
		case 'installationStatus':
			return '["installationStatus", "installationStatusErrorLevel"]'
		case 'actionResult':
			return '["actionResultErrorLevel", "actionResult"]'
		case 'depotVersions':
			return 'depot_version_diff'
		case 'clientVersions':
			return 'client_version_outdated'
		case 'desc':
			return 'description'
		case '':
			return 'productId'
		default:
			return sortBy
	}
}

async function fetchProducts(params?: PageChangeParams) {
	loading.value = true
	error.value = null
	try {
		await selectionStore.ensureServersSelected()
		if (selectionStore.selectedServers.length === 0) { error.value = String($t('servers.noSelection')); return }

		const p: Record<string, unknown> = {
			type: props.productType,
			selectedDepots: selectionStore.selectedServersParam,
		}
		if (selectionStore.selectedClients.length > 0)
			p.selectedClients = `[${selectionStore.selectedClients.join(',')}]`
		if (params) {
			p.pageNumber = params.pageNumber
			p.perPage = params.perPage
			if (params.sortBy && !params.sortBy.startsWith('__')) {
				p.sortBy = translateSortBy(params.sortBy)
				p.sortDesc = params.sortDesc
			}
			p.filterQuery = params.filterQuery
		} else {
			if (tableSettings.settings.sortColumn && !tableSettings.settings.sortColumn.startsWith('__')) {
				p.sortBy = translateSortBy(tableSettings.settings.sortColumn)
				p.sortDesc = tableSettings.settings.sortDirection === 'desc'
			}
		}

		const result = await getProducts(p)
		if (result.error) throw result.error
		const newData = (result.data || []) as ProductRow[]
		if (result.total !== null) totalItems.value = result.total
		if (params && params.pageNumber > 1 && lastPageParams.value) {
			const existingIds = new Set(products.value.map(p => p.productId))
			const unique = newData.filter(p => !existingIds.has(p.productId))
			products.value = [...products.value, ...unique]
		} else {
			products.value = newData
		}
	} catch (e) {
		error.value = e instanceof Error ? e.message : String($t('products.none'))
	} finally { loading.value = false }
}

watch(() => props.productType, () => { pendingActionRequests.value.clear(); fetchProducts() })

watch(() => props.initialSortColumn, (newCol) => {
	if (newCol) {
		tableSettings.setSort(newCol, 'desc')
		fetchProducts()
	}
})

watch(() => route.query.product, (newProductId, oldProductId) => {
	if (!newProductId && showConfigPanel.value) {
		showConfigPanel.value = false
		configProduct.value = null
		return
	}
	if (!newProductId) return
	if (newProductId === oldProductId) return
	if (!showConfigPanel.value) return
	const p = products.value.find(pr => pr.productId === newProductId)
	if (p) {
		configProduct.value = p
		showConfigPanel.value = true
	}
})

function tryOpenPanelFromRoute() {
	const productId = route.query.product as string | undefined
	const view = route.query.view as string | undefined
	if (productId && view === 'panel' && products.value.length > 0) {
		const p = products.value.find(pr => pr.productId === productId)
		if (p && (!showConfigPanel.value || configProduct.value?.productId !== productId)) {
			configProduct.value = p
			showConfigPanel.value = true
		}
	}
}

watch(() => selectionStore.selectedClients, () => fetchProducts(), { deep: true })
watch(() => selectionStore.selectedServers, () => fetchProducts(), { deep: true })

watch(messageBusLastMsg, (msg) => {
	if (!msg || typeof msg !== 'object') return
	const msgType = (msg as Record<string, unknown>).type
	if (typeof msgType !== 'string' || !msgType.includes('productOnClient_')) return
	const ids = extractProductIdsFromMessage(msg)
	if (ids.length > 0) {
		setLiveStatus(ids, { kind: 'updated', message: String($t('actions.live.updated')) }, 12000)
		return
	}
	if (selectedProductIds.value.length > 0) {
		setLiveStatus(selectedProductIds.value, { kind: 'updated', message: String($t('actions.live.updated')) }, 8000)
	}
})

onMounted(async () => {
	if (props.initialSortColumn) {
		tableSettings.setSort(props.initialSortColumn, 'desc')
	}
	await Promise.all([
		fetchProducts(),
		fetchProductIcons(),
	])
	tryOpenPanelFromRoute()
})

defineExpose({ refresh: () => fetchProducts(), hasUnsavedChanges, discardAllChanges })
</script>
