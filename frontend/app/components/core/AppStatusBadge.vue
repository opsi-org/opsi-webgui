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
		<UBadge :color="badgeColor" :variant="variant" :size="size" class="justify-center cursor-pointer">
			<img v-if="imageSrc" :src="imageSrc" :alt="imageAlt || ''" :class="iconSizeClass" />
			<UIcon v-else-if="icon" :name="icon" :class="[iconSizeClass]" />
			<span v-if="label" class="text-[11px] leading-none opacity-80 mr-0.5" :style="contentTextStyle">{{ label
			}}</span>
			<span class="text-[12px] leading-none" :style="contentTextStyle">{{ displayValue }}</span>
		</UBadge>
	</UButton>
	<UBadge v-else-if="displayValue !== null && displayValue > 0" :color="badgeColor" :variant="variant" :size="size"
		class="justify-center" :class="{ 'cursor-pointer': clickable }" :title="tooltipText"
		v-on="clickable ? { click: onBadgeClick } : {}">
		<img v-if="imageSrc" :src="imageSrc" :alt="imageAlt || ''" :class="iconSizeClass" />
		<UIcon v-else-if="icon" :name="icon" :class="[iconSizeClass]" />
		<span v-if="label" class="text-[11px] leading-none opacity-80 mr-0.5" :style="contentTextStyle">{{ label
		}}</span>
		<span class="text-[12px] leading-none" :style="contentTextStyle">{{ displayValue }}</span>
	</UBadge>
	<UBadge v-else-if="label && displayValue === null" :color="badgeColor" :variant="variant" :size="size" class="gap-1"
		:class="{ 'cursor-pointer': clickable }" :title="tooltipText" v-on="clickable ? { click: onBadgeClick } : {}">
		<img v-if="imageSrc" :src="imageSrc" :alt="imageAlt || ''" :class="iconSizeClass" />
		<UIcon v-else-if="icon" :name="icon" :class="iconSizeClass" />
		<span class="text-[12px] leading-none" :style="contentTextStyle">{{ label }}</span>
	</UBadge>
	<UBadge v-else-if="displayValue === null && (icon || imageSrc)" :color="badgeColor" :variant="variant" :size="size"
		class="justify-center" :class="{ 'cursor-pointer': clickable }" :title="tooltipText"
		v-on="clickable ? { click: onBadgeClick } : {}">
		<img v-if="imageSrc" :src="imageSrc" :alt="imageAlt || ''" :class="iconSizeClass" />
		<UIcon v-else-if="icon" :name="icon" :class="iconSizeClass" />
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
	size: 'sm',
	clickable: false,
})

const emit = defineEmits<{ click: [] }>()

// Only intercept the click when the badge is interactive; otherwise let it bubble
// so decorative badges don't block clicks on a parent element (e.g. nav cards).
function onBadgeClick(event: MouseEvent) {
	if (!props.clickable) return
	event.stopPropagation()
	emit('click')
}

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

const contentTextStyle = computed(() => {
	// Use strong foreground for low-contrast badge variants.
	if (props.variant === 'subtle' || props.variant === 'soft' || props.variant === 'outline') {
		return { color: 'var(--color-text)' }
	}
	return { color: 'inherit' }
})

const iconSizeClass = computed(() => {
	switch (props.size) {
		case 'xs': return 'w-3 h-3'
		case 'sm': return 'w-4 h-4'
		case 'md': return 'w-5 h-5'
		case 'lg': return 'w-6 h-6'
		default: return 'w-4 h-4'
	}
})
</script>
