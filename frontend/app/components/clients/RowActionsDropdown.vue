<!--
This file is part of opsi-webgui application.
opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
Copyright (c) uib GmbH <info@uib.de> 2026
All rights reserved.
License: AGPL-3.0

Row-level client actions dropdown for the clients table.
- Buttons: Configuration, Logs, Clone
- Client Actions: Dropdown with on_demand, notify, reboot, shutdown, deploy, delete
-->
<template>
	<div class="flex items-center gap-0.5">
		<!-- Buttons -->
		<UTooltip :text="String($t('configuration'))">
			<UButton :icon="icons.config" variant="ghost" color="neutral" size="xs" @click="emit('open-config')" />
		</UTooltip>

		<UTooltip :text="String($t('logs'))">
			<UButton :icon="icons.log" variant="ghost" color="neutral" size="xs" @click="emit('open-logs')" />
		</UTooltip>

		<UTooltip :text="String($t('clone'))">
			<UButton :icon="icons.clone" variant="ghost" color="neutral" size="xs" @click="emit('open-clone')" />
		</UTooltip>

		<!-- Client Actions Dropdown -->
		<UDropdownMenu :items="clientActionItems">
			<UButton :icon="icons.menu" variant="ghost" color="neutral" size="xs" :loading="loading" :disabled="loading"
				:title="String($t('clientActions'))" />
		</UDropdownMenu>
	</div>

	<!-- On Demand Confirmation Popover -->
	<UPopover v-model:open="showOnDemandPopover" :popper="{ placement: 'bottom' }">
		<template #content>
			<div class="p-4 min-w-70">
				<div class="flex items-center gap-2 mb-3">
					<UIcon :name="icons.onDemand" class="w-5 h-5 text-opsi-blue" />
					<span class="font-medium">{{ $t('onDemand') }}</span>
				</div>
				<p class="text-sm text-[--color-text-muted] mb-4">
					{{ $t('onDemandDescription') }}
				</p>
				<div class="flex justify-end gap-2">
					<UButton variant="outline" color="neutral" size="sm" @click="showOnDemandPopover = false">
						{{ $t('cancel') }}
					</UButton>
					<UButton color="primary" size="sm" :loading="executing" @click="executeOnDemand">
						{{ $t('trigger') }}
					</UButton>
				</div>
			</div>
		</template>
	</UPopover>

	<!-- Notify Modal -->
	<UModal v-model:open="showNotifyModal">
		<template #content>
			<div class="p-4 min-w-[320px]">
				<div class="flex items-center gap-3 mb-4">
					<UIcon :name="icons.notify" class="w-6 h-6 text-opsi-blue" />
					<h3 class="text-lg font-semibold">{{ $t('notify') }}</h3>
				</div>
				<p class="text-sm text-[--color-text-muted] mb-3">
					{{ $t('sendNotificationTo') }} {{ clientId }}
				</p>
				<UFormField :label="$t('notificationText')" class="mb-4">
					<UTextarea v-model="notifyText" :placeholder="String($t('enterNotificationText'))" :rows="3" />
				</UFormField>
				<div class="flex justify-end gap-2">
					<UButton variant="outline" color="neutral" @click="showNotifyModal = false" :disabled="executing">
						{{ $t('cancel') }}
					</UButton>
					<UButton color="primary" @click="executeNotify" :loading="executing" :disabled="!notifyText.trim()">
						{{ $t('send') }}
					</UButton>
				</div>
			</div>
		</template>
	</UModal>

	<!-- Reboot Confirmation Popover -->
	<UPopover v-model:open="showRebootPopover" :popper="{ placement: 'bottom' }">
		<template #content>
			<div class="p-4 min-w-70">
				<div class="flex items-center gap-2 mb-3">
					<UIcon :name="icons.reboot" class="w-5 h-5 text-amber-500" />
					<span class="font-medium">{{ $t('reboot') }}</span>
				</div>
				<p class="text-sm text-[--color-text-muted] mb-4">
					{{ $t('confirmRebootClient') }}
				</p>
				<div class="flex justify-end gap-2">
					<UButton variant="outline" color="neutral" size="sm" @click="showRebootPopover = false">
						{{ $t('cancel') }}
					</UButton>
					<UButton color="warning" size="sm" :loading="executing" @click="executeReboot">
						{{ $t('reboot') }}
					</UButton>
				</div>
			</div>
		</template>
	</UPopover>

	<!-- Shutdown Confirmation Popover -->
	<UPopover v-model:open="showShutdownPopover" :popper="{ placement: 'bottom' }">
		<template #content>
			<div class="p-4 min-w-70">
				<div class="flex items-center gap-2 mb-3">
					<UIcon :name="icons.shutdown" class="w-5 h-5 text-amber-600" />
					<span class="font-medium">{{ $t('shutdown') }}</span>
				</div>
				<p class="text-sm text-[--color-text-muted] mb-4">
					{{ $t('confirmShutdownClient') }}
				</p>
				<div class="flex justify-end gap-2">
					<UButton variant="outline" color="neutral" size="sm" @click="showShutdownPopover = false">
						{{ $t('cancel') }}
					</UButton>
					<UButton color="warning" size="sm" :loading="executing" @click="executeShutdown">
						{{ $t('shutdown') }}
					</UButton>
				</div>
			</div>
		</template>
	</UPopover>

	<!-- Deploy Client Agent Modal -->
	<UModal v-model:open="showDeployModal">
		<template #content>
			<div class="p-4 min-w-90">
				<div class="flex items-center gap-3 mb-4">
					<UIcon :name="icons.deploy" class="w-6 h-6 text-opsi-blue" />
					<h3 class="text-lg font-semibold">{{ $t('deployClientAgent') }}</h3>
				</div>
				<p class="text-sm text-[--color-text-muted] mb-4">
					{{ $t('deployAgentTo') }} {{ clientId }}
				</p>

				<div class="space-y-3 mb-4">
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

				<div class="flex justify-end gap-2">
					<UButton variant="outline" color="neutral" @click="showDeployModal = false" :disabled="executing">
						{{ $t('cancel') }}
					</UButton>
					<UButton color="primary" @click="executeDeploy" :loading="executing"
						:disabled="!deployOptions.username || !deployOptions.password">
						{{ $t('deploy') }}
					</UButton>
				</div>
			</div>
		</template>
	</UModal>

	<!-- Delete Confirmation Modal -->
	<UModal v-model:open="showDeleteModal">
		<template #content>
			<div class="p-4 min-w-[320px]">
				<div class="flex items-center gap-3 mb-4">
					<UIcon :name="icons.delete" class="w-6 h-6 text-red-500" />
					<h3 class="text-lg font-semibold text-red-600">{{ $t('delete') }}</h3>
				</div>
				<p class="text-sm mb-2">
					{{ $t('confirmDeleteClient', { clientId }) }}
				</p>
				<p class="text-xs text-[--color-text-muted] mb-4">
					{{ $t('deleteClientWarning') }}
				</p>
				<div class="flex justify-end gap-2">
					<UButton variant="outline" color="neutral" @click="showDeleteModal = false" :disabled="executing">
						{{ $t('cancel') }}
					</UButton>
					<UButton color="error" @click="executeDelete" :loading="executing">
						{{ $t('delete') }}
					</UButton>
				</div>
			</div>
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
const toast = useToast()
const { triggerOnDemand, sendNotification, rebootClients, shutdownClients, deployClientAgent, deleteClient } = useApiHelpers()

const loading = ref(false)
const executing = ref(false)

// Modal/Popover states
const showOnDemandPopover = ref(false)
const showNotifyModal = ref(false)
const showRebootPopover = ref(false)
const showShutdownPopover = ref(false)
const showDeployModal = ref(false)
const showDeleteModal = ref(false)

// Form data
const notifyText = ref('')
const deployOptions = ref({ username: '', password: '', type: 'windows' })
const selectedOsType = ref({ label: 'Windows', value: 'windows' })

const osTypes = [
	{ label: 'Windows', value: 'windows' },
	{ label: 'Linux', value: 'linux' },
	{ label: 'macOS', value: 'macos' },
]

watch(selectedOsType, (newVal) => {
	deployOptions.value.type = newVal.value
})

// Client action menu items - Nuxt UI v3 format
const clientActionItems = computed(() => [
	[
		{
			label: String($t('onDemand')),
			icon: icons.onDemand,
			onSelect: () => { showOnDemandPopover.value = true }
		},
		{
			label: String($t('notify')),
			icon: icons.notify,
			onSelect: () => { showNotifyModal.value = true }
		}
	],
	[
		{
			label: String($t('reboot')),
			icon: icons.reboot,
			onSelect: () => { showRebootPopover.value = true }
		},
		{
			label: String($t('shutdown')),
			icon: icons.shutdown,
			onSelect: () => { showShutdownPopover.value = true }
		}
	],
	[
		{
			label: String($t('deployClientAgent')),
			icon: icons.deploy,
			onSelect: () => { showDeployModal.value = true }
		}
	],
	[
		{
			label: String($t('delete')),
			icon: icons.delete,
			onSelect: () => { showDeleteModal.value = true }
		}
	]
])

async function executeOnDemand() {
	executing.value = true
	try {
		const result = await triggerOnDemand([props.clientId])
		if (result?.error || result?.data?.[props.clientId]?.error) {
			throw new Error(result?.data?.[props.clientId]?.error || 'Failed')
		}
		toast.add({ title: String($t('success')), description: String($t('onDemandTriggered')), color: 'success' })
		emit('action-complete', 'onDemand', true)
	} catch (e) {
		toast.add({ title: String($t('error')), description: String(e), color: 'error' })
		emit('action-complete', 'onDemand', false)
	} finally {
		executing.value = false
		showOnDemandPopover.value = false
	}
}

async function executeNotify() {
	executing.value = true
	try {
		const result = await sendNotification([props.clientId], notifyText.value)
		if (result?.error || result?.data?.[props.clientId]?.error) {
			throw new Error(result?.data?.[props.clientId]?.error || 'Failed')
		}
		toast.add({ title: String($t('success')), description: String($t('notificationSent')), color: 'success' })
		emit('action-complete', 'notify', true)
		notifyText.value = ''
	} catch (e) {
		toast.add({ title: String($t('error')), description: String(e), color: 'error' })
		emit('action-complete', 'notify', false)
	} finally {
		executing.value = false
		showNotifyModal.value = false
	}
}

async function executeReboot() {
	executing.value = true
	try {
		const result = await rebootClients([props.clientId])
		if (result?.error || result?.data?.[props.clientId]?.error) {
			throw new Error(result?.data?.[props.clientId]?.error || 'Failed')
		}
		toast.add({ title: String($t('success')), description: String($t('rebootInitiated')), color: 'success' })
		emit('action-complete', 'reboot', true)
	} catch (e) {
		toast.add({ title: String($t('error')), description: String(e), color: 'error' })
		emit('action-complete', 'reboot', false)
	} finally {
		executing.value = false
		showRebootPopover.value = false
	}
}

async function executeShutdown() {
	executing.value = true
	try {
		const result = await shutdownClients([props.clientId])
		if (result?.error || result?.data?.[props.clientId]?.error) {
			throw new Error(result?.data?.[props.clientId]?.error || 'Failed')
		}
		toast.add({ title: String($t('success')), description: String($t('shutdownInitiated')), color: 'success' })
		emit('action-complete', 'shutdown', true)
	} catch (e) {
		toast.add({ title: String($t('error')), description: String(e), color: 'error' })
		emit('action-complete', 'shutdown', false)
	} finally {
		executing.value = false
		showShutdownPopover.value = false
	}
}

async function executeDeploy() {
	executing.value = true
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
		toast.add({ title: String($t('success')), description: String($t('deploymentStarted')), color: 'success' })
		emit('action-complete', 'deploy', true)
		deployOptions.value = { username: '', password: '', type: 'windows' }
	} catch (e) {
		toast.add({ title: String($t('error')), description: String(e), color: 'error' })
		emit('action-complete', 'deploy', false)
	} finally {
		executing.value = false
		showDeployModal.value = false
	}
}

async function executeDelete() {
	executing.value = true
	try {
		const result = await deleteClient(props.clientId)
		if (result?.error) {
			throw result.error
		}
		toast.add({ title: String($t('success')), description: String($t('clientDeleted')), color: 'success' })
		emit('action-complete', 'delete', true)
	} catch (e) {
		toast.add({ title: String($t('error')), description: String(e), color: 'error' })
		emit('action-complete', 'delete', false)
	} finally {
		executing.value = false
		showDeleteModal.value = false
	}
}
</script>
