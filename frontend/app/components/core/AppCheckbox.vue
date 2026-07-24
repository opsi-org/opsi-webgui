<!--
  This file is part of opsi-webgui application.
  opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
  Copyright (c) uib GmbH <info@uib.de> 2026
  All rights reserved.
  License: AGPL-3.0

  CoreAppCheckbox - UI library wrapper for checkbox rendering.
-->
<template>
  <UCheckbox v-bind="accessibleAttrs" />
</template>

<script setup lang="ts">
  import { useUiStore } from '~/stores/uiStore'

  defineOptions({ inheritAttrs: false })
  const attrs = useAttrs()
  const uiStore = useUiStore()
  const accessibleAttrs = computed(() => {
    const a = withAccessibleName(attrs) as Record<string, unknown>
    if (uiStore.isMobile) a.size = 'xs'
    return a
  })
</script>
