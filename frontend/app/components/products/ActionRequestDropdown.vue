<template>
	<div class="flex items-center gap-1">
		<USelect v-if="!disabled" v-model="selectedRequest" :items="requestItems" size="xs" class="min-w-24"
			@update:model-value="handleChange" />
		<span v-else class="text-xs text-(--color-text-muted)">
			{{ currentLabel || '-' }}
		</span>
		<span v-if="hasChanged" class="w-1.5 h-1.5 rounded-full bg-yellow-500 shrink-0" :title="$t('unsavedChange')" />
	</div>
</template>

<script setup lang="ts">
interface Props {
	productId: string
	currentRequest?: string
	availableActions?: string[]
	disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
	disabled: false,
	availableActions: () => [],
})

const emit = defineEmits<{
	change: [request: string]
}>()

const { t: $t } = useI18n()

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

defineExpose({ hasChanged, resetToOriginal })
</script>
