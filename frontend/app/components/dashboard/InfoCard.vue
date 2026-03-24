Dashboard reusable info card with icon, label, value and optional sub-content.
<template>
	<div :class="[
		'bg-white dark:bg-[--color-surface] rounded-xl shadow-sm dark:shadow-none p-3 transition-all',
		clickable ? 'cursor-pointer hover:shadow-md' : ''
	]" @click="clickable ? $emit('click') : undefined">
		<div class="flex items-center gap-3">
			<div v-if="icon" class="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
				:class="iconBgClass || 'bg-opsi-blue/10'">
				<UIcon :name="icon" class="w-5 h-5" :class="iconClass" />
			</div>
			<div class="flex-1 min-w-0">
				<p class="text-sm text-[--color-text-muted] uppercase tracking-wide">{{ label }}</p>
				<p class="font-semibold truncate" :title="String(value)">{{ value || '-' }}</p>
			</div>
			<slot name="trailing" />
			<UIcon v-if="clickable" :name="arrowIcon" class="w-3 h-3 text-[--color-text-muted] shrink-0" />
		</div>
		<slot />
	</div>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{
	icon?: string
	iconBgClass?: string
	iconClass?: string
	label: string
	value?: string | number | null
	clickable?: boolean
}>(), {
	clickable: false,
})

defineEmits<{ click: [] }>()

const icons = useIcons()
const arrowIcon = icons.arrowRight
</script>
