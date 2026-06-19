<!--
  This file is part of opsi-webgui application.
  opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
  Copyright (c) uib GmbH <info@uib.de> 2026
  All rights reserved.
  License: AGPL-3.0

  CoreAppSelectMenu - UI library wrapper for searchable/multi-select dropdown rendering.
-->
<template>
  <USelectMenu v-bind="accessibleAttrs">
    <template v-for="(_, name) in $slots" :key="name" #[name]="slotData">
      <slot :name="name" v-bind="slotData || {}" />
    </template>
  </USelectMenu>
</template>

<script setup lang="ts">
defineOptions({ inheritAttrs: false })
const attrs = useAttrs()
const accessibleAttrs = computed(() => withAccessibleName(attrs))
</script>
