<!--
  This file is part of opsi-webgui application.
  opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
  Copyright (c) uib GmbH <info@uib.de> 2026
  All rights reserved.
  License: AGPL-3.0

  CoreAppStatusBadge - Unified badge component for status labels and statistic counts.
-->
<template>
	<UButton v-if="clickable && displayValue !== null && displayValue > 0" variant="ghost" color="neutral" size="xs"
		class="p-0!" :title="tooltipText" @click.stop="$emit('click')">
		<UBadge :color="badgeColor" :variant="variant" :size="size" class="min-w-6 justify-center cursor-pointer">
			<img v-if="imageSrc" :src="imageSrc" :alt="imageAlt || ''" :class="iconSizeClass" />
			<UIcon v-else-if="icon" :name="icon" :class="[iconSizeClass, 'mr-0.5']" />
			<span v-if="label" class="text-xs opacity-70 mr-0.5">{{ label }}</span>
			<span class="font-medium">{{ displayValue }}</span>
		</UBadge>
	</UButton>
	<UBadge v-else-if="displayValue !== null && displayValue > 0" :color="badgeColor" :variant="variant" :size="size"
		class="min-w-6 justify-center" :class="{ 'cursor-pointer': clickable }" :title="tooltipText"
		@click.stop="clickable ? $emit('click') : undefined">
		<img v-if="imageSrc" :src="imageSrc" :alt="imageAlt || ''" :class="iconSizeClass" />
		<UIcon v-else-if="icon" :name="icon" :class="[iconSizeClass, 'mr-0.5']" />
		<span v-if="label" class="text-xs opacity-70 mr-0.5">{{ label }}</span>
		<span class="font-medium">{{ displayValue }}</span>
	</UBadge>
	<UBadge v-else-if="label && displayValue === null" :color="badgeColor" :variant="variant" :size="size" class="gap-1"
		:class="{ 'cursor-pointer': clickable }" :title="tooltipText"
		@click.stop="clickable ? $emit('click') : undefined">
		<img v-if="imageSrc" :src="imageSrc" :alt="imageAlt || ''" :class="iconSizeClass" />
		<UIcon v-else-if="icon" :name="icon" :class="iconSizeClass" />
		<span class="font-medium">{{ label }}</span>
	</UBadge>
	<span v-else class="text-(--color-text-muted) text-xs flex justify-center">-</span>
</template>

<script setup lang="ts">
type BadgeStatus = 'success' | 'warning' | 'error' | 'info' | 'neutral'
type BadgeVariant = 'subtle' | 'soft' | 'outline' | 'solid'
type BadgeSize = 'xs' | 'sm' | 'md' | 'lg'

interface Props {
	value?: number | null
	icon?: string
	imageSrc?: string
	imageAlt?: string
	label?: string
	tooltip?: string
	status?: BadgeStatus
	variant?: BadgeVariant
	size?: BadgeSize
	clickable?: boolean
}

const props = withDefaults(defineProps<Props>(), {
	value: null,
	status: 'neutral',
	variant: 'subtle',
	size: 'xs',
	clickable: false,
})

defineEmits<{ click: [] }>()

const displayValue = computed(() => props.value)
const tooltipText = computed(() => {
	if (!props.tooltip) return undefined
	if (props.value != null) return `${props.tooltip}: ${props.value}`
	return props.tooltip
})

const badgeColor = computed(() => {
	switch (props.status) {
		case 'success': return 'success'
		case 'warning': return 'warning'
		case 'error': return 'error'
		case 'info': return 'info'
		default: return 'neutral'
	}
})

const iconSizeClass = computed(() => {
	switch (props.size) {
		case 'xs': return 'w-3 h-3'
		case 'sm': return 'w-3.5 h-3.5'
		case 'md': return 'w-4 h-4'
		case 'lg': return 'w-5 h-5'
		default: return 'w-3 h-3'
	}
})
</script>
