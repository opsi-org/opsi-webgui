<template>
	<UModal v-model:open="open" :title="$t('processActions')">
		<template #content>
			<UCard class="min-w-96" @click.stop>
				<template #header>
					<div class="flex items-center justify-between">
						<div class="flex items-center gap-2">
							<UIcon :name="icons.onDemand" class="w-5 h-5 text-opsi-blue" />
							<span class="font-medium">{{ $t('processActions') }}</span>
						</div>
						<UButton variant="ghost" size="xs" :icon="icons.close" @click="open = false" />
					</div>
				</template>

				<UAlert v-if="statusMessage" :color="statusMessage.type" :description="statusMessage.message"
					variant="subtle" class="mb-3"
					:close-button="{ icon: icons.close, color: statusMessage.type, variant: 'link' }"
					@close="statusMessage = null" />

				<div class="space-y-4">
					<div class="divide-y divide-(--color-border) dark:divide-(--color-border)">
						<div
							class="form-row flex flex-col md:flex-row items-start md:items-center gap-y-1 gap-x-4 py-2.5">
							<span class="text-sm font-medium md:w-1/3">{{ $t('products') }}</span>
							<div class="flex-1">
								<div class="flex flex-col gap-2">
									<label class="flex items-center gap-2 cursor-pointer">
										<input type="radio" v-model="productMode" value="all"
											class="text-opsi-blue focus:ring-opsi-blue" />
										<span class="text-sm">{{ $t('allProducts') }}</span>
									</label>
									<label v-if="selectedProductIds.length > 0"
										class="flex items-center gap-2 cursor-pointer">
										<input type="radio" v-model="productMode" value="selected"
											class="text-opsi-blue focus:ring-opsi-blue" />
										<span class="text-sm">{{ $t('onlySelectedProducts') }}
											({{ selectedProductIds.length }})</span>
									</label>
								</div>
								<div v-if="productMode === 'selected' && selectedProductIds.length > 0"
									class="mt-2 max-h-24 overflow-auto border border-(--color-border) rounded p-2 bg-(--color-surface) text-xs font-mono">
									<div v-for="id in selectedProductIds" :key="id">{{ id }}</div>
								</div>
							</div>
						</div>

						<div
							class="form-row flex flex-col md:flex-row items-start md:items-center gap-y-1 gap-x-4 py-2.5">
							<span class="text-sm font-medium md:w-1/3">{{ $t('visibility') }}</span>
							<div class="flex-1">
								<div class="flex items-center gap-3">
									<label class="flex items-center gap-2 cursor-pointer">
										<input type="radio" v-model="visibility" value=""
											class="text-opsi-blue focus:ring-opsi-blue" />
										<span class="text-sm">{{ $t('clientDefault') }}</span>
									</label>
									<label class="flex items-center gap-2 cursor-pointer">
										<input type="radio" v-model="visibility" value="visible"
											class="text-opsi-blue focus:ring-opsi-blue" />
										<span class="text-sm">{{ $t('visible') }}</span>
									</label>
									<label class="flex items-center gap-2 cursor-pointer">
										<input type="radio" v-model="visibility" value="hidden"
											class="text-opsi-blue focus:ring-opsi-blue" />
										<span class="text-sm">{{ $t('hidden') }}</span>
									</label>
								</div>
							</div>
						</div>

						<div
							class="form-row flex flex-col md:flex-row items-start md:items-center gap-y-1 gap-x-4 py-2.5">
							<span class="text-sm font-medium md:w-1/3">{{ $t('clients') }}
								({{ clientIds.length }})</span>
							<div class="flex-1">
								<div class="flex items-center gap-2 mb-2">
									<UButton size="xs" variant="outline" color="neutral"
										:disabled="arraysEqual(clientIds, selectionStore.selectedClients)"
										@click="clientIds = [...selectionStore.selectedClients]">
										{{ $t('reset') }}
									</UButton>
								</div>
								<div v-if="clientIds.length > 0"
									class="max-h-24 overflow-auto border border-(--color-border) rounded p-2 bg-(--color-surface) text-xs font-mono">
									<div v-for="id in clientIds" :key="id" class="flex items-center justify-between">
										<span>{{ id }}</span>
										<UButton size="xs" variant="ghost" color="neutral" :icon="icons.close"
											@click="clientIds = clientIds.filter(c => c !== id)" />
									</div>
								</div>
								<div v-else class="text-xs text-(--color-text-muted) italic">
									{{ $t('noClientsSelected') }}
								</div>
							</div>
						</div>
					</div>
				</div>

				<template #footer>
					<div class="flex justify-end gap-2">
						<UButton variant="ghost" size="sm" @click="open = false">{{ $t('cancel') }}</UButton>
						<UButton color="primary" size="sm" :loading="executing" :disabled="clientIds.length === 0"
							@click="executeProcessAction">
							<UIcon :name="icons.onDemand" class="w-4 h-4 mr-1" />
							{{ $t('processActions') }}
						</UButton>
					</div>
				</template>
			</UCard>
		</template>
	</UModal>
</template>

<script setup lang="ts">
import type { ProductVisibility } from '~/types'

const open = defineModel<boolean>('open', { default: false })

interface Props {
	selectedProductIds?: string[]
}

const props = withDefaults(defineProps<Props>(), {
	selectedProductIds: () => [],
})

const emit = defineEmits<{
	executed: []
}>()

const icons = useIcons()
const { t: $t } = useI18n()
const selectionStore = useSelectionStore()
const { processActionRequests } = useApiHelpers()

const executing = ref(false)
const statusMessage = ref<{ type: 'success' | 'error'; message: string } | null>(null)
const productMode = ref<'all' | 'selected'>('all')
const visibility = ref<ProductVisibility>('')
const clientIds = ref<string[]>([...selectionStore.selectedClients])

watch(open, (isOpen) => {
	if (isOpen) {
		clientIds.value = [...selectionStore.selectedClients]
		productMode.value = props.selectedProductIds.length > 0 ? 'selected' : 'all'
	}
})

function arraysEqual(a: string[], b: string[]): boolean {
	if (a.length !== b.length) return false
	const sortedA = [...a].sort()
	const sortedB = [...b].sort()
	return sortedA.every((v, i) => v === sortedB[i])
}

async function executeProcessAction() {
	if (clientIds.value.length === 0) return
	executing.value = true
	try {
		const productIds = productMode.value === 'selected' ? props.selectedProductIds : undefined
		const result = await processActionRequests(clientIds.value, productIds, visibility.value || undefined)

		if (result.error) throw result.error

		statusMessage.value = { type: 'success', message: String($t('message.processActionsExecuted')) }
		setTimeout(() => { statusMessage.value = null }, 5000)
		open.value = false
		emit('executed')
	} catch (e) {
		console.error('Failed to execute process actions:', e)
		statusMessage.value = {
			type: 'error',
			message: e instanceof Error ? e.message : String($t('message.failedToProcessActions')),
		}
	} finally {
		executing.value = false
	}
}
</script>
