<!--
This file is part of opsi-webgui application.
opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
Copyright (c) uib GmbH <info@uib.de> 2026
All rights reserved.
License: AGPL-3.0

Statistic badge component for displaying numeric statistics with icon and link.
-->
<template>
	<NuxtLink v-if="displayValue > 0" :to="link" class="inline-flex items-center justify-center" :title="tooltipText">
		<UBadge :color="badgeColor" variant="subtle" size="xs" class="min-w-6 justify-center">
			<UIcon v-if="icon" :name="icon" class="w-3 h-3 mr-0.5" />
			<span class="font-medium">{{ displayValue }}</span>
		</UBadge>
	</NuxtLink>
	<span v-else class="text-(--color-text-muted) text-xs flex justify-center">-</span>
</template>

<script setup lang="ts">
interface Props {
	value?: number
	icon?: string
	tooltip?: string
	status?: 'success' | 'warning' | 'error' | 'info' | 'neutral'
	link?: string
}

const props = withDefaults(defineProps<Props>(), {
	status: 'neutral',
	link: '#'
})

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
