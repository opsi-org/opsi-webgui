<!--
This file is part of opsi-webgui application.
opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
Copyright (c) uib GmbH <info@uib.de> 2026
All rights reserved.
License: AGPL-3.0

ProductsTable component - used for both Localboot and Netboot products.
Includes side panel with tabs for product properties and dependencies.
-->
<template>
	<LayoutsDetailPanel :showPanel="showConfigPanel" @close="closePanel">
		<template #main>
			<LayoutsPageLayout show-refresh :loading="loading" @refresh="fetchProducts">
				<template #stats>
					<!-- Auto-refresh toggle -->
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

				<!-- Error State -->
				<UAlert v-if="error" color="error" :title="$t('error')" :description="error"
					:close-button="{ icon: icons.close, color: 'error', variant: 'link' }" @close="error = null" />

				<!-- Products Table -->
				<SharedDataTable :rows="products" :columns="columns" :loading="loading" :table-id="tableId"
					row-key="productId" :selectable="true" :filterable="true" :show-refresh="false" :clickable="true"
					@select="handleRowSelect" @selection-change="handleSelectionChange" @refresh="fetchProducts">
					<template #cell-productId="{ row }">
						<div class="flex items-center gap-2">
							<span class="font-medium">{{ (row as Product).productId }}</span>
							<UBadge v-if="(row as Product).client_version_outdated" color="warning" variant="soft"
								size="xs">
								{{ $t('outdated') }}
							</UBadge>
						</div>
					</template>
					<template #cell-description="{ row }">
						<span class="line-clamp-1" :title="(row as Product).description || ''">
							{{ (row as Product).description || '-' }}
						</span>
					</template>
					<template #cell-advice="{ row }">
						<span v-if="(row as Product).advice" class="line-clamp-1 text-amber-600 dark:text-amber-400"
							:title="(row as Product).advice">
							{{ (row as Product).advice }}
						</span>
						<span v-else class="text-(--color-text-muted)">-</span>
					</template>
					<template #cell-depotVersions="{ row }">
						<span class="font-mono text-xs text-(--color-text-muted)">
							{{ formatVersions((row as Product).depotVersions) }}
						</span>
					</template>
					<template #cell-priority="{ row }">
						<UBadge v-if="(row as Product).priority !== undefined && (row as Product).priority !== 0"
							:color="getPriorityColor((row as Product).priority!)" variant="subtle" size="xs">
							{{ (row as Product).priority }}
						</UBadge>
						<span v-else class="text-(--color-text-muted) text-xs">0</span>
					</template>
					<template #cell-modificationTime="{ row }">
						<span v-if="(row as Product).modificationTime" class="text-xs text-(--color-text-muted)">
							{{ formatDate((row as Product).modificationTime!) }}
						</span>
						<span v-else class="text-(--color-text-muted)">-</span>
					</template>
					<template #cell-installationStatus="{ row }">
						<ProductsInstallationStatusBadge :status="(row as Product).installationStatus"
							:status-details="(row as Product).installationStatusDetails" />
					</template>
					<template #cell-actionResult="{ row }">
						<ProductsActionResultBadge :result="(row as Product).actionResult"
							:result-details="(row as Product).actionResultDetails" />
					</template>
					<template #cell-actionProgress="{ row }">
						<span v-if="(row as Product).actionProgress" class="text-xs">
							{{ (row as Product).actionProgress }}
						</span>
						<span v-else class="text-(--color-text-muted)">-</span>
					</template>
					<template #cell-actionRequest="{ row }">
						<ProductsActionRequestDropdown :product-id="(row as Product).productId"
							:current-request="(row as Product).actionRequest"
							:disabled="stateStore.selectedClients.length === 0"
							@change="handleActionRequestChange((row as Product).productId, $event)" />
					</template>
					<template #row-actions="{ row }">
						<div class="flex items-center gap-1">
							<UTooltip :text="String($t('configuration'))">
								<UButton :icon="icons.settings" variant="ghost" color="neutral" size="xs"
									@click.stop="openProductConfig((row as Product))" />
							</UTooltip>
						</div>
					</template>
				</SharedDataTable>
			</LayoutsPageLayout>
		</template>

		<template #title>{{ configProduct?.productId }}</template>
		<template #subtitle>{{ configProduct?.description }}</template>

		<template #panel>
			<div v-if="configProduct" class="flex flex-col h-full">
				<!-- Product Info Header -->
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
					</div>
					<div v-if="configProduct.advice"
						class="p-2 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 text-xs rounded-lg">
						<UIcon :name="icons.warning" class="w-3 h-3 inline mr-1" />
						{{ configProduct.advice }}
					</div>
				</div>

				<!-- Tabs Navigation -->
				<SharedTabsNav v-model="panelActiveTab" :tabs="panelTabs" class="shrink-0 mt-4" />

				<!-- Tab Content -->
				<div class="flex-1 overflow-auto mt-4">
					<!-- Properties Tab -->
					<div v-show="panelActiveTab === 'properties'">
						<div v-if="propertiesLoading" class="py-8 text-center">
							<UIcon :name="icons.loading" class="w-6 h-6 animate-spin mx-auto text-opsi-blue" />
							<p class="mt-2 text-sm text-(--color-text-muted)">{{ $t('loading') }}...</p>
						</div>
						<div v-else-if="properties.length === 0" class="py-8 text-center">
							<UIcon :name="icons.settings" class="w-10 h-10 mx-auto mb-2 text-(--color-text-muted)" />
							<p class="text-sm text-(--color-text-muted)">{{ $t('noProperties') }}</p>
						</div>
						<div v-else class="space-y-3">
							<div v-for="prop in properties" :key="prop.propertyId"
								class="p-3 border border-(--color-border) dark:border-(--color-border) rounded-lg bg-white dark:bg-(--color-surface)">
								<div class="flex flex-col gap-2">
									<div class="flex items-center justify-between">
										<div class="flex items-center gap-2">
											<span class="font-medium text-sm">{{ prop.propertyId }}</span>
											<UBadge :color="prop.type === 'BoolProductProperty' ? 'info' : 'neutral'"
												variant="subtle" size="xs">
												{{ prop.type === 'BoolProductProperty' ? 'Bool' : 'Text' }}
											</UBadge>
											<UBadge v-if="prop.multiValue" color="secondary" variant="subtle" size="xs">
												Multi
											</UBadge>
										</div>
									</div>
									<p v-if="prop.description" class="text-xs text-(--color-text-muted)">
										{{ prop.description }}
									</p>
									<div class="flex items-center gap-2 text-xs text-(--color-text-muted)">
										<span>{{ $t('default') }}:</span>
										<UBadge v-for="val in prop.default?.slice(0, 3)" :key="String(val)"
											color="neutral" variant="soft" size="xs">
											{{ String(val) }}
										</UBadge>
										<span v-if="(prop.default?.length || 0) > 3">+{{ (prop.default?.length || 0) - 3
										}}</span>
									</div>

									<!-- Property Value Editor -->
									<div class="mt-2">
										<UCheckbox v-if="prop.type === 'BoolProductProperty'"
											:model-value="Boolean(prop._value)"
											@update:model-value="(v: boolean | 'indeterminate') => updatePropertyValue(prop.propertyId, v)"
											:disabled="!prop.editable" />
										<USelect v-else-if="prop.allValues && prop.allValues.length > 0"
											:model-value="String(prop._value ?? '')"
											@update:model-value="(v) => updatePropertyValue(prop.propertyId, String(v ?? ''))"
											:options="prop.allValues.map(v => ({ label: String(v), value: String(v) }))"
											:disabled="!prop.editable" size="sm" class="w-full" />
										<UInput v-else :model-value="String(prop._value ?? '')"
											@update:model-value="(v: string) => updatePropertyValue(prop.propertyId, v)"
											:disabled="!prop.editable" size="sm" class="w-full" />
									</div>
								</div>
							</div>

							<!-- Save Button -->
							<div v-if="hasPropertyChanges"
								class="sticky bottom-0 pt-3 bg-white dark:bg-(--color-surface)">
								<UButton color="primary" block :loading="savingProperties" @click="saveProperties">
									<UIcon :name="icons.check" class="w-4 h-4 mr-1" />
									{{ $t('saveChanges') }}
								</UButton>
							</div>
						</div>
					</div>

					<!-- Dependencies Tab -->
					<div v-show="panelActiveTab === 'dependencies'">
						<div v-if="dependenciesLoading" class="py-8 text-center">
							<UIcon :name="icons.loading" class="w-6 h-6 animate-spin mx-auto text-opsi-blue" />
							<p class="mt-2 text-sm text-(--color-text-muted)">{{ $t('loading') }}...</p>
						</div>
						<div v-else-if="dependencies.length === 0" class="py-8 text-center">
							<UIcon :name="icons.product" class="w-10 h-10 mx-auto mb-2 text-(--color-text-muted)" />
							<p class="text-sm text-(--color-text-muted)">{{ $t('noDependencies') }}</p>
						</div>
						<div v-else class="space-y-2">
							<div v-for="(dep, index) in dependencies" :key="index"
								class="p-3 border border-(--color-border) dark:border-(--color-border) rounded-lg bg-white dark:bg-(--color-surface)">
								<div class="flex items-start gap-3">
									<UIcon :name="icons.arrowRight" class="w-4 h-4 mt-0.5 text-(--color-text-muted)" />
									<div class="flex-1 min-w-0">
										<div class="flex items-center gap-2 flex-wrap">
											<span class="font-medium text-sm text-opsi-blue">
												{{ dep.requiredProductId }}
											</span>
											<UBadge v-if="dep.requiredVersion" color="neutral" variant="soft" size="xs">
												{{ dep.requiredVersion }}
											</UBadge>
										</div>
										<div
											class="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-xs text-(--color-text-muted)">
											<span v-if="dep.requirementType" class="flex items-center gap-1">
												<strong>{{ $t('type') }}:</strong>
												<UBadge :color="getDependencyTypeColor(dep.requirementType)"
													variant="subtle" size="xs">
													{{ getDependencyTypeLabel(dep.requirementType, dep.productAction) }}
												</UBadge>
											</span>
											<span v-if="dep.requiredAction">
												<strong>{{ $t('action') }}:</strong> {{ dep.requiredAction }}
											</span>
											<span v-if="dep.requiredInstallationStatus">
												<strong>{{ $t('status') }}:</strong> {{ dep.requiredInstallationStatus
												}}
											</span>
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</template>
	</LayoutsDetailPanel>
</template>

<script setup lang="ts">
import type { DataTableColumnDef } from '~/composables/useDataTableSettings'
import type { ProductRow, ProductType } from '~/types/api/product.types'
import { useStateStore } from '~/stores/stateStore'

interface Props {
	productType: ProductType
	initialProductId?: string
}

const props = defineProps<Props>()

type Product = ProductRow

type PropertyValue = string | boolean | string[]

interface ProductProperty {
	productId: string
	propertyId: string
	type: 'UnicodeProductProperty' | 'BoolProductProperty'
	version: string
	description: string
	multiValue: boolean
	editable: boolean
	default: (string | boolean)[]
	allValues: (string | boolean)[]
	_value?: PropertyValue
	_originalValue?: PropertyValue
}

interface ProductDependency {
	productId: string
	productAction: string | null
	version: string
	requiredProductId: string
	requiredVersion: string | null
	requiredAction: string | null
	requiredInstallationStatus: string | null
	requirementType: string | null
}

const icons = useIcons()
const { t: $t } = useI18n()
const toast = useToast()
const { getProducts, getProductProperties, saveProductProperties, getProductDependencies } = useApiHelpers()
const stateStore = useStateStore()

const loading = ref(false)
const error = ref<string | null>(null)
const selectedProduct = ref<Product | null>(null)
const configProduct = ref<Product | null>(null)
const showConfigPanel = ref(false)
const products = ref<Product[]>([])
const selectedProducts = ref<Product[]>([])
const pendingActionRequests = ref<Record<string, string>>({})

// Dynamic table ID based on product type
const tableId = computed(() =>
	props.productType === 'NetbootProduct' ? 'products-netboot' : 'products-localboot'
)

// Messagebus auto-refresh integration
const { isConnected: mbConnected, autoRefreshEnabled, changesDetected, manualRefresh } = useAutoRefreshProducts(fetchProducts)

// Panel state
const panelActiveTab = ref<'properties' | 'dependencies'>('properties')
const propertiesLoading = ref(false)
const dependenciesLoading = ref(false)
const savingProperties = ref(false)
const properties = ref<ProductProperty[]>([])
const dependencies = ref<ProductDependency[]>([])

const panelTabs = computed(() => [
	{
		label: `${$t('properties')}${properties.value.length > 0 ? ` (${properties.value.length})` : ''}`,
		value: 'properties'
	},
	{
		label: `${$t('dependencies')}${dependencies.value.length > 0 ? ` (${dependencies.value.length})` : ''}`,
		value: 'dependencies'
	},
])

const hasPropertyChanges = computed(() => {
	return properties.value.some(p => p._value !== p._originalValue)
})

const columns: DataTableColumnDef[] = [
	{ key: 'installationStatus', label: String($t('installationStatus')), sortable: true, class: 'text-center w-12', visible: false },
	{ key: 'actionResult', label: String($t('actionResult')), sortable: true, class: 'text-center w-12', visible: false },
	{ key: 'productId', label: String($t('productId')), sortable: true, alwaysVisible: true },
	{ key: 'description', label: String($t('description')), sortable: true, class: 'hidden md:table-cell max-w-xs' },
	{ key: 'advice', label: String($t('advice')), sortable: true, class: 'hidden lg:table-cell max-w-xs', visible: false },
	{ key: 'modificationTime', label: String($t('modificationTime')), sortable: true, class: 'hidden xl:table-cell', visible: false },
	{ key: 'priority', label: String($t('priority')), sortable: true, class: 'text-center w-16', visible: false },
	{ key: 'depotVersions', label: String($t('version')), sortable: true, class: 'hidden sm:table-cell' },
	{ key: 'actionProgress', label: String($t('actionProgress')), sortable: true, class: 'hidden xl:table-cell', visible: false },
	{ key: 'actionRequest', label: String($t('actionRequest')), sortable: true, class: 'w-28', visible: false },
]

function formatVersions(versions?: string | string[]): string {
	if (!versions) return '-'
	if (Array.isArray(versions)) {
		const unique = [...new Set(versions)]
		return unique.length > 1 ? `${unique[0]} (+${unique.length - 1})` : unique[0] || '-'
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

function getDependencyTypeColor(type: string | null): 'success' | 'warning' | 'error' | 'info' | 'neutral' {
	if (!type) return 'neutral'
	if (type === 'before') return 'warning'
	if (type === 'after') return 'info'
	return 'neutral'
}

function getDependencyTypeLabel(type: string | null, action: string | null): string {
	const typeActionKey = `${type}-${action}`
	const labels: Record<string, string> = {
		'null-setup': String($t('required')),
		'after-setup': String($t('postRequired')),
		'before-setup': String($t('preRequired')),
		'before-uninstall': String($t('onUninstall')),
	}
	return labels[typeActionKey] || type || String($t('unknown'))
}

function openProductConfig(product: Product) {
	configProduct.value = product
	showConfigPanel.value = true
	panelActiveTab.value = 'properties'
	fetchProductConfig(product.productId)
}

function closePanel() {
	showConfigPanel.value = false
	configProduct.value = null
	properties.value = []
	dependencies.value = []
}

function updatePropertyValue(propertyId: string, value: PropertyValue) {
	const prop = properties.value.find(p => p.propertyId === propertyId)
	if (prop) {
		prop._value = value
	}
}

async function fetchProductConfig(productId: string) {
	await stateStore.ensureDepotsSelected()
	const depots = stateStore.selectedDepots
	const clients = stateStore.selectedClients

	// Fetch properties and dependencies in parallel
	propertiesLoading.value = true
	dependenciesLoading.value = true
	properties.value = []
	dependencies.value = []

	try {
		const [propsResult, depsResult] = await Promise.all([
			getProductProperties(productId, {
				selectedDepots: depots,
				selectedClients: clients.length > 0 ? clients : undefined
			}).catch(e => {
				console.error('Failed to fetch product properties:', e)
				return { data: null, error: e }
			}),
			getProductDependencies(productId, {
				selectedClients: clients.length > 0 ? clients : undefined
			}).catch(e => {
				console.error('Failed to fetch product dependencies:', e)
				return { data: null, error: e }
			})
		])

		// Handle properties result
		if (propsResult.error) {
			console.error('Properties API error:', propsResult.error)
			toast.add({
				title: String($t('warning')),
				description: String($t('message.failedToLoadProperties')),
				color: 'warning',
			})
		} else if (propsResult.data) {
			const propsData = propsResult.data.properties || propsResult.data
			if (propsData && typeof propsData === 'object') {
				properties.value = Object.values(propsData).map((p: any) => ({
					...p,
					_value: getInitialPropertyValue(p),
					_originalValue: getInitialPropertyValue(p),
				}))
			}
		}
		propertiesLoading.value = false

		// Handle dependencies result
		if (depsResult.error) {
			console.error('Dependencies API error:', depsResult.error)
		} else if (depsResult.data) {
			dependencies.value = depsResult.data.dependencies || []
		}
		dependenciesLoading.value = false
	} catch (e) {
		console.error('fetchProductConfig failed:', e)
		propertiesLoading.value = false
		dependenciesLoading.value = false
	}
}

function getInitialPropertyValue(prop: any): PropertyValue {
	// Priority: clients > depots > default
	if (prop.clients && Object.keys(prop.clients).length > 0) {
		const values = Object.values(prop.clients)
		if (values.length > 0) {
			const firstValue = values[0] as (string | boolean)[]
			if (prop.multiValue) return firstValue as string[]
			return firstValue[0] ?? ''
		}
	}
	if (prop.depots && Object.keys(prop.depots).length > 0) {
		const values = Object.values(prop.depots)
		if (values.length > 0) {
			const firstValue = values[0] as (string | boolean)[]
			if (prop.multiValue) return firstValue as string[]
			return firstValue[0] ?? ''
		}
	}
	if (prop.default && prop.default.length > 0) {
		if (prop.multiValue) return prop.default as string[]
		return prop.default[0] ?? ''
	}
	return ''
}

async function saveProperties() {
	if (!configProduct.value || !hasPropertyChanges.value) return

	savingProperties.value = true
	try {
		const changedProperties: Record<string, string | boolean | string[]> = {}
		for (const prop of properties.value) {
			if (prop._value !== prop._originalValue) {
				changedProperties[prop.propertyId] = prop._value as string | boolean | string[]
			}
		}

		const result = await saveProductProperties(configProduct.value.productId, {
			depotIds: stateStore.selectedDepots,
			clientIds: stateStore.selectedClients.length > 0 ? stateStore.selectedClients : undefined,
			properties: changedProperties,
		})

		if (result.error) {
			throw result.error
		}

		// Update original values to reflect saved state
		for (const prop of properties.value) {
			prop._originalValue = prop._value
		}

		toast.add({
			title: String($t('success')),
			description: String($t('message.propertiesSaved')),
			color: 'success',
		})
	} catch (e) {
		console.error('Failed to save properties:', e)
		toast.add({
			title: String($t('error')),
			description: e instanceof Error ? e.message : String($t('message.failedToSaveProperties')),
			color: 'error',
		})
	} finally {
		savingProperties.value = false
	}
}

function handleActionRequestChange(productId: string, request: string) {
	pendingActionRequests.value[productId] = request
	console.log(`Action request changed for ${productId}: ${request}`)
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
			perPage: 100,
			selectedDepots: stateStore.selectedDepotsParam
		}

		// Include selected clients if any
		if (stateStore.selectedClients.length > 0) {
			params.selectedClients = `[${stateStore.selectedClients.join(',')}]`
		}

		const result = await getProducts(params)
		if (result.error) {
			throw result.error
		}
		products.value = (result.data || []) as Product[]
	} catch (err: unknown) {
		console.error('Failed to fetch products:', err)
		error.value = err instanceof Error ? err.message : String($t('errorFetchingProducts'))
	} finally {
		loading.value = false
	}
}

function handleSelectionChange(rows: Product[], keys: string[]) {
	selectedProducts.value = rows
}

function handleRowSelect(row: Product) {
	selectedProduct.value = row
}

watch(() => props.productType, () => {
	fetchProducts()
})

// Handle initial product ID from URL
watch(() => props.initialProductId, (newId) => {
	if (newId && products.value.length > 0) {
		const product = products.value.find(p => p.productId === newId)
		if (product) {
			openProductConfig(product)
		}
	}
}, { immediate: true })

// Open initial product after products are loaded
watch(products, (newProducts) => {
	if (props.initialProductId && newProducts.length > 0 && !showConfigPanel.value) {
		const product = newProducts.find(p => p.productId === props.initialProductId)
		if (product) {
			openProductConfig(product)
		}
	}
})

onMounted(() => {
	fetchProducts()
})

defineExpose({ refresh: fetchProducts })
</script>
