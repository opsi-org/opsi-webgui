<!--
  This file is part of opsi-webgui application.
  opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
  Copyright (c) uib GmbH <info@uib.de> 2026
  All rights reserved.
  License: AGPL-3.0

  CoreAppHeading - card/section/modal title.
-->
<template>
	<component :is="tag" :class="headingClass">
		<CoreAppIcon v-if="icon" :name="icon" :class="iconClass" />
		<span class="min-w-0">
			<slot>{{ text }}</slot>
		</span>
	</component>
</template>

<script setup lang="ts">
interface Props {
	text?: string
	icon?: string
	size?: 'xs' | 'sm' | 'lg'
	tag?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'span' | 'div'
}

const props = withDefaults(defineProps<Props>(), {
	size: 'sm',
	tag: 'h3',
})

const headingClass = computed(() => [
	'font-heading uppercase tracking-wide text-(--color-text) m-0 flex items-center gap-2',
	props.size === 'xs' ? 'text-xs' : props.size === 'lg' ? 'text-base' : 'text-sm',
])

const iconClass = computed(() => (props.size === 'xs' ? 'w-4 h-4 shrink-0' : 'w-5 h-5 shrink-0'))
</script>
