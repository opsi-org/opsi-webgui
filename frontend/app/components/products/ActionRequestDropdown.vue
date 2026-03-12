<!--
This file is part of opsi-webgui application.
opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
Copyright (c) uib GmbH <info@uib.de> 2026
All rights reserved.
License: AGPL-3.0

Action request dropdown for products table - allows setting product actions.
-->
<template>
	<div class="flex items-center gap-1">
		<USelectMenu v-if="!disabled" v-model="selectedRequest" :items="requestOptions" size="xs" class="min-w-20"
			value-key="value" label-key="label" @update:model-value="handleChange">
			<template #item="{ item }">
				<span class="text-xs" :class="getRequestClass(item.value)">{{ item.label }}</span>
			</template>
		</USelectMenu>
		<span v-else class="text-xs text-[--color-text-muted]">
			{{ currentLabel || '-' }}
		</span>
	</div>
</template>

<script setup lang="ts">
interface Props {
	productId: string
	currentRequest?: string
	disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
	disabled: false
})

const emit = defineEmits<{
	(e: 'change', request: string): void
}>()

const { t: $t } = useI18n()

const requestOptions = [
	{ label: String($t('none')), value: 'none' },
	{ label: String($t('setup')), value: 'setup' },
	{ label: String($t('uninstall')), value: 'uninstall' },
	{ label: String($t('update')), value: 'update' },
	{ label: String($t('always')), value: 'always' },
	{ label: String($t('once')), value: 'once' },
	{ label: String($t('custom')), value: 'custom' },
]

const selectedRequest = ref(props.currentRequest || 'none')

const currentLabel = computed(() => {
	const option = requestOptions.find(o => o.value === selectedRequest.value)
	return option?.label || selectedRequest.value || String($t('none'))
})

function getRequestClass(request: string): string {
	switch (request) {
		case 'setup': return 'text-blue-600 dark:text-blue-400'
		case 'uninstall': return 'text-red-600 dark:text-red-400'
		case 'update': return 'text-green-600 dark:text-green-400'
		case 'always':
		case 'once': return 'text-purple-600 dark:text-purple-400'
		default: return ''
	}
}

function handleChange(value: string) {
	emit('change', value)
}

watch(() => props.currentRequest, (newVal) => {
	selectedRequest.value = newVal || 'none'
})
</script>
