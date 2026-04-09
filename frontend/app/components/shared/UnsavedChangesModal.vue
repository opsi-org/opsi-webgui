SharedUnsavedChangesModal — Unified unsaved-changes button + modal.
Supports product properties, product action requests, host parameters, and host attributes.
<template>
	<template v-if="totalChangesCount > 0">
		<div class="inline-flex rounded-md shadow-sm">
			<template v-if="showSaveDiscard">
				<UTooltip :text="$t('save')">
					<UButton :size="size" color="success" variant="solid" class="rounded-r-none"
						:loading="isSaving" @click="handleQuickSave">
						<UIcon :name="icons.check" class="w-3.5 h-3.5" />
					</UButton>
				</UTooltip>
				<UTooltip :text="$t('discard')">
					<UButton :size="size" color="neutral" variant="soft"
						class="rounded-none border border-(--color-border)" @click="handleQuickDiscard">
						<UIcon :name="icons.delete" class="w-3.5 h-3.5" />
					</UButton>
				</UTooltip>
			</template>
			<UButton :size="size" color="neutral" variant="soft"
				:class="showSaveDiscard ? 'rounded-l-none border border-(--color-border)' : ''" @click="open = true">
				{{ $t('unsavedChanges') }}
				<UBadge size="xs" color="warning" class="ml-1">{{ totalChangesCount }}</UBadge>
			</UButton>
		</div>
	</template>

	<UModal v-model:open="open" :title="$t('unsavedChanges')" :ui="{ content: 'max-w-sm sm:max-w-2xl' }">
		<template #body>
			<div class="space-y-3 max-h-[50vh] overflow-y-auto">
				<!-- Product-grouped changes (properties + action requests) -->
				<template v-if="groupedProductChanges.length > 0">
					<div v-for="group in groupedProductChanges" :key="group.productId"
						class="border border-(--color-border) rounded-lg overflow-hidden">
						<div class="bg-(--color-surface) px-3 py-2 flex items-center justify-between">
							<div class="flex items-center gap-2">
								<UIcon :name="icons.product" class="w-4 h-4 text-(--color-text-muted)" />
								<span class="text-sm font-medium">{{ group.productId }}</span>
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
										<span v-if="change.label !== 'Action Request'" class="font-medium truncate">{{ change.label }}</span>
									</div>
									<p class="text-xs mt-0.5">{{ change.oldValue }} → {{ change.newValue }}</p>
								</div>
								<UTooltip :text="$t('discard')">
									<UButton size="xs" :icon="icons.x" color="neutral" variant="ghost" @click="change.discard()" />
								</UTooltip>
							</div>
						</div>
					</div>
				</template>

				<!-- Host parameters -->
				<div v-if="(configRef?.changedParams?.size ?? 0) > 0">
					<h5 class="font-heading text-xs text-(--color-text-muted) mb-2 m-0">{{ $t('parameters') }}</h5>
					<div class="divide-y divide-(--color-border) border border-(--color-border) rounded-lg">
						<div v-for="[key] in configRef?.changedParams" :key="key"
							class="changed-item flex items-center justify-between gap-2 px-3 py-2 text-sm">
							<div class="min-w-0 flex-1">
								<p class="font-medium truncate m-0">{{ key }}</p>
								<p class="text-xs mt-0.5 m-0">
									{{ fmtVal(configRef?.getOriginalParamValue?.(key)) }}
									→ {{ fmtVal(configRef?.changedParams?.get(key)) }}
								</p>
							</div>
							<UTooltip :text="$t('discard')">
								<UButton size="xs" :icon="icons.x" color="neutral" variant="ghost"
									@click="configRef?.discardSingleParam?.(key)" />
							</UTooltip>
						</div>
					</div>
				</div>

				<!-- Host attributes -->
				<div v-if="(configRef?.changedAttributesList?.length ?? 0) > 0">
					<h5 class="font-heading text-xs text-(--color-text-muted) mb-2 m-0">{{ $t('attributes') }}</h5>
					<div class="divide-y divide-(--color-border) border border-(--color-border) rounded-lg">
						<div v-for="item in configRef?.changedAttributesList" :key="item.key"
							class="changed-item flex items-center justify-between gap-2 px-3 py-2 text-sm">
							<div class="min-w-0 flex-1">
								<p class="font-medium truncate m-0">{{ item.key }}</p>
								<p class="text-xs mt-0.5 m-0">
									{{ fmtVal(item.oldValue) }} → {{ fmtVal(item.newValue) }}
								</p>
							</div>
							<UTooltip :text="$t('discard')">
								<UButton size="xs" :icon="icons.x" color="neutral" variant="ghost"
									@click="configRef?.discardSingleAttribute?.(item.key)" />
							</UTooltip>
						</div>
					</div>
				</div>

				<div v-if="totalChangesCount === 0" class="py-6 text-center text-sm text-(--color-text-muted)">
					{{ $t('message.noItemsFound') }}
				</div>
			</div>
		</template>
		<template #footer>
			<div class="w-full space-y-3">
				<!-- Save & Process options (products mode) -->
				<div v-if="showProcessOptions" class="border border-(--color-border) rounded-lg overflow-hidden">
					<div class="bg-(--color-surface) px-3 py-1.5 flex items-center gap-2">
						<UIcon :name="icons.onDemand" class="w-4 h-4 text-(--color-text-muted)" />
						<label class="flex items-center gap-2 cursor-pointer">
							<input type="checkbox" v-model="processAfterSave"
								class="rounded border-(--color-border) text-opsi-blue focus:ring-opsi-blue w-3.5 h-3.5" />
							<span class="text-sm font-medium">{{ $t('saveAndProcess') }}</span>
						</label>
					</div>
					<template v-if="processAfterSave">
						<div class="px-3 py-2 space-y-2 bg-(--color-surface)/50">
							<div class="flex flex-wrap items-center gap-x-4 gap-y-1">
								<div class="flex items-center gap-2">
									<span class="text-xs font-medium text-(--color-text-muted)">{{ $t('products') }}:</span>
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
									<span class="text-xs font-medium text-(--color-text-muted)">{{ $t('visibility') }}:</span>
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
								<span v-if="onDemandClientIds.length > 0" class="ml-1">
									({{ onDemandClientIds.slice(0, 3).join(', ') }}{{ onDemandClientIds.length > 3 ? '...' : '' }})
								</span>
							</div>
						</div>
					</template>
				</div>
				<div class="flex gap-2 justify-end">
					<UButton variant="soft" color="neutral" @click="handleDiscardAll">{{ $t('discardAll') }}</UButton>
					<UButton color="primary" :loading="isSaving" @click="handleSaveAll">
						{{ processAfterSave && showProcessOptions ? $t('saveAndProcess') : $t('saveAll') }}
					</UButton>
				</div>
			</div>
		</template>
	</UModal>
</template>

<script setup lang="ts">
import type { ProductConfigTabsRef, ProductActionRequestChange, EditablePropertyValue, ProductVisibility } from '~/types'

/**
 * Host config ref interface for host parameters + attributes context.
 */
export interface HostConfigRef {
	hasAnyChanges?: boolean
	isSaving?: boolean
	changedCount?: number
	changedParams?: Map<string, unknown>
	changedAttributesList?: Array<{ key: string; label: string; oldValue: unknown; newValue: unknown }>
	saveAll?: () => void
	discardAll?: () => void
	discardSingleParam?: (key: string) => void
	discardSingleAttribute?: (key: string) => void
	getOriginalParamValue?: (key: string) => unknown
	fmtVal?: (v: unknown) => string
}

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

const props = withDefaults(defineProps<{
	/** Host config ref for host parameters/attributes mode */
	configRef?: HostConfigRef | null
	/** Product config ref for product properties/action requests mode */
	productConfigRef?: ProductConfigTabsRef | null
	/** Product ID context for panel property changes */
	configProductId?: string
	/** Selected product IDs for on-demand processing */
	selectedProductIds?: string[]
	/** Which product changes to show: 'all' | 'actionRequests' | 'properties' */
	mode?: 'all' | 'actionRequests' | 'properties'
	/** Button size */
	size?: 'xs' | 'sm'
	/** Show inline save/discard buttons */
	showSaveDiscard?: boolean
	/** Show the process options in footer (for action request mode) */
	showProcessOptions?: boolean
	/** Client IDs for on-demand processing */
	clientIds?: string[]
}>(), {
	configRef: null,
	productConfigRef: null,
	size: 'sm',
	showSaveDiscard: true,
	mode: 'all',
	selectedProductIds: () => [],
	showProcessOptions: false,
	clientIds: () => [],
})

const emit = defineEmits<{
	saveAll: [processOnDemand: boolean, onDemandOptions?: { productIds?: string[]; visibility?: string; clientIds?: string[] }]
	discardAll: []
}>()

const icons = useIcons()
const { t: $t } = useI18n()
const open = ref(false)
const processAfterSave = ref(false)
const onDemandProductMode = ref<'all' | 'selected'>('all')
const onDemandVisibility = ref<ProductVisibility>('')
const onDemandClientIds = ref<string[]>([])

watch(open, (isOpen) => {
	if (isOpen) {
		onDemandClientIds.value = [...props.clientIds]
		onDemandProductMode.value = props.selectedProductIds.length > 0 ? 'selected' : 'all'
	}
})

function fmtVal(v: unknown): string {
	if (props.configRef?.fmtVal) return props.configRef.fmtVal(v)
	if (props.productConfigRef?.fmtVal) return props.productConfigRef.fmtVal(v)
	if (v === null || v === undefined) return '-'
	if (Array.isArray(v)) return v.join(', ')
	return String(v)
}

const isSaving = computed(() => props.configRef?.isSaving || props.productConfigRef?.isSaving || false)

/** Product-grouped changes (properties + action requests) */
const groupedProductChanges = computed<ChangeGroup[]>(() => {
	if (!props.productConfigRef) return []
	const groups = new Map<string, ChangeItem[]>()

	if (props.mode !== 'actionRequests' && props.productConfigRef.changedProperties) {
		const productId = props.configProductId || String($t('properties'))
		for (const [key, newVal] of props.productConfigRef.changedProperties) {
			const items = groups.get(productId) || []
			items.push({
				key: `prop-${key}`,
				type: 'property',
				label: key,
				oldValue: props.productConfigRef.fmtVal?.(props.productConfigRef.getOriginalPropertyValue?.(key)) || '-',
				newValue: props.productConfigRef.fmtVal?.(newVal) || '-',
				discard: () => props.productConfigRef?.discardSingleProperty?.(key),
			})
			groups.set(productId, items)
		}
	}

	if (props.mode !== 'properties' && props.productConfigRef.changedActionRequests) {
		for (const [productId, change] of props.productConfigRef.changedActionRequests) {
			const items = groups.get(productId) || []
			items.push({
				key: `ar-${productId}`,
				type: 'actionRequest',
				label: String($t('actionRequest')),
				oldValue: change.oldRequest || 'none',
				newValue: change.actionRequest,
				discard: () => props.productConfigRef?.discardSingleActionRequest?.(productId),
			})
			groups.set(productId, items)
		}
	}

	return Array.from(groups.entries()).map(([productId, changes]) => ({ productId, changes }))
})

/** Total count of all changes across all contexts */
const totalChangesCount = computed(() => {
	let count = 0
	// Product changes
	if (props.productConfigRef) {
		if (props.mode !== 'actionRequests' && props.productConfigRef.changedProperties) {
			count += props.productConfigRef.changedProperties.size
		}
		if (props.mode !== 'properties' && props.productConfigRef.changedActionRequests) {
			count += props.productConfigRef.changedActionRequests.size
		}
	}
	// Host changes
	if (props.configRef) {
		count += props.configRef.changedParams?.size ?? 0
		count += props.configRef.changedAttributesList?.length ?? 0
	}
	return count
})

function handleQuickSave() {
	emit('saveAll', false)
}

function handleQuickDiscard() {
	emit('discardAll')
}

function handleSaveAll() {
	open.value = false
	const options = processAfterSave.value && props.showProcessOptions ? {
		productIds: onDemandProductMode.value === 'selected' ? props.selectedProductIds : undefined,
		visibility: onDemandVisibility.value || undefined,
		clientIds: onDemandClientIds.value.length > 0 ? onDemandClientIds.value : undefined,
	} : undefined
	emit('saveAll', processAfterSave.value && props.showProcessOptions, options)
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