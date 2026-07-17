<!--
  This file is part of opsi-webgui application.
  opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
  Copyright (c) uib GmbH <info@uib.de> 2026
  All rights reserved.
  License: AGPL-3.0

  ClientsCloneForm - Form for cloning an existing client to a new client.
-->
<template>
	<CoreAppNavigationGuardModal v-model="showLeaveWarning" @cancel="cancelLeave" @confirm="confirmLeave" />

	<div v-if="!canCreateClients || isReadOnly" class="flex items-center justify-center h-full p-8">
		<CoreAppAlertInline color="warning" :title="$t('auth.permissionDenied')">
			<template #description>{{ isReadOnly ? $t('opsiConfig.serverFeatures.readOnly.disabled') :
				$t('opsiConfig.serverFeatures.clientCreation.disabled') }}</template>
		</CoreAppAlertInline>
	</div>
	<template v-else>
		<div class="shrink-0 pb-3 sticky top-0 z-10 bg-(--color-surface) mb-3">
			<div class="flex flex-wrap items-center gap-3">
				<div v-if="showSourceSelector" class="flex items-center gap-2">
					<slot name="sourceSelector">
						<HostsSelector v-model="sourceSelectorModel" type="client"
							:placeholder="sourceSelectorPlaceholder" :allow-all="false" allow-clear />
					</slot>
				</div>
				<div class="flex-1" />
				<div class="flex flex-wrap items-center gap-2">
					<CoreAppButton v-if="resolvedSourceId" color="success" :loading="loading"
						:title="String($t('clients.clone.title'))" @click="cloneClient">
						<CoreAppIcon :name="icons.clone" /> {{ $t('clients.clone.title') }}
					</CoreAppButton>
					<CoreAppButton :icon="icons.refresh" color="primary" variant="outline" size="sm"
						:title="String($t('common.refresh'))" @click="refresh" />
				</div>
			</div>
		</div>

		<CoreAppEmptyState v-if="!resolvedSourceId && !loading" :icon="icons.client"
			:message="String($t('clients.selectClone'))" class="flex-1" />

		<div v-else :class="['flex-1 overflow-y-auto space-y-4']">
			<CoreAppAlertInline v-if="success" color="success" :title="String($t('common.success'))" closable
				@close="success = false">
				<template #description>{{ $t('clients.clone.ok') }}</template>
			</CoreAppAlertInline>
			<CoreAppAlertInline v-if="error" color="error" :title="String($t('common.error'))" :description="error"
				closable @close="error = null" />

			<div v-if="!panelMode || showSourceInPanel" class="opsi-card">
				<div
					class="form-row flex flex-col md:flex-row items-start md:items-center gap-y-1 gap-x-6 min-h-10 hover:bg-(--color-surface-hover) rounded transition-colors">
					<span class="text-sm text-(--color-text) min-w-0 md:w-1/3 break-all">
						{{ $t('clients.clone.source') }}
					</span>
					<span class="text-sm flex-1 truncate" :title="resolvedSourceId || undefined">
						{{ resolvedSourceId }}
					</span>
				</div>
			</div>

			<div class="opsi-card">
				<div class="flex items-center justify-between mb-3">
					<h4 class="text-xs font-heading uppercase tracking-wide m-0">{{ $t('clients.create.title') }}</h4>
				</div>
				<div>
					<div
						class="form-row flex flex-col md:flex-row items-start md:items-center gap-y-1 gap-x-6 min-h-10 hover:bg-(--color-surface-hover) rounded transition-colors">
						<span class="text-sm min-w-0 md:w-1/3 break-all">
							{{ $t('clients.id') }} <span class="text-error">*</span>
						</span>
						<div class="flex-1 flex flex-col items-start gap-1 min-w-0">
							<div class="flex items-center gap-2 w-full">
								<CoreAppInput v-model="clientName" :disabled="loading" size="sm"
									:placeholder="String($t('fields.hostname.enter'))" class="flex-1" />
								<CoreAppInput v-model="domain" :disabled="loading" size="sm"
									:placeholder="String($t('fields.domainExample'))" class="flex-1" />
							</div>
							<div v-if="formErrors.newId" class="text-xs text-error">
								{{ formErrors.newId }}
							</div>
						</div>
					</div>
					<div
						class="form-row flex flex-col md:flex-row items-start md:items-center gap-y-1 gap-x-6 min-h-10 hover:bg-(--color-surface-hover) rounded transition-colors">
						<span class="text-sm min-w-0 md:w-1/3 break-all">
							{{ $t('fields.ip') }}
						</span>
						<div class="flex-1">
							<CoreAppInput v-model="cloneclient.target.ipAddress" :disabled="loading" size="sm"
								:placeholder="String($t('fields.ipExample'))" class="w-full" />
						</div>
					</div>
					<div
						class="form-row flex flex-col md:flex-row items-start md:items-center gap-y-1 gap-x-6 min-h-10 hover:bg-(--color-surface-hover) rounded transition-colors">
						<span class="text-sm min-w-0 md:w-1/3 break-all">
							{{ $t('fields.mac') }}
						</span>
						<div class="flex-1">
							<CoreAppInput v-model="cloneclient.target.hardwareAddress" :disabled="loading" size="sm"
								:placeholder="String($t('fields.macExample'))" class="w-full" />
						</div>
					</div>
					<div
						class="form-row flex flex-col md:flex-row items-start md:items-center gap-y-1 gap-x-6 min-h-10 hover:bg-(--color-surface-hover) rounded transition-colors">
						<span class="text-sm min-w-0 md:w-1/3 break-all">
							{{ $t('fields.uuid') }}
						</span>
						<div class="flex-1">
							<CoreAppInput v-model="cloneclient.target.systemUUID" :disabled="loading" size="sm"
								:placeholder="String($t('fields.uuidExample'))" class="w-full" />
						</div>
					</div>
				</div>
			</div>

			<div class="opsi-card h-full">
				<div class="flex items-center justify-between mb-3">
					<h4 class="text-xs font-heading uppercase tracking-wide m-0">{{ $t('clients.clone.options') }}</h4>
				</div>
				<div>
					<button type="button"
						class="form-row w-full text-left flex flex-col md:flex-row items-start md:items-center gap-y-1 gap-x-6 min-h-10 hover:bg-(--color-surface-hover) rounded transition-colors cursor-pointer"
						@click="cloneclient.options.configs = !cloneclient.options.configs">
						<span class="text-sm min-w-0 md:w-1/3 break-all">
							{{ $t('config.items') }}
						</span>
						<div class="flex-1 flex items-center gap-2 min-w-0">
							<CoreAppCheckbox v-model="cloneclient.options.configs" :disabled="loading" @click.stop />
						</div>
					</button>
					<button type="button"
						class="form-row w-full text-left flex flex-col md:flex-row items-start md:items-center gap-y-1 gap-x-6 min-h-10 hover:bg-(--color-surface-hover) rounded transition-colors cursor-pointer"
						@click="cloneclient.options.products = !cloneclient.options.products">
						<span class="text-sm min-w-0 md:w-1/3 break-all">
							{{ $t('products.title') }}
						</span>
						<div class="flex-1 flex items-center gap-2 min-w-0">
							<CoreAppCheckbox v-model="cloneclient.options.products" :disabled="loading" @click.stop />
						</div>
					</button>
					<button type="button"
						class="form-row w-full text-left flex flex-col md:flex-row items-start md:items-center gap-y-1 gap-x-6 min-h-10 hover:bg-(--color-surface-hover) rounded transition-colors cursor-pointer"
						@click="cloneclient.options.productProperties = !cloneclient.options.productProperties">
						<span class="text-sm min-w-0 md:w-1/3 break-all">
							{{ $t('products.properties') }}
						</span>
						<div class="flex-1 flex items-center gap-2 min-w-0">
							<CoreAppCheckbox v-model="cloneclient.options.productProperties" :disabled="loading" @click.stop />
						</div>
					</button>
				</div>
			</div>
		</div>
	</template>
</template>

<script setup lang="ts">
import { useSelectionStore } from '~/stores/selectionStore'

const { canCreateClients, isReadOnly } = useUserPermissions()
const icons = useIcons()
const { t: $t } = useI18n()
const { getClientIds, cloneClient: cloneClientApi } = useApiHelpers()
const selectionStore = useSelectionStore()
const props = defineProps<{
	sourceId?: string | null
	panelMode?: boolean
	showSourceInPanel?: boolean
	showSourceSelector?: boolean
	sourceSelectorPlaceholder?: string
}>()

const emit = defineEmits(['saved', 'has-changes', 'update:sourceId'])

const sourceSelectorModel = ref<string>(props.sourceId || '')
watch(() => props.sourceId, (v) => { sourceSelectorModel.value = v || '' })
watch(sourceSelectorModel, (v) => emit('update:sourceId', v || null))

const resolvedSourceId = computed(() => props.sourceId || (props.showSourceSelector ? sourceSelectorModel.value : null))

const loading = ref(false)
const error = ref<string | null>(null)
const success = ref(false)

const clientName = ref('')
const domain = ref('')
const clientIds = ref<string[]>([])

const showLeaveWarning = ref(false)
let resolveLeave: ((ok: boolean) => void) | null = null

const hasChanges = computed(() => clientName.value.length > 0)

// Only register route-leave guard when NOT in panel mode.
// In panel mode the parent page handles navigation guards.
if (!props.panelMode) {
	onBeforeRouteLeave(() => {
		if (!hasChanges.value) return true
		showLeaveWarning.value = true
		return new Promise<boolean>((resolve) => {
			resolveLeave = resolve
		})
	})
}

function confirmLeave() {
	showLeaveWarning.value = false
	resolveLeave?.(true)
	resolveLeave = null
}

function cancelLeave() {
	showLeaveWarning.value = false
	resolveLeave?.(false)
	resolveLeave = null
}

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

onMounted(() => {
	if (resolvedSourceId.value) domain.value = getDefaultDomain(resolvedSourceId.value)
	fetchClientIds()
})

async function fetchClientIds() {
	const depots = selectionStore.selectedServers
	const result = await getClientIds(depots)
	clientIds.value = result.data || []
}

const formErrors = reactive({ newId: '' })
watch([clientName, domain], () => {
	formErrors.newId = ''
	if (!clientName.value) return
	const fqdn = clientName.value + domain.value
	if (clientIds.value.includes(fqdn)) {
		formErrors.newId = $t('clients.validation.exists')
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
	if (!resolvedSourceId.value || !checkValid()) {
		error.value = $t('clients.validation.exists')
		return
	}
	loading.value = true
	error.value = null
	success.value = false
	cloneclient.target.hostId = clientName.value + domain.value
	try {
		const res = await cloneClientApi(
			resolvedSourceId.value,
			cloneclient.target,
			cloneclient.options
		)
		if (res.error) throw res.error
		success.value = true
		refresh()
		emit('saved')
	} catch (e: unknown) {
		error.value = (e instanceof Error ? e.message : '') || $t('clients.clone.err')
	} finally {
		loading.value = false
	}
}

function refresh() {
	clientName.value = ''
	domain.value = resolvedSourceId.value ? getDefaultDomain(resolvedSourceId.value) : ''
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
	cloneClient,
	hasChanges,
})
</script>