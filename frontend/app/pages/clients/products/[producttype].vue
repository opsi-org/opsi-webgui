Client Products page - manage products for selected clients
<template>
	<LayoutsPageLayout show-refresh :loading="loading" @refresh="refresh">
		<template #actions>
			<UButton :icon="icons.back" variant="ghost" color="neutral" size="sm" @click="router.push('/clients')">
				{{ $t('clients') }}
			</UButton>
		</template>

		<template #tabs>
			<SharedTabsNav v-model="activeType" :tabs="productTypes" />
		</template>

		<ProductsMainView v-if="selectionStore.selectedClients.length > 0" ref="productsTableRef"
			:product-type="productType" />
	</LayoutsPageLayout>
</template>

<script setup lang="ts">
import type { ProductType } from '~/types'
import { useSelectionStore } from '~/stores/selectionStore'

definePageMeta({ layout: 'default' })

const icons = useIcons()
const { t: $t } = useI18n()
const router = useRouter()
const route = useRoute()
const selectionStore = useSelectionStore()

const routeProductType = computed(() => {
	const param = route.params.producttype as string
	if (param === 'LocalbootProduct' || param === 'localboot') return 'LocalbootProduct'
	if (param === 'NetbootProduct' || param === 'netboot') return 'NetbootProduct'
	return 'LocalbootProduct'
})

const activeType = ref<string>(routeProductType.value === 'NetbootProduct' ? 'netboot' : 'localboot')

const productTypes = [
	{ label: String($t('localbootProducts')), value: 'localboot' },
	{ label: String($t('netbootProducts')), value: 'netboot' },
]

const productType = computed<ProductType>(() => {
	return activeType.value === 'netboot' ? 'NetbootProduct' : 'LocalbootProduct'
})

const loading = ref(false)
const productsTableRef = ref<{ refresh: () => void } | null>(null)

watch(activeType, (newType) => {
	const typeParam = newType === 'netboot' ? 'NetbootProduct' : 'LocalbootProduct'
	router.replace(`/clients/products/${typeParam}`)
})

function refresh() {
	productsTableRef.value?.refresh()
}
</script>
