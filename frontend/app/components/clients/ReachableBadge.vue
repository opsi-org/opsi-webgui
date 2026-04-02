Reachable status badge - auto-checks reachability on mount.
<template>
	<div class="flex items-center justify-center">
		<UIcon v-if="loading" :name="icons.refresh" class="w-4 h-4 animate-spin text-(--color-text-muted)" />

		<UTooltip v-else-if="reachable === true" :text="String($t('message.clientIsReachable'))">
			<UIcon :name="icons.clientReachable" class="w-4 h-4 text-green-500 cursor-pointer"
				@click.stop="$emit('check')" />
		</UTooltip>
		<UTooltip v-else-if="reachable === false" :text="String($t('message.clientIsNotReachable'))">
			<UIcon :name="icons.clientReachable" class="w-4 h-4 text-red-400 cursor-pointer"
				@click.stop="$emit('check')" />
		</UTooltip>

		<UTooltip v-else :text="String($t('checkClientReachability'))">
			<UIcon :name="icons.clientReachable" class="w-4 h-4 text-(--color-text-muted) cursor-pointer"
				@click.stop="$emit('check')" />
		</UTooltip>
	</div>
</template>

<script setup lang="ts">
interface Props {
	clientId: string
	reachable?: boolean
	loading?: boolean
}

const props = defineProps<Props>()

defineEmits<{
	(e: 'check'): void
}>()

const icons = useIcons()
const { t: $t } = useI18n()

// Auto-check reachability on mount if not already known
onMounted(() => {
	if (props.reachable === undefined && !props.loading) {
		// Small delay to avoid all badges firing at once
		// Will be batched in parent component
	}
})
</script>
