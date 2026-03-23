ClientsAddForm - add client form for panel mode with all options.
<template>
	<div :class="['space-y-4', panelMode ? 'h-full overflow-y-auto p-2' : '']">
		<UAlert v-if="success" color="success" :title="String($t('success'))"
			:close-button="{ icon: 'i-heroicons-x-mark' }" @close="success = false">
			<template #description>{{ $t('clientCreatedSuccessfully') }}</template>
		</UAlert>
		<UAlert v-if="error" color="error" :title="String($t('error'))" :description="error"
			:close-button="{ icon: 'i-heroicons-x-mark' }" @close="error = null" />

		<div class="shrink-0 flex justify-end gap-2 mb-2">
			<UTooltip :text="$t('addClient')">
				<UButton color="success" :loading="loading" :disabled="!canCreate" @click="handleSubmit">
					<UIcon :name="icons.add" />
				</UButton>
			</UTooltip>
		</div>

		<div class="space-y-6 bg-(--color-background) dark:bg-(--color-background-dark)">
			<div class="mb-6">
				<p class="text-sm font-semibold uppercase tracking-wide text-muted mb-3">{{ $t('newClient') }}</p>
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
						<div v-if="formErrors.clientId" class="text-xs text-error">{{ formErrors.clientId }}</div>
					</div>
				</div>
				<div
					class="form-row flex flex-col md:flex-row items-start md:items-center gap-y-1 gap-x-6 min-h-10 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors">
					<span class="font-mono text-sm text-(--color-text-secondary) min-w-0 md:w-1/3 break-all">{{
						$t('description') }}</span>
					<div class="flex-1">
						<UInput v-model="form.description" :disabled="loading" size="sm"
							placeholder="Client description" class="flex-1" />
					</div>
				</div>
				<div
					class="form-row flex flex-col md:flex-row items-start md:items-center gap-y-1 gap-x-6 min-h-10 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors">
					<span class="font-mono text-sm text-(--color-text-secondary) min-w-0 md:w-1/3 break-all">{{
						$t('ipAddress')
					}}</span>
					<div class="flex-1">
						<UInput v-model="form.ipAddress" :disabled="loading" size="sm" placeholder="192.168.1.x"
							class="flex-1" />
					</div>
				</div>
				<div
					class="form-row flex flex-col md:flex-row items-start md:items-center gap-y-1 gap-x-6 min-h-10 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors">
					<span class="font-mono text-sm text-(--color-text-secondary) min-w-0 md:w-1/3 break-all">{{
						$t('macAddress')
					}}</span>
					<div class="flex-1">
						<UInput v-model="form.macAddress" :disabled="loading" size="sm" placeholder="00:11:22:33:44:55"
							class="flex-1" />
					</div>
				</div>
				<div
					class="form-row flex flex-col md:flex-row items-start md:items-center gap-y-1 gap-x-6 min-h-10 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors">
					<span class="font-mono text-sm text-(--color-text-secondary) min-w-0 md:w-1/3 break-all">{{
						$t('inventoryNumber') }}</span>
					<div class="flex-1">
						<UInput v-model="form.inventoryNumber" :disabled="loading" size="sm" placeholder="INV-001"
							class="flex-1" />
					</div>
				</div>
				<div
					class="form-row flex flex-col md:flex-row items-start md:items-center gap-y-1 gap-x-6 min-h-10 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors">
					<span class="font-mono text-sm text-(--color-text-secondary) min-w-0 md:w-1/3 break-all">{{
						$t('notes') }}</span>
					<div class="flex-1">
						<UInput v-model="form.notes" :disabled="loading" size="sm" placeholder="Notes" class="flex-1" />
					</div>
				</div>
			</div>

			<div class="mb-6">
				<p class="text-sm font-semibold uppercase tracking-wide text-muted mb-3">{{ $t('assignments') }}</p>
				<div
					class="form-row flex flex-col md:flex-row items-start md:items-center gap-y-1 gap-x-6 min-h-10 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors">
					<span class="font-mono text-sm text-(--color-text-secondary) min-w-0 md:w-1/3 break-all">
						{{ $t('depot') }} <span class="text-error">*</span>
					</span>
					<div class="flex-1">
						<USelect v-model="form.depotId" :items="depotOptions" :loading="loadingDepots"
							:disabled="loading" size="sm" class="w-full" />
						<div v-if="formErrors.depotId" class="text-xs text-error">{{ formErrors.depotId }}</div>
					</div>
				</div>
				<div
					class="form-row flex flex-col md:flex-row items-start md:items-center gap-y-1 gap-x-6 min-h-10 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors">
					<span class="font-mono text-sm text-(--color-text-secondary) min-w-0 md:w-1/3 break-all">{{
						$t('groups') }}</span>
					<div class="flex-1">
						<div v-if="loadingGroups" class="text-xs text-(--color-text-muted)">{{ $t('loading') }}...</div>
						<div v-else class="space-y-1 max-h-32 overflow-y-auto">
							<label v-for="group in availableGroups" :key="group"
								class="flex items-center gap-2 p-1 rounded hover:bg-(--color-surface-hover) cursor-pointer text-xs">
								<input type="checkbox" :value="group" v-model="form.groups"
									class="rounded border-gray-300 text-opsi-blue focus:ring-opsi-blue"
									:disabled="loading" />
								{{ group }}
							</label>
						</div>
						<p v-if="availableGroups.length === 0 && !loadingGroups"
							class="text-xs text-(--color-text-muted)">
							{{ $t('noGroupsAvailable') }}
						</p>
					</div>
				</div>
			</div>

			<div class="mb-6">
				<p class="text-sm font-semibold uppercase tracking-wide text-muted mb-3">{{ $t('initialSetup') }}</p>
				<div
					class="form-row flex flex-col md:flex-row items-start md:items-center gap-y-1 gap-x-6 min-h-10 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors">
					<span class="font-mono text-sm text-(--color-text-secondary) min-w-0 md:w-1/3 break-all">UEFI</span>
					<div class="flex-1">
						<label class="flex items-center gap-2 cursor-pointer">
							<input type="checkbox" v-model="form.uefi"
								class="rounded border-gray-300 text-opsi-blue focus:ring-opsi-blue"
								:disabled="loading" />
							<span class="text-xs">{{ $t('enableUefi') }}</span>
						</label>
					</div>
				</div>
				<div
					class="form-row flex flex-col md:flex-row items-start md:items-center gap-y-1 gap-x-6 min-h-10 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors">
					<span class="font-mono text-sm text-(--color-text-secondary) min-w-0 md:w-1/3 break-all">{{
						$t('netbootProduct') }}</span>
					<div class="flex-1">
						<USelect v-model="form.netbootProductId" :items="netbootProductOptions"
							:loading="loadingNetboot" :disabled="loading" size="sm" class="w-full"
							:placeholder="$t('selectNetbootProduct')" />
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { useSelectionStore } from '~/stores/selectionStore'

defineProps<{
	panelMode?: boolean
}>()

const emit = defineEmits<{
	saved: []
}>()

const icons = useIcons()
const { t: $t } = useI18n()
const { createClient, getServers, getClientIds, getHostGroupIds, getProducts, setClientUefi, addClientToGroups, setClientProductActions } = useApiHelpers()
const selectionStore = useSelectionStore()

const loading = ref(false)
const loadingDepots = ref(false)
const loadingGroups = ref(false)
const loadingNetboot = ref(false)
const error = ref<string | null>(null)
const success = ref(false)

const clientName = ref('')
const domain = ref('')
const clientIds = ref<string[]>([])
const availableGroups = ref<string[]>([])
const netbootProducts = ref<Array<{ productId: string }>>([])

const form = reactive({
	description: '',
	depotId: '',
	ipAddress: '',
	macAddress: '',
	inventoryNumber: '',
	notes: '',
	groups: [] as string[],
	uefi: false,
	netbootProductId: '',
})

const formErrors = reactive({ clientId: '', depotId: '' })
const depots = ref<Array<{ depotId: string; description: string }>>([])

const depotOptions = computed(() => depots.value.map(d => ({
	label: d.description ? `${d.depotId} - ${d.description}` : d.depotId,
	value: d.depotId,
})))

const netbootProductOptions = computed(() => [
	{ label: String($t('none')), value: '' },
	...netbootProducts.value.map(p => ({ label: p.productId, value: p.productId }))
])

const canCreate = computed(() =>
	clientName.value.length > 0 &&
	!Number.isInteger(parseInt(clientName.value.charAt(0))) &&
	!clientIds.value.includes(clientName.value + domain.value) &&
	form.depotId &&
	!loading.value
)

onMounted(async () => {
	loadingDepots.value = true
	try {
		const res = await getServers()
		if (res.data) {
			depots.value = res.data
			if (selectionStore.selectedServers.length > 0) form.depotId = selectionStore.selectedServers[0] ?? ''
			else if (depots.value.length > 0) form.depotId = depots.value[0]?.depotId ?? ''
		}
	} finally { loadingDepots.value = false }
	if (form.depotId) {
		const idx = form.depotId.indexOf('.')
		domain.value = idx > 0 ? form.depotId.substring(idx) : '.local'
	}
	const result = await getClientIds(form.depotId ? [form.depotId] : selectionStore.selectedServers)
	clientIds.value = result.data || []

	loadingGroups.value = true
	try {
		const groupRes = await getHostGroupIds()
		if (groupRes.data) availableGroups.value = groupRes.data
	} finally { loadingGroups.value = false }

	loadingNetboot.value = true
	try {
		const selectedServers = form.depotId ? [form.depotId] : selectionStore.selectedServers
		const nbRes = await getProducts({ type: 'NetbootProduct', selectedDepots: `[${selectedServers.join(',')}]` })
		if (nbRes.data) {
			const seen = new Set<string>()
			netbootProducts.value = (nbRes.data as Array<{ productId: string }>).filter(p => {
				if (seen.has(p.productId)) return false
				seen.add(p.productId)
				return true
			})
		}
	} finally { loadingNetboot.value = false }
})

watch([clientName, domain], () => {
	formErrors.clientId = ''
	if (!clientName.value) return
	if (Number.isInteger(parseInt(clientName.value.charAt(0)))) {
		formErrors.clientId = $t('message.formvalid.clientNameCannotStartWithNumber')
		return
	}
	if (clientIds.value.includes(clientName.value + domain.value)) {
		formErrors.clientId = $t('message.formvalid.clientExists')
	}
})

async function handleSubmit() {
	formErrors.clientId = ''
	formErrors.depotId = ''
	if (!clientName.value.trim()) { formErrors.clientId = String($t('clientIdRequired')); return }
	if (!form.depotId) { formErrors.depotId = String($t('depotRequired')); return }

	loading.value = true
	error.value = null
	try {
		const hostId = clientName.value + domain.value
		const res = await createClient({
			client: {
				hostId,
				description: form.description.trim() || undefined,
				inventoryNumber: form.inventoryNumber.trim() || undefined,
				hardwareAddress: form.macAddress.trim() || null,
				ipAddress: form.ipAddress.trim() || null,
				notes: form.notes.trim() || null,
			},
			depot: form.depotId,
		})
		if (res.error) throw res.error

		// Post-creation setup
		if (form.uefi) {
			await setClientUefi(hostId, true).catch(() => { })
		}
		if (form.groups.length > 0) {
			await addClientToGroups(hostId, form.groups).catch(() => { })
		}
		if (form.netbootProductId) {
			await setClientProductActions({
				clientIds: [hostId],
				productIds: [form.netbootProductId],
				actionRequest: 'setup',
			}).catch(() => { })
		}

		success.value = true
		clientIds.value.push(hostId)
		emit('saved')
	} catch (e: unknown) {
		error.value = e instanceof Error ? e.message : String($t('errorCreatingClient'))
	} finally { loading.value = false }
}
</script>
