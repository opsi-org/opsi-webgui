<template>
	<div v-if="visibleChangesCount > 0" class="inline-flex rounded-md shadow-sm">
		<UTooltip :text="$t('saveAll')">
			<UButton :size="size" color="success" variant="solid" class="rounded-r-none" :loading="configRef?.isSaving"
				@click="emit('saveAll', false)">
				<UIcon :name="icons.save" class="w-3.5 h-3.5" />
			</UButton>
		</UTooltip>
		<UTooltip :text="$t('discard')">
			<UButton :size="size" color="neutral" variant="soft" class="rounded-none border border-(--color-border)"
				@click="emit('discardAll')">
				<UIcon :name="icons.delete" class="w-3.5 h-3.5" />
			</UButton>
		</UTooltip>
		<UButton :size="size" color="neutral" variant="soft" class="rounded-l-none border border-(--color-border)"
			@click="open = true">
			{{ $t('unsavedChanges') }}
			<UBadge size="xs" color="warning" class="ml-1">{{ visibleChangesCount }}</UBadge>
		</UButton>
	</div>

	<UModal v-model:open="open" :title="$t('unsavedChanges')" :ui="{ content: 'max-w-2xl' }">
		<template #body>
			<div class="space-y-3 max-h-[50vh] overflow-y-auto">

				<div v-for="group in groupedChanges" :key="group.productId"
					class="border border-(--color-border) rounded-lg overflow-hidden">
					<div class="bg-(--color-surface) px-3 py-2 flex items-center justify-between">
						<div class="flex items-center gap-2">
							<UIcon :name="icons.product" class="w-4 h-4 text-opsi-blue" />
							<span class="font-mono text-sm font-medium">{{ group.productId }}</span>
						</div>
						<UBadge v-if="group.changes.length > 1" color="warning" variant="subtle" size="xs">
							{{ group.changes.length }} {{ group.changes.length === 1 ? 'change' : 'changes' }}
						</UBadge>
					</div>
					<div class="divide-y divide-(--color-border)">
						<div v-for="change in group.changes" :key="change.key"
							class="changed-item flex items-center justify-between gap-2 px-2 py-1 text-sm">
							<div class="min-w-0 flex-1">
								<div class="flex items-center gap-2">
									<span v-if="change.label != 'Action Request'" class="font-medium truncate">{{
										change.label }}</span>
								</div>
								<p class="text-xs  mt-0.5">
									{{ change.oldValue }} → {{ change.newValue }}
								</p>
							</div>
							<UTooltip :text="$t('discard')">
								<UButton size="xs" :icon="icons.close" color="neutral" variant="ghost"
									@click="change.discard()" />
							</UTooltip>
						</div>
					</div>
				</div>

				<div v-if="groupedChanges.length === 0" class="py-6 text-center text-sm text-(--color-text-muted)">
					{{ $t('message.noItemsFound') }}
				</div>
			</div>
		</template>
		<template #footer>
			<div class="w-full space-y-3">
				<div v-if="mode === 'actionRequests'" class="border border-(--color-border) rounded-lg overflow-hidden">
					<div class="bg-(--color-surface) px-3 py-1.5 flex items-center gap-2">
						<UIcon :name="icons.onDemand" class="w-4 h-4 text-opsi-blue" />
						<label class="flex items-center gap-2 cursor-pointer">
							<input type="checkbox" v-model="processAfterSave"
								class="rounded border-gray-300 text-opsi-blue focus:ring-opsi-blue w-3.5 h-3.5" />
							<span class="text-sm font-medium">{{ $t('saveAndProcess') }}</span>
						</label>
					</div>
					<template v-if="processAfterSave">
						<div class="px-3 py-2 space-y-2 bg-(--color-surface)/50">
							<div class="flex flex-wrap items-center gap-x-4 gap-y-1">
								<div class="flex items-center gap-2">
									<span class="text-xs font-medium text-(--color-text-muted)">{{ $t('products')
									}}:</span>
									<label class="flex items-center gap-1 cursor-pointer text-xs">
										<input type="radio" v-model="onDemandProductMode" value="all"
											class="text-opsi-blue focus:ring-opsi-blue w-3 h-3" />
										{{ $t('all') }}
									</label>
									<label v-if="selectedProductIds.length > 0"
										class="flex items-center gap-1 cursor-pointer text-xs">
										<input type="radio" v-model="onDemandProductMode" value="selected"
											class="text-opsi-blue focus:ring-opsi-blue w-3 h-3" />
										{{ $t('selected') }} ({{ selectedProductIds.length }})
									</label>
								</div>
								<div class="flex items-center gap-2">
									<span class="text-xs font-medium text-(--color-text-muted)">{{ $t('visibility')
									}}:</span>
									<label class="flex items-center gap-1 cursor-pointer text-xs">
										<input type="radio" v-model="onDemandVisibility" value=""
											class="text-opsi-blue focus:ring-opsi-blue w-3 h-3" />
										{{ $t('clientDefault') }}
									</label>
									<label class="flex items-center gap-1 cursor-pointer text-xs">
										<input type="radio" v-model="onDemandVisibility" value="visible"
											class="text-opsi-blue focus:ring-opsi-blue w-3 h-3" />
										{{ $t('visible') }}
									</label>
									<label class="flex items-center gap-1 cursor-pointer text-xs">
										<input type="radio" v-model="onDemandVisibility" value="hidden"
											class="text-opsi-blue focus:ring-opsi-blue w-3 h-3" />
										{{ $t('hidden') }}
									</label>
								</div>
							</div>
							<div class="text-xs text-(--color-text-muted)">
								{{ $t('clients') }}: {{ onDemandClientIds.length }}
								<span v-if="onDemandClientIds.length > 0" class="ml-1 font-mono">
									({{ onDemandClientIds.slice(0, 3).join(', ') }}{{ onDemandClientIds.length > 3 ?
										'...' : '' }})
								</span>
							</div>
						</div>
					</template>
				</div>
				<div class="flex gap-2 justify-end">
					<UButton variant="soft" color="neutral" @click="handleDiscardAll">{{ $t('discardAll') }}
					</UButton>
					<UButton color="primary" :loading="configRef?.isSaving" @click="handleSaveAll">
						{{ processAfterSave && mode === 'actionRequests' ? $t('saveAndProcess') : $t('saveAll') }}
					</UButton>
				</div>
			</div>
		</template>
	</UModal>
</template>

<script setup lang="ts">
import type { ProductConfigTabsRef, ProductVisibility } from '~/types'

const props = withDefaults(defineProps<{
	configRef: ProductConfigTabsRef | null
	configProductId?: string
	selectedProductIds?: string[]
	mode?: 'all' | 'actionRequests' | 'properties'
	size?: 'xs' | 'sm'
}>(), {
	size: 'sm',
	mode: 'all',
	selectedProductIds: () => [],
})

const emit = defineEmits<{
	saveAll: [processOnDemand: boolean, onDemandOptions?: { productIds?: string[]; visibility?: string; clientIds?: string[] }]
	discardAll: []
}>()

const icons = useIcons()
const { t: $t } = useI18n()
const selectionStore = useSelectionStore()
const open = ref(false)
const processAfterSave = ref(false)
const onDemandProductMode = ref<'all' | 'selected'>('all')
const onDemandVisibility = ref<ProductVisibility>('')
const onDemandClientIds = ref<string[]>([...selectionStore.selectedClients])

watch(open, (isOpen) => {
	if (isOpen) {
		onDemandClientIds.value = [...selectionStore.selectedClients]
		onDemandProductMode.value = props.selectedProductIds.length > 0 ? 'selected' : 'all'
	}
})

interface ChangeItem {
	key: string
	type: 'property' | 'actionRequest'
	label: string
	oldValue: string
	newValue: string
	discard: () => void
}

interface ChangeGroup {
	productId: string
	changes: ChangeItem[]
}

const groupedChanges = computed<ChangeGroup[]>(() => {
	const groups = new Map<string, ChangeItem[]>()

	if (props.mode !== 'actionRequests' && props.configRef?.changedProperties) {
		const productId = props.configProductId || String($t('properties'))
		for (const [key, newVal] of props.configRef.changedProperties) {
			const items = groups.get(productId) || []
			items.push({
				key: `prop-${key}`,
				type: 'property',
				label: key,
				oldValue: props.configRef?.fmtVal?.(props.configRef?.getOriginalPropertyValue?.(key)) || '-',
				newValue: props.configRef?.fmtVal?.(newVal) || '-',
				discard: () => props.configRef?.discardSingleProperty?.(key),
			})
			groups.set(productId, items)
		}
	}

	if (props.mode !== 'properties' && props.configRef?.changedActionRequests) {
		for (const [productId, change] of props.configRef.changedActionRequests) {
			const items = groups.get(productId) || []
			items.push({
				key: `ar-${productId}`,
				type: 'actionRequest',
				label: String($t('actionRequest')),
				oldValue: change.oldRequest || 'none',
				newValue: change.actionRequest,
				discard: () => props.configRef?.discardSingleActionRequest?.(productId),
			})
			groups.set(productId, items)
		}
	}

	return Array.from(groups.entries()).map(([productId, changes]) => ({
		productId,
		changes,
	}))
})

const visibleChangesCount = computed(() => {
	let count = 0
	if (props.mode !== 'actionRequests' && props.configRef?.changedProperties) {
		count += props.configRef.changedProperties.size
	}
	if (props.mode !== 'properties' && props.configRef?.changedActionRequests) {
		count += props.configRef.changedActionRequests.size
	}
	return count
})

function handleSaveAll() {
	open.value = false
	const options = processAfterSave.value && props.mode === 'actionRequests' ? {
		productIds: onDemandProductMode.value === 'selected' ? props.selectedProductIds : undefined,
		visibility: onDemandVisibility.value || undefined,
		clientIds: onDemandClientIds.value.length > 0 ? onDemandClientIds.value : undefined,
	} : undefined
	emit('saveAll', processAfterSave.value && props.mode === 'actionRequests', options)
}

function handleDiscardAll() {
	open.value = false
	emit('discardAll')
}
</script>

<style scoped>
.changed-item:hover {
	background: var(--color-surface-hover, #4b4b49);
	transition: background 0.2s;
}
</style>
