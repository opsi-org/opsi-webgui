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
                    :search-placeholder="String($t('filter'))" show-refresh :loading="loading" @refresh="refresh">
                    <template #tabs>
                        <CommonTabsNav v-model="activeType" :tabs="productTypes" />
                    </template>
                </CommonPageHeader>

                <!-- Table -->
                <CommonDataTable :rows="filtered" :columns="columns" :loading="loading" :page-size="20"
                    @select="(row) => selectedProduct = row as any">
                    <template #version-data="{ row }">
                        <span class="text-[var(--color-text-muted)]">{{ (row as any).version }}</span>
                    </template>
                    <template #actions-data="{ row }">
                        <UButton :icon="icons.eye" variant="ghost" color="neutral" size="xs"
                            @click.stop="selectedProduct = row as any" />
                    </template>
                </CommonDataTable>
            </div>
        </template>

        <template #title>{{ selectedProduct?.id }}</template>
        <template #panel>
            <div v-if="selectedProduct" class="space-y-4">
                <div class="space-y-2">
                    <div><span class="text-sm text-[var(--color-text-muted)]">{{ $t('productId') }}:</span> <span
                            class="ml-2 font-medium">{{ selectedProduct.id }}</span></div>
                    <div><span class="text-sm text-[var(--color-text-muted)]">{{ $t('name') }}:</span> <span
                            class="ml-2">{{ selectedProduct.name }}</span></div>
                    <div><span class="text-sm text-[var(--color-text-muted)]">{{ $t('version') }}:</span> <span
                            class="ml-2">{{ selectedProduct.version }}</span></div>
                    <div><span class="text-sm text-[var(--color-text-muted)]">{{ $t('type') }}:</span>
                        <CommonStatusBadge class="ml-2" status="info"
                            :label="String(activeType === 'localboot' ? $t('localbootProducts') : $t('netbootProducts'))" />
                    </div>
                </div>
                <div class="pt-4 border-t border-[var(--color-border)]">
                    <p class="text-sm text-[var(--color-text-muted)]">{{ selectedProduct.description }}</p>
                </div>
            </div>
        </template>
    </CommonDetailPanel>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'default' })

const icons = useIcons()
const { $t } = useNuxtApp()

const search = ref('')
const loading = ref(false)
const activeType = ref('localboot')
const selectedProduct = ref<typeof products.value[0] | null>(null)

const productTypes = [
    { label: String($t('localbootProducts')), value: 'localboot' },
    { label: String($t('netbootProducts')), value: 'netboot' },
]

const columns = [
    { key: 'id', label: String($t('productId')) },
    { key: 'name', label: String($t('name')), class: 'hidden md:table-cell' },
    { key: 'version', label: String($t('version')), class: 'hidden sm:table-cell' },
    { key: 'actions', label: String($t('actions')) },
]

const products = ref([
    { id: 'opsi-client-agent', name: 'OPSI Client Agent', version: '4.3.0.1-1', description: 'OPSI client agent for automated software deployment' },
    { id: 'hwaudit', name: 'Hardware Audit', version: '4.3.0.1-1', description: 'Collects hardware information from clients' },
    { id: 'swaudit', name: 'Software Audit', version: '4.3.0.3-1', description: 'Collects installed software information' },
    { id: 'opsi-configed', name: 'OPSI Configed', version: '4.3.0.2-1', description: 'Management console for OPSI' },
])

const filtered = computed(() => {
    let items = products.value
    if (search.value) {
        const q = search.value.toLowerCase()
        items = items.filter(p => p.id.toLowerCase().includes(q) || p.name.toLowerCase().includes(q))
    }
    return items
})

const refresh = async () => { loading.value = true; await new Promise(r => setTimeout(r, 500)); loading.value = false }
</script>
