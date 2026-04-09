SharedUnsavedChangesModal — Unified unsaved-changes button + modal.
Supports product properties, product action requests, host parameters, and host attributes.
<template>
	<template v-if="totalChangesCount > 0">
		<div class="inline-flex rounded-md shadow-sm">
			<template v-if="showSaveDiscard">
				<UTooltip :text="$t('save')">
					<UButton :size="size" color="success" variant="solid" class="rounded-r-none" :loading="isSaving"
						@click="handleQuickSave">
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
			<div class="space-y-3">
				<!-- Result alerts inside modal -->
				<SharedAlertInline v-if="saveResult && saveResult.type === 'success'" color="success"
					:title="$t('success')" :description="saveResult.message" variant="subtle" closable
					@close="saveResult = null" />
				<SharedAlertInline v-if="saveResult && saveResult.type === 'error'" color="error" :title="$t('error')"
					:description="saveResult.message" variant="subtle" closable @close="saveResult = null" />
				<SharedAlertInline v-if="saveResult && saveResult.type === 'warning'" color="warning"
					:title="$t('warning')" :description="saveResult.message" variant="subtle" closable
					@close="saveResult = null" />

				<!-- Product changes table -->
				<template v-if="flatChanges.length > 0">
					<div class="border border-(--color-border) rounded-lg bg-(--color-surface)"
						style="min-height: 80px;">
						<div class="max-h-64 overflow-y-auto text-xs">
							<table class="min-w-full table-auto">
								<thead class="bg-(--color-surface) sticky top-0 z-10">
									<tr class="text-left text-(--color-text-muted)">
										<th class="px-2 py-1.5 font-medium">{{ $t('productId') }}</th>
										<th class="px-2 py-1.5 font-medium">{{ $t('property') }}</th>
										<th class="px-2 py-1.5 font-medium">{{ $t('oldValue') }}</th>
										<th class="px-2 py-1.5 font-medium">{{ $t('newValue') }}</th>
										<th class="px-2 py-1.5 font-medium w-10"></th>
									</tr>
								</thead>
								<tbody class="divide-y divide-(--color-border)">
									<tr v-for="change in flatChanges" :key="change.key"
										class="hover:bg-(--color-surface-hover)">
										<td class="px-2 py-1 max-w-32 font-medium">
											<UTooltip :text="change.productId" :delay-duration="300">
												<span class="block truncate">{{ change.productId }}</span>
											</UTooltip>
										</td>
										<td class="px-2 py-1 max-w-28 text-(--color-text-muted)">
											<UTooltip :text="change.label" :delay-duration="300">
												<span class="block truncate">{{ change.label }}</span>
											</UTooltip>
										</td>
										<td class="px-2 py-1 max-w-24 text-(--color-text-muted)">
											<UTooltip :text="String(change.oldValue)" :delay-duration="300">
												<span class="block truncate">{{ change.oldValue }}</span>
											</UTooltip>
										</td>
										<td class="px-2 py-1 max-w-24 font-medium">
											<UTooltip :text="String(change.newValue)" :delay-duration="300">
												<span class="block truncate">{{ change.newValue }}</span>
											</UTooltip>
										</td>
										<td class="px-2 py-1 text-center">
											<UTooltip :text="$t('discard')">
												<UButton size="xs" :icon="icons.x" color="neutral" variant="ghost"
													@click="change.discard()" />
											</UTooltip>
										</td>
									</tr>
								</tbody>
							</table>
						</div>
					</div>
				</template>

				<!-- Host parameters table -->
				<template v-if="(configRef?.changedParams?.size ?? 0) > 0">
					<h5 class="font-heading text-xs text-(--color-text-muted) mb-1 m-0">{{ $t('parameters') }}</h5>
					<div class="border border-(--color-border) rounded-lg bg-(--color-surface)">
						<div class="max-h-48 overflow-y-auto text-xs">
							<table class="min-w-full table-auto">
								<thead class="bg-(--color-surface) sticky top-0 z-10">
									<tr class="text-left text-(--color-text-muted)">
										<th class="px-2 py-1.5 font-medium">{{ $t('parameter') }}</th>
										<th class="px-2 py-1.5 font-medium">{{ $t('oldValue') }}</th>
										<th class="px-2 py-1.5 font-medium">{{ $t('newValue') }}</th>
										<th class="px-2 py-1.5 font-medium w-10"></th>
									</tr>
								</thead>
								<tbody class="divide-y divide-(--color-border)">
									<tr v-for="[key] in configRef?.changedParams" :key="key"
										class="hover:bg-(--color-surface-hover)">
										<td class="px-2 py-1 max-w-40 font-medium">
											<UTooltip :text="key" :delay-duration="300">
												<span class="block truncate">{{ key }}</span>
											</UTooltip>
										</td>
										<td class="px-2 py-1 max-w-28 text-(--color-text-muted)">
											<UTooltip :text="fmtVal(configRef?.getOriginalParamValue?.(key))" :delay-duration="300">
												<span class="block truncate">{{ fmtVal(configRef?.getOriginalParamValue?.(key)) }}</span>
											</UTooltip>
										</td>
										<td class="px-2 py-1 max-w-28 font-medium">
											<UTooltip :text="fmtVal(configRef?.changedParams?.get(key))" :delay-duration="300">
												<span class="block truncate">{{ fmtVal(configRef?.changedParams?.get(key)) }}</span>
											</UTooltip>
										</td>
										<td class="px-2 py-1 text-center">
											<UTooltip :text="$t('discard')">
												<UButton size="xs" :icon="icons.x" color="neutral" variant="ghost"
													@click="configRef?.discardSingleParam?.(key)" />
											</UTooltip>
										</td>
									</tr>
								</tbody>
							</table>
						</div>
					</div>
				</template>

				<!-- Host attributes table -->
				<template v-if="(configRef?.changedAttributesList?.length ?? 0) > 0">
					<h5 class="font-heading text-xs text-(--color-text-muted) mb-1 m-0">{{ $t('attributes') }}</h5>
					<div class="border border-(--color-border) rounded-lg bg-(--color-surface)">
						<div class="max-h-48 overflow-y-auto text-xs">
							<table class="min-w-full table-auto">
								<thead class="bg-(--color-surface) sticky top-0 z-10">
									<tr class="text-left text-(--color-text-muted)">
										<th class="px-2 py-1.5 font-medium">{{ $t('attribute') }}</th>
										<th class="px-2 py-1.5 font-medium">{{ $t('oldValue') }}</th>
										<th class="px-2 py-1.5 font-medium">{{ $t('newValue') }}</th>
										<th class="px-2 py-1.5 font-medium w-10"></th>
									</tr>
								</thead>
								<tbody class="divide-y divide-(--color-border)">
									<tr v-for="item in configRef?.changedAttributesList" :key="item.key"
										class="hover:bg-(--color-surface-hover)">
										<td class="px-2 py-1 max-w-40 font-medium">
											<UTooltip :text="item.key" :delay-duration="300">
												<span class="block truncate">{{ item.key }}</span>
											</UTooltip>
										</td>
										<td class="px-2 py-1 max-w-28 text-(--color-text-muted)">
											<UTooltip :text="fmtVal(item.oldValue)" :delay-duration="300">
												<span class="block truncate">{{ fmtVal(item.oldValue) }}</span>
											</UTooltip>
										</td>
										<td class="px-2 py-1 max-w-28 font-medium">
											<UTooltip :text="fmtVal(item.newValue)" :delay-duration="300">
												<span class="block truncate">{{ fmtVal(item.newValue) }}</span>
											</UTooltip>
										</td>
										<td class="px-2 py-1 text-center">
											<UTooltip :text="$t('discard')">
												<UButton size="xs" :icon="icons.x" color="neutral" variant="ghost"
													@click="configRef?.discardSingleAttribute?.(item.key)" />
											</UTooltip>
										</td>
									</tr>
								</tbody>
							</table>
						</div>
					</div>
				</template>

				<div v-if="totalChangesCount === 0 && !saveResult"
					class="py-6 text-center text-sm text-(--color-text-muted)">
					{{ $t('message.noItemsFound') }}
				</div>
			</div>
		</template>
		<template #footer>
			<div class="w-full space-y-3">
				<!-- Save & Process options (products mode) -->
				<div v-if="showProcessOptions && totalChangesCount > 0"
					class="border border-(--color-border) rounded-lg overflow-hidden">
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
								<span v-if="onDemandClientIds.length > 0" class="ml-1">
									({{ onDemandClientIds.slice(0, 3).join(', ') }}{{ onDemandClientIds.length > 3 ?
										'...' : '' }})
								</span>
							</div>
						</div>
					</template>
				</div>
				<div class="flex gap-2 justify-end">
					<template v-if="totalChangesCount > 0">
						<UButton variant="soft" color="neutral" @click="handleDiscardAll">{{ $t('discardAll') }}
						</UButton>
						<UButton color="primary" :loading="isSaving" @click="handleSaveAll">
							{{ processAfterSave && showProcessOptions ? $t('saveAndProcess') : $t('saveAll') }}
						</UButton>
					</template>
					<UButton v-else variant="soft" color="neutral" @click="open = false">{{ $t('close') }}</UButton>
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
	saveAll: [processOnDemand: boolean, onDemandOptions?: { productIds?: string[]; visibility?: string; clientIds?: string[] }, onResult?: (result: { type: 'success' | 'error' | 'warning'; message: string }) => void]
	discardAll: []
}>()

const icons = useIcons()
const { t: $t } = useI18n()
const open = ref(false)
const processAfterSave = ref(false)
const onDemandProductMode = ref<'all' | 'selected'>('all')
const onDemandVisibility = ref<ProductVisibility>('')
const onDemandClientIds = ref<string[]>([])
const saveResult = ref<{ type: 'success' | 'error' | 'warning'; message: string } | null>(null)

watch(open, (isOpen) => {
	if (isOpen) {
		onDemandClientIds.value = [...props.clientIds]
		onDemandProductMode.value = props.selectedProductIds.length > 0 ? 'selected' : 'all'
		saveResult.value = null
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

/** Flat list of all product changes for table display */
const flatChanges = computed(() => {
	const items: Array<ChangeItem & { productId: string }> = []
	for (const group of groupedProductChanges.value) {
		for (const change of group.changes) {
			items.push({ ...change, productId: group.productId })
		}
	}
	return items
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
	saveResult.value = null
	const options = processAfterSave.value && props.showProcessOptions ? {
		productIds: onDemandProductMode.value === 'selected' ? props.selectedProductIds : undefined,
		visibility: onDemandVisibility.value || undefined,
		clientIds: onDemandClientIds.value.length > 0 ? onDemandClientIds.value : undefined,
	} : undefined
	emit('saveAll', processAfterSave.value && props.showProcessOptions, options, (result) => {
		saveResult.value = result
	})
}

function handleDiscardAll() {
	emit('discardAll')
	saveResult.value = { type: 'success', message: String($t('allChangesDiscarded')) }
}
</script>