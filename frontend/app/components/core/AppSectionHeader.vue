<!--
  This file is part of the OPSI-WebGUI application.
  OPSI-WebGUI is the web-based management interface for OPSI.
  https://opsi.org/en/

  Copyright (c) UIB GmbH info@uib.de 2026
  All rights reserved.
  License: AGPL-3.0

  CoreAppSectionHeader - Compact section heading with optional actions.
-->
<template>
  <div class="flex items-center justify-between gap-2">
    <h4 class="m-0 text-xs font-semibold uppercase tracking-wider text-(--color-text-muted)">{{ title }}</h4>
    <div class="flex items-center gap-0.5">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
  defineProps<{ title: string }>()
</script>
