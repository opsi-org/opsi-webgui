<!--
  This file is part of opsi-webgui application.
  opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
  Copyright (c) uib GmbH <info@uib.de> 2026
  All rights reserved.
  License: AGPL-3.0

  CoreAppEmptyState - Uniform placeholder for empty / "nothing selected" states.
-->
<template>
  <div class="flex flex-col items-center justify-center gap-3 text-center px-4 py-8" :class="fill ? 'h-full min-h-40' : ''">
    <CoreAppIcon v-if="icon" :name="icon" class="w-12 h-12 opacity-40 text-(--color-text-muted)" />
    <p class="text-sm text-(--color-text-muted) m-0">
      <slot>{{ message }}</slot>
    </p>
    <slot name="actions" />
  </div>
</template>

<script setup lang="ts">
  withDefaults(
    defineProps<{
      icon?: string
      message?: string
      fill?: boolean
    }>(),
    {
      fill: true,
    },
  )
</script>
