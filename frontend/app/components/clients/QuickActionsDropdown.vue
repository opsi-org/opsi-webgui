<template>
	<div class="relative">
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
	</div>

	<UModal v-model:open="confirmOpen" :dismissible="true">
		<template #content>
			<div class="p-4 min-w-87.5" @click.stop>
				<div class="flex items-center justify-between mb-3">
					<h3 class="text-lg font-semibold flex items-center gap-2">
						<UIcon :name="currentActionIcon" class="w-5 h-5" :class="currentActionColor" />
						{{ t(currentAction) }}
					</h3>
					<UButton :icon="icons.x" variant="ghost" color="neutral" @click="confirmOpen = false" />
				</div>

				<UAlert v-if="statusMessage && statusMessage.type === 'error'" color="error" :title="t('error')"
					:description="statusMessage.message" variant="subtle" class="mb-3" close
					@update:open="statusMessage = null" />

				<!-- <p class="text-sm text-(--color-text-muted) mb-4">
					{{ t('confirmActionOnClients') }}
				</p> -->

				<div v-if="currentAction === 'onDemand'" class="mb-4 p-3 bg-(--color-surface) rounded">
					<p class="text-xs text-(--color-text-muted) mb-2">
						{{ t('onDemandDescription') }}
					</p>
					<div v-if="selectionStore.selectedProducts.length > 0" class="text-xs">
						<span class="text-(--color-text-muted)">{{ t('selectedProducts') }}:</span>
						<span class="ml-1 font-medium">{{ selectionStore.selectedProducts.length }}</span>
					</div>
				</div>

				<div v-if="currentAction === 'notify'" class="mb-4">
					<label class="block text-xs text-(--color-text-muted) mb-1">{{ t('notificationText') }}</label>
					<UTextarea v-model="notifyText" :placeholder="t('enterNotificationText')" :rows="3"
						class="w-full" />
				</div>

				<div v-if="currentAction === 'reboot'"
					class="mb-4 p-3 bg-amber-50 dark:bg-amber-900/20 rounded border border-amber-200 dark:border-amber-800">
					<div class="flex items-start gap-2">
						<UIcon :name="icons.warning" class="w-4 h-4 text-amber-600 dark:text-amber-400 mt-0.5" />
						<p class="text-xs text-amber-800 dark:text-amber-200">
							{{ t('rebootWarning') }}
						</p>
					</div>
				</div>

				<div v-if="currentAction === 'shutdown'"
					class="mb-4 p-3 bg-amber-50 dark:bg-amber-900/20 rounded border border-amber-200 dark:border-amber-800">
					<div class="flex items-start gap-2">
						<UIcon :name="icons.warning" class="w-4 h-4 text-amber-600 dark:text-amber-400 mt-0.5" />
						<p class="text-xs text-amber-800 dark:text-amber-200">
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

				<div v-if="currentAction === 'delete'"
					class="mb-4 p-3 bg-red-50 dark:bg-red-900/20 rounded border border-red-200 dark:border-red-800">
					<div class="flex items-start gap-2">
						<UIcon :name="icons.warning" class="w-4 h-4 text-red-600 dark:text-red-400 mt-0.5" />
						<div>
							<p class="text-xs text-red-800 dark:text-red-200 font-medium">
								{{ t('deleteWarning') }}
							</p>
							<p class="text-xs text-red-700 dark:text-red-300 mt-1">
								{{ t('deleteClientsDescription') }}
							</p>
						</div>
					</div>
				</div>

				<div v-if="clientIds.length <= 5" class="mb-4">
					<label class="block text-xs text-[--color-text-muted] mb-1">{{ t('affectedClients') }}</label>
					<div class="text-xs font-mono bg-[--color-surface] rounded p-2 max-h-24 overflow-y-auto">
						<div v-for="client in clientIds" :key="client" class="py-0.5">{{ client }}</div>
					</div>
				</div>

				<div class="flex justify-end gap-2 pt-3 border-[--color-border]">
					<UButton variant="ghost" color="neutral" @click="confirmOpen = false">{{ t('cancel') }}</UButton>
					<UButton :color="currentAction === 'delete' ? 'error' : 'primary'" :loading="loading"
						:disabled="!canExecute" @click="executeAction">
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
					<h3 class="text-lg font-semibold">{{ t('actionResults') }}</h3>
					<UButton :icon="icons.x" variant="ghost" color="neutral" @click="resultOpen = false" />
				</div>

				<div class="max-h-80 overflow-y-auto space-y-1">
					<div v-for="(result, clientId) in actionResults" :key="clientId"
						class="p-2 bg-[--color-surface] rounded text-xs">
						<div class="flex items-center justify-between">
							<span class="font-mono">{{ clientId }}</span>
							<UBadge :color="result.success ? 'success' : 'error'" size="xs">
								{{ result.success ? t('success') : t('failed') }}
							</UBadge>
						</div>
						<div v-if="!result.success && result.message"
							class="mt-1 text-[11px] text-(--color-error) wrap-break-word">
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
const props = defineProps<{
	clientIds: string[]
	disabled?: boolean
	compact?: boolean
}>()

const icons = useIcons()
const { t } = useI18n()
const { apiPost } = useApiHelpers()
const selectionStore = useSelectionStore()

const confirmOpen = ref(false)
const resultOpen = ref(false)
const currentAction = ref<string>('')
const loading = ref(false)
const notifyText = ref('')
const deployOptions = ref({ username: '', password: '', type: 'windows' })
const actionResults = ref<Record<string, { success: boolean; message?: string }>>({})
const statusMessage = ref<{ type: 'success' | 'error' | 'warning'; message: string } | null>(null)

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

const actions = [
	{ key: 'onDemand', icon: icons.onDemand, color: 'text-blue-600 dark:text-blue-400' },
	{ key: 'notify', icon: icons.notify, color: 'text-blue-600 dark:text-blue-400' },
	{ key: 'reboot', icon: icons.reboot, color: 'text-amber-600 dark:text-amber-400' },
	{ key: 'shutdown', icon: icons.shutdown, color: 'text-amber-600 dark:text-amber-400' },
	{ key: 'deployClientAgent', icon: icons.deploy, color: 'text-green-600 dark:text-green-400' },
	{ key: 'delete', icon: icons.delete, color: 'text-red-600 dark:text-red-400' },
] as const

const currentActionIcon = computed(() => {
	const action = actions.find(a => a.key === currentAction.value)
	return action?.icon || icons.info
})

const currentActionColor = computed(() => {
	const action = actions.find(a => a.key === currentAction.value)
	return action?.color || ''
})

const canExecute = computed(() => {
	if (currentAction.value === 'notify' && !notifyText.value.trim()) return false
	if (currentAction.value === 'deployClientAgent' && (!deployOptions.value.username || !deployOptions.value.password)) return false
	return true
})

const actionItems = computed(() => [
	actions.map(action => ({
		label: t(action.key) || action.key,
		icon: action.icon,
		onSelect: () => openConfirm(action.key),
	}))
])

function openConfirm(action: string) {
	currentAction.value = action
	notifyText.value = ''
	deployOptions.value = { username: '', password: '', type: 'windows' }
	confirmOpen.value = true
}

async function executeAction() {
	if (!currentAction.value || !props.clientIds.length) return

	loading.value = true
	actionResults.value = {}

	try {
		let result: Record<string, any> = {}

		switch (currentAction.value) {
			case 'onDemand':
				const onDemandResponse = await apiPost<Record<string, any>>('/command/opsiclientd_rpc', {
					client_ids: props.clientIds,
					method: 'fireEvent',
					params: ['on_demand'],
				})
				result = onDemandResponse.data || {}
				break

			case 'notify':
				const notifyResponse = await apiPost<Record<string, any>>('/command/opsiclientd_rpc', {
					client_ids: props.clientIds,
					method: 'showPopup',
					params: [notifyText.value],
				})
				result = notifyResponse.data || {}
				break

			case 'reboot':
				const rebootResponse = await apiPost<Record<string, any>>('/command/opsiclientd_rpc', {
					client_ids: props.clientIds,
					method: 'reboot',
					params: [],
				})
				result = rebootResponse.data || {}
				break

			case 'shutdown':
				const shutdownResponse = await apiPost<Record<string, any>>('/command/opsiclientd_rpc', {
					client_ids: props.clientIds,
					method: 'shutdown',
					params: [],
				})
				result = shutdownResponse.data || {}
				break

			case 'deployClientAgent':
				const deployResponse = await apiPost<Record<string, any>>('/opsidata/clients/deploy', {
					clients: props.clientIds,
					username: deployOptions.value.username,
					password: deployOptions.value.password,
					type: deployOptions.value.type,
				})
				result = deployResponse.data || {}
				break

			case 'delete':
				for (const clientId of props.clientIds) {
					try {
						await apiPost(`/opsidata/clients/${clientId}/delete`, {})
						result[clientId] = { success: true }
					} catch (e) {
						result[clientId] = { success: false, error: String(e) }
					}
				}
				selectionStore.setClients(selectionStore.selectedClients.filter(c => !props.clientIds.includes(c)))
				break
		}

		const successCount = Object.values(result).filter((r: any) => r?.success !== false && !r?.error).length
		const failCount = props.clientIds.length - successCount

		if (failCount === 0) {
			statusMessage.value = {
				type: 'success',
				message: `${t('actionCompleted')} (${successCount} ${t('clients')})`,
			}
			setTimeout(() => { statusMessage.value = null }, 5000)
		} else {
			statusMessage.value = {
				type: 'warning',
				message: `${successCount} ${t('successful')}, ${failCount} ${t('failed')}`,
			}
			actionResults.value = Object.fromEntries(
				props.clientIds.map(id => [id, {
					success: !result[id]?.error,
					message: result[id]?.error ? String(result[id].error) : undefined,
				}])
			)
			resultOpen.value = true
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
