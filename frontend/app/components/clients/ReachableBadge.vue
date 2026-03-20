Reachable status badge with check button functionality.
<template>
	<div class="flex items-center justify-center">
		<UIcon v-if="loading" :name="icons.loading" class="w-4 h-4 animate-spin text-(--color-text-muted)" />

		<UIcon v-else-if="reachable === true" :name="icons.check" class="w-4 h-4 text-green-500"
			:title="$t('message.clientIsReachable')" />
		<UIcon v-else-if="reachable === false" :name="icons.x" class="w-4 h-4 text-red-500"
			:title="$t('message.clientIsNotReachable')" />

		<UButton v-else variant="ghost" color="neutral" size="xs" :icon="icons.clientReachable"
			:title="$t('checkClientReachability')" @click.stop="$emit('check')" />
	</div>
</template>

<script setup lang="ts">
interface Props {
	clientId: string
	reachable?: boolean
	loading?: boolean
}

defineProps<Props>()

defineEmits<{
	(e: 'check'): void
}>()

const icons = useIcons()
const { t: $t } = useI18n()
</script>
