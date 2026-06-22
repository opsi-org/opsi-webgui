<!--
  This file is part of opsi-webgui application.
  opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
  Copyright (c) uib GmbH <info@uib.de> 2026
  All rights reserved.
  License: AGPL-3.0

  ProductsPage - Route wrapper for ProductsMainView component.
-->
<template>
    <ProductsMainView ref="productsTableRef"
        :product-type="activeType === 'netboot' ? 'NetbootProduct' : 'LocalbootProduct'"
        :initial-product-id="initialProductId">
        <template #tabs>
            <CoreAppTabsNav v-model="activeType" :tabs="productTypes" />
        </template>
    </ProductsMainView>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'default' })

const { t: $t } = useI18n()
const router = useRouter()
const route = useRoute()

useHead({ title: () => `${$t('products.title')} - opsi-WebGUI` })

const activeType = ref<string>((route.query.type as string) || 'localboot')
const initialProductId = computed(() => route.query.product as string | undefined)

const productTypes = [
    { label: String($t('products.localboot')), value: 'localboot' },
    { label: String($t('products.netboot')), value: 'netboot' },
]

watch(activeType, (newType) => {
    router.replace({ query: { ...route.query, type: newType } })
})

watch(() => route.query.type, (newType) => {
    if (newType && typeof newType === 'string' && (newType === 'localboot' || newType === 'netboot')) {
        activeType.value = newType
    }
})
</script>