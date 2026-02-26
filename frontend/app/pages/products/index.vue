<!--
This file is part of opsi-webgui application.
opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
Copyright (c) uib GmbH <info@uib.de> 2025
All rights reserved.
License: AGPL-3.0
-->
<template>
    <CommonDetailPanel :showPanel="!!selectedProduct" @close="selectedProduct = null">
        <template #main>
            <div class="space-y-4">
                <!-- Header with Tabs -->
                <CommonPageHeader :title="String($t('products'))" v-model="search" show-search
                    :search-placeholder="String($t('filter'))" show-refresh :loading="loading" @refresh="fetchProducts">
                    <template #tabs>
                        <CommonTabsNav v-model="activeType" :tabs="productTypes" />
                    </template>
                </CommonPageHeader>

                <!-- Error State -->
                <div v-if="error" class="p-4 bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-lg">
                    {{ error }}
                </div>

                <!-- Table -->
                <CommonDataTable :rows="filtered" :columns="columns" :loading="loading" :page-size="20"
                    @select="(row) => selectedProduct = row as any">
                    <template #depotVersions-data="{ row }">
                        <span class="text-[var(--color-text-muted)]">{{ (row as any).depotVersions }}</span>
                    </template>
                    <template #actions-data="{ row }">
                        <UButton :icon="icons.eye" variant="ghost" color="neutral" size="xs"
                            @click.stop="selectedProduct = row as any" />
                    </template>
                </CommonDataTable>
            </div>
        </template>

        <template #title>{{ selectedProduct?.productId }}</template>
        <template #panel>
            <div v-if="selectedProduct" class="space-y-4">
                <div class="space-y-2">
                    <div><span class="text-sm text-[var(--color-text-muted)]">{{ $t('productId') }}:</span> <span
                            class="ml-2 font-medium">{{ selectedProduct.productId }}</span></div>
                    <div><span class="text-sm text-[var(--color-text-muted)]">{{ $t('name') }}:</span> <span
                            class="ml-2">{{ selectedProduct.productId }}</span></div>
                    <div><span class="text-sm text-[var(--color-text-muted)]">{{ $t('version') }}:</span> <span
                            class="ml-2">{{ selectedProduct.depotVersions }}</span></div>
                    <div><span class="text-sm text-[var(--color-text-muted)]">{{ $t('type') }}:</span>
                        <CommonStatusBadge class="ml-2" status="info"
                            :label="String(activeType === 'LocalbootProduct' ? $t('localbootProducts') : $t('netbootProducts'))" />
                    </div>
                </div>
                <div class="pt-4 border-t border-[var(--color-border)]">
                    <p class="text-sm text-[var(--color-text-muted)]">{{ selectedProduct.description ||
                        $t('noDescription') }}</p>
                </div>
            </div>
        </template>
    </CommonDetailPanel>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'default' })

interface Product {
    productId: string
    description?: string
    depotVersions?: string
    clientVersions?: string
    installationStatus?: string
    actionRequest?: string
    actionResult?: string
    selectedClients?: string[]
    [key: string]: unknown
}

const icons = useIcons()
const { t: $t } = useI18n()
const { getProducts } = useApiHelpers()

const search = ref('')
const loading = ref(false)
const error = ref<string | null>(null)
const activeType = ref<'LocalbootProduct' | 'NetbootProduct'>('LocalbootProduct')
const selectedProduct = ref<Product | null>(null)
const products = ref<Product[]>([])
const totalCount = ref(0)

const productTypes = [
    { label: String($t('localbootProducts')), value: 'LocalbootProduct' },
    { label: String($t('netbootProducts')), value: 'NetbootProduct' },
]

const columns = [
    { key: 'productId', label: String($t('productId')) },
    { key: 'description', label: String($t('description')), class: 'hidden md:table-cell' },
    { key: 'depotVersions', label: String($t('version')), class: 'hidden sm:table-cell' },
    { key: 'actions', label: String($t('actions')) },
]

const filtered = computed(() => {
    let items = products.value
    if (search.value) {
        const q = search.value.toLowerCase()
        items = items.filter(p =>
            p.productId.toLowerCase().includes(q) ||
            (p.description?.toLowerCase().includes(q) ?? false)
        )
    }
    return items
})

const fetchProducts = async () => {
    loading.value = true
    error.value = null
    try {
        const result = await getProducts({
            type: activeType.value,
            sortBy: 'productId',
            sortDesc: false,
            pageNumber: 1,
            perPage: 100,
        })
        if (result.error) {
            throw result.error
        }
        products.value = result.data || []
        totalCount.value = products.value.length
    } catch (err: unknown) {
        console.error('Failed to fetch products:', err)
        error.value = err instanceof Error ? err.message : $t('errorFetchingProducts')
    } finally {
        loading.value = false
    }
}

// Refetch when product type changes
watch(activeType, () => {
    fetchProducts()
})

onMounted(() => {
    fetchProducts()
})
</script>
