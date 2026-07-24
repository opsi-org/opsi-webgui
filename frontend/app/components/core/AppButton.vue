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
  import { useUiStore } from '~/stores/uiStore'

  defineOptions({ inheritAttrs: false })

  const slots = useSlots()
  const attrs = useAttrs()
  const uiStore = useUiStore()

  const computedAttrs = computed(() => {
    const responsiveAttrs = { ...attrs } as Record<string, unknown>
    if (uiStore.isMobile) {
      responsiveAttrs.size = 'xs'
    }

    const hasText = Boolean(slots.default)
    const hasName = responsiveAttrs['aria-label'] || responsiveAttrs['aria-labelledby']
    const title = responsiveAttrs.title
    if (!hasText && !hasName && typeof title === 'string' && title.trim()) {
      return { ...responsiveAttrs, 'aria-label': title }
    }
    return responsiveAttrs
  })
</script>
