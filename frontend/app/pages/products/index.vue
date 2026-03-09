<!--
This file is part of opsi-webgui application.
opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
Copyright (c) uib GmbH <info@uib.de> 2025
All rights reserved.
License: AGPL-3.0

Products index page - provides tab navigation between localboot and netboot products.
-->
<template>
    <LayoutsPageLayout show-refresh :loading="loading" @refresh="refresh">
        <template #tabs>
            <SharedTabsNav v-model="activeType" :tabs="productTypes" />
        </template>

        <SharedProductsList ref="productsListRef" :product-type="activeProductType" />
    </LayoutsPageLayout>
</template>

<script setup lang="ts">
import type { ProductType } from '~/types/api/product.types'

definePageMeta({ layout: 'default' })

const { t: $t } = useI18n()
const router = useRouter()
const route = useRoute()

// Get initial type from query param or default to localboot
const activeType = ref<string>((route.query.type as string) || 'localboot')

const productTypes = [
    { label: String($t('localbootProducts')), value: 'localboot' },
    { label: String($t('netbootProducts')), value: 'netboot' },
]

const activeProductType = computed<ProductType>(() =>
    activeType.value === 'netboot' ? 'NetbootProduct' : 'LocalbootProduct'
)

const loading = ref(false)
const productsListRef = ref<{ refresh: () => void } | null>(null)

// Sync type with query param
watch(activeType, (newType) => {
    router.replace({ query: { ...route.query, type: newType } })
})

function refresh() {
    productsListRef.value?.refresh()
}
</script>
