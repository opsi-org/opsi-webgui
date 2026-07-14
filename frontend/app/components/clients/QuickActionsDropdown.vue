<!--
  This file is part of opsi-webgui application.
  opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
  Copyright (c) uib GmbH <info@uib.de> 2026
  All rights reserved.
  License: AGPL-3.0

  ClientsQuickActionsDropdown - Bulk action dropdown for selected clients (on-demand, reboot, etc).
-->
<template>
	<div class="relative">
		<!-- Inline mode: just a dropdown trigger icon (for row actions) -->
		<template v-if="inline">
			<CoreAppDropdownMenu v-if="clientIds.length > 0" :items="actionItems">
				<CoreAppButton :icon="icons.moreVertical" variant="ghost" color="neutral" size="xs" :loading="loading"
					:disabled="loading" :title="String($t('clients.actions'))"
					:aria-label="String($t('clients.actions'))" data-testid="client-quick-actions-trigger-inline" />
				<template #item-leading="{ item }">
					<CoreAppImage v-if="menuItem(item).image" :src="menuItem(item).image as string"
						:dark-src="menuItem(item).darkImage" :alt="menuItem(item).label"
						image-class="w-5 h-5 shrink-0" />
					<CoreAppIcon v-else :name="menuItem(item).icon" class="w-5 h-5 shrink-0" />
				</template>
			</CoreAppDropdownMenu>
		</template>
		<!-- Standard mode: button with badge -->
		<template v-else>
			<CoreAppDropdownMenu v-if="clientIds.length > 0" :items="actionItems">
				<CoreAppButton variant="soft" color="primary" size="sm" :class="compact ? '' : 'w-full'"
					:aria-label="String($t('clients.actions'))" :title="String($t('clients.actions'))" data-testid="client-quick-actions-trigger">
					<CoreAppIcon :name="icons.client" class="w-4 h-4" />
					<span v-if="!compact">{{ $t('clients.actions') }}</span>
					<CoreAppBadge size="xs" color="primary" class="ml-1">{{ clientIds.length }}</CoreAppBadge>
					<CoreAppIcon v-if="!compact" :name="icons.chevronDown" class="w-3 h-3 ml-1" />
				</CoreAppButton>
				<template #item-leading="{ item }">
					<CoreAppImage v-if="menuItem(item).image" :src="menuItem(item).image as string"
						:dark-src="menuItem(item).darkImage" :alt="menuItem(item).label"
						image-class="w-5 h-5 shrink-0" />
					<CoreAppIcon v-else :name="menuItem(item).icon" class="w-5 h-5 shrink-0" />
				</template>
			</CoreAppDropdownMenu>
			<CoreAppButton v-else variant="ghost" color="neutral" size="sm"
				class="opacity-50 hover:opacity-70" :class="compact ? '' : 'w-full'" aria-disabled="true"
				:aria-label="String($t('clients.selectFirst'))" :title="String($t('clients.selectFirst'))"
				@click="showSelectionHint">
				<CoreAppIcon :name="icons.client" class="w-4 h-4" />
				<span v-if="!compact">{{ $t('clients.actions') }}</span>
				<CoreAppIcon v-if="!compact" :name="icons.chevronDown" class="w-3 h-3 ml-1" />
			</CoreAppButton>
		</template>
	</div>

	<CoreAppModal v-model:open="confirmOpen" :dismissible="true" data-testid="client-quick-actions-dialog">
		<template #content>
			<div class="p-4 min-w-87.5" @click.stop>
				<div class="flex items-center justify-between mb-3">
					<h3 class="text-sm font-heading uppercase tracking-wide flex items-center gap-2 m-0">
						<CoreAppImage v-if="currentAction === 'deployClientAgent'" src="opsi-client-agent.svg"
							dark-src="opsi-client-agent-light.svg" :alt="actionLabel(currentAction)"
							image-class="w-8 h-8 shrink-0" />
						<CoreAppIcon v-else :name="currentActionIcon" class="w-8 h-8 text-(--color-text-muted)" />
						{{ actionLabel(currentAction) }}
						<span v-if="clientIds.length === 1"
							class="text-(--color-text-muted) font-normal normal-case truncate max-w-48">{{ clientIds[0]
							}}</span>
						<span v-else-if="clientIds.length > 1" class="text-(--color-text-muted) font-normal">({{
							clientIds.length }} {{ $t('clients.title') }})</span>
					</h3>
					<CoreAppButton :icon="icons.x" variant="ghost" color="neutral"
						:aria-label="String($t('common.close'))" @click="confirmOpen = false" />
				</div>

				<CoreAppAlertInline v-if="statusMessage && statusMessage.type === 'error'" color="error"
					:title="$t('common.error')" :description="statusMessage.message" variant="subtle" class="mb-3"
					closable @close="statusMessage = null" />

				<div v-if="currentAction === 'onDemand'" class="mb-4 p-3">
					<p class="mb-2">
						{{ $t('actions.ondemandDesc') }}
					</p>
				</div>

				<div v-if="currentAction === 'notify'" class="mb-4">
					<CoreAppTextarea v-model="notifyText" :placeholder="$t('notifications.text')" :rows="3"
						class="w-full" />
				</div>

				<div v-if="currentAction === 'reboot'"
					class="mb-4 p-3 bg-(--color-warning-soft-bg) rounded border border-(--color-warning)/30">
					<div class="flex items-start gap-2">
						<CoreAppIcon :name="icons.warning" class="w-4 h-4 text-(--color-warning-soft-text) mt-0.5" />
						<p class="text-sm text-(--color-warning-soft-text)">
							{{ $t('clients.reboot.warn') }}
						</p>
					</div>
				</div>

				<div v-if="currentAction === 'shutdown'"
					class="mb-4 p-3 bg-(--color-warning-soft-bg) rounded border border-(--color-warning)/30">
					<div class="flex items-start gap-2">
						<CoreAppIcon :name="icons.warning" class="w-4 h-4 text-(--color-warning-soft-text) mt-0.5" />
						<p class="text-sm text-(--color-warning-soft-text)">
							{{ $t('clients.shutdown.warn') }}
						</p>
					</div>
				</div>

				<div v-if="currentAction === 'deployClientAgent'" class="space-y-3 mb-4">
					<div class="flex items-center gap-3 mb-1">
						<p class="text-sm text-(--color-text-muted) m-0">{{ $t('clients.deployDesc') }}</p>
					</div>
					<div class="grid grid-cols-3 gap-2 mb-3">
						<CoreAppButton v-for="os in osTypes" :key="os.value"
							:variant="deployOptions.type === os.value ? 'solid' : 'outline'"
							:color="deployOptions.type === os.value ? 'primary' : 'neutral'" size="sm"
							class="justify-center" @click="deployOptions.type = os.value">
							<CoreAppIcon :name="os.icon" class="w-6 h-6 mr-1" />
							{{ os.label }}
						</CoreAppButton>
					</div>
					<div>
						<span class="block text-xs text-[--color-text-muted] mb-1">{{ $t('auth.username') }}</span>
						<CoreAppInput v-model="deployOptions.username" :placeholder="$t('fields.adminUsername')"
							size="sm" class="w-full" />
					</div>
					<div>
						<span class="block text-xs text-[--color-text-muted] mb-1">{{ $t('auth.password') }}</span>
						<CoreAppInput v-model="deployOptions.password" type="password"
							:placeholder="$t('auth.enterPassword')" size="sm" class="w-full" />
					</div>
				</div>

				<div v-if="currentAction === 'rename'" class="space-y-3 mb-4">
					<p class="text-sm text-(--color-text-muted) mb-1">
						{{ $t('clients.rename.desc') }}
					</p>
					<CoreAppFormField :label="$t('fields.newId')">
						<div class="flex gap-1 items-center">
							<CoreAppInput v-model="renameHostname" :placeholder="String($t('fields.hostname.enter'))"
								class="flex-1" :color="renameValidation.color as any" />
							<span class="text-sm text-(--color-text-muted)">.</span>
							<CoreAppInput v-model="renameDomain" :placeholder="String($t('fields.domain'))"
								class="flex-1" />
						</div>
						<p v-if="renameValidation.message" class="text-xs mt-1" :class="renameValidation.textClass">
							{{ renameValidation.message }}
						</p>
					</CoreAppFormField>
				</div>

				<div v-if="currentAction === 'delete'"
					class="mb-4 p-3 bg-(--color-error-soft-bg) rounded border border-(--color-error)/30">
					<div class="flex items-start gap-2">
						<CoreAppIcon :name="icons.warning" class="w-4 h-4 text-(--color-error-soft-text) mt-0.5" />
						<div>
							<p class="text-sm text-(--color-error-soft-text) font-medium">
								{{ $t('clients.delete.warn') }}
							</p>
							<p class="text-sm text-(--color-error-soft-text) mt-1">
								{{ $t('clients.delete.desc') }}
							</p>
						</div>
					</div>
				</div>

				<div class="flex justify-end gap-2 pt-3 border-[--color-border]">
					<CoreAppButton variant="outline" color="primary" @click="confirmOpen = false">{{ $t('common.cancel')
					}}
					</CoreAppButton>
					<CoreAppButton :color="currentAction === 'delete' ? 'error' : 'primary'" :loading="loading"
						:disabled="isReadOnly || !canExecute" @click="executeAction">
						{{ actionLabel(currentAction) }}
					</CoreAppButton>
				</div>
			</div>
		</template>
	</CoreAppModal>

	<CoreAppModal v-model:open="resultOpen" :dismissible="true">
		<template #content>
			<div class="p-4 min-w-87.5">
				<div class="flex items-center justify-between mb-3">
					<h3 class="text-sm font-heading uppercase tracking-wide flex items-center gap-2 m-0">
						<CoreAppIcon :name="currentActionIcon" class="w-5 h-5 text-(--color-text-muted)" />
						{{ $t('actions.results') }}
					</h3>
					<CoreAppButton :icon="icons.x" variant="ghost" color="neutral"
						:aria-label="String($t('common.close'))" @click="resultOpen = false" />
				</div>

				<div class="max-h-80 overflow-y-auto space-y-1.5">
					<div v-for="(result, clientId) in actionResults" :key="clientId"
						class="p-3 rounded-lg border text-sm"
						:class="result.success ? 'bg-(--color-success-soft-bg) border-(--color-success)/30' : 'bg-(--color-error-soft-bg) border-(--color-error)/30'">
						<div class="flex items-center justify-between gap-2">
							<div class="flex items-center gap-2 min-w-0">
								<CoreAppIcon :name="result.success ? icons.checkCircle : icons.xCircle"
									class="w-4 h-4 shrink-0"
									:class="result.success ? 'text-(--color-success-soft-text)' : 'text-(--color-error-soft-text)'" />
								<span class="font-medium truncate">{{ clientId }}</span>
							</div>
							<CoreAppBadge :color="result.success ? 'success' : 'error'" size="xs" variant="subtle">
								{{ result.success ? $t('common.success') : $t('common.failed') }}
							</CoreAppBadge>
						</div>
						<div v-if="result.message" class="mt-1.5 pl-6 text-sm wrap-break-word"
							:class="result.success ? 'text-(--color-success-soft-text)' : 'text-(--color-error-soft-text)'">
							{{ result.message }}
						</div>
					</div>
				</div>

				<div class="flex justify-end mt-4 pt-3 border-t border-[--color-border]">
					<CoreAppButton variant="ghost" color="neutral" @click="resultOpen = false">{{ $t('common.close') }}
					</CoreAppButton>
				</div>
			</div>
		</template>
	</CoreAppModal>
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
const { t: $t } = useI18n()
const { triggerOnDemand, sendNotification, rebootClients, shutdownClients, deployClientAgent, deleteClient, renameClient } = useApiHelpers()
const selectionStore = useSelectionStore()
const { isReadOnly, canCreateClients } = useUserPermissions()

type ActionMenuItem = { label: string; icon: string; image?: string; darkImage?: string }
const menuItem = (i: unknown): ActionMenuItem => i as ActionMenuItem

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

// Map each action to its translation key (reuses existing keys where possible).
const actionLabelKeys: Record<string, string> = {
	onDemand: 'actions.ondemand',
	notify: 'actions.notify',
	reboot: 'actions.reboot',
	shutdown: 'actions.shutdown',
	deployClientAgent: 'clients.deploy',
	rename: 'actions.rename',
	delete: 'common.delete',
}
function actionLabel(key: string) {
	return key ? $t(actionLabelKeys[key] ?? key) : ''
}

function showSelectionHint() {
	statusMessage.value = {
		type: 'warning',
		message: $t('clients.selectFirst'),
	}
	setTimeout(() => { statusMessage.value = null }, 4000)
}

const allActions = [
	{ key: 'onDemand', icon: icons.onDemand, color: 'text-(--color-info-soft-text)' },
	{ key: 'notify', icon: icons.notify, color: 'text-(--color-info-soft-text)' },
	{ key: 'reboot', icon: icons.reboot, color: 'text-(--color-warning-soft-text)' },
	{ key: 'shutdown', icon: icons.shutdown, color: 'text-(--color-warning-soft-text)' },
	{ key: 'deployClientAgent', icon: icons.deploy, image: 'opsi-client-agent.svg', darkImage: 'opsi-client-agent-light.svg', color: 'text-(--color-success-soft-text)' },
	{ key: 'rename', icon: icons.pencilSquare, color: 'text-(--color-info-soft-text)' },
	{ key: 'delete', icon: icons.delete, color: 'text-(--color-error-soft-text)' },
] as const

const actions = computed(() =>
	allActions.filter(a => a.key !== 'rename' || (props.showRename && props.clientIds.length === 1))
)

const renameValidation = computed(() => {
	const hostname = renameHostname.value.trim()
	if (!hostname) return { color: undefined, message: '', textClass: '' }
	if (/^\d/.test(hostname)) return { color: 'error', message: String($t('fields.hostname.required')), textClass: 'text-(--color-error)' }
	const newId = hostname + '.' + renameDomain.value.trim()
	if (props.clientIds.length === 1 && newId === props.clientIds[0]) return { color: 'error', message: String($t('clients.validation.exists')), textClass: 'text-(--color-error)' }
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
	const groups: Array<Array<{ label: string; icon: string; image?: string; darkImage?: string; disabled: boolean; onSelect: () => void }>> = []
	const mainActions = actions.value.filter(a => a.key !== 'rename' && a.key !== 'delete')
	const renameAction = actions.value.find(a => a.key === 'rename')
	const deleteAction = actions.value.find(a => a.key === 'delete')

	groups.push(mainActions.map(action => ({
		label: actionLabel(action.key),
		icon: action.icon,
		image: 'image' in action ? action.image : undefined,
		darkImage: 'darkImage' in action ? action.darkImage : undefined,
		disabled: isReadOnly.value,
		onSelect: () => openConfirm(action.key),
	})))

	if (renameAction || deleteAction) {
		const group: typeof groups[0] = []
		if (renameAction) {
			group.push({
				label: actionLabel(renameAction.key),
				icon: renameAction.icon,
				disabled: isReadOnly.value,
				onSelect: () => openConfirm(renameAction.key),
			})
		}
		if (deleteAction) {
			group.push({
				label: actionLabel(deleteAction.key),
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
		type ClientActionResult = { success?: boolean; error?: unknown; message?: string }
		let result: Record<string, ClientActionResult> = {}

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

		actionResults.value = Object.fromEntries(
			props.clientIds.map(id => [id, {
				success: result[id]?.success !== false && !result[id]?.error,
				message: result[id]?.error ? String(result[id].error) : (result[id]?.message || undefined),
			}])
		)

		const successCount = Object.values(actionResults.value).filter(r => r.success).length
		const failCount = props.clientIds.length - successCount

		resultOpen.value = true

		if (failCount === 0) {
			emit('action-complete', currentAction.value, true)
		}

		confirmOpen.value = false
	} catch (e) {
		statusMessage.value = {
			type: 'error',
			message: e instanceof Error ? e.message : String(e),
		}
	} finally {
		loading.value = false
	}
}
</script>
