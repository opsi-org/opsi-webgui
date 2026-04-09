ClientsAddForm - add client form for panel mode with all options.
<template>
	<div class="flex flex-col h-full">
		<div
			class="shrink-0 sticky top-0 z-10 bg-(--color-background) dark:bg-(--color-background) px-2 py-2 border-b border-(--color-border)">
			<div class="flex items-center justify-between">
				<SharedAlertInline v-if="success" color="success" :title="String($t('success'))" class="flex-1 mr-2">
					<template #description>{{ $t('clientCreatedSuccessfully') }}</template>
				</SharedAlertInline>
				<SharedAlertInline v-else-if="error" color="error" :title="String($t('error'))" :description="error"
					closable class="flex-1 mr-2" @close="error = null" />
				<div v-else />
				<div class="flex gap-2 shrink-0">
					<UTooltip :text="$t('addClient')">
						<UButton color="success" :loading="loading" :disabled="!canCreate" @click="handleSubmit">
							<UIcon :name="icons.client" />
							<UIcon :name="icons.add" />
						</UButton>
					</UTooltip>
					<UTooltip :text="$t('reset')">
						<UButton variant="ghost" color="neutral" :icon="icons.refresh" :disabled="loading"
							@click="resetForm" />
					</UTooltip>
				</div>
			</div>
		</div>

		<div class="flex-1 overflow-y-auto p-2">
			<div class="mb-6">
				<div class="flex items-center justify-between mb-3">
					<h4 class="text-sm font-semibold m-0">{{ $t('newClient') }}</h4>
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
							<div v-if="formErrors.clientId" class="text-xs text-error">{{ formErrors.clientId }}</div>
						</div>
					</div>
					<div
						class="form-row flex flex-col md:flex-row items-start md:items-center gap-y-1 gap-x-6 min-h-10 hover:bg-(--color-surface-hover) rounded transition-colors">
						<span class="text-sm min-w-0 md:w-1/3 break-all">
							{{ $t('description') }}
						</span>
						<div class="flex-1">
							<UInput v-model="form.description" :disabled="loading" size="sm"
								placeholder="Client description" class="flex-1" />
						</div>
					</div>
					<div
						class="form-row flex flex-col md:flex-row items-start md:items-center gap-y-1 gap-x-6 min-h-10 hover:bg-(--color-surface-hover) rounded transition-colors">
						<span class="text-sm min-w-0 md:w-1/3 break-all">
							{{ $t('inventoryNumber') }}
						</span>
						<div class="flex-1">
							<UInput v-model="form.inventoryNumber" :disabled="loading" size="sm"
								placeholder="Inventory number" class="flex-1" />
						</div>
					</div>
					<div
						class="form-row flex flex-col md:flex-row items-start md:items-center gap-y-1 gap-x-6 min-h-10 hover:bg-(--color-surface-hover) rounded transition-colors">
						<span class="text-sm min-w-0 md:w-1/3 break-all">
							{{ $t('ipAddress') }}
						</span>
						<div class="flex-1">
							<UInput v-model="form.ipAddress" :disabled="loading" size="sm" placeholder="192.168.1.x"
								class="flex-1" />
						</div>
					</div>
					<div
						class="form-row flex flex-col md:flex-row items-start md:items-center gap-y-1 gap-x-6 min-h-10 hover:bg-(--color-surface-hover) rounded transition-colors">
						<span class="text-sm min-w-0 md:w-1/3 break-all">
							{{ $t('macAddress') }}
						</span>
						<div class="flex-1">
							<UInput v-model="form.macAddress" :disabled="loading" size="sm"
								placeholder="00:11:22:33:44:55" class="flex-1" />
						</div>
					</div>
					<div
						class="form-row flex flex-col md:flex-row items-start md:items-center gap-y-1 gap-x-6 min-h-10 hover:bg-(--color-surface-hover) rounded transition-colors">
						<span class="text-sm min-w-0 md:w-1/3 break-all">
							{{ $t('notes') }}
						</span>
						<div class="flex-1">
							<UTextarea v-model="form.notes" :disabled="loading" size="sm" :rows="3"
								placeholder="Additional notes" class="flex-1 w-full" />
						</div>
					</div>
				</div>
			</div>

			<div class="mb-6">
				<div class="flex items-center justify-between mb-3">
					<h4 class="text-sm font-semibold m-0">{{ $t('assignments') }}</h4>
				</div>
				<div class="mb-6">
					<div
						class="form-row flex flex-col md:flex-row items-start md:items-center gap-y-1 gap-x-6 min-h-10 hover:bg-(--color-surface-hover) rounded transition-colors">
						<span class="text-sm min-w-0 md:w-1/3 break-all">
							{{ $t('depot') }} <span class="text-error">*</span>
						</span>
						<div class="flex-1 flex flex-col items-start gap-1 min-w-0">
							<USelect v-model="form.depotId" :items="depotOptions" :loading="loadingDepots"
								:disabled="loading" size="sm" class="w-full" />
							<div v-if="formErrors.depotId" class="text-xs text-error">{{ formErrors.depotId }}</div>
						</div>
					</div>
					<div
						class="form-row flex flex-col md:flex-row items-start md:items-center gap-y-1 gap-x-6 min-h-10 hover:bg-(--color-surface-hover) rounded transition-colors">
						<span class="text-sm min-w-0 md:w-1/3 break-all">
							{{ $t('groups') }}
						</span>
						<div class="flex-1 flex items-center gap-2 min-w-0">
							<USelectMenu v-model="form.groups" :items="groupOptions" multiple :disabled="loading"
								size="sm" class="w-full" />
						</div>
					</div>
				</div>
			</div>

			<div class="mb-6">
				<div class="flex items-center justify-between mb-3">
					<h4 class="text-sm font-semibold m-0">{{ $t('initialSetup') }}</h4>
				</div>
				<div class="mb-6">
					<div
						class="form-row flex flex-col md:flex-row items-start md:items-center gap-y-1 gap-x-6 min-h-10 hover:bg-(--color-surface-hover) rounded transition-colors">
						<span class="text-sm min-w-0 md:w-1/3 break-all">
							{{ $t('netbootProducts') }}
						</span>
						<div class="flex-1 flex items-center gap-2 min-w-0">
							<USelectMenu v-model="form.netbootProducts" :items="netbootProductOptions" multiple
								:disabled="loading" size="sm" class="w-full" />
						</div>
					</div>
					<div
						class="form-row flex flex-col md:flex-row items-start md:items-center gap-y-1 gap-x-6 min-h-10 hover:bg-(--color-surface-hover) rounded transition-colors">
						<span class="text-sm min-w-0 md:w-1/3 break-all flex items-center gap-1.5">
							<UIcon :name="icons.deploy" class="w-4 h-4" />
							{{ $t('enableAgentSetup') }}
						</span>
						<div class="flex-1 flex items-center gap-2 min-w-0">
							<UCheckbox v-model="form.agentSetup" :disabled="loading" />
						</div>
					</div>
					<div v-if="form.agentSetup"
						class="ml-4 border-l-2 border-(--color-border) pl-4 space-y-0">
						<div
							class="form-row flex flex-col md:flex-row items-start md:items-center gap-y-1 gap-x-6 min-h-10 hover:bg-(--color-surface-hover) rounded transition-colors">
							<span class="text-sm min-w-0 md:w-1/3 break-all">
								{{ $t('type') }}
							</span>
							<div class="flex-1">
								<div class="grid grid-cols-3 gap-2">
									<UButton v-for="os in osTypes" :key="os.value"
										:variant="form.agentType === os.value ? 'solid' : 'outline'"
										:color="form.agentType === os.value ? 'primary' : 'neutral'" size="sm"
										class="justify-center" :disabled="loading" @click="form.agentType = os.value">
										<UIcon :name="os.icon" class="w-4 h-4 mr-1" />
										{{ os.label }}
									</UButton>
								</div>
							</div>
						</div>
						<div
							class="form-row flex flex-col md:flex-row items-start md:items-center gap-y-1 gap-x-6 min-h-10 hover:bg-(--color-surface-hover) rounded transition-colors">
							<span class="text-sm min-w-0 md:w-1/3 break-all flex items-center gap-1.5">
								<UIcon :name="icons.user" class="w-4 h-4 text-(--color-text-muted)" />
								{{ $t('username') }}
							</span>
							<div class="flex-1 flex items-center gap-2 min-w-0">
								<UInput v-model="form.agentUsername" :disabled="loading" size="sm"
									:placeholder="String($t('adminUsername'))" class="w-full" />
							</div>
						</div>
						<div
							class="form-row flex flex-col md:flex-row items-start md:items-center gap-y-1 gap-x-6 min-h-10 hover:bg-(--color-surface-hover) rounded transition-colors">
							<span class="text-sm min-w-0 md:w-1/3 break-all flex items-center gap-1.5">
								<UIcon :name="icons.key" class="w-4 h-4 text-(--color-text-muted)" />
								{{ $t('password') }}
							</span>
							<div class="flex-1 flex items-center gap-2 min-w-0">
								<UInput v-model="form.agentPassword" :disabled="loading" size="sm" type="password"
									:placeholder="String($t('enterPassword'))" class="w-full" />
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { useSelectionStore } from '~/stores/selectionStore'

const emit = defineEmits<{
	saved: []
}>()

const icons = useIcons()
const { t: $t } = useI18n()
const { createClient, deployClientAgent, getServers, getClientIds, getHostGroupIds, getServersProducts, addClientToGroups, setClientProductActions } = useApiHelpers()
const selectionStore = useSelectionStore()

const loading = ref(false)
const loadingDepots = ref(false)
const error = ref<string | null>(null)
const success = ref(false)

const clientName = ref('')
const domain = ref('')
const clientIds = ref<string[]>([])

const form = reactive({
	description: '',
	inventoryNumber: '',
	depotId: '',
	ipAddress: '',
	macAddress: '',
	notes: '',
	agentSetup: false,
	agentType: 'windows' as 'windows' | 'linux' | 'mac',
	agentUsername: '',
	agentPassword: '',
	netbootProducts: [] as Array<{ label: string; value: string }>,
	groups: [] as Array<{ label: string; value: string }>,
})

const formErrors = reactive({ clientId: '', depotId: '' })
const depots = ref<Array<{ depotId: string; description: string }>>([])
const netbootProductOptions = ref<Array<{ label: string; value: string }>>([])
const groupOptions = ref<Array<{ label: string; value: string }>>([])

const osTypes = [
	{ value: 'windows' as const, label: 'Windows', icon: icons.windows },
	{ value: 'linux' as const, label: 'Linux', icon: icons.linux },
	{ value: 'mac' as const, label: 'macOS', icon: icons.apple },
]

const depotOptions = computed(() => depots.value.map(d => ({
	label: d.description ? `${d.depotId} - ${d.description}` : d.depotId,
	value: d.depotId,
})))

const canCreate = computed(() =>
	clientName.value.length > 0 &&
	!Number.isInteger(parseInt(clientName.value.charAt(0))) &&
	!clientIds.value.includes(clientName.value + domain.value) &&
	form.depotId &&
	!loading.value
)

function getDefaultDomainFromDepot(depotId: string): string {
	const idx = depotId.indexOf('.')
	return idx > 0 ? depotId.substring(idx) : '.local'
}

function resetForm() {
	clientName.value = ''
	if (form.depotId) {
		domain.value = getDefaultDomainFromDepot(form.depotId)
	}
	form.description = ''
	form.inventoryNumber = ''
	form.ipAddress = ''
	form.macAddress = ''
	form.notes = ''
	form.agentSetup = false
	form.agentType = 'windows'
	form.agentUsername = ''
	form.agentPassword = ''
	form.netbootProducts = []
	form.groups = []
	formErrors.clientId = ''
	formErrors.depotId = ''
	error.value = null
	success.value = false
}

onMounted(async () => {
	await fetchDepots()
	if (form.depotId) {
		domain.value = getDefaultDomainFromDepot(form.depotId)
	}
	await Promise.all([
		fetchClientIds(),
		fetchNetbootProducts(),
		fetchGroups()
	])
})

async function fetchDepots() {
	loadingDepots.value = true
	try {
		const res = await getServers()
		if (res.data) {
			depots.value = res.data
			if (selectionStore.selectedServers.length > 0 && selectionStore.selectedServers[0]) {
				form.depotId = selectionStore.selectedServers[0]
			} else if (depots.value.length > 0 && depots.value[0]) {
				form.depotId = depots.value[0].depotId
			}
		}
	} catch (e) {
		console.error('Failed to fetch depots:', e)
	} finally {
		loadingDepots.value = false
	}
}

async function fetchClientIds() {
	try {
		const depotList = form.depotId ? [form.depotId] : (selectionStore.selectedServers || [])
		const result = await getClientIds(depotList)
		clientIds.value = result.data || []
	} catch (e) {
		console.error('Failed to fetch client IDs:', e)
	}
}

async function fetchNetbootProducts() {
	try {
		const depot = form.depotId || (selectionStore.selectedServers[0])
		if (depot) {
			const res = await getServersProducts([depot])
			if (res.data && Array.isArray(res.data)) {
				netbootProductOptions.value = res.data.map((item: any) => ({
					label: item.productId,
					value: item.productId
				}))
			}
		}
	} catch (e) {
		console.error('Failed to fetch netboot products:', e)
	}
}

async function fetchGroups() {
	try {
		const res = await getHostGroupIds()
		if (res.data && Array.isArray(res.data)) {
			groupOptions.value = res.data.map((groupId: string) => ({
				label: groupId,
				value: groupId
			}))
		}
	} catch (e) {
		console.error('Failed to fetch groups:', e)
	}
}

watch(() => form.depotId, async (newDepot) => {
	if (newDepot) {
		domain.value = getDefaultDomainFromDepot(newDepot)
		await fetchNetbootProducts()
		await fetchClientIds()
	}
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

function validateForm(): boolean {
	formErrors.clientId = ''
	formErrors.depotId = ''
	let valid = true

	if (!clientName.value.trim()) {
		formErrors.clientId = String($t('clientIdRequired'))
		valid = false
	} else if (Number.isInteger(parseInt(clientName.value.charAt(0)))) {
		formErrors.clientId = String($t('message.formvalid.clientNameCannotStartWithNumber'))
		valid = false
	} else if (clientIds.value.includes(clientName.value + domain.value)) {
		formErrors.clientId = String($t('message.formvalid.clientExists'))
		valid = false
	}

	if (!form.depotId) {
		formErrors.depotId = String($t('depotRequired'))
		valid = false
	}

	if (form.agentSetup && (!form.agentUsername || !form.agentPassword)) {
		error.value = String($t('agentCredentialsRequired'))
		valid = false
	}

	return valid
}

async function handleSubmit() {
	error.value = null
	success.value = false

	if (!validateForm()) return

	loading.value = true
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

		if (form.groups.length > 0) {
			const groupIds = form.groups.map(g => g.value)
			await addClientToGroups(hostId, groupIds)
		}

		if (form.agentSetup && form.agentUsername && form.agentPassword) {
			await deployClientAgent({
				clients: [hostId],
				username: form.agentUsername,
				password: form.agentPassword,
				type: form.agentType
			})
		}

		if (form.netbootProducts.length > 0) {
			const productIds = form.netbootProducts.map(p => p.value)
			await setClientProductActions({
				clientIds: [hostId],
				productIds,
				actionRequest: 'setup',
			})
		}

		success.value = true
		clientIds.value.push(hostId)
		emit('saved')
	} catch (e: unknown) {
		error.value = e instanceof Error ? e.message : String($t('errorCreatingClient'))
	} finally { loading.value = false }
}
</script>
