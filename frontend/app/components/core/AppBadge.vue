<!--
  This file is part of opsi-webgui application.
  opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
  Copyright (c) uib GmbH <info@uib.de> 2026
  All rights reserved.
  License: AGPL-3.0

  CoreAppBadge - UI library wrapper for badge rendering.
-->
<template>
	<UBadge :color="color" :variant="variant" :size="size" :class="badgeClass" v-bind="$attrs">
		<slot>
			<img v-if="imageSrc" :src="imageSrc" :alt="imageAlt || ''" :class="iconSizeClass" />
			<CoreAppIcon v-if="icon && !imageSrc" :name="icon" :class="iconSizeClass" />
			<span v-if="label" class="font-medium">{{ label }}</span>
		</slot>
	</UBadge>
</template>

<script setup lang="ts">
defineOptions({ inheritAttrs: false })
type BadgeColor = 'success' | 'warning' | 'error' | 'info' | 'neutral' | 'primary'
type BadgeVariant = 'subtle' | 'soft' | 'outline' | 'solid'
type BadgeSize = 'xs' | 'sm' | 'md' | 'lg'

interface Props {
	color?: BadgeColor
	variant?: BadgeVariant
	size?: BadgeSize
	icon?: string
	imageSrc?: string
	imageAlt?: string
	label?: string
	class?: string
}

const props = withDefaults(defineProps<Props>(), {
	color: 'neutral',
	variant: 'subtle',
	size: 'xs',
})

const badgeClass = computed(() => props.class || '')

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
