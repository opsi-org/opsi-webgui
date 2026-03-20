<template>
	<LayoutsDetailPanel :showPanel="showConfigPanel" @close="closePanel">
		<template #main>
			<LayoutsPageLayout show-refresh :loading="loading" @refresh="fetchProducts">
				<template #stats>
					<div class="flex items-center gap-1.5">
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
						variant="soft" size="xs" class="ml-2" @click="manualRefresh">
						{{ $t('changesDetected') }}
					</UButton>
				</template>

				<template #actions>
					<div class="flex items-center gap-2">
						<ProductsQuickActionsDropdown :products="products" @applied="fetchProducts" />
						<UButton variant="soft" color="neutral" size="sm"
							:disabled="selectionStore.selectedClients.length === 0" @click="processActionsOpen = true">
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
					:selected-keys="selectedTableKeys" @select="handleRowSelect"
					@selection-change="handleSelectionChange" @refresh="fetchProducts">

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

					<template #cell-installationStatus="{ row }">
						<ProductsInstallationStatusBadge :status="(row as ProductRow).installationStatus"
							:status-details="(row as ProductRow).installationStatusDetails" />
					</template>

					<template #cell-actionResult="{ row }">
						<ProductsActionResultBadge :result="(row as ProductRow).actionResult"
							:result-details="(row as ProductRow).actionResultDetails" />
					</template>

					<template #cell-actionRequest="{ row }">
						<ProductsActionRequestDropdown :product-id="(row as ProductRow).productId"
							:current-request="(row as ProductRow).actionRequest"
							:available-actions="(row as ProductRow).actions || []"
							:disabled="selectionStore.selectedClients.length === 0"
							@change="handleActionRequestChange((row as ProductRow).productId, (row as ProductRow).actionRequest || 'none', $event)" />
					</template>

					<template #row-actions="{ row }">
						<UButton :icon="icons.settings" variant="ghost" color="neutral" size="xs"
							:title="$t('configuration')" @click.stop="openProductConfig(row as ProductRow)" />
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
				<div class="space-y-3 pb-4 border-b border-(--color-border)">
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
							<UIcon :name="icons.lock" class="w-3 h-3 mr-0.5" /> {{ $t('locked') }}
						</UBadge>
					</div>
					<p v-if="configProduct.description" class="text-xs text-(--color-text-muted) line-clamp-2">
						{{ configProduct.description }}
					</p>
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
import type { ProductRow, ProductType, ProductConfigTabsRef, ProductActionRequestChange, EditablePropertyValue } from '~/types'
import { useSelectionStore } from '~/stores/selectionStore'

interface Props {
	productType: ProductType
	initialProductId?: string
}

const props = defineProps<Props>()
const icons = useIcons()
const { t: $t } = useI18n()
const toast = useToast()
const { getProducts, setClientProductActions } = useApiHelpers()
const selectionStore = useSelectionStore()

const selectedTableKeys = computed(() => selectionStore.selectedProducts)

const loading = ref(false)
const error = ref<string | null>(null)
const products = ref<ProductRow[]>([])
const configProduct = ref<ProductRow | null>(null)
const showConfigPanel = ref(false)
const processActionsOpen = ref(false)
const pendingActionRequests = ref(new Map<string, ProductActionRequestChange>())
const savingActionRequests = ref(false)
const configTabsComponentRef = ref<InstanceType<typeof import('./ConfigTabs.vue').default> | null>(null)

const tableId = computed(() => props.productType === 'NetbootProduct' ? 'products-netboot' : 'products-localboot')
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

const { isConnected: mbConnected, autoRefreshEnabled, changesDetected, manualRefresh } = useAutoRefreshProducts(fetchProducts)

const columns: DataTableColumnDef[] = [
	{ key: 'installationStatus', label: String($t('installationStatus')), sortable: true, class: 'text-center w-12' },
	{ key: 'actionResult', label: String($t('actionResult')), sortable: true, class: 'text-center w-12', visible: false },
	{ key: 'productId', label: String($t('productId')), sortable: true, alwaysVisible: true },
	{ key: 'description', label: String($t('description')), sortable: true },
	{ key: 'depotVersions', label: String($t('serverVersion')), sortable: true },
	{ key: 'clientVersions', label: String($t('clientVersion')), sortable: true, visible: false },
	{ key: 'actionRequest', label: String($t('actionRequest')), sortable: true, class: 'w-32' },
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

function handleRowSelect(row: ProductRow) {
	selectionStore.toggleProduct(row.productId, 'table')
}

function handleSelectionChange(_rows: ProductRow[], keys: string[]) {
	selectionStore.setProducts(keys, 'table')
}

function handleActionRequestChange(productId: string, oldReq: string, newReq: string) {
	if (newReq === oldReq || (newReq === 'none' && !oldReq)) pendingActionRequests.value.delete(productId)
	else pendingActionRequests.value.set(productId, { productId, actionRequest: newReq, oldRequest: oldReq || 'none' })
}

async function saveActionRequests() {
	if (pendingActionRequests.value.size === 0) return
	savingActionRequests.value = true
	try {
		const grouped = new Map<string, string[]>()
		for (const [pid, change] of pendingActionRequests.value) {
			const arr = grouped.get(change.actionRequest) || []
			arr.push(pid)
			grouped.set(change.actionRequest, arr)
		}
		const clientIds = selectionStore.selectedClients.length > 0 ? selectionStore.selectedClients : []
		for (const [actionRequest, productIds] of grouped) {
			const r = await setClientProductActions({ clientIds, productIds, actionRequest })
			if (r.error) throw r.error
		}
		pendingActionRequests.value.clear()
		toast.add({ title: String($t('success')), description: String($t('message.actionRequestsSaved')), color: 'success' })
		await fetchProducts()
	} catch (e) {
		toast.add({ title: String($t('error')), description: e instanceof Error ? e.message : String($t('message.failedToSaveActionRequests')), color: 'error' })
	} finally { savingActionRequests.value = false }
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

async function fetchProducts() {
	loading.value = true
	error.value = null
	try {
		await selectionStore.ensureServersSelected()
		if (selectionStore.selectedServers.length === 0) { error.value = String($t('message.noServerSelected')); return }

		const params: Record<string, unknown> = {
			type: props.productType, sortBy: 'productId', sortDesc: false,
			pageNumber: 1, perPage: 500,
			selectedDepots: selectionStore.selectedServersParam,
		}
		if (selectionStore.selectedClients.length > 0)
			params.selectedClients = `[${selectionStore.selectedClients.join(',')}]`

		const result = await getProducts(params)
		if (result.error) throw result.error
		products.value = (result.data || []) as ProductRow[]
	} catch (e) {
		error.value = e instanceof Error ? e.message : String($t('errorFetchingProducts'))
	} finally { loading.value = false }
}

watch(() => props.productType, () => { pendingActionRequests.value.clear(); fetchProducts() })

watch(() => props.initialProductId, (newId) => {
	if (newId && products.value.length > 0) {
		const p = products.value.find(pr => pr.productId === newId)
		if (p) openProductConfig(p)
	}
}, { immediate: true })

watch(() => selectionStore.selectedClients, fetchProducts, { deep: true })
watch(() => selectionStore.selectedServers, fetchProducts, { deep: true })

onMounted(fetchProducts)

defineExpose({ refresh: fetchProducts })
</script>
