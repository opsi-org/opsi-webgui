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
			<span>{{ t('productActions') }}</span>
			<UBadge v-if="stateStore.selectedProducts.length" size="xs" color="primary" class="ml-1">
				{{ stateStore.selectedProducts.length }}
			</UBadge>
		</UButton>
		<UButton v-else variant="ghost" color="neutral" size="sm" class="w-full opacity-70" disabled>
			<UIcon :name="icons.product" class="w-4 h-4" />
			<span>{{ t('productActions') }}</span>
		</UButton>
	</div>

	<UModal v-model:open="dialogOpen" :dismissible="true">
		<template #content>
			<UCard class="min-w-80" @click.stop>
				<template #header>
					<div class="flex items-center justify-between">
						<span class="font-medium">{{ t('productQuickActions') }}</span>
						<UButton variant="ghost" size="xs" :icon="icons.close" @click="dialogOpen = false" />
					</div>
				</template>

				<div v-if="loading" class="flex justify-center py-6">
					<UIcon :name="icons.loading" class="w-5 h-5 animate-spin" />
				</div>

				<div v-else class="space-y-4">
					<!-- Selection Summary -->
					<div class="text-xs text-muted p-2 rounded bg-(--color-surface)]">
						<div class="flex justify-between">
							<span>{{ t('selectedClients') }}:</span>
							<span class="font-medium">{{ stateStore.selectedClients.length || t('all') }}</span>
						</div>
						<div class="flex justify-between mt-1">
							<span>{{ t('selectedProducts') }}:</span>
							<span class="font-medium">{{ stateStore.selectedProducts.length || t('all') }}</span>
						</div>
					</div>

					<!-- Filters -->
					<div class="grid grid-cols-2 gap-2">
						<div>
							<label class="text-xs text-muted">{{ t('installationStatus') }}</label>
							<USelect v-model="filters.installationStatus" :items="installationStatusOptions" size="xs"
								class="w-full mt-1" />
						</div>
						<div>
							<label class="text-xs text-muted">{{ t('actionResult') }}</label>
							<USelect v-model="filters.actionResult" :items="actionResultOptions" size="xs"
								class="w-full mt-1" />
						</div>
					</div>

					<!-- Action Request -->
					<div>
						<label class="text-xs text-muted">{{ t('actionRequest') }}</label>
						<USelect v-model="actionRequest" :items="actionRequestOptions" size="sm" class="w-full mt-1" />
					</div>

					<!-- Preview -->
					<div v-if="previewProducts.length > 0" class="text-xs">
						<div class="text-muted mb-1">{{ t('preview') }} ({{ previewProducts.length }})</div>
						<div
							class="max-h-32 overflow-y-auto border border-(--color-border)] rounded p-2 space-y-0.5 bg-(--color-surface)]">
							<div v-for="p in previewProducts.slice(0, 15)" :key="p.productId"
								class="flex justify-between">
								<span class="font-mono">{{ p.productId }}</span>
								<span class="text-muted">→ <span class="text-opsi-blue">{{ actionRequest
										}}</span></span>
							</div>
							<div v-if="previewProducts.length > 15" class="text-muted text-center pt-1">
								+{{ previewProducts.length - 15 }} {{ t('more') }}
							</div>
						</div>
					</div>
					<div v-else
						class="text-center py-3 text-xs text-muted border border-dashed border-(--color-border)] rounded">
						{{ t('noProductsMatchCriteria') }}
					</div>
				</div>

				<template #footer>
					<div class="flex justify-end gap-2">
						<UButton variant="ghost" size="sm" @click="dialogOpen = false">{{ t('cancel') }}</UButton>
						<UButton color="primary" size="sm" :disabled="previewProducts.length === 0 || applying"
							:loading="applying" @click="applyActions">
							{{ t('apply') }} ({{ previewProducts.length }})
						</UButton>
					</div>
				</template>
			</UCard>
		</template>
	</UModal>
</template>

<script setup lang="ts">
const icons = useIcons()
const { t } = useI18n()
const { apiGet, apiPost } = useApiHelpers()
const toast = useToast()
const stateStore = useStateStore()

const dialogOpen = ref(false)
const loading = ref(false)
const applying = ref(false)

const hasSelections = computed(() =>
	stateStore.selectedProducts.length > 0 || stateStore.selectedClients.length > 0 || stateStore.selectedDepots.length > 0
)

const filters = ref({ installationStatus: '', actionResult: '' })
const actionRequest = ref('setup')

const installationStatusOptions = [
	{ value: '', label: t('all') || 'All' },
	{ value: 'installed', label: t('installed') || 'Installed' },
	{ value: 'not_installed', label: t('notInstalled') || 'Not Installed' },
	{ value: 'unknown', label: t('unknown') || 'Unknown' },
]

const actionResultOptions = [
	{ value: '', label: t('all') || 'All' },
	{ value: 'successful', label: t('successful') || 'Successful' },
	{ value: 'failed', label: t('failed') || 'Failed' },
	{ value: 'none', label: t('none') || 'None' },
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

watch(filters, async () => {
	if (dialogOpen.value) await loadPreview()
}, { deep: true })

async function loadPreview() {
	loading.value = true
	try {
		const params: Record<string, unknown> = {}
		if (stateStore.selectedDepots.length) params.selectedDepots = `[${stateStore.selectedDepots.join(',')}]`
		if (stateStore.selectedClients.length) params.selectedClients = `[${stateStore.selectedClients.join(',')}]`
		if (stateStore.selectedProducts.length) params.selectedProducts = `[${stateStore.selectedProducts.join(',')}]`

		const result = await apiGet<Array<{ productId: string; installationStatus: string; actionResult: string }>>('/opsidata/products', params)
		if (result.data) {
			previewProducts.value = result.data
				.filter(p => {
					if (filters.value.installationStatus && p.installationStatus !== filters.value.installationStatus) return false
					if (filters.value.actionResult && p.actionResult !== filters.value.actionResult) return false
					return true
				})
				.map(p => ({ productId: p.productId, currentStatus: p.installationStatus || 'unknown' }))
		}
	} catch (e) {
		console.error('Failed to load products:', e)
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
		const clientIds = stateStore.selectedClients.length ? stateStore.selectedClients : undefined

		await apiPost('/opsidata/clients/products', {
			clientIds,
			productIds,
			actionRequest: actionRequest.value,
		})

		toast.add({
			title: t('success') || 'Success',
			description: t('actionsApplied') || `Action "${actionRequest.value}" set for ${productIds.length} products`,
			color: 'success'
		})
		dialogOpen.value = false
	} catch (e) {
		console.error('Failed to apply actions:', e)
		toast.add({ title: t('error') || 'Error', description: String(e), color: 'error' })
	} finally {
		applying.value = false
	}
}
</script>
