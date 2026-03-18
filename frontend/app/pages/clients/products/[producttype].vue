<!--
This file is part of opsi-webgui application.
opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
Copyright (c) uib GmbH <info@uib.de> 2026
All rights reserved.
License: AGPL-3.0

Client Products page - manage products for selected clients
-->
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

		<template #stats>
			<span v-if="stateStore.selectedClients.length > 0" class="text-sm text-opsi-blue">
				{{ $t('clients') }}: {{ stateStore.selectedClients.length }}
			</span>
			<span v-else class="text-sm text-warning">
				{{ $t('selectClientsFirst') }}
			</span>
		</template>

		<UAlert v-if="stateStore.selectedClients.length === 0" color="warning" :title="$t('warning')"
			:description="$t('selectClientsFirst')" class="mb-4">
			<template #actions>
				<UButton color="primary" size="sm" @click="router.push('/clients')">
					{{ $t('clients') }}
				</UButton>
			</template>
		</UAlert>

		<ProductsTable v-if="stateStore.selectedClients.length > 0" ref="productsTableRef"
			:product-type="productType" />
	</LayoutsPageLayout>
</template>

<script setup lang="ts">
import type { ProductType } from '~/types/api/product.types'
import { useStateStore } from '~/stores/stateStore'

definePageMeta({ layout: 'default' })

const icons = useIcons()
const { t: $t } = useI18n()
const router = useRouter()
const route = useRoute()
const stateStore = useStateStore()

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
