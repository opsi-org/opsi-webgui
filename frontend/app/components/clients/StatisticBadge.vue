Statistic badge component for displaying numeric statistics with icon and link.
<template>
	<button v-if="displayValue > 0" class="inline-flex items-center justify-center" :title="tooltipText"
		@click.stop="$emit('stat-click')">
		<UBadge :color="badgeColor" variant="subtle" size="xs" class="min-w-6 justify-center cursor-pointer">
			<UIcon v-if="icon" :name="icon" class="w-3 h-3 mr-0.5" />
			<span v-if="label" class="text-xs opacity-70 mr-0.5">{{ label }}</span>
			<span class="font-medium">{{ displayValue }}</span>
		</UBadge>
	</button>
	<span v-else class="text-(--color-text-muted) text-xs flex justify-center">-</span>
</template>

<script setup lang="ts">
interface Props {
	value?: number
	icon?: string
	label?: string
	tooltip?: string
	status?: 'success' | 'warning' | 'error' | 'info' | 'neutral'
}

const props = withDefaults(defineProps<Props>(), {
	status: 'neutral',
})

defineEmits<{ 'stat-click': [] }>()

const displayValue = computed(() => props.value ?? 0)
const tooltipText = computed(() => `${props.tooltip || ''}: ${displayValue.value}`)

const badgeColor = computed(() => {
	switch (props.status) {
		case 'success': return 'success'
		case 'warning': return 'warning'
		case 'error': return 'error'
		case 'info': return 'info'
		default: return 'neutral'
	}
})
</script>
