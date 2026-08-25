<!--
  This file is part of opsi-webgui application.
  opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
  Copyright (c) uib GmbH <info@uib.de> 2026
  All rights reserved.
  License: AGPL-3.0

  CoreAppButton - UI library wrapper for button rendering.
-->
<template>
  <CoreAppTooltip v-if="tooltipText" :text="tooltipText" :delay="{ open: 300 }">
    <UButton v-bind="computedAttrs">
      <slot />
    </UButton>
  </CoreAppTooltip>
  <UButton v-else v-bind="computedAttrs">
    <slot />
  </UButton>
</template>

<script setup lang="ts">
  import { useUiStore } from '~/stores/uiStore'

  defineOptions({ inheritAttrs: false })

  const slots = useSlots()
  const attrs = useAttrs()
  const uiStore = useUiStore()

  // Native `title` attributes render the browser's black tooltip; use the styled
  // CoreAppTooltip everywhere instead and strip `title` so it isn't shown twice.
  const tooltipText = computed(() => {
    const title = attrs.title
    return typeof title === 'string' && title.trim() ? title : ''
  })

  const computedAttrs = computed(() => {
    const responsiveAttrs = { ...attrs } as Record<string, unknown>
    delete responsiveAttrs.title
    if (uiStore.isMobile) {
      responsiveAttrs.size = 'xs'
    }

    const hasText = Boolean(slots.default)
    const hasName = responsiveAttrs['aria-label'] || responsiveAttrs['aria-labelledby']
    if (!hasText && !hasName && tooltipText.value) {
      responsiveAttrs['aria-label'] = tooltipText.value
    }
    return responsiveAttrs
  })
</script>
