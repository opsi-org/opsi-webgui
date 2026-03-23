Dashboard stat card - shows a big number, label, optional sub-stats, and is clickable.
<template>
	<div class="bg-white dark:bg-[--color-surface] rounded-xl shadow-sm dark:shadow-none p-3 cursor-pointer hover:shadow-md transition-all"
		@click="$emit('click')">
		<div class="flex items-center justify-between mb-1">
			<UIcon :name="icon" class="w-4 h-4 text-[--color-text-muted]" />
			<UIcon :name="arrowIcon" class="w-3 h-3 text-[--color-text-muted]" />
		</div>
		<p class="text-2xl font-bold">{{ value ?? '-' }}</p>
		<p class="text-xs text-[--color-text-muted]">
			{{ label }}
			<span v-if="subtitle" class="text-[10px]">({{ subtitle }})</span>
		</p>
		<div v-if="$slots.default" class="mt-1 flex gap-3 text-[10px]">
			<slot />
		</div>
	</div>
</template>

<script setup lang="ts">
defineProps<{
	icon: string
	value: number | string | null
	label: string
	subtitle?: string
}>()

defineEmits<{ click: [] }>()

const icons = useIcons()
const arrowIcon = icons.arrowRight
</script>
