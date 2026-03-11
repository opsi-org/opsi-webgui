<!--
This file is part of opsi-webgui application.
opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
Copyright (c) uib GmbH <info@uib.de> 2026
All rights reserved.
License: AGPL-3.0

Row-level client actions dropdown for the clients table.
-->
<template>
	<UDropdown :items="actionMenuItems" :popper="{ placement: 'bottom-end' }">
		<UButton :icon="icons.menu" variant="ghost" color="neutral" size="xs" :loading="loading" :disabled="loading" />
	</UDropdown>

	<!-- Confirmation Modal -->
	<UModal v-model:open="confirmOpen">
		<template #content>
			<div class="p-4 min-w-[300px]">
				<div class="flex items-center gap-3 mb-4">
					<UIcon :name="currentActionIcon" class="w-6 h-6 text-opsi-blue" />
					<h3 class="text-lg font-semibold">{{ $t(currentAction) || currentAction }}</h3>
				</div>

				<p class="text-sm text-(--color-text-muted) mb-4">
					{{ $t('confirmActionOnClient') || `Execute action on ${clientId}?` }}
				</p>

				<!-- On Demand info -->
				<div v-if="currentAction === 'onDemand'" class="mb-4 p-3 bg-(--color-surface) rounded">
					<p class="text-xs text-(--color-text-muted)">
						{{ $t('onDemandDescription') || 'Triggers the on_demand event to process pending action requests.' }}
					</p>
				</div>

				<!-- Notify input -->
				<div v-if="currentAction === 'notify'" class="mb-4">
					<label class="block text-xs text-(--color-text-muted) mb-1">
						{{ $t('notificationText') || 'Notification Text' }}
					</label>
					<UTextarea v-model="notifyText" :placeholder="String($t('enterNotificationText'))" :rows="2" />
				</div>

				<!-- Deploy Client Agent options -->
				<div v-if="currentAction === 'deployClientAgent'" class="mb-4 space-y-3">
					<div>
						<label class="block text-xs text-(--color-text-muted) mb-1">{{ $t('username') }}</label>
						<UInput v-model="deployOptions.username" :placeholder="String($t('username'))" />
					</div>
					<div>
						<label class="block text-xs text-(--color-text-muted) mb-1">{{ $t('password') }}</label>
						<UInput v-model="deployOptions.password" type="password"
							:placeholder="String($t('password'))" />
					</div>
					<div>
						<label class="block text-xs text-(--color-text-muted) mb-1">{{ $t('type') }}</label>
						<USelectMenu v-model="selectedOsType" :items="osTypes" />
					</div>
				</div>

				<div class="flex justify-end gap-2 mt-4">
					<UButton variant="outline" color="neutral" @click="confirmOpen = false" :disabled="executing">
						{{ $t('cancel') }}
					</UButton>
					<UButton :color="currentAction === 'delete' ? 'error' : 'primary'" @click="executeAction"
						:loading="executing" :disabled="!isFormValid">
						{{ $t(currentAction) || currentAction }}
					</UButton>
				</div>
			</div>
		</template>
	</UModal>

	<!-- Delete Confirmation Modal -->
	<UModal v-model:open="deleteConfirmOpen">
		<template #content>
			<div class="p-4 min-w-[300px]">
				<div class="flex items-center gap-3 mb-4">
					<UIcon :name="icons.delete" class="w-6 h-6 text-red-500" />
					<h3 class="text-lg font-semibold text-red-600">{{ $t('delete') }}</h3>
				</div>

				<p class="text-sm mb-4">
					{{ $t('confirmDeleteClient') || `Are you sure you want to delete client "${clientId}"?` }}
				</p>

				<p class="text-xs text-(--color-text-muted) mb-4">
					{{ $t('deleteClientWarning') || 'This action cannot be undone.' }}
				</p>

				<div class="flex justify-end gap-2 mt-4">
					<UButton variant="outline" color="neutral" @click="deleteConfirmOpen = false" :disabled="executing">
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
	(e: 'action-complete', action: string, success: boolean): void
}>()

const icons = useIcons()
const { t: $t } = useI18n()
const toast = useToast()
const { triggerOnDemand, sendNotification, rebootClients, shutdownClients, deployClientAgent, deleteClient } = useApiHelpers()

const loading = ref(false)
const executing = ref(false)
const confirmOpen = ref(false)
const deleteConfirmOpen = ref(false)
const currentAction = ref('')
const notifyText = ref('')
const deployOptions = ref({ username: '', password: '', type: 'windows' })
const selectedOsType = ref({ label: 'Windows', value: 'windows' })

const osTypes = [
	{ label: 'Windows', value: 'windows' },
	{ label: 'Linux', value: 'linux' },
	{ label: 'macOS', value: 'macos' },
]

// Sync selectedOsType with deployOptions.type
watch(selectedOsType, (newVal) => {
	deployOptions.value.type = newVal.value
})

const actions = [
	{ key: 'onDemand', icon: icons.onDemand, color: 'primary' },
	{ key: 'notify', icon: icons.notify, color: 'primary' },
	{ key: 'reboot', icon: icons.reboot, color: 'warning' },
	{ key: 'shutdown', icon: icons.shutdown, color: 'warning' },
	{ key: 'deployClientAgent', icon: icons.deploy, color: 'primary' },
	{ key: 'delete', icon: icons.delete, color: 'error' },
]

const currentActionIcon = computed(() => {
	const action = actions.find(a => a.key === currentAction.value)
	return action?.icon || icons.play
})

const isFormValid = computed(() => {
	if (currentAction.value === 'notify' && !notifyText.value.trim()) return false
	if (currentAction.value === 'deployClientAgent' && (!deployOptions.value.username || !deployOptions.value.password)) return false
	return true
})

const actionMenuItems = computed(() => [
	actions.map(action => ({
		label: String($t(action.key) || action.key),
		icon: action.icon,
		click: () => openConfirm(action.key),
	}))
])

function openConfirm(action: string) {
	currentAction.value = action
	notifyText.value = ''
	deployOptions.value = { username: '', password: '', type: 'windows' }

	if (action === 'delete') {
		deleteConfirmOpen.value = true
	} else {
		confirmOpen.value = true
	}
}

async function executeAction() {
	executing.value = true
	try {
		let result: any
		const clientIds = [props.clientId]

		switch (currentAction.value) {
			case 'onDemand':
				result = await triggerOnDemand(clientIds)
				break
			case 'notify':
				result = await sendNotification(clientIds, notifyText.value)
				break
			case 'reboot':
				result = await rebootClients(clientIds)
				break
			case 'shutdown':
				result = await shutdownClients(clientIds)
				break
			case 'deployClientAgent':
				result = await deployClientAgent(clientIds, deployOptions.value)
				break
		}

		if (result?.error) {
			throw result.error
		}

		// Check for per-client errors
		if (result?.data && result.data[props.clientId]?.error) {
			throw new Error(result.data[props.clientId].error)
		}

		toast.add({
			title: String($t('success') || 'Success'),
			description: String($t('actionExecutedSuccessfully') || `${currentAction.value} executed successfully`),
			color: 'success'
		})

		emit('action-complete', currentAction.value, true)
		confirmOpen.value = false
	} catch (e) {
		console.error('Action failed:', e)
		toast.add({
			title: String($t('error') || 'Error'),
			description: String(e),
			color: 'error'
		})
		emit('action-complete', currentAction.value, false)
	} finally {
		executing.value = false
	}
}

async function executeDelete() {
	executing.value = true
	try {
		const result = await deleteClient(props.clientId)

		if (result?.error) {
			throw result.error
		}

		toast.add({
			title: String($t('success') || 'Success'),
			description: String($t('clientDeleted') || `Client ${props.clientId} deleted successfully`),
			color: 'success'
		})

		emit('action-complete', 'delete', true)
		deleteConfirmOpen.value = false
	} catch (e) {
		console.error('Delete failed:', e)
		toast.add({
			title: String($t('error') || 'Error'),
			description: String(e),
			color: 'error'
		})
		emit('action-complete', 'delete', false)
	} finally {
		executing.value = false
	}
}
</script>
