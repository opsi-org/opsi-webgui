<!--
  This file is part of opsi-webgui application.
  opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
  Copyright (c) uib GmbH <info@uib.de> 2026
  All rights reserved.
  License: AGPL-3.0

  CoreAppButton - UI library wrapper for button rendering.
-->
<template>
	<UButton v-bind="computedAttrs">
		<slot />
	</UButton>
</template>

<script setup lang="ts">
defineOptions({ inheritAttrs: false })

const slots = useSlots()
const attrs = useAttrs()

const computedAttrs = computed(() => {
	const hasText = Boolean(slots.default)
	const hasName = attrs['aria-label'] || attrs['aria-labelledby']
	const title = attrs.title
	if (!hasText && !hasName && typeof title === 'string' && title.trim()) {
		return { ...attrs, 'aria-label': title }
	}
	return attrs
})
</script>
