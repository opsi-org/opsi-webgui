<template>
    <ProductsMainView ref="productsTableRef"
        :product-type="activeType === 'netboot' ? 'NetbootProduct' : 'LocalbootProduct'"
        :initial-product-id="initialProductId">
        <template #tabs>
            <SharedTabsNav v-model="activeType" :tabs="productTypes" />
        </template>
    </ProductsMainView>
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

const productsTableRef = ref<{ refresh: () => void; hasUnsavedChanges: boolean } | null>(null)

watch(activeType, (newType) => {
    router.replace({ query: { ...route.query, type: newType } })
})

watch(() => route.query.type, (newType) => {
    if (newType && typeof newType === 'string' && (newType === 'localboot' || newType === 'netboot')) {
        activeType.value = newType
    }
})
</script>