<!--
This file is part of opsi-webgui application.
opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
Copyright (c) uib GmbH <info@uib.de> 2025
All rights reserved.
License: AGPL-3.0

Products page - unified localboot and netboot products with tab navigation
-->
<template>
    <LayoutsPageLayout show-refresh :loading="loading" @refresh="refresh">
        <template #tabs>
            <SharedTabsNav v-model="activeType" :tabs="productTypes" />
        </template>

        <ProductsTable ref="productsTableRef"
            :product-type="activeType === 'netboot' ? 'NetbootProduct' : 'LocalbootProduct'"
            :initial-product-id="initialProductId" />
    </LayoutsPageLayout>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'default' })

const { t: $t } = useI18n()
const router = useRouter()
const route = useRoute()

const activeType = ref<string>((route.query.type as string) || 'localboot')
const initialProductId = computed(() => route.query.product as string | undefined)

const productTypes = [
    { label: String($t('localbootProducts')), value: 'localboot' },
    { label: String($t('netbootProducts')), value: 'netboot' },
]

const loading = ref(false)
const productsTableRef = ref<{ refresh: () => void } | null>(null)

watch(activeType, (newType) => {
    router.replace({ query: { ...route.query, type: newType } })
})

watch(() => route.query.type, (newType) => {
    if (newType && typeof newType === 'string' && (newType === 'localboot' || newType === 'netboot')) {
        activeType.value = newType
    }
})

function refresh() {
    productsTableRef.value?.refresh()
}
</script>
