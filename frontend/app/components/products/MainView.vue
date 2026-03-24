<template>
	<UModal v-model:open="showLeaveWarning" :title="$t('unsavedChanges')">
		<template #body>
			<p class="text-sm">{{ $t('navigateAwayWarning') }}</p>
		</template>
		<template #footer>
			<div class="flex gap-2 justify-end">
				<UButton variant="outline" color="neutral" @click="cancelLeave">{{ $t('stayOnPage') }}</UButton>
				<UButton color="error" @click="confirmLeave">{{ $t('leaveAnyway') }}</UButton>
			</div>
		</template>
	</UModal>

	<LayoutsDetailPanel :showPanel="showConfigPanel" @close="closePanel">
		<template #main>
			<LayoutsPageLayout :loading="loading">
				<template #tabs>
					<slot name="tabs" />
				</template>
				<template #actions>
					<UButton v-if="changesDetected && !autoRefreshEnabled" :icon="icons.refresh" color="warning"
						variant="soft" size="xs" @click="manualRefresh" :title="lastChangeDescription">
						{{ $t('changesDetected') }}
					</UButton>
					<ProductsQuickActionsDropdown :products="products" @applied="fetchProducts" />
					<UButton :icon="icons.refresh" variant="ghost" color="neutral" size="sm" :loading="loading"
						:title="String($t('refresh'))" @click="fetchProducts()" />
				</template>

				<template #saveActions>
					<ProductsUnsavedChangesModal :config-ref="productConfigTabsRef"
						:config-product-id="configProduct?.productId" mode="actionRequests"
						:selected-product-ids="selectedProductIds" @save-all="handleSaveAll"
						@discard-all="discardAllChanges" />
				</template>

				<UAlert v-if="error" color="error" :title="$t('error')" :description="error"
					:close-button="{ icon: icons.close, color: 'error', variant: 'link' }" @close="error = null" />

				<div v-if="actionStatus" class="mb-3">
					<UAlert :color="actionStatus.type" :title="actionStatus.title" :description="actionStatus.message"
						variant="subtle"
						:close-button="{ icon: icons.close, color: actionStatus.type, variant: 'link' }"
						@close="actionStatus = null" />
				</div>

				<SharedDataTable :rows="products" :columns="columns" :loading="loading" :table-id="tableId"
					row-key="productId" :selectable="true" :filterable="true" :show-refresh="false" :clickable="true"
					:total-items="totalItems" :selected-keys="selectedTableKeys"
					:sort-by-selection-enabled="sortBySelectionEnabled" @row-activate="handleRowActivate"
					@selection-change="handleSelectionChange" @page-change="handlePageChange" @refresh="fetchProducts">

					<template #header-cell-actionRequest="{ sortColumn, sortDirection }">
						<ProductsActionRequestDropdown mode="header"
							:has-clients-selected="selectionStore.selectedClients.length > 0"
							:has-products-selected="selectionStore.selectedProducts.length > 0"
							:sort-column="sortColumn" :sort-direction="(sortDirection as 'asc' | 'desc')"
							@apply="handleBulkActionRequest" />
					</template>

					<template #cell-productId="{ row }">
						<div class="flex items-center gap-2">
							<UIcon v-if="(row as ProductRow).locked" :name="icons.lock"
								class="w-3.5 h-3.5 text-red-500 shrink-0" :title="$t('locked')" />
							<span class="font-medium">{{ (row as ProductRow).productId }}</span>
						</div>
					</template>

					<template #cell-description="{ row }">
						<span class="line-clamp-1" :title="(row as ProductRow).description || undefined">
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
						<ProductsActionRequestDropdown :product-id="(row as ProductRow).productId"
							:current-request="(row as ProductRow).actionRequest"
							:available-actions="(row as ProductRow).actions || []"
							:disabled="selectionStore.selectedClients.length === 0"
							:request-details="(row as ProductRow).actionRequestDetails"
							:selected-clients="(row as ProductRow).selectedClients"
							:pending-request="pendingActionRequests.get((row as ProductRow).productId)?.actionRequest"
							@change="handleActionRequestChange((row as ProductRow).productId, (row as ProductRow).actionRequest || 'none', $event)" />
					</template>

					<template #cell-actionProgress="{ row }">
						<span class="text-sm text-(--color-text)">
							{{ (row as ProductRow).actionProgress || '-' }}
						</span>
					</template>

					<template #cell-advice="{ row }">
						<span class="line-clamp-1 text-sm text-(--color-text)"
							:title="(row as ProductRow).advice || undefined">
							{{ (row as ProductRow).advice || '-' }}
						</span>
					</template>

					<template #cell-priority="{ row }">
						<span class="text-sm text-(--color-text)">{{ (row as ProductRow).priority ?? '-' }}</span>
					</template>

					<template #cell-modificationTime="{ row }">
						<span class="text-sm text-(--color-text)">
							{{ formatModificationTime((row as ProductRow).modificationTime) }}
						</span>
					</template>

					<template #row-actions="{ row }">
						<UButton :icon="icons.config" variant="ghost" color="neutral" size="xs"
							:title="$t('configuration')" @click.stop="openProductConfig(row as ProductRow)" />
					</template>
				</SharedDataTable>
			</LayoutsPageLayout>
		</template>

		<template #title>
			<span class="flex items-center gap-2">
				<UIcon :name="icons.product" class="w-4 h-4 text-opsi-blue shrink-0" />
				{{ configProduct?.productId }}
			</span>
		</template>
		<template #subtitle>{{ configProduct?.description }}</template>

		<template #panelActions>
			<ProductsUnsavedChangesModal :config-ref="panelPropertyConfigRef"
				:config-product-id="configProduct?.productId" mode="properties" @save-all="handlePanelSave"
				@discard-all="handlePanelDiscard" />
		</template>

		<template #panel>
			<div v-if="configProduct?.productId" class="flex flex-col h-full">
				<ProductsConfigTabs ref="configPanelRef" :product-id="configProduct.productId" :panel-mode="true"
					class="flex-1" @saved="onConfigSaved" />
			</div>
		</template>
	</LayoutsDetailPanel>
</template>

<script setup lang="ts">
import type { DataTableColumnDef } from '~/composables/useDataTableSettings'
import type { PageChangeParams } from '~/components/shared/DataTable.vue'
import type { ProductRow, ProductType, ProductConfigTabsRef, ProductActionRequestChange, EditablePropertyValue } from '~/types'
import { useSelectionStore } from '~/stores/selectionStore'

interface Props {
	productType: ProductType
	initialProductId?: string
	initialSortColumn?: string
}

const props = defineProps<Props>()
const icons = useIcons()
const { t: $t } = useI18n()
const { getProducts, setClientProductActions, processActionRequests } = useApiHelpers()
const selectionStore = useSelectionStore()
const router = useRouter()
const route = useRoute()

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
const configPanelRef = configTabsComponentRef
const lastPageParams = ref<PageChangeParams | null>(null)

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
const pendingActionRequestCount = computed(() => pendingActionRequests.value.size)

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
	{ key: 'installationStatus', label: String($t('installationStatus')), headerIcon: icons.productInstallationStatusInstalled, sortable: true, class: 'text-center w-16', align: 'center' },
	{ key: 'actionResult', label: String($t('actionResult')), headerIcon: icons.productActionResult, sortable: true, class: 'text-center w-16', align: 'center', visible: false },
	{ key: 'productId', label: String($t('productId')), sortable: true, alwaysVisible: true },
	{ key: 'description', label: String($t('description')), sortable: true },
	{ key: 'version', label: String($t('version')), sortable: true },
	{ key: 'advice', label: String($t('advice')), sortable: true, visible: false },
	{ key: 'priority', label: String($t('priority')), sortable: true, visible: false },
	{ key: 'modificationTime', label: String($t('modificationTime')), sortable: true, visible: false },
	{ key: 'actionProgress', label: String($t('actionProgress')), sortable: true, visible: false },
	{ key: 'actionRequest', label: String($t('actionRequest')), sortable: true, class: 'w-40' },
]

function openProductConfig(product: ProductRow) {
	configProduct.value = product
	showConfigPanel.value = true
	router.replace({ query: { ...route.query, product: product.productId, view: 'panel' } })
}

function formatModificationTime(value: string | undefined | null): string {
	if (!value) return '-'
	try {
		return new Date(value).toLocaleString('en-US', { year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: '2-digit', second: '2-digit', hour12: true })
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
	const { product: _p, view: _v, ...rest } = route.query
	router.replace({ query: rest })
}

function handleRowActivate(row: ProductRow) {
	if (configProduct.value && configProduct.value.productId !== row.productId && hasUnsavedChanges.value) {
		pendingAction.value = () => {
			discardAllChanges()
			selectionStore.setProducts([row.productId], 'table')
			openProductConfig(row)
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

async function saveActionRequests() {
	if (pendingActionRequests.value.size === 0) return
	if (selectionStore.selectedClients.length === 0) {
		actionStatus.value = { type: 'error', title: String($t('error')), message: String($t('message.noClientsSelected')) }
		setTimeout(() => { actionStatus.value = null }, 5000)
		return
	}
	savingActionRequests.value = true
	const errors: string[] = []
	const savedIds: string[] = []
	try {
		const clientIds = selectionStore.selectedClients
		for (const [pid, change] of pendingActionRequests.value) {
			try {
				const r = await setClientProductActions({ clientIds, productIds: [pid], actionRequest: change.actionRequest })
				if (r.error) throw r.error
				savedIds.push(pid)
			} catch (e) {
				errors.push(`${pid}: ${e instanceof Error ? e.message : String(e)}`)
			}
		}
		for (const pid of savedIds) {
			pendingActionRequests.value.delete(pid)
		}
		if (errors.length > 0 && savedIds.length > 0) {
			actionStatus.value = { type: 'warning', title: String($t('warning')), message: `${savedIds.length} saved, ${errors.length} failed: ${errors.join('; ')}` }
		} else if (errors.length > 0) {
			actionStatus.value = { type: 'error', title: String($t('error')), message: errors.join('; ') }
		} else {
			actionStatus.value = { type: 'success', title: String($t('success')), message: String($t('message.actionRequestsSaved')) }
		}
		setTimeout(() => { actionStatus.value = null }, errors.length > 0 ? 8000 : 5000)
		await fetchProducts()
	} catch (e) {
		actionStatus.value = { type: 'error', title: String($t('error')), message: e instanceof Error ? e.message : String($t('message.failedToSaveActionRequests')) }
		setTimeout(() => { actionStatus.value = null }, 8000)
	} finally { savingActionRequests.value = false }
}

async function handleSaveAll(processOnDemand?: boolean, onDemandOptions?: { productIds?: string[]; visibility?: string; clientIds?: string[] }) {
	await saveActionRequests()
	if (processOnDemand) {
		const clientIds = onDemandOptions?.clientIds || selectionStore.selectedClients
		if (clientIds.length > 0) {
			try {
				const productIds = onDemandOptions?.productIds || undefined
				await processActionRequests(clientIds, productIds)
				actionStatus.value = { type: 'success', title: String($t('success')), message: String($t('message.processActionsExecuted')) }
				setTimeout(() => { actionStatus.value = null }, 5000)
			} catch (e) {
				actionStatus.value = { type: 'error', title: String($t('error')), message: e instanceof Error ? e.message : String($t('message.failedToProcessActions')) }
			}
		}
	}
}

async function handlePanelSave() {
	if (configTabsComponentRef.value?.hasAnyChanges) {
		await configTabsComponentRef.value.saveAll()
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

function onConfigSaved() { fetchProducts() }

function handlePageChange(params: PageChangeParams) {
	lastPageParams.value = params
	fetchProducts(params)
}

async function fetchProducts(params?: PageChangeParams) {
	loading.value = true
	error.value = null
	try {
		await selectionStore.ensureServersSelected()
		if (selectionStore.selectedServers.length === 0) { error.value = String($t('message.noServerSelected')); return }

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
				p.sortBy = params.sortBy
				p.sortDesc = params.sortDesc
			}
			p.filterQuery = params.filterQuery
		} else {
			if (tableSettings.settings.sortColumn && !tableSettings.settings.sortColumn.startsWith('__')) {
				p.sortBy = tableSettings.settings.sortColumn
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
		error.value = e instanceof Error ? e.message : String($t('errorFetchingProducts'))
	} finally { loading.value = false }
}

watch(() => props.productType, () => { pendingActionRequests.value.clear(); fetchProducts() })

watch(() => route.query.product, (newProductId, oldProductId) => {
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

onMounted(async () => {
	if (props.initialSortColumn) {
		tableSettings.setSort(props.initialSortColumn, 'desc')
	}
	await fetchProducts()
	tryOpenPanelFromRoute()
})

defineExpose({ refresh: () => fetchProducts(), hasUnsavedChanges })
</script>
