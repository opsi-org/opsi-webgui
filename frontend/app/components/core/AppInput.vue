<!--
  This file is part of the OPSI-WebGUI application.
  OPSI-WebGUI is the web-based management interface for OPSI.
https://opsi.org/en/

  Copyright (c) UIB GmbH info@uib.de 2026
  All rights reserved.
  License: AGPL-3.0

  CoreAppInput - UI library wrapper for text input rendering.
-->
<template>
  <UInput v-bind="accessibleAttrs" class="w-full">
    <template v-for="(_, name) in $slots" :key="name" #[name]="slotData">
      <slot :name="name" v-bind="slotData || {}" />
    </template>
  </UInput>
</template>

<script setup lang="ts">
  import { useUiStore } from '~/stores/uiStore'

  defineOptions({ inheritAttrs: false })
  const attrs = useAttrs()
  const uiStore = useUiStore()
  const accessibleAttrs = computed(() => {
    const a = { ...(withAccessibleName(attrs) as Record<string, unknown>) }
    if (uiStore.isMobile) a.size = 'xs'
    return a
  })
</script>
