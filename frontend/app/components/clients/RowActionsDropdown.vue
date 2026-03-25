Row-level client actions dropdown for the clients table.
- Buttons: Configuration, Logs, Clone
- Client Actions: Dropdown with on_demand, notify, reboot, shutdown, deploy, delete
<template>
	<div class="flex items-center gap-0.5">
		<UTooltip :text="String($t('configuration'))">
			<UButton :icon="icons.config" variant="ghost" color="neutral" size="xs" @click="emit('open-config')" />
		</UTooltip>

		<UTooltip :text="String($t('logs'))">
			<UButton :icon="icons.log" variant="ghost" color="neutral" size="xs" @click="emit('open-logs')" />
		</UTooltip>

		<UTooltip :text="String($t('clone'))">
			<UButton :icon="icons.clone" variant="ghost" color="neutral" size="xs" @click="emit('open-clone')" />
		</UTooltip>

		<UDropdownMenu :items="clientActionItems">
			<UButton :icon="icons.moreVertical" variant="ghost" color="neutral" size="xs" :loading="loading"
				:disabled="loading" :title="String($t('clientActions'))" />
		</UDropdownMenu>
	</div>

	<UModal v-model:open="showOnDemandPopover">
		<template #content>
			<UCard>
				<template #header>
					<div class="flex items-center justify-between">
						<div class="flex items-center gap-3">
							<UIcon :name="icons.onDemand" class="w-5 h-5 text-opsi-blue" />
							<h3 class="font-semibold text-(--color-text)">{{ $t('onDemand') }}</h3>
						</div>
						<UButton :icon="icons.close" variant="ghost" color="neutral" size="xs"
							@click="showOnDemandPopover = false" />
					</div>
				</template>
				<UAlert v-if="actionError" color="error" :title="$t('error')" :description="actionError"
					variant="subtle" class="mb-3" :close-button="{ icon: icons.close, color: 'error', variant: 'link' }"
					@close="actionError = null" />
				<p class="text-sm text-(--color-text-muted)">
					{{ $t('onDemandDescription') }}
				</p>
				<template #footer>
					<div class="flex justify-end gap-2">
						<UButton variant="soft" color="neutral" @click="showOnDemandPopover = false">
							{{ $t('cancel') }}
						</UButton>
						<UButton color="primary" :loading="executing" @click="executeOnDemand">
							{{ $t('trigger') }}
						</UButton>
					</div>
				</template>
			</UCard>
		</template>
	</UModal>

	<UModal v-model:open="showNotifyModal">
		<template #content>
			<UCard>
				<template #header>
					<div class="flex items-center justify-between">
						<div class="flex items-center gap-3">
							<UIcon :name="icons.notify" class="w-5 h-5 text-opsi-blue" />
							<h3 class="font-semibold text-(--color-text)">{{ $t('notify') }}</h3>
						</div>
						<UButton :icon="icons.close" variant="ghost" color="neutral" size="xs"
							@click="showNotifyModal = false" />
					</div>
				</template>
				<UAlert v-if="actionError" color="error" :title="$t('error')" :description="actionError"
					variant="subtle" class="mb-3" :close-button="{ icon: icons.close, color: 'error', variant: 'link' }"
					@close="actionError = null" />
				<p class="text-sm text-(--color-text-muted) mb-3">
					{{ $t('sendNotificationTo') }} {{ clientId }}
				</p>
				<UFormField :label="$t('notificationText')">
					<UTextarea v-model="notifyText" :placeholder="String($t('enterNotificationText'))" :rows="3" />
				</UFormField>
				<template #footer>
					<div class="flex justify-end gap-2">
						<UButton variant="soft" color="neutral" @click="showNotifyModal = false" :disabled="executing">
							{{ $t('cancel') }}
						</UButton>
						<UButton color="primary" @click="executeNotify" :loading="executing"
							:disabled="!notifyText.trim()">
							{{ $t('send') }}
						</UButton>
					</div>
				</template>
			</UCard>
		</template>
	</UModal>

	<UModal v-model:open="showRebootPopover">
		<template #content>
			<UCard>
				<template #header>
					<div class="flex items-center justify-between">
						<div class="flex items-center gap-3">
							<UIcon :name="icons.reboot" class="w-5 h-5 text-amber-500" />
							<h3 class="font-semibold text-(--color-text)">{{ $t('reboot') }}</h3>
						</div>
						<UButton :icon="icons.close" variant="ghost" color="neutral" size="xs"
							@click="showRebootPopover = false" />
					</div>
				</template>
				<UAlert v-if="actionError" color="error" :title="$t('error')" :description="actionError"
					variant="subtle" class="mb-3" :close-button="{ icon: icons.close, color: 'error', variant: 'link' }"
					@close="actionError = null" />
				<div
					class="p-3 bg-amber-50 dark:bg-amber-900/20 rounded border border-amber-200 dark:border-amber-800 mb-3">
					<div class="flex items-start gap-2">
						<UIcon :name="icons.warning"
							class="w-4 h-4 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
						<p class="text-sm text-amber-800 dark:text-amber-200">
							{{ $t('confirmRebootClient') }}
						</p>
					</div>
				</div>
				<p class="text-xs text-(--color-text-muted) font-mono">{{ clientId }}</p>
				<template #footer>
					<div class="flex justify-end gap-2">
						<UButton variant="soft" color="neutral" @click="showRebootPopover = false">
							{{ $t('cancel') }}
						</UButton>
						<UButton color="warning" :loading="executing" @click="executeReboot">
							{{ $t('reboot') }}
						</UButton>
					</div>
				</template>
			</UCard>
		</template>
	</UModal>

	<UModal v-model:open="showShutdownPopover">
		<template #content>
			<UCard>
				<template #header>
					<div class="flex items-center justify-between">
						<div class="flex items-center gap-3">
							<UIcon :name="icons.shutdown" class="w-5 h-5 text-amber-600" />
							<h3 class="font-semibold text-(--color-text)">{{ $t('shutdown') }}</h3>
						</div>
						<UButton :icon="icons.close" variant="ghost" color="neutral" size="xs"
							@click="showShutdownPopover = false" />
					</div>
				</template>
				<UAlert v-if="actionError" color="error" :title="$t('error')" :description="actionError"
					variant="subtle" class="mb-3" :close-button="{ icon: icons.close, color: 'error', variant: 'link' }"
					@close="actionError = null" />
				<div
					class="p-3 bg-amber-50 dark:bg-amber-900/20 rounded border border-amber-200 dark:border-amber-800 mb-3">
					<div class="flex items-start gap-2">
						<UIcon :name="icons.warning"
							class="w-4 h-4 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
						<p class="text-sm text-amber-800 dark:text-amber-200">
							{{ $t('confirmShutdownClient') }}
						</p>
					</div>
				</div>
				<p class="text-xs text-(--color-text-muted) font-mono">{{ clientId }}</p>
				<template #footer>
					<div class="flex justify-end gap-2">
						<UButton variant="soft" color="neutral" @click="showShutdownPopover = false">
							{{ $t('cancel') }}
						</UButton>
						<UButton color="warning" :loading="executing" @click="executeShutdown">
							{{ $t('shutdown') }}
						</UButton>
					</div>
				</template>
			</UCard>
		</template>
	</UModal>

	<UModal v-model:open="showDeployModal">
		<template #content>
			<UCard>
				<template #header>
					<div class="flex items-center justify-between">
						<div class="flex items-center gap-3">
							<UIcon :name="icons.deploy" class="w-5 h-5 text-opsi-blue" />
							<h3 class="font-semibold text-(--color-text)">{{ $t('deployClientAgent') }}</h3>
						</div>
						<UButton :icon="icons.close" variant="ghost" color="neutral" size="xs"
							@click="showDeployModal = false" />
					</div>
				</template>
				<UAlert v-if="actionError" color="error" :title="$t('error')" :description="actionError"
					variant="subtle" class="mb-3" :close-button="{ icon: icons.close, color: 'error', variant: 'link' }"
					@close="actionError = null" />
				<p class="text-sm text-(--color-text-muted) mb-4">
					{{ $t('deployAgentTo') }} {{ clientId }}
				</p>
				<div class="space-y-3">
					<UFormField :label="$t('type')">
						<USelectMenu v-model="selectedOsType" :items="osTypes" class="w-full" />
					</UFormField>
					<UFormField :label="$t('username')">
						<UInput v-model="deployOptions.username" :placeholder="String($t('username'))" />
					</UFormField>
					<UFormField :label="$t('password')">
						<UInput v-model="deployOptions.password" type="password"
							:placeholder="String($t('password'))" />
					</UFormField>
				</div>
				<template #footer>
					<div class="flex justify-end gap-2">
						<UButton variant="soft" color="neutral" @click="showDeployModal = false" :disabled="executing">
							{{ $t('cancel') }}
						</UButton>
						<UButton color="primary" @click="executeDeploy" :loading="executing"
							:disabled="!deployOptions.username || !deployOptions.password">
							{{ $t('deploy') }}
						</UButton>
					</div>
				</template>
			</UCard>
		</template>
	</UModal>

	<UModal v-model:open="showRenameModal">
		<template #content>
			<UCard>
				<template #header>
					<div class="flex items-center justify-between">
						<div class="flex items-center gap-3">
							<UIcon :name="icons.rename" class="w-5 h-5 text-opsi-blue" />
							<h3 class="font-semibold text-(--color-text)">{{ $t('rename') }}</h3>
						</div>
						<UButton :icon="icons.close" variant="ghost" color="neutral" size="xs"
							@click="showRenameModal = false" />
					</div>
				</template>
				<UAlert v-if="actionError" color="error" :title="$t('error')" :description="actionError"
					variant="subtle" class="mb-3" :close-button="{ icon: icons.close, color: 'error', variant: 'link' }"
					@close="actionError = null" />
				<p class="text-sm text-(--color-text-muted) mb-1">
					{{ $t('renameClientDescription') }}
				</p>
				<p class="text-xs text-(--color-text-muted) mb-4 italic">
					{{ $t('renameWarning') }}
				</p>
				<div class="space-y-3">
					<UFormField :label="$t('newHostId')">
						<div class="flex gap-1 items-center">
							<UInput v-model="renameHostname" :placeholder="String($t('enterHostname'))" class="flex-1"
								:color="renameValidation.color as any" />
							<span class="text-sm text-(--color-text-muted)">.</span>
							<UInput v-model="renameDomain" :placeholder="String($t('domain'))" class="flex-1" />
						</div>
						<p v-if="renameValidation.message" class="text-xs mt-1" :class="renameValidation.textClass">
							{{ renameValidation.message }}
						</p>
					</UFormField>
				</div>
				<template #footer>
					<div class="flex justify-end gap-2">
						<UButton variant="soft" color="neutral" @click="showRenameModal = false" :disabled="executing">
							{{ $t('cancel') }}
						</UButton>
						<UButton color="primary" @click="executeRename" :loading="executing"
							:disabled="!renameHostname.trim() || !!renameValidation.message">
							{{ $t('rename') }}
						</UButton>
					</div>
				</template>
			</UCard>
		</template>
	</UModal>

	<UModal v-model:open="showDeleteModal">
		<template #content>
			<UCard>
				<template #header>
					<div class="flex items-center justify-between">
						<div class="flex items-center gap-3">
							<UIcon :name="icons.delete" class="w-5 h-5 text-(--color-opsi-error)" />
							<h3 class="font-semibold text-(--color-text)">{{ $t('delete') }}</h3>
						</div>
						<UButton :icon="icons.close" variant="ghost" color="neutral" size="xs"
							@click="showDeleteModal = false" />
					</div>
				</template>
				<UAlert v-if="actionError" color="error" :title="$t('error')" :description="actionError"
					variant="subtle" class="mb-3" :close-button="{ icon: icons.close, color: 'error', variant: 'link' }"
					@close="actionError = null" />
				<div class="p-3 bg-red-50 dark:bg-red-900/20 rounded border border-red-200 dark:border-red-800 mb-3">
					<div class="flex items-start gap-2">
						<UIcon :name="icons.warning" class="w-4 h-4 text-red-600 dark:text-red-400 mt-0.5 shrink-0" />
						<div>
							<p class="text-sm text-red-800 dark:text-red-200 font-medium">
								{{ $t('confirmDeleteClient', { clientId }) }}
							</p>
							<p class="text-xs text-red-700 dark:text-red-300 mt-1">
								{{ $t('deleteClientWarning') }}
							</p>
						</div>
					</div>
				</div>
				<p class="text-xs text-(--color-text-muted) font-mono">{{ clientId }}</p>
				<template #footer>
					<div class="flex justify-end gap-2">
						<UButton variant="soft" color="neutral" @click="showDeleteModal = false" :disabled="executing">
							{{ $t('cancel') }}
						</UButton>
						<UButton color="error" @click="executeDelete" :loading="executing">
							{{ $t('delete') }}
						</UButton>
					</div>
				</template>
			</UCard>
		</template>
	</UModal>
</template>

<script setup lang="ts">
const props = defineProps<{
	clientId: string
}>()

const emit = defineEmits<{
	(e: 'open-config'): void
	(e: 'open-logs'): void
	(e: 'open-clone'): void
	(e: 'action-complete', action: string, success: boolean): void
}>()

const icons = useIcons()
const { t: $t } = useI18n()
const { triggerOnDemand, sendNotification, rebootClients, shutdownClients, deployClientAgent, deleteClient, renameClient, getHostAttributes, getConfigServer } = useApiHelpers()

const loading = ref(false)
const executing = ref(false)
const actionError = ref<string | null>(null)

const showOnDemandPopover = ref(false)
const showNotifyModal = ref(false)
const showRebootPopover = ref(false)
const showShutdownPopover = ref(false)
const showDeployModal = ref(false)
const showRenameModal = ref(false)
const showDeleteModal = ref(false)

const notifyText = ref('')
const deployOptions = ref<{ username: string; password: string; type: 'windows' | 'linux' | 'mac' }>({ username: '', password: '', type: 'windows' })
const selectedOsType = ref({ label: 'Windows', value: 'windows' })
const renameHostname = ref('')
const renameDomain = ref('')

const renameValidation = computed(() => {
	const hostname = renameHostname.value.trim()
	if (!hostname) return { color: undefined, message: '', textClass: '' }
	if (/^\d/.test(hostname)) return { color: 'error', message: String($t('hostnameRequired')), textClass: 'text-red-500' }
	const newId = hostname + '.' + renameDomain.value.trim()
	if (newId === props.clientId) return { color: 'error', message: String($t('clientAlreadyExists')), textClass: 'text-red-500' }
	return { color: undefined, message: '', textClass: '' }
})

const osTypes = [
	{ label: 'Windows', value: 'windows' },
	{ label: 'Linux', value: 'linux' },
	{ label: 'macOS', value: 'mac' },
]

watch(selectedOsType, (newVal) => {
	deployOptions.value.type = newVal.value as 'windows' | 'linux' | 'mac'
})

const clientActionItems = computed(() => [
	[
		{
			label: String($t('onDemand')),
			icon: icons.onDemand,
			onSelect: () => { actionError.value = null; showOnDemandPopover.value = true }
		},
		{
			label: String($t('notify')),
			icon: icons.notify,
			onSelect: () => { actionError.value = null; showNotifyModal.value = true }
		}
	],
	[
		{
			label: String($t('reboot')),
			icon: icons.reboot,
			onSelect: () => { actionError.value = null; showRebootPopover.value = true }
		},
		{
			label: String($t('shutdown')),
			icon: icons.shutdown,
			onSelect: () => { actionError.value = null; showShutdownPopover.value = true }
		}
	],
	[
		{
			label: String($t('deployClientAgent')),
			icon: icons.deploy,
			onSelect: () => { actionError.value = null; showDeployModal.value = true }
		}
	],
	[
		{
			label: String($t('rename')),
			icon: icons.rename,
			onSelect: () => { actionError.value = null; openRenameModal() }
		},
		{
			label: String($t('delete')),
			icon: icons.delete,
			onSelect: () => { actionError.value = null; showDeleteModal.value = true }
		}
	]
])

async function executeOnDemand() {
	executing.value = true
	actionError.value = null
	try {
		const result = await triggerOnDemand([props.clientId])
		if (result?.error || result?.data?.[props.clientId]?.error) {
			throw new Error(result?.data?.[props.clientId]?.error || 'Failed')
		}
		emit('action-complete', 'onDemand', true)
		showOnDemandPopover.value = false
	} catch (e) {
		actionError.value = e instanceof Error ? e.message : String(e)
		emit('action-complete', 'onDemand', false)
	} finally {
		executing.value = false
	}
}

async function executeNotify() {
	executing.value = true
	actionError.value = null
	try {
		const result = await sendNotification([props.clientId], notifyText.value)
		if (result?.error || result?.data?.[props.clientId]?.error) {
			throw new Error(result?.data?.[props.clientId]?.error || 'Failed')
		}
		emit('action-complete', 'notify', true)
		notifyText.value = ''
		showNotifyModal.value = false
	} catch (e) {
		actionError.value = e instanceof Error ? e.message : String(e)
		emit('action-complete', 'notify', false)
	} finally {
		executing.value = false
	}
}

async function executeReboot() {
	executing.value = true
	actionError.value = null
	try {
		const result = await rebootClients([props.clientId])
		if (result?.error || result?.data?.[props.clientId]?.error) {
			throw new Error(result?.data?.[props.clientId]?.error || 'Failed')
		}
		emit('action-complete', 'reboot', true)
		showRebootPopover.value = false
	} catch (e) {
		actionError.value = e instanceof Error ? e.message : String(e)
		emit('action-complete', 'reboot', false)
	} finally {
		executing.value = false
	}
}

async function executeShutdown() {
	executing.value = true
	actionError.value = null
	try {
		const result = await shutdownClients([props.clientId])
		if (result?.error || result?.data?.[props.clientId]?.error) {
			throw new Error(result?.data?.[props.clientId]?.error || 'Failed')
		}
		emit('action-complete', 'shutdown', true)
		showShutdownPopover.value = false
	} catch (e) {
		actionError.value = e instanceof Error ? e.message : String(e)
		emit('action-complete', 'shutdown', false)
	} finally {
		executing.value = false
	}
}

async function executeDeploy() {
	executing.value = true
	actionError.value = null
	try {
		const result = await deployClientAgent({
			clients: [props.clientId],
			username: deployOptions.value.username,
			password: deployOptions.value.password,
			type: deployOptions.value.type
		})
		if (result?.error) {
			throw result.error
		}
		emit('action-complete', 'deploy', true)
		deployOptions.value = { username: '', password: '', type: 'windows' }
		showDeployModal.value = false
	} catch (e) {
		actionError.value = e instanceof Error ? e.message : String(e)
		emit('action-complete', 'deploy', false)
	} finally {
		executing.value = false
	}
}

async function openRenameModal() {
	// Extract hostname and domain from current clientId
	const dotIndex = props.clientId.indexOf('.')
	if (dotIndex > 0) {
		renameHostname.value = ''
		renameDomain.value = props.clientId.substring(dotIndex + 1)
	} else {
		renameHostname.value = ''
		renameDomain.value = ''
	}
	showRenameModal.value = true
}

async function executeRename() {
	const hostname = renameHostname.value.trim()
	const domain = renameDomain.value.trim()
	if (!hostname) return

	const newHostId = domain ? `${hostname}.${domain}` : hostname
	executing.value = true
	actionError.value = null
	try {
		// First get current host attributes
		const { data: hostData } = await getHostAttributes(props.clientId)
		const attrs = (hostData as Array<Record<string, unknown>>)?.[0] || {}
		// Remove computed/readonly fields
		delete attrs.type
		delete attrs.created
		delete attrs.lastSeen
		delete attrs.systemUUID
		delete attrs.uefi
		// Set the new hostId
		attrs.hostId = newHostId
		// Use the rename API - PUT to update the client
		const result = await renameClient(props.clientId, newHostId)
		if (result?.error) {
			throw result.error
		}
		emit('action-complete', 'rename', true)
		renameHostname.value = ''
		showRenameModal.value = false
	} catch (e) {
		actionError.value = e instanceof Error ? e.message : String(e)
		emit('action-complete', 'rename', false)
	} finally {
		executing.value = false
	}
}

async function executeDelete() {
	executing.value = true
	actionError.value = null
	try {
		const result = await deleteClient(props.clientId)
		if (result?.error) {
			throw result.error
		}
		emit('action-complete', 'delete', true)
		showDeleteModal.value = false
	} catch (e) {
		actionError.value = e instanceof Error ? e.message : String(e)
		emit('action-complete', 'delete', false)
	} finally {
		executing.value = false
	}
}
</script>
