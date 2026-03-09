<!--
This file is part of opsi-webgui application.
opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
Copyright (c) uib GmbH <info@uib.de> 2025
All rights reserved.
License: AGPL-3.0

ProductsList - Reusable component for displaying products by type.
Used by /products/localboot and /products/netboot pages.
-->
<template>
	<LayoutsDetailPanel :showPanel="!!selectedProduct" @close="selectedProduct = null">
		<template #main>
			<LayoutsPageLayout v-model="filterQuery" show-search :search-placeholder="String($t('typeToFilter'))"
				show-refresh :loading="loading" @refresh="fetchProducts">
				<template #stats>
					<span class="text-sm text-muted">
						{{ $t('total') }}: {{ filteredProducts.length }}
						<span v-if="selectedProducts.length > 0" class="ml-2">
							| {{ $t('selected') }}: {{ selectedProducts.length }}
						</span>
					</span>
				</template>

				<!-- Error State -->
				<UAlert v-if="error" color="error" :title="$t('error')" :description="error"
					:close-button="{ icon: icons.close, color: 'error', variant: 'link' }" @close="error = null" />

				<!-- Products Table -->
				<SharedEnhancedTable :rows="filteredProducts" :columns="columns" :loading="loading" row-key="productId"
					:actions="tableActions" :selectable="true" :filterable="false" :column-toggle="true"
					:show-refresh="false" :clickable="true" :infinite-scroll="true" :page-size="50"
					@select="handleRowSelect" @selection-change="handleSelectionChange">
					<template #productId-data="{ row }">
						<div class="flex items-center gap-2">
							<span class="font-medium">{{ (row as Product).productId }}</span>
							<UBadge v-if="(row as Product).client_version_outdated" color="warning" variant="soft"
								size="xs">
								{{ $t('outdated') }}
							</UBadge>
						</div>
					</template>
					<template #description-data="{ row }">
						<span class="line-clamp-1">{{ (row as Product).description || '-' }}</span>
					</template>
					<template #depotVersions-data="{ row }">
						<span class="font-mono text-xs text-muted">
							{{ formatVersions((row as Product).depotVersions) }}
						</span>
					</template>
					<template #installationStatus-data="{ row }">
						<SharedStatusBadge v-if="(row as Product).installationStatus"
							:status="getInstallationStatus((row as Product).installationStatus!)"
							:label="(row as Product).installationStatus!" />
						<span v-else class="text-muted">-</span>
					</template>
					<template #actionResult-data="{ row }">
						<SharedStatusBadge v-if="(row as Product).actionResult"
							:status="getActionResultStatus((row as Product).actionResult!)"
							:label="(row as Product).actionResult!" />
						<span v-else class="text-muted">-</span>
					</template>
				</SharedEnhancedTable>
			</LayoutsPageLayout>
		</template>

		<template #title>{{ selectedProduct?.productId }}</template>
		<template #panel>
			<div v-if="selectedProduct" class="space-y-4">
				<div class="space-y-3">
					<div class="flex items-start gap-2">
						<span class="text-sm text-muted w-24 shrink-0">{{ $t('productId') }}:</span>
						<span class="font-medium">{{ selectedProduct.productId }}</span>
					</div>
					<div class="flex items-start gap-2">
						<span class="text-sm text-muted w-24 shrink-0">{{ $t('name') }}:</span>
						<span>{{ selectedProduct.name || selectedProduct.productId }}</span>
					</div>
					<div class="flex items-start gap-2">
						<span class="text-sm text-muted w-24 shrink-0">{{ $t('version') }}:</span>
						<span class="font-mono text-xs">{{ formatVersions(selectedProduct.depotVersions) }}</span>
					</div>
					<div class="flex items-center gap-2">
						<span class="text-sm text-muted w-24 shrink-0">{{ $t('type') }}:</span>
						<SharedStatusBadge status="info"
							:label="String(productType === 'LocalbootProduct' ? $t('localboot') : $t('netboot'))" />
					</div>
					<div v-if="selectedProduct.installationStatus" class="flex items-center gap-2">
						<span class="text-sm text-muted w-24 shrink-0">{{ $t('status') }}:</span>
						<SharedStatusBadge :status="getInstallationStatus(selectedProduct.installationStatus)"
							:label="selectedProduct.installationStatus" />
					</div>
				</div>
				<div v-if="selectedProduct.description" class="pt-4 border-t border-default">
					<p class="text-sm text-muted">{{ selectedProduct.description }}</p>
				</div>
				<div v-if="selectedProduct.advice" class="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
					<p class="text-sm text-amber-700 dark:text-amber-400">{{ selectedProduct.advice }}</p>
				</div>
			</div>
		</template>
	</LayoutsDetailPanel>
</template>

<script setup lang="ts">
import type { TableColumn, TableAction } from '~/types/table.types'
import type { ProductRow, ProductType } from '~/types/api/product.types'
import { useStateStore } from '~/stores/stateStore'

interface Props {
	productType: ProductType
}

const props = defineProps<Props>()

type Product = ProductRow

const icons = useIcons()
const { t: $t } = useI18n()
const { getProducts } = useApiHelpers()
const stateStore = useStateStore()

const loading = ref(false)
const error = ref<string | null>(null)
const selectedProduct = ref<Product | null>(null)
const products = ref<Product[]>([])
const selectedProducts = ref<Product[]>([])
const filterQuery = ref('')

const columns: TableColumn<Product>[] = [
	{ key: 'productId', label: String($t('productId')), sortable: true, alwaysVisible: true },
	{ key: 'description', label: String($t('description')), sortable: true, class: 'hidden md:table-cell max-w-xs' },
	{ key: 'depotVersions', label: String($t('version')), sortable: true, class: 'hidden sm:table-cell' },
	{ key: 'installationStatus', label: String($t('status')), sortable: true, class: 'hidden lg:table-cell', visible: false },
	{ key: 'actionResult', label: String($t('result')), sortable: true, class: 'hidden lg:table-cell', visible: false },
]

const tableActions: TableAction<Product>[] = [
	{
		icon: icons.eye,
		label: String($t('view')),
		handler: (row) => { selectedProduct.value = row }
	}
]

function formatVersions(versions?: string | string[]): string {
	if (!versions) return '-'
	if (Array.isArray(versions)) {
		const unique = [...new Set(versions)]
		return unique.length > 1 ? `${unique[0]} (+${unique.length - 1})` : unique[0] || '-'
	}
	return String(versions)
}

function getInstallationStatus(status: string): 'success' | 'warning' | 'error' | 'info' | 'neutral' {
	const s = status?.toLowerCase()
	if (s === 'installed') return 'success'
	if (s === 'unknown') return 'warning'
	if (s === 'not_installed') return 'neutral'
	return 'info'
}

function getActionResultStatus(result: string): 'success' | 'warning' | 'error' | 'info' | 'neutral' {
	const r = result?.toLowerCase()
	if (r === 'successful') return 'success'
	if (r === 'failed') return 'error'
	if (r === 'none') return 'neutral'
	return 'info'
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

function handleSelectionChange(rows: Product[]) {
	selectedProducts.value = rows
}

function handleRowSelect(row: Product) {
	selectedProduct.value = row
}

const filteredProducts = computed(() => {
	if (!filterQuery.value) return products.value
	const q = filterQuery.value.toLowerCase()
	return products.value.filter(p =>
		p.productId.toLowerCase().includes(q) ||
		(p.name?.toLowerCase().includes(q)) ||
		(p.description?.toLowerCase().includes(q))
	)
})

// Refetch when product type changes
watch(() => props.productType, () => {
	fetchProducts()
})

onMounted(() => {
	fetchProducts()
})

// Expose refresh method
defineExpose({ refresh: fetchProducts })
</script>
