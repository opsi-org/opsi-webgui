<template>
	<div class="relative">
		<!-- Inline mode: just a dropdown trigger icon (for row actions) -->
		<template v-if="inline">
			<UDropdownMenu v-if="clientIds.length > 0" :items="actionItems">
				<UButton :icon="icons.moreVertical" variant="ghost" color="neutral" size="xs" :loading="loading"
					:disabled="loading" :title="String(t('clientActions'))" />
			</UDropdownMenu>
		</template>
		<!-- Standard mode: button with badge -->
		<template v-else>
			<UDropdownMenu v-if="clientIds.length > 0" :items="actionItems">
				<UTooltip v-if="compact" :text="t('clientActions')">
					<UButton variant="soft" color="primary" size="sm">
						<UIcon :name="icons.client" class="w-4 h-4" />
						<UBadge size="xs" color="primary" class="ml-0.5">{{ clientIds.length }}</UBadge>
					</UButton>
				</UTooltip>
				<UButton v-else variant="soft" color="primary" size="sm" class="w-full">
					<UIcon :name="icons.client" class="w-4 h-4" />
					<span>{{ t('clientActions') }}</span>
					<UBadge size="xs" color="primary" class="ml-1">{{ clientIds.length }}</UBadge>
					<UIcon :name="icons.chevronDown" class="w-3 h-3 ml-1" />
				</UButton>
			</UDropdownMenu>
			<UTooltip v-else-if="compact" :text="t('clientActions')">
				<UButton variant="ghost" color="neutral" size="sm" class="opacity-70 hover:opacity-100"
					@click="showSelectionHint">
					<UIcon :name="icons.client" class="w-4 h-4" />
				</UButton>
			</UTooltip>
			<UButton v-else variant="ghost" color="neutral" size="sm" class="w-full opacity-70 hover:opacity-100"
				@click="showSelectionHint">
				<UIcon :name="icons.client" class="w-4 h-4" />
				<span>{{ t('clientActions') }}</span>
				<UIcon :name="icons.chevronDown" class="w-3 h-3 ml-1" />
			</UButton>
		</template>
	</div>

	<UModal v-model:open="confirmOpen" :dismissible="true">
		<template #content>
			<div class="p-4 min-w-87.5" @click.stop>
				<div class="flex items-center justify-between mb-3">
					<h3 class="text-sm flex items-center gap-2 m-0">
						<UIcon :name="currentActionIcon" class="w-5 h-5 text-(--color-text-muted)" />
						{{ t(currentAction) }}
						<span v-if="clientIds.length === 1" class="text-(--color-text-muted) font-normal truncate max-w-48">{{ clientIds[0] }}</span>
						<span v-else-if="clientIds.length > 1" class="text-(--color-text-muted) font-normal">({{ clientIds.length }} {{ t('clients') }})</span>
					</h3>
					<UButton :icon="icons.x" variant="ghost" color="neutral" @click="confirmOpen = false" />
				</div>

				<SharedAlertInline v-if="statusMessage && statusMessage.type === 'error'" color="error"
					:title="t('error')" :description="statusMessage.message" variant="subtle" class="mb-3" closable
					@close="statusMessage = null" />

				<div v-if="currentAction === 'onDemand'" class="mb-4 p-3">
					<p class="mb-2">
						{{ t('onDemandDescription') }}
					</p>
				</div>

				<div v-if="currentAction === 'notify'" class="mb-4">
					<UTextarea v-model="notifyText" :placeholder="t('enterNotificationText')" :rows="3"
						class="w-full" />
				</div>

				<div v-if="currentAction === 'reboot'"
					class="mb-4 p-3 bg-amber-50 dark:bg-amber-900/20 rounded border border-amber-200 dark:border-amber-800">
					<div class="flex items-start gap-2">
						<UIcon :name="icons.warning" class="w-4 h-4 text-amber-600 dark:text-amber-400 mt-0.5" />
						<p class="text-sm text-amber-800 dark:text-amber-200">
							{{ t('rebootWarning') }}
						</p>
					</div>
				</div>

				<div v-if="currentAction === 'shutdown'"
					class="mb-4 p-3 bg-amber-50 dark:bg-amber-900/20 rounded border border-amber-200 dark:border-amber-800">
					<div class="flex items-start gap-2">
						<UIcon :name="icons.warning" class="w-4 h-4 text-amber-600 dark:text-amber-400 mt-0.5" />
						<p class="text-sm text-amber-800 dark:text-amber-200">
							{{ t('shutdownWarning') }}
						</p>
					</div>
				</div>

				<div v-if="currentAction === 'deployClientAgent'" class="space-y-3 mb-4">
					<div class="grid grid-cols-3 gap-2 mb-3">
						<UButton v-for="os in osTypes" :key="os.value"
							:variant="deployOptions.type === os.value ? 'solid' : 'outline'"
							:color="deployOptions.type === os.value ? 'primary' : 'neutral'" size="sm"
							class="justify-center" @click="deployOptions.type = os.value">
							<UIcon :name="os.icon" class="w-4 h-4 mr-1" />
							{{ os.label }}
						</UButton>
					</div>
					<div>
						<label class="block text-xs text-[--color-text-muted] mb-1">{{ t('username') }}</label>
						<UInput v-model="deployOptions.username" :placeholder="t('adminUsername')" size="sm" />
					</div>
					<div>
						<label class="block text-xs text-[--color-text-muted] mb-1">{{ t('password') }}</label>
						<UInput v-model="deployOptions.password" type="password" :placeholder="t('enterPassword')"
							size="sm" />
					</div>
				</div>

				<div v-if="currentAction === 'rename'" class="space-y-3 mb-4">
					<p class="text-sm text-(--color-text-muted) mb-1">
						{{ t('renameClientDescription') }}
					</p>
					<UFormField :label="t('newHostId')">
						<div class="flex gap-1 items-center">
							<UInput v-model="renameHostname" :placeholder="String(t('enterHostname'))" class="flex-1"
								:color="renameValidation.color as any" />
							<span class="text-sm text-(--color-text-muted)">.</span>
							<UInput v-model="renameDomain" :placeholder="String(t('domain'))" class="flex-1" />
						</div>
						<p v-if="renameValidation.message" class="text-xs mt-1" :class="renameValidation.textClass">
							{{ renameValidation.message }}
						</p>
					</UFormField>
				</div>

				<div v-if="currentAction === 'delete'"
					class="mb-4 p-3 bg-red-50 dark:bg-red-900/20 rounded border border-red-200 dark:border-red-800">
					<div class="flex items-start gap-2">
						<UIcon :name="icons.warning" class="w-4 h-4 text-red-600 dark:text-red-400 mt-0.5" />
						<div>
							<p class="text-sm text-red-800 dark:text-red-200 font-medium">
								{{ t('deleteWarning') }}
							</p>
							<p class="text-sm text-red-700 dark:text-red-300 mt-1">
								{{ t('deleteClientsDescription') }}
							</p>
						</div>
					</div>
				</div>

				<div class="flex justify-end gap-2 pt-3 border-[--color-border]">
					<UButton variant="ghost" color="neutral" @click="confirmOpen = false">{{ t('cancel') }}</UButton>
					<UButton :color="currentAction === 'delete' ? 'error' : 'primary'" :loading="loading"
						:disabled="isReadOnly || !canExecute" @click="executeAction">
						{{ t(currentAction || 'confirm') }}
					</UButton>
				</div>
			</div>
		</template>
	</UModal>

	<UModal v-model:open="resultOpen" :dismissible="true">
		<template #content>
			<div class="p-4 min-w-87.5">
				<div class="flex items-center justify-between mb-3">
					<h3 class="text-sm flex items-center gap-2 m-0">
						<UIcon :name="currentActionIcon" class="w-5 h-5 text-(--color-text-muted)" />
						{{ t('actionResults') }}
					</h3>
					<UButton :icon="icons.x" variant="ghost" color="neutral" @click="resultOpen = false" />
				</div>

				<div class="max-h-80 overflow-y-auto space-y-1.5">
					<div v-for="(result, clientId) in actionResults" :key="clientId"
						class="p-3 rounded-lg border text-sm"
						:class="result.success ? 'bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-800' : 'bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-800'">
						<div class="flex items-center justify-between gap-2">
							<div class="flex items-center gap-2 min-w-0">
								<UIcon :name="result.success ? icons.checkCircle : icons.xCircle"
									class="w-4 h-4 shrink-0"
									:class="result.success ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'" />
								<span class="font-medium truncate">{{ clientId }}</span>
							</div>
							<UBadge :color="result.success ? 'success' : 'error'" size="xs" variant="subtle">
								{{ result.success ? t('success') : t('failed') }}
							</UBadge>
						</div>
						<div v-if="result.message"
							class="mt-1.5 pl-6 text-sm wrap-break-word"
							:class="result.success ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'">
							{{ result.message }}
						</div>
					</div>
				</div>

				<div class="flex justify-end mt-4 pt-3 border-t border-[--color-border]">
					<UButton variant="soft" @click="resultOpen = false">{{ t('close') }}</UButton>
				</div>
			</div>
		</template>
	</UModal>
</template>

<script setup lang="ts">
import { useSelectionStore } from '~/stores/selectionStore'

const props = defineProps<{
	clientIds: string[]
	disabled?: boolean
	compact?: boolean
	inline?: boolean
	showRename?: boolean
}>()

const emit = defineEmits<{
	'action-complete': [action: string, success: boolean]
}>()

const icons = useIcons()
const { t } = useI18n()
const { triggerOnDemand, sendNotification, rebootClients, shutdownClients, deployClientAgent, deleteClient, renameClient } = useApiHelpers()
const selectionStore = useSelectionStore()
const { isReadOnly, canCreateClients } = useUserPermissions()

const confirmOpen = ref(false)
const resultOpen = ref(false)
const currentAction = ref<string>('')
const loading = ref(false)
const notifyText = ref('')
const deployOptions = ref({ username: '', password: '', type: 'windows' })
const actionResults = ref<Record<string, { success: boolean; message?: string }>>({})
const statusMessage = ref<{ type: 'success' | 'error' | 'warning'; message: string } | null>(null)

const renameHostname = ref('')
const renameDomain = ref('')

const osTypes = [
	{ value: 'windows', label: 'Windows', icon: icons.windows },
	{ value: 'linux', label: 'Linux', icon: icons.linux },
	{ value: 'macos', label: 'macOS', icon: icons.apple },
]

function showSelectionHint() {
	statusMessage.value = {
		type: 'warning',
		message: t('selectClientsFirst'),
	}
	setTimeout(() => { statusMessage.value = null }, 4000)
}

const allActions = [
	{ key: 'onDemand', icon: icons.onDemand, color: 'text-blue-600 dark:text-blue-400' },
	{ key: 'notify', icon: icons.notify, color: 'text-blue-600 dark:text-blue-400' },
	{ key: 'reboot', icon: icons.reboot, color: 'text-amber-600 dark:text-amber-400' },
	{ key: 'shutdown', icon: icons.shutdown, color: 'text-amber-600 dark:text-amber-400' },
	{ key: 'deployClientAgent', icon: icons.deploy, color: 'text-green-600 dark:text-green-400' },
	{ key: 'rename', icon: icons.pencilSquare, color: 'text-blue-600 dark:text-blue-400' },
	{ key: 'delete', icon: icons.delete, color: 'text-red-600 dark:text-red-400' },
] as const

const actions = computed(() =>
	allActions.filter(a => a.key !== 'rename' || (props.showRename && props.clientIds.length === 1))
)

const renameValidation = computed(() => {
	const hostname = renameHostname.value.trim()
	if (!hostname) return { color: undefined, message: '', textClass: '' }
	if (/^\d/.test(hostname)) return { color: 'error', message: String(t('hostnameRequired')), textClass: 'text-red-500' }
	const newId = hostname + '.' + renameDomain.value.trim()
	if (props.clientIds.length === 1 && newId === props.clientIds[0]) return { color: 'error', message: String(t('clientAlreadyExists')), textClass: 'text-red-500' }
	return { color: undefined, message: '', textClass: '' }
})

const currentActionIcon = computed(() => {
	const action = allActions.find(a => a.key === currentAction.value)
	return action?.icon || icons.info
})

const currentActionColor = computed(() => {
	const action = allActions.find(a => a.key === currentAction.value)
	return action?.color || ''
})

const canExecute = computed(() => {
	if (currentAction.value === 'notify' && !notifyText.value.trim()) return false
	if (currentAction.value === 'deployClientAgent' && (!deployOptions.value.username || !deployOptions.value.password)) return false
	if (currentAction.value === 'rename' && (!renameHostname.value.trim() || !!renameValidation.value.message)) return false
	return true
})

const actionItems = computed(() => {
	const groups: Array<Array<{ label: string; icon: string; disabled: boolean; onSelect: () => void }>> = []
	const mainActions = actions.value.filter(a => a.key !== 'rename' && a.key !== 'delete')
	const renameAction = actions.value.find(a => a.key === 'rename')
	const deleteAction = actions.value.find(a => a.key === 'delete')

	groups.push(mainActions.map(action => ({
		label: t(action.key) || action.key,
		icon: action.icon,
		disabled: isReadOnly.value,
		onSelect: () => openConfirm(action.key),
	})))

	if (renameAction || deleteAction) {
		const group: typeof groups[0] = []
		if (renameAction) {
			group.push({
				label: t(renameAction.key) || renameAction.key,
				icon: renameAction.icon,
				disabled: isReadOnly.value,
				onSelect: () => openConfirm(renameAction.key),
			})
		}
		if (deleteAction) {
			group.push({
				label: t(deleteAction.key) || deleteAction.key,
				icon: deleteAction.icon,
				disabled: isReadOnly.value || !canCreateClients.value,
				onSelect: () => openConfirm(deleteAction.key),
			})
		}
		groups.push(group)
	}

	return groups
})

function openConfirm(action: string) {
	currentAction.value = action
	notifyText.value = ''
	deployOptions.value = { username: '', password: '', type: 'windows' }
	statusMessage.value = null

	if (action === 'rename' && props.clientIds.length === 1) {
		const clientId = props.clientIds[0]!
		const dotIndex = clientId.indexOf('.')
		renameHostname.value = ''
		renameDomain.value = dotIndex > 0 ? clientId.substring(dotIndex + 1) : ''
	}

	confirmOpen.value = true
}

async function executeAction() {
	if (!currentAction.value || !props.clientIds.length) return

	loading.value = true
	actionResults.value = {}

	try {
		let result: Record<string, any> = {}

		switch (currentAction.value) {
			case 'onDemand': {
				const res = await triggerOnDemand(props.clientIds)
				if (res.error) throw res.error
				result = res.data || {}
				break
			}

			case 'notify': {
				const res = await sendNotification(props.clientIds, notifyText.value)
				if (res.error) throw res.error
				result = res.data || {}
				break
			}

			case 'reboot': {
				const res = await rebootClients(props.clientIds)
				if (res.error) throw res.error
				result = res.data || {}
				break
			}

			case 'shutdown': {
				const res = await shutdownClients(props.clientIds)
				if (res.error) throw res.error
				result = res.data || {}
				break
			}

			case 'deployClientAgent': {
				const res = await deployClientAgent({
					clients: props.clientIds,
					username: deployOptions.value.username,
					password: deployOptions.value.password,
					type: deployOptions.value.type as 'windows' | 'linux' | 'mac',
				})
				if (res.error) throw res.error
				result = res.data || {}
				break
			}

			case 'rename': {
				const clientId = props.clientIds[0]!
				const newHostId = `${renameHostname.value.trim()}.${renameDomain.value.trim()}`
				try {
					const res = await renameClient(clientId, newHostId)
					if (res?.error) throw res.error
					result[clientId] = { success: true, message: `→ ${newHostId}` }
					emit('action-complete', 'rename', true)
				} catch (e) {
					result[clientId] = { success: false, error: String(e instanceof Error ? e.message : e) }
					emit('action-complete', 'rename', false)
				}
				break
			}

			case 'delete':
				for (const clientId of props.clientIds) {
					try {
						await deleteClient(clientId)
						result[clientId] = { success: true }
					} catch (e) {
						result[clientId] = { success: false, error: String(e) }
					}
				}
				selectionStore.setClients(selectionStore.selectedClients.filter(c => !props.clientIds.includes(c)))
				break
		}

		// Build results for all clients
		actionResults.value = Object.fromEntries(
			props.clientIds.map(id => [id, {
				success: result[id]?.success !== false && !result[id]?.error,
				message: result[id]?.error ? String(result[id].error) : (result[id]?.message || undefined),
			}])
		)

		const successCount = Object.values(actionResults.value).filter(r => r.success).length
		const failCount = props.clientIds.length - successCount

		// Always show the result modal
		resultOpen.value = true

		// Only emit action-complete on full success to avoid duplicate error display
		// (errors are already visible in the result modal)
		if (failCount === 0) {
			emit('action-complete', currentAction.value, true)
		}

		confirmOpen.value = false
	} catch (e) {
		console.error('Action failed:', e)
		statusMessage.value = {
			type: 'error',
			message: e instanceof Error ? e.message : String(e),
		}
	} finally {
		loading.value = false
	}
}
</script>
