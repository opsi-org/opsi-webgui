<!--
  This file is part of the OPSI-WebGUI application.
  OPSI-WebGUI is the web-based management interface for OPSI.
  https://opsi.org/en/

  Copyright (c) UIB GmbH info@uib.de 2026
  All rights reserved.
  License: AGPL-3.0

  CoreAppTooltip - UI library wrapper for tooltip rendering.
-->
<template>
  <UTooltip v-bind="$attrs">
    <slot />
    <template v-for="name in forwardedSlots" :key="name" #[name]="slotData">
      <slot :name="name" v-bind="slotData || {}" />
    </template>
  </UTooltip>
</template>

<script setup lang="ts">
  defineOptions({ inheritAttrs: false })

  const slots = useSlots()
  // "default" is already rendered above; forwarding it again would define the
  // slot twice and mount the trigger content for a second time.
  const forwardedSlots = computed(() => Object.keys(slots).filter((name) => name !== 'default'))
</script>
