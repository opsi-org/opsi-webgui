<!--
This file is part of opsi-webgui application.
opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
Copyright (c) uib GmbH <info@uib.de> 2026
All rights reserved.
License: AGPL-3.0

ClientCloneForm  - form for cloning a client.
-->
<template>
	<div :class="['space-y-4', panelMode ? 'h-full overflow-y-auto' : '']">
		<UAlert v-if="success" color="success" :title="String($t('success'))"
			:close-button="{ icon: 'i-heroicons-x-mark' }" @close="success = false">
			<template #description>{{ $t('clientClonedSuccessfully') }}</template>
		</UAlert>
		<UAlert v-if="error" color="error" :title="String($t('error'))" :description="error"
			:close-button="{ icon: 'i-heroicons-x-mark' }" @close="error = null" />

		<div class="space-y-6 bg-(--color-background) dark:bg-(--color-background-dark)">
			<!-- Source Client Section -->
			<div v-if="!panelMode || showSourceInPanel" class="mb-6">
				<div
					class="form-row flex flex-col md:flex-row items-start md:items-center gap-y-1 gap-x-6 min-h-10 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors">
					<span class="text-sm text-(--color-text-secondary) min-w-0 md:w-1/3 break-all">
						{{ $t('sourceClient') }}
					</span>
					<span class="text-sm font-mono flex-1 truncate" :title="sourceId">
						{{ sourceId }}
					</span>
				</div>
			</div>

			<!-- New Client Section -->
			<div class="mb-6">
				<div class="flex items-center justify-between mb-3">
					<p class="text-sm font-semibold uppercase tracking-wide text-muted">{{ $t('newClient') }}</p>
				</div>
				<div class="mb-6">
					<!-- HostId (clientName + domain) -->
					<div
						class="form-row flex flex-col md:flex-row items-start md:items-center gap-y-1 gap-x-6 min-h-10 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors">
						<span class="font-mono text-sm text-(--color-text-secondary) min-w-0 md:w-1/3 break-all">
							{{ $t('clientId') }} <span class="text-error">*</span>
						</span>
						<div class="flex-1 flex flex-col items-start gap-1 min-w-0">
							<div class="flex items-center gap-2 w-full">
								<UInput v-model="clientName" :disabled="loading" size="sm" placeholder="clientname"
									class="flex-1" />
								<UInput v-model="domain" :disabled="loading" size="sm" placeholder=".domain.local"
									class="flex-1" />
							</div>
							<div v-if="formErrors.newId" class="text-xs text-error">
								{{ formErrors.newId }}
							</div>
						</div>
					</div>
					<!-- Other fields from cloneclient.target -->
					<div
						class="form-row flex flex-col md:flex-row items-start md:items-center gap-y-1 gap-x-6 min-h-10 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors">
						<span class="font-mono text-sm text-(--color-text-secondary) min-w-0 md:w-1/3 break-all">
							{{ $t('ipAddress') }}
						</span>
						<div class="flex-1">
							<UInput v-model="cloneclient.target.ipAddress" :disabled="loading" size="sm"
								placeholder="192.168.1.x" class="flex-1" />
						</div>
					</div>
					<div
						class="form-row flex flex-col md:flex-row items-start md:items-center gap-y-1 gap-x-6 min-h-10 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors">
						<span class="font-mono text-sm text-(--color-text-secondary) min-w-0 md:w-1/3 break-all">
							{{ $t('macAddress') }}
						</span>
						<div class="flex-1">
							<UInput v-model="cloneclient.target.hardwareAddress" :disabled="loading" size="sm"
								placeholder="00:11:22:33:44:55" class="flex-1" />
						</div>
					</div>
					<div
						class="form-row flex flex-col md:flex-row items-start md:items-center gap-y-1 gap-x-6 min-h-10 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors">
						<span class="font-mono text-sm text-(--color-text-secondary) min-w-0 md:w-1/3 break-all">
							{{ $t('systemUUID') }}
						</span>
						<div class="flex-1">
							<UInput v-model="cloneclient.target.systemUUID" :disabled="loading" size="sm"
								placeholder="UUID" class="flex-1" />
						</div>
					</div>
				</div>
			</div>

			<!-- Clone Options Section -->
			<div class="mb-6">
				<div class="flex items-center justify-between mb-3">
					<p class="text-sm font-semibold uppercase tracking-wide text-muted">{{ $t('cloneOptions') }}</p>
				</div>
				<div class="mb-6">
					<div
						class="form-row flex flex-col md:flex-row items-start md:items-center gap-y-1 gap-x-6 min-h-10 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors">
						<span class="font-mono text-sm text-(--color-text-secondary) min-w-0 md:w-1/3 break-all">
							{{ $t('configs') }}
						</span>
						<div class="flex-1 flex items-center gap-2 min-w-0">
							<UCheckbox v-model="cloneclient.options.configs" :disabled="loading" />
						</div>
					</div>
					<div
						class="form-row flex flex-col md:flex-row items-start md:items-center gap-y-1 gap-x-6 min-h-10 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors">
						<span class="font-mono text-sm text-(--color-text-secondary) min-w-0 md:w-1/3 break-all">
							{{ $t('products') }}
						</span>
						<div class="flex-1 flex items-center gap-2 min-w-0">
							<UCheckbox v-model="cloneclient.options.products" :disabled="loading" />
						</div>
					</div>
					<div
						class="form-row flex flex-col md:flex-row items-start md:items-center gap-y-1 gap-x-6 min-h-10 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors">
						<span class="font-mono text-sm text-(--color-text-secondary) min-w-0 md:w-1/3 break-all">
							{{ $t('productProperties') }}
						</span>
						<div class="flex-1 flex items-center gap-2 min-w-0">
							<UCheckbox v-model="cloneclient.options.productProperties" :disabled="loading" />
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { ref, reactive, watch, onMounted } from 'vue'
import { useSelectionStore } from '~/stores/selectionStore'

const { t: $t } = useI18n()
const { getClientIds, cloneClient: cloneClientApi } = useApiHelpers()
const selectionStore = useSelectionStore()
const props = defineProps<{
	sourceId: string
	panelMode?: boolean
	showSourceInPanel?: boolean
}>()

const emit = defineEmits(['saved', 'has-changes'])

const loading = ref(false)
const error = ref<string | null>(null)
const success = ref(false)

const clientName = ref('')
const domain = ref('')
const clientIds = ref<string[]>([])

const cloneclient = reactive({
	target: {
		hostId: '',
		ipAddress: '',
		hardwareAddress: '',
		systemUUID: ''
	},
	options: {
		configs: true,
		products: true,
		productProperties: false
	}
})

function getDefaultDomain(id: string) {
	const idx = id.indexOf('.')
	return idx > 0 ? id.substring(idx) : ''
}

// Set domain default from sourceId
onMounted(() => {
	domain.value = getDefaultDomain(props.sourceId)
	fetchClientIds()
})

async function fetchClientIds() {
	const depots = selectionStore.selectedDepots
	const result = await getClientIds(depots)
	clientIds.value = result.data || []
}

// Validation
const formErrors = reactive({ newId: '' })
watch([clientName, domain], () => {
	formErrors.newId = ''
	if (!clientName.value) return
	const fqdn = clientName.value + domain.value
	if (clientIds.value.includes(fqdn)) {
		formErrors.newId = $t('message.formvalid.clientExists')
	}
})

function checkValid() {
	return (
		clientName.value.length > 0 &&
		!Number.isInteger(parseInt(clientName.value.charAt(0))) &&
		!clientIds.value.includes(clientName.value + domain.value)
	)
}

async function cloneClient() {
	if (!checkValid()) {
		error.value = $t('message.formvalid.clientExists')
		return
	}
	loading.value = true
	error.value = null
	success.value = false
	cloneclient.target.hostId = clientName.value + domain.value
	try {
		const res = await cloneClientApi(
			props.sourceId,
			cloneclient.target,
			cloneclient.options
		)
		if (res.error) throw res.error
		success.value = true
		refresh()
		emit('saved')
	} catch (e: any) {
		error.value = e?.message || $t('failedToCloneClient')
	} finally {
		loading.value = false
	}
}

function refresh() {
	clientName.value = ''
	domain.value = getDefaultDomain(props.sourceId)
	cloneclient.target = {
		hostId: '',
		ipAddress: '',
		hardwareAddress: '',
		systemUUID: ''
	}
	cloneclient.options = {
		configs: true,
		products: true,
		productProperties: false
	}
	formErrors.newId = ''
	error.value = null
	success.value = false
}

defineExpose({
	refresh,
	cloneClient
})
</script>