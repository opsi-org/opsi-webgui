ClientCloneForm - form for cloning a client. Supports standalone page and detail panel modes.
<template>
	<SharedNavigationGuardModal v-model="showLeaveWarning" @cancel="cancelLeave" @confirm="confirmLeave" />

	<div :class="['flex flex-col', panelMode ? 'h-full' : 'h-full min-h-0']">
		<div class="shrink-0 pb-3">
			<div class="flex flex-wrap items-center gap-3">
				<div v-if="showSourceSelector" class="flex items-center gap-2">
					<slot name="sourceSelector">
						<HostsSelector v-model="sourceSelectorModel" type="client"
							:placeholder="sourceSelectorPlaceholder" :allow-all="false" allow-clear />
					</slot>
				</div>
				<div class="flex-1" />
				<div class="flex flex-wrap items-center gap-2">
					<UTooltip :text="$t('cloneClient')">
						<UButton v-if="resolvedSourceId" color="success" :loading="loading" @click="cloneClient">
							<UIcon :name="icons.clone" />
						</UButton>
					</UTooltip>
					<UTooltip :text="$t('refresh')">
						<UButton :icon="icons.refresh" color="neutral" variant="ghost" size="sm" @click="refresh" />
					</UTooltip>
				</div>
			</div>
		</div>

		<div v-if="!resolvedSourceId && !loading" class="p-8 text-center rounded-lg flex-1">
			<UIcon :name="icons.client" class="w-12 h-12 mx-auto mb-3 opacity-50 text-muted" />
			<p class="text-muted">{{ $t('selectClientToClone') }}</p>
		</div>

		<div v-else :class="['flex-1 overflow-y-auto space-y-4']">
			<SharedAlertInline v-if="success" color="success" :title="String($t('success'))" closable
				@close="success = false">
				<template #description>{{ $t('clientClonedSuccessfully') }}</template>
			</SharedAlertInline>
			<SharedAlertInline v-if="error" color="error" :title="String($t('error'))" :description="error" closable
				@close="error = null" />

			<div class="space-y-6 bg-(--color-background) dark:bg-(--color-background-dark)">
				<div v-if="!panelMode || showSourceInPanel" class="mb-6">
					<div
						class="form-row flex flex-col md:flex-row items-start md:items-center gap-y-1 gap-x-6 min-h-10 hover:bg-(--color-surface-hover) rounded transition-colors">
						<span class="text-sm text-(--color-text) min-w-0 md:w-1/3 break-all">
							{{ $t('sourceClient') }}
						</span>
						<span class="text-sm flex-1 truncate" :title="resolvedSourceId || undefined">
							{{ resolvedSourceId }}
						</span>
					</div>
				</div>

				<div class="mb-6">
					<div class="flex items-center justify-between mb-3">
						<h4 class="text-xs m-0">{{ $t('newClient') }}</h4>
					</div>
					<div class="mb-6">
						<div
							class="form-row flex flex-col md:flex-row items-start md:items-center gap-y-1 gap-x-6 min-h-10 hover:bg-(--color-surface-hover) rounded transition-colors">
							<span class="text-sm min-w-0 md:w-1/3 break-all">
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
						<div
							class="form-row flex flex-col md:flex-row items-start md:items-center gap-y-1 gap-x-6 min-h-10 hover:bg-(--color-surface-hover) rounded transition-colors">
							<span class="text-sm min-w-0 md:w-1/3 break-all">
								{{ $t('ipAddress') }}
							</span>
							<div class="flex-1">
								<UInput v-model="cloneclient.target.ipAddress" :disabled="loading" size="sm"
									placeholder="192.168.1.x" class="flex-1" />
							</div>
						</div>
						<div
							class="form-row flex flex-col md:flex-row items-start md:items-center gap-y-1 gap-x-6 min-h-10 hover:bg-(--color-surface-hover) rounded transition-colors">
							<span class="text-sm min-w-0 md:w-1/3 break-all">
								{{ $t('macAddress') }}
							</span>
							<div class="flex-1">
								<UInput v-model="cloneclient.target.hardwareAddress" :disabled="loading" size="sm"
									placeholder="00:11:22:33:44:55" class="flex-1" />
							</div>
						</div>
						<div
							class="form-row flex flex-col md:flex-row items-start md:items-center gap-y-1 gap-x-6 min-h-10 hover:bg-(--color-surface-hover) rounded transition-colors">
							<span class="text-sm min-w-0 md:w-1/3 break-all">
								{{ $t('systemUUID') }}
							</span>
							<div class="flex-1">
								<UInput v-model="cloneclient.target.systemUUID" :disabled="loading" size="sm"
									placeholder="UUID" class="flex-1" />
							</div>
						</div>
					</div>
				</div>

				<div class="mb-6">
					<div class="flex items-center justify-between mb-3">
						<h4 class="text-xs m-0">{{ $t('cloneOptions') }}</h4>
					</div>
					<div class="mb-6">
						<div
							class="form-row flex flex-col md:flex-row items-start md:items-center gap-y-1 gap-x-6 min-h-10 hover:bg-(--color-surface-hover) rounded transition-colors">
							<span class="text-sm min-w-0 md:w-1/3 break-all">
								{{ $t('configs') }}
							</span>
							<div class="flex-1 flex items-center gap-2 min-w-0">
								<UCheckbox v-model="cloneclient.options.configs" :disabled="loading" />
							</div>
						</div>
						<div
							class="form-row flex flex-col md:flex-row items-start md:items-center gap-y-1 gap-x-6 min-h-10 hover:bg-(--color-surface-hover) rounded transition-colors">
							<span class="text-sm min-w-0 md:w-1/3 break-all">
								{{ $t('products') }}
							</span>
							<div class="flex-1 flex items-center gap-2 min-w-0">
								<UCheckbox v-model="cloneclient.options.products" :disabled="loading" />
							</div>
						</div>
						<div
							class="form-row flex flex-col md:flex-row items-start md:items-center gap-y-1 gap-x-6 min-h-10 hover:bg-(--color-surface-hover) rounded transition-colors">
							<span class="text-sm min-w-0 md:w-1/3 break-all">
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
	</div>
</template>

<script setup lang="ts">
import { ref, reactive, watch, onMounted } from 'vue'
import { useSelectionStore } from '~/stores/selectionStore'

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
	if (!resolvedSourceId.value || !checkValid()) {
		error.value = $t('message.formvalid.clientExists')
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
	} catch (e: any) {
		error.value = e?.message || $t('failedToCloneClient')
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