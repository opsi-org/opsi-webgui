<!--
This file is part of opsi-webgui application.
opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
Copyright (c) uib GmbH <info@uib.de> 2026
All rights reserved.
License: AGPL-3.0
-->
<template>
	<div class="flex-1">
		<UButton v-if="hasSelections" variant="soft" color="primary" size="sm" class="w-full"
			@click="dialogOpen = true">
			<UIcon :name="icons.product" class="w-4 h-4" />
			<span>{{ $t('productQuickActions') }}</span>
			<UBadge v-if="stateStore.selectedProducts.length" size="xs" color="primary" class="ml-1">
				{{ stateStore.selectedProducts.length }}
			</UBadge>
		</UButton>
		<UButton v-else variant="ghost" color="neutral" size="sm" class="w-full opacity-70" disabled>
			<UIcon :name="icons.product" class="w-4 h-4" />
			<span>{{ $t('productQuickActions') }}</span>
		</UButton>
	</div>

	<UModal v-model:open="dialogOpen" :dismissible="true">
		<template #content>
			<UCard class="min-w-96" @click.stop>
				<template #header>
					<div class="flex items-center justify-between">
						<div class="flex items-center gap-2">
							<UIcon :name="icons.product" class="w-5 h-5 text-opsi-blue" />
							<span class="font-medium">{{ $t('productQuickActions') }}</span>
						</div>
						<UButton variant="ghost" size="xs" :icon="icons.close" @click="dialogOpen = false" />
					</div>
				</template>

				<div v-if="loading" class="flex justify-center py-6">
					<UIcon :name="icons.loading" class="w-5 h-5 animate-spin" />
				</div>

				<div v-else class="space-y-4">
					<div class="p-2.5 rounded-lg bg-(--color-surface) dark:bg-(--color-surface) text-xs">
						<div class="flex justify-between">
							<span class="text-(--color-text-muted)">{{ $t('selectedClients') }}:</span>
							<span class="font-medium">{{ stateStore.selectedClients.length || $t('all') }}</span>
						</div>
						<div class="flex justify-between mt-1">
							<span class="text-(--color-text-muted)">{{ $t('selectedProducts') }}:</span>
							<span class="font-medium">{{ stateStore.selectedProducts.length || $t('all') }}</span>
						</div>
					</div>

					<div class="divide-y divide-(--color-border) dark:divide-(--color-border)">
						<div class="form-row flex flex-col md:flex-row items-start gap-y-1 gap-x-4 py-2.5">
							<span class="text-xs font-semibold text-(--color-text-muted) uppercase md:w-1/3 shrink-0">
								{{ $t('conditions') }}
							</span>
							<div class="flex-1 space-y-2">
								<div class="grid grid-cols-2 gap-2">
									<div>
										<label class="text-xs text-(--color-text-muted) block mb-1">{{
											$t('installationStatus')
											}}</label>
										<USelect v-model="filters.installationStatus" :items="installationStatusOptions"
											size="xs" class="w-full" @update:model-value="loadPreview" />
									</div>
									<div>
										<label class="text-xs text-(--color-text-muted) block mb-1">{{
											$t('actionResult') }}</label>
										<USelect v-model="filters.actionResult" :items="actionResultOptions" size="xs"
											class="w-full" @update:model-value="loadPreview" />
									</div>
								</div>
								<label class="flex items-center gap-2 cursor-pointer">
									<UCheckbox v-model="filters.outdatedOnly" @update:model-value="loadPreview" />
									<span class="text-xs">{{ $t('outdatedOnClient') }}</span>
								</label>
							</div>
						</div>

						<div class="form-row flex flex-col md:flex-row items-start gap-y-1 gap-x-4 py-2.5">
							<span class="text-xs font-semibold text-(--color-text-muted) uppercase md:w-1/3 shrink-0">
								{{ $t('actionRequest') }}
							</span>
							<div class="flex-1">
								<USelect v-model="actionRequest" :items="actionRequestOptions" size="sm"
									class="w-full" />
							</div>
						</div>
					</div>

					<div>
						<div class="flex items-center justify-between mb-1.5">
							<span class="text-xs font-semibold text-(--color-text-muted) uppercase">
								{{ $t('preview') }}
							</span>
							<UBadge color="neutral" variant="soft" size="xs">
								{{ previewProducts.length }}
							</UBadge>
						</div>
						<div v-if="previewProducts.length > 0"
							class="max-h-40 overflow-y-auto border border-(--color-border) rounded-lg p-2 space-y-0.5 bg-(--color-surface) text-xs">
							<div v-for="p in previewProducts.slice(0, 20)" :key="p.productId"
								class="flex justify-between items-center py-0.5">
								<span class="font-mono truncate">{{ p.productId }}</span>
								<span class="text-(--color-text-muted) shrink-0 ml-2">→
									<span class="text-opsi-blue font-medium">{{ actionRequest }}</span>
								</span>
							</div>
							<div v-if="previewProducts.length > 20"
								class="text-(--color-text-muted) text-center pt-1 border-t border-(--color-border) mt-1">
								+{{ previewProducts.length - 20 }} {{ $t('more') }}
							</div>
						</div>
						<div v-else
							class="text-center py-4 text-xs text-(--color-text-muted) border border-dashed border-(--color-border) rounded-lg">
							{{ $t('noProductsMatchCriteria') }}
						</div>
					</div>
				</div>

				<template #footer>
					<div class="flex justify-end gap-2">
						<UButton variant="ghost" size="sm" @click="dialogOpen = false">{{ $t('cancel') }}</UButton>
						<UButton color="primary" size="sm" :disabled="previewProducts.length === 0 || applying"
							:loading="applying" @click="applyActions">
							{{ $t('apply') }} ({{ previewProducts.length }})
						</UButton>
					</div>
				</template>
			</UCard>
		</template>
	</UModal>
</template>

<script setup lang="ts">
import type { ProductRow } from '~/types/api/product.types'

interface Props {
	products?: ProductRow[]
}

const props = withDefaults(defineProps<Props>(), {
	products: () => [],
})

const emit = defineEmits<{
	applied: []
}>()

const icons = useIcons()
const { t: $t } = useI18n()
const { setClientProductActions } = useApiHelpers()
const toast = useToast()
const stateStore = useStateStore()

const dialogOpen = ref(false)
const loading = ref(false)
const applying = ref(false)

const hasSelections = computed(() =>
	stateStore.selectedProducts.length > 0 || stateStore.selectedClients.length > 0 || stateStore.selectedDepots.length > 0
)

const filters = ref({ installationStatus: '', actionResult: '', outdatedOnly: false })
const actionRequest = ref('setup')

const installationStatusOptions = [
	{ value: '', label: String($t('all')) },
	{ value: 'installed', label: String($t('installed')) },
	{ value: 'not_installed', label: String($t('notInstalled')) },
	{ value: 'unknown', label: String($t('unknown')) },
]

const actionResultOptions = [
	{ value: '', label: String($t('all')) },
	{ value: 'successful', label: String($t('successful')) },
	{ value: 'failed', label: String($t('failed')) },
	{ value: 'none', label: String($t('none')) },
]

const actionRequestOptions = [
	{ value: 'setup', label: 'setup' },
	{ value: 'uninstall', label: 'uninstall' },
	{ value: 'update', label: 'update' },
	{ value: 'always', label: 'always' },
	{ value: 'once', label: 'once' },
	{ value: 'none', label: 'none' },
]

interface ProductPreview {
	productId: string
	currentStatus: string
}

const previewProducts = ref<ProductPreview[]>([])

watch(dialogOpen, async (open) => {
	if (open) await loadPreview()
})

async function loadPreview() {
	loading.value = true
	try {
		const sourceProducts = props.products.length > 0 ? props.products : []
		const selectedProductSet = new Set(stateStore.selectedProducts)

		previewProducts.value = sourceProducts
			.filter(p => {
				if (selectedProductSet.size > 0 && !selectedProductSet.has(p.productId)) return false
				if (filters.value.installationStatus && p.installationStatus !== filters.value.installationStatus) return false
				if (filters.value.actionResult && p.actionResult !== filters.value.actionResult) return false
				if (filters.value.outdatedOnly && !p.client_version_outdated) return false
				return true
			})
			.map(p => ({ productId: p.productId, currentStatus: p.installationStatus || 'unknown' }))
	} catch (e) {
		console.error('Failed to load preview:', e)
		previewProducts.value = []
	} finally {
		loading.value = false
	}
}

async function applyActions() {
	if (!previewProducts.value.length) return
	applying.value = true
	try {
		const productIds = [...new Set(previewProducts.value.map(p => p.productId))]
		const clientIds = stateStore.selectedClients.length ? stateStore.selectedClients : []

		const result = await setClientProductActions({
			clientIds,
			productIds,
			actionRequest: actionRequest.value,
		})

		if (result.error) throw result.error

		toast.add({
			title: String($t('success')),
			description: String($t('message.actionsApplied')),
			color: 'success',
		})
		dialogOpen.value = false
		emit('applied')
	} catch (e) {
		console.error('Failed to apply actions:', e)
		toast.add({ title: String($t('error')), description: String(e), color: 'error' })
	} finally {
		applying.value = false
	}
}
</script>
