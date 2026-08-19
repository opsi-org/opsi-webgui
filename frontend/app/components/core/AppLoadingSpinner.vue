<!--
  This file is part of opsi-webgui application.
  opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
  Copyright (c) uib GmbH <info@uib.de> 2026
  All rights reserved.
  License: AGPL-3.0

  CoreAppLoadingSpinner - Reusable loading spinner with size variants.
-->
<template>
  <div :class="containerClass">
    <UIcon :name="icons.refresh" :class="['animate-spin', sizeClass]" />
  </div>
</template>

<script setup lang="ts">
  const props = withDefaults(
    defineProps<{
      size?: 'xs' | 'sm' | 'md' | 'lg'
      centered?: boolean
    }>(),
    {
      size: 'md',
      centered: true,
    },
  )

  const icons = useIcons()

  const sizeMap: Record<string, string> = {
    xs: 'w-3.5 h-3.5',
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  }

  const sizeClass = computed(() => sizeMap[props.size] || sizeMap.md)

  const containerClass = computed(() => {
    const base = 'flex items-center gap-2 text-(--color-text-muted)'
    return props.centered ? `${base} justify-center` : base
  })
</script>
