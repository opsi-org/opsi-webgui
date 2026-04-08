<template>
	<div v-if="mode === 'header'" class="flex items-center gap-1" @click.stop>
		<span class="font-heading text-xs tracking-wider">{{ $t('actionRequest') }}</span>
		<UIcon v-if="sortColumn === 'actionRequest'" :name="sortDirection === 'asc' ? icons.sortAsc : icons.sortDesc"
			class="w-3 h-3" />
		<UIcon v-else :name="icons.sort" class="w-3 h-3 opacity-30" />
		<UPopover v-if="hasClientsSelected && hasProductsSelected">
			<UButton size="xs" variant="ghost" color="neutral" :icon="icons.chevronDown"
				:title="$t('message.setActionRequestForSelectedProducts')" />
			<template #content>
				<div class="p-2 w-44">
					<p class="text-xs text-(--color-text-muted) mb-2">{{ $t('setForSelected') }}</p>
					<div class="space-y-1">
						<UButton v-for="action in bulkActionOptions" :key="action" size="xs" variant="ghost"
							color="neutral" block class="justify-start" @click="emit('apply', action)">
							{{ action }}
						</UButton>
					</div>
				</div>
			</template>
		</UPopover>
	</div>

	<div v-else class="flex items-center gap-1">
		<SharedTooltipTable v-if="isMixed && disabled" :rows="mixedTooltipRows">
			<UBadge color="warning" variant="subtle" size="xs" class="gap-1 cursor-help">
				<UIcon :name="icons.unequal" class="w-3 h-3" />
				<span>{{ $t('mixed') }}</span>
			</UBadge>
		</SharedTooltipTable>
		<template v-else-if="!disabled">
			<USelect v-model="selectedRequest" :items="requestItems" size="xs" class="min-w-24"
				@update:model-value="handleChange" />
			<SharedTooltipTable v-if="isMixed" :rows="mixedTooltipRows">
				<UBadge color="warning" variant="subtle" size="xs" class="gap-1 cursor-help shrink-0">
					<UIcon :name="icons.unequal" class="w-3 h-3" />
				</UBadge>
			</SharedTooltipTable>
		</template>
		<span v-else class="text-xs text-(--color-text-muted)">
			{{ currentLabel || '-' }}
		</span>
		<span v-if="hasChanged || hasPendingChange" class="w-1.5 h-1.5 rounded-full bg-yellow-500 shrink-0"
			:title="$t('unsavedChange')" />
	</div>
</template>

<script setup lang="ts">
interface Props {
	mode?: 'row' | 'header'
	productId?: string
	currentRequest?: string
	availableActions?: string[]
	disabled?: boolean
	requestDetails?: string[]
	selectedClients?: string[] | null
	pendingRequest?: string
	hasClientsSelected?: boolean
	hasProductsSelected?: boolean
	sortColumn?: string
	sortDirection?: 'asc' | 'desc'
}

const props = withDefaults(defineProps<Props>(), {
	mode: 'row',
	disabled: false,
	availableActions: () => [],
	hasClientsSelected: false,
	hasProductsSelected: false,
})

const emit = defineEmits<{
	change: [request: string]
	apply: [actionRequest: string]
}>()

const icons = useIcons()
const { t: $t } = useI18n()

const bulkActionOptions = ['none', 'setup', 'uninstall', 'update', 'always', 'once', 'custom']

const isMixed = computed(() => {
	if (!props.requestDetails || props.requestDetails.length <= 1) return false
	const unique = [...new Set(props.requestDetails.map(r => r?.toLowerCase() || 'none'))]
	return unique.length > 1
})

const hasPendingChange = computed(() => {
	if (!props.pendingRequest) return false
	const orig = props.currentRequest || 'none'
	return props.pendingRequest !== orig
})

const mixedTooltipRows = computed(() => {
	if (!props.requestDetails) return []
	const clients = props.selectedClients || []
	if (clients.length > 0 && clients.length === props.requestDetails.length) {
		return clients.map((c, i) => ({ key: c, value: props.requestDetails![i] || 'none' }))
	}
	const counts: Record<string, number> = {}
	props.requestDetails.forEach(r => {
		const key = r?.toLowerCase() || 'none'
		counts[key] = (counts[key] || 0) + 1
	})
	return Object.entries(counts).map(([k, v]) => ({ key: k, value: String(v) }))
})

const defaultActions = ['none', 'setup', 'uninstall', 'update', 'always', 'once', 'custom']

const requestItems = computed(() => {
	const actions = props.availableActions.length > 0 ? ['none', ...props.availableActions] : defaultActions
	return [...new Set(actions)].map(a => ({
		label: a === 'none' ? String($t('none')) : a,
		value: a,
	}))
})

const originalRequest = ref(props.currentRequest || 'none')
const selectedRequest = ref(props.currentRequest || 'none')

const hasChanged = computed(() => selectedRequest.value !== originalRequest.value)

const currentLabel = computed(() => {
	const option = requestItems.value.find(o => o.value === selectedRequest.value)
	return option?.label || selectedRequest.value || String($t('none'))
})

function handleChange(value: string) {
	emit('change', value)
}

function resetToOriginal() {
	selectedRequest.value = originalRequest.value
}

watch(() => props.currentRequest, (newVal) => {
	originalRequest.value = newVal || 'none'
	selectedRequest.value = newVal || 'none'
})

watch(() => props.pendingRequest, (newVal) => {
	if (newVal !== undefined) {
		selectedRequest.value = newVal
	} else {
		selectedRequest.value = originalRequest.value
	}
})

defineExpose({ hasChanged, resetToOriginal })
</script>
