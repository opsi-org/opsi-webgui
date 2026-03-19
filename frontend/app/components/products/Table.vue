<template>
	<LayoutsDetailPanel :showPanel="showConfigPanel" @close="closePanel">
		<template #main>
			<LayoutsPageLayout show-refresh :loading="loading" @refresh="fetchProducts">
				<template #stats>
					<div class="flex items-center gap-1.5">
						<span v-if="mbConnected" class="w-2 h-2 rounded-full bg-green-500"
							title="MessageBus connected" />
						<span v-else class="w-2 h-2 rounded-full bg-red-400" title="MessageBus disconnected" />
						<label class="flex items-center gap-1 cursor-pointer text-xs text-(--color-text-muted)">
							<input type="checkbox" v-model="autoRefreshEnabled"
								class="rounded border-gray-300 text-opsi-blue focus:ring-opsi-blue w-3.5 h-3.5" />
							{{ $t('autoRefresh') }}
						</label>
					</div>
					<UButton v-if="changesDetected && !autoRefreshEnabled" :icon="icons.refresh" color="warning"
						variant="soft" size="xs" class="ml-2" @click="manualRefresh">
						{{ $t('changesDetected') }}
					</UButton>
				</template>

				<template #actions>
					<div class="flex items-center gap-2">
						<ProductsQuickActionsDropdown :products="products" @applied="fetchProducts" />

						<UButton variant="soft" color="neutral" size="sm"
							:disabled="stateStore.selectedClients.length === 0" @click="processActionsOpen = true">
							<UIcon :name="icons.onDemand" class="w-4 h-4" />
							<span class="hidden sm:inline">{{ $t('processActions') }}</span>
						</UButton>

						<UButton v-if="pendingActionRequestCount > 0" color="warning" variant="soft" size="sm"
							:loading="savingActionRequests" @click="saveActionRequests">
							<UIcon :name="icons.save" class="w-4 h-4" />
							<span>{{ $t('saveActions') }} ({{ pendingActionRequestCount }})</span>
						</UButton>
					</div>
				</template>

				<template #saveActions>
					<ProductsUnsavedChangesModal :config-ref="productConfigTabsRef" @save-all="saveAllChanges"
						@discard-all="discardAllChanges" />
				</template>

				<UAlert v-if="error" color="error" :title="$t('error')" :description="error"
					:close-button="{ icon: icons.close, color: 'error', variant: 'link' }" @close="error = null" />

				<SharedDataTable :rows="products" :columns="columns" :loading="loading" :table-id="tableId"
					row-key="productId" :selectable="true" :filterable="true" :show-refresh="false" :clickable="true"
					@select="handleRowSelect" @selection-change="handleSelectionChange" @refresh="fetchProducts">

					<template #cell-productId="{ row }">
						<div class="flex items-center gap-2">
							<UIcon v-if="(row as ProductRow).locked" :name="icons.lock"
								class="w-3.5 h-3.5 text-red-500 shrink-0" :title="$t('locked')" />
							<span class="font-medium">{{ (row as ProductRow).productId }}</span>
							<UBadge v-if="(row as ProductRow).client_version_outdated" color="warning" variant="soft"
								size="xs">
								{{ $t('outdated') }}
							</UBadge>
							<UBadge v-if="(row as ProductRow).depot_version_diff" color="info" variant="soft" size="xs">
								{{ $t('versionDiff') }}
							</UBadge>
						</div>
					</template>

					<template #cell-description="{ row }">
						<span class="line-clamp-1" :title="(row as ProductRow).description || ''">
							{{ (row as ProductRow).description || '-' }}
						</span>
					</template>

					<template #cell-advice="{ row }">
						<span v-if="(row as ProductRow).advice" class="line-clamp-1 text-amber-600 dark:text-amber-400"
							:title="(row as ProductRow).advice">
							{{ (row as ProductRow).advice }}
						</span>
						<span v-else class="text-(--color-text-muted)">-</span>
					</template>

					<template #cell-depotVersions="{ row }">
						<span class="font-mono text-xs text-(--color-text-muted)">
							{{ formatVersions((row as ProductRow).depotVersions) }}
						</span>
					</template>

					<template #cell-clientVersions="{ row }">
						<span class="font-mono text-xs text-(--color-text-muted)">
							{{ formatVersions((row as ProductRow).clientVersions) }}
						</span>
					</template>

					<template #cell-priority="{ row }">
						<UBadge v-if="(row as ProductRow).priority !== undefined && (row as ProductRow).priority !== 0"
							:color="getPriorityColor((row as ProductRow).priority!)" variant="subtle" size="xs">
							{{ (row as ProductRow).priority }}
						</UBadge>
						<span v-else class="text-(--color-text-muted) text-xs">0</span>
					</template>

					<template #cell-modificationTime="{ row }">
						<span v-if="(row as ProductRow).modificationTime" class="text-xs text-(--color-text-muted)">
							{{ formatDate((row as ProductRow).modificationTime!) }}
						</span>
						<span v-else class="text-(--color-text-muted)">-</span>
					</template>

					<template #cell-installationStatus="{ row }">
						<ProductsInstallationStatusBadge :status="(row as ProductRow).installationStatus"
							:status-details="(row as ProductRow).installationStatusDetails" />
					</template>

					<template #cell-actionResult="{ row }">
						<ProductsActionResultBadge :result="(row as ProductRow).actionResult"
							:result-details="(row as ProductRow).actionResultDetails" />
					</template>

					<template #cell-actionProgress="{ row }">
						<span v-if="(row as ProductRow).actionProgress" class="text-xs">
							{{ (row as ProductRow).actionProgress }}
						</span>
						<span v-else class="text-(--color-text-muted)">-</span>
					</template>

					<template #cell-actionRequest="{ row }">
						<ProductsActionRequestDropdown :product-id="(row as ProductRow).productId"
							:current-request="(row as ProductRow).actionRequest"
							:available-actions="(row as ProductRow).actions || []"
							:disabled="stateStore.selectedClients.length === 0"
							@change="handleActionRequestChange((row as ProductRow).productId, (row as ProductRow).actionRequest || 'none', $event)" />
					</template>

					<template #row-actions="{ row }">
						<div class="flex items-center gap-1">
							<UTooltip :text="$t('configuration')">
								<UButton :icon="icons.settings" variant="ghost" color="neutral" size="xs"
									@click.stop="openProductConfig((row as ProductRow))" />
							</UTooltip>
						</div>
					</template>
				</SharedDataTable>
			</LayoutsPageLayout>
		</template>

		<template #title>{{ configProduct?.productId }}</template>
		<template #subtitle>{{ configProduct?.description }}</template>

		<template #panelActions>
			<ProductsUnsavedChangesModal v-if="showConfigPanel" :config-ref="productConfigTabsRef" size="xs"
				@save-all="saveAllChanges" @discard-all="discardAllChanges" />
		</template>

		<template #panel>
			<div v-if="configProduct" class="flex flex-col h-full">
				<div class="space-y-3 pb-4 border-b border-(--color-border) dark:border-(--color-border)">
					<div class="flex items-center gap-2">
						<UIcon :name="icons.product" class="w-5 h-5 text-opsi-blue" />
						<div class="flex-1 min-w-0">
							<span class="font-medium">{{ configProduct.productId }}</span>
							<UBadge v-if="configProduct.depotVersions" class="ml-2" color="neutral" variant="soft"
								size="xs">
								v{{ formatVersions(configProduct.depotVersions) }}
							</UBadge>
						</div>
						<UBadge v-if="configProduct.locked" color="error" variant="subtle" size="xs">
							<UIcon :name="icons.lock" class="w-3 h-3 mr-0.5" />
							{{ $t('locked') }}
						</UBadge>
					</div>
					<p v-if="configProduct.description" class="text-xs text-(--color-text-muted) line-clamp-2">
						{{ configProduct.description }}
					</p>
					<div v-if="configProduct.advice"
						class="p-2 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 text-xs rounded-lg">
						<UIcon :name="icons.warning" class="w-3 h-3 inline mr-1" />
						{{ configProduct.advice }}
					</div>
				</div>

				<ProductsConfigTabs ref="configTabsComponentRef" :product-id="configProduct.productId"
					:panel-mode="true" class="flex-1 mt-4" @saved="onConfigSaved" />
			</div>
		</template>
	</LayoutsDetailPanel>

	<ProductsProcessActionsModal v-model:open="processActionsOpen" :selected-product-ids="selectedProductIds"
		@executed="fetchProducts" />
</template>

<script setup lang="ts">
import type { DataTableColumnDef } from '~/composables/useDataTableSettings'
import type { ProductRow, ProductType, ProductConfigTabsRef, ProductActionRequestChange, EditablePropertyValue } from '~/types/api/product.types'
import { useStateStore } from '~/stores/stateStore'

interface Props {
	productType: ProductType
	initialProductId?: string
}

const props = defineProps<Props>()

const icons = useIcons()
const { t: $t } = useI18n()
const toast = useToast()
const { getProducts, setClientProductActions } = useApiHelpers()
const stateStore = useStateStore()

const loading = ref(false)
const error = ref<string | null>(null)
const products = ref<ProductRow[]>([])
const selectedProducts = ref<ProductRow[]>([])
const configProduct = ref<ProductRow | null>(null)
const showConfigPanel = ref(false)
const processActionsOpen = ref(false)

const pendingActionRequests = ref(new Map<string, ProductActionRequestChange>())
const savingActionRequests = ref(false)

const configTabsComponentRef = ref<InstanceType<typeof import('./ConfigTabs.vue').default> | null>(null)

const tableId = computed(() =>
	props.productType === 'NetbootProduct' ? 'products-netboot' : 'products-localboot'
)

const selectedProductIds = computed(() => selectedProducts.value.map(p => p.productId))

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
			discardSingleActionRequest: (productId: string) => { pendingActionRequests.value.delete(productId) },
			getOriginalPropertyValue: () => undefined,
			fmtVal: (v: unknown) => v === null || v === undefined ? '-' : Array.isArray(v) ? v.join(', ') : String(v),
			refresh: fetchProducts,
		}
	}

	const tabsHasChanges = tabs.hasAnyChanges
	const totalChanges = (tabs.changedCount || 0) + pendingActionRequests.value.size

	return {
		hasAnyChanges: tabsHasChanges || pendingActionRequests.value.size > 0,
		isSaving: (tabs.isSaving as unknown as boolean) || savingActionRequests.value,
		changedCount: totalChanges,
		changedProperties: tabs.changedProperties as unknown as Map<string, EditablePropertyValue>,
		changedActionRequests: pendingActionRequests.value,
		saveAll: saveAllChanges,
		discardAll: discardAllChanges,
		discardSingleProperty: tabs.discardSingleProperty,
		discardSingleActionRequest: (productId: string) => { pendingActionRequests.value.delete(productId) },
		getOriginalPropertyValue: tabs.getOriginalPropertyValue,
		fmtVal: tabs.fmtVal,
		refresh: fetchProducts,
	}
})

const { isConnected: mbConnected, autoRefreshEnabled, changesDetected, manualRefresh } = useAutoRefreshProducts(fetchProducts)

const columns: DataTableColumnDef[] = [
	{ key: 'installationStatus', label: String($t('installationStatus')), sortable: true, class: 'text-center w-12', visible: false },
	{ key: 'actionResult', label: String($t('actionResult')), sortable: true, class: 'text-center w-12', visible: false },
	{ key: 'productId', label: String($t('productId')), sortable: true, alwaysVisible: true },
	{ key: 'description', label: String($t('description')), sortable: true, class: 'hidden md:table-cell max-w-xs' },
	{ key: 'advice', label: String($t('advice')), sortable: true, class: 'hidden lg:table-cell max-w-xs', visible: false },
	{ key: 'modificationTime', label: String($t('modificationTime')), sortable: true, class: 'hidden xl:table-cell', visible: false },
	{ key: 'priority', label: String($t('priority')), sortable: true, class: 'text-center w-16', visible: false },
	{ key: 'depotVersions', label: String($t('depotVersion')), sortable: true, class: 'hidden sm:table-cell' },
	{ key: 'clientVersions', label: String($t('clientVersion')), sortable: true, class: 'hidden lg:table-cell', visible: false },
	{ key: 'actionProgress', label: String($t('actionProgress')), sortable: true, class: 'hidden xl:table-cell', visible: false },
	{ key: 'actionRequest', label: String($t('actionRequest')), sortable: true, class: 'w-32', visible: false },
]

function formatVersions(versions?: string | string[] | null): string {
	if (!versions) return '-'
	if (Array.isArray(versions)) {
		const unique = [...new Set(versions.filter(Boolean))]
		if (unique.length === 0) return '-'
		return unique.length > 1 ? `${unique[0]} (+${unique.length - 1})` : (unique[0] || '-')
	}
	return String(versions)
}

function formatDate(dateStr: string): string {
	try {
		return new Date(dateStr).toLocaleDateString()
	} catch {
		return dateStr
	}
}

function getPriorityColor(priority: number): 'success' | 'warning' | 'error' | 'info' | 'neutral' {
	if (priority >= 80) return 'error'
	if (priority >= 50) return 'warning'
	if (priority > 0) return 'info'
	if (priority < 0) return 'neutral'
	return 'neutral'
}

function openProductConfig(product: ProductRow) {
	configProduct.value = product
	showConfigPanel.value = true
}

function closePanel() {
	if (configTabsComponentRef.value?.hasAnyChanges) {
		const confirmed = window.confirm(String($t('message.unsavedChanges')))
		if (!confirmed) return
	}
	showConfigPanel.value = false
	configProduct.value = null
}

function handleActionRequestChange(productId: string, oldRequest: string, newRequest: string) {
	if (newRequest === oldRequest || newRequest === 'none' && !oldRequest) {
		pendingActionRequests.value.delete(productId)
	} else {
		pendingActionRequests.value.set(productId, {
			productId,
			actionRequest: newRequest,
			oldRequest: oldRequest || 'none',
		})
	}
}

async function saveActionRequests() {
	if (pendingActionRequests.value.size === 0) return
	savingActionRequests.value = true
	try {
		const grouped = new Map<string, string[]>()
		for (const [productId, change] of pendingActionRequests.value) {
			const existing = grouped.get(change.actionRequest) || []
			existing.push(productId)
			grouped.set(change.actionRequest, existing)
		}

		const clientIds = stateStore.selectedClients.length > 0 ? stateStore.selectedClients : []

		for (const [actionRequest, productIds] of grouped) {
			const result = await setClientProductActions({
				clientIds,
				productIds,
				actionRequest,
			})
			if (result.error) throw result.error
		}

		pendingActionRequests.value.clear()
		toast.add({ title: String($t('success')), description: String($t('message.actionRequestsSaved')), color: 'success' })
		await fetchProducts()
	} catch (e) {
		console.error('Failed to save action requests:', e)
		toast.add({
			title: String($t('error')),
			description: e instanceof Error ? e.message : String($t('message.failedToSaveActionRequests')),
			color: 'error',
		})
	} finally {
		savingActionRequests.value = false
	}
}

async function saveAllChanges() {
	if (configTabsComponentRef.value?.hasAnyChanges) {
		await configTabsComponentRef.value.saveAll()
	}
	if (pendingActionRequests.value.size > 0) {
		await saveActionRequests()
	}
}

function discardAllChanges() {
	configTabsComponentRef.value?.discardAll()
	pendingActionRequests.value.clear()
}

function onConfigSaved() {
	fetchProducts()
}

async function fetchProducts() {
	loading.value = true
	error.value = null
	try {
		await stateStore.ensureDepotsSelected()

		if (stateStore.depots.length === 0) {
			error.value = String($t('message.noServerSelected'))
			return
		}

		const params: Record<string, unknown> = {
			type: props.productType,
			sortBy: 'productId',
			sortDesc: false,
			pageNumber: 1,
			perPage: 500,
			selectedDepots: stateStore.selectedDepotsParam,
		}

		if (stateStore.selectedClients.length > 0) {
			params.selectedClients = `[${stateStore.selectedClients.join(',')}]`
		}

		const result = await getProducts(params)
		if (result.error) throw result.error
		products.value = (result.data || []) as ProductRow[]
	} catch (err: unknown) {
		console.error('Failed to fetch products:', err)
		error.value = err instanceof Error ? err.message : String($t('errorFetchingProducts'))
	} finally {
		loading.value = false
	}
}

function handleSelectionChange(rows: ProductRow[], _keys: string[]) {
	selectedProducts.value = rows
	stateStore.setProducts(rows.map(r => r.productId))
}

function handleRowSelect(row: ProductRow) {
	openProductConfig(row)
}

watch(() => props.productType, () => {
	pendingActionRequests.value.clear()
	fetchProducts()
})

watch(() => props.initialProductId, (newId) => {
	if (newId && products.value.length > 0) {
		const product = products.value.find(p => p.productId === newId)
		if (product) openProductConfig(product)
	}
}, { immediate: true })

watch(products, (newProducts) => {
	if (props.initialProductId && newProducts.length > 0 && !showConfigPanel.value) {
		const product = newProducts.find(p => p.productId === props.initialProductId)
		if (product) openProductConfig(product)
	}
})

onMounted(() => {
	fetchProducts()
})

defineExpose({ refresh: fetchProducts })
</script>
