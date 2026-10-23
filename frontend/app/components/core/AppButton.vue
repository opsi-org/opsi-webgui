<!--
  This file is part of the OPSI-WebGUI application.
  OPSI-WebGUI is the web-based management interface for OPSI.
  https://opsi.org/en/

  Copyright (c) UIB GmbH info@uib.de 2026
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
  import { buttonAppearance, type ButtonIntent } from '~/utils/buttonAppearance'

  defineOptions({ inheritAttrs: false })

  const props = defineProps<{ intent?: ButtonIntent; active?: boolean }>()
  const slots = useSlots()
  const attrs = useAttrs()
  const uiStore = useUiStore()

  // Native `title` attributes render the browser's black tooltip; use the styled
  // CoreAppTooltip everywhere instead and strip `title` so it isn't shown twice.
  const tooltipText = computed(() => {
    const title = attrs.title || attrs['aria-label']
    return typeof title === 'string' && title.trim() ? title : ''
  })

  const computedAttrs = computed(() => {
    const responsiveAttrs = { ...attrs } as Record<string, unknown>
    if (props.intent) {
      Object.assign(responsiveAttrs, buttonAppearance(props.intent, props.active))
    } else if (attrs['aria-pressed'] !== undefined) {
      Object.assign(responsiveAttrs, buttonAppearance('toggle', attrs['aria-pressed'] === true || attrs['aria-pressed'] === 'true'))
      if (attrs.color === 'error') responsiveAttrs.color = 'error'
    }
    if (props.intent === 'toggle') {
      responsiveAttrs['aria-pressed'] = Boolean(props.active)
    }
    responsiveAttrs.class = [
      'justify-center focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-primary) disabled:cursor-not-allowed disabled:opacity-50',
      !slots.default && 'shrink-0 aspect-square',
      attrs.class,
    ]
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
