<!--
  This file is part of opsi-webgui application.
  opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
  Copyright (c) uib GmbH <info@uib.de> 2026
  All rights reserved.
  License: AGPL-3.0

  CoreAppSectionHeader - Compact title + right-aligned icon actions row, used to head up a
  section inside a popover (e.g. "Advanced Filters") without repeating the title elsewhere.
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
