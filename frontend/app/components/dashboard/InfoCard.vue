Dashboard reusable info card with icon, label, value and optional sub-content.
<template>
	<div :class="[
		'bg-white dark:bg-[--color-surface] rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.08),0_4px_12px_rgba(0,0,0,0.04)] dark:shadow-[0_1px_3px_rgba(0,0,0,0.3),0_4px_12px_rgba(0,0,0,0.2)] p-4 transition-all duration-200',
		clickable ? 'cursor-pointer hover:shadow-[0_4px_20px_rgba(0,0,0,0.1)] dark:hover:shadow-[0_4px_20px_rgba(0,0,0,0.4)] group' : ''
	]" @click="clickable ? $emit('click') : undefined">
		<div class="flex items-center gap-3">
			<UIcon v-if="icon" :name="icon" class="w-5 h-5 text-[--color-text-muted] shrink-0" />
			<div class="flex-1 min-w-0">
				<p class="font-heading text-xs text-[--color-text-muted] tracking-wider m-0">{{ label }}</p>
				<p class="truncate text-base font-semibold" :title="String(value)">{{ value || '-' }}</p>
			</div>
			<slot name="trailing" />
			<UIcon v-if="clickable" :name="arrowIcon"
				class="w-3 h-3 text-[--color-text-muted] shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
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
const arrowIcon = icons.chevronRight
</script>
