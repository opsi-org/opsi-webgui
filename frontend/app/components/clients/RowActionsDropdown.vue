Row-level client actions dropdown for the clients table.
- Buttons: Configuration, Logs, Clone
- Client Actions: Uses ClientsQuickActionsDropdown (inline mode) with rename support
<template>
	<div class="flex items-center gap-0.5">
		<UTooltip :text="String($t('configuration'))">
			<UButton :icon="icons.config" variant="ghost" color="neutral" size="xs" @click="emit('open-config')" />
		</UTooltip>

		<UTooltip :text="String($t('logs'))">
			<UButton :icon="icons.log" variant="ghost" color="neutral" size="xs" @click="emit('open-logs')" />
		</UTooltip>

		<UTooltip :text="String($t('clone'))">
			<UButton :icon="icons.clone" variant="ghost" color="neutral" size="xs" @click="emit('open-clone')" :disabled="isReadOnly || !canCreateClients" />
		</UTooltip>

		<ClientsQuickActionsDropdown
			:client-ids="[clientId]"
			inline
			show-rename
			@action-complete="handleActionComplete"
		/>
	</div>
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
const { isReadOnly, canCreateClients } = useUserPermissions()

function handleActionComplete(action: string, success: boolean) {
	emit('action-complete', action, success)
}
</script>
