<!--
  This file is part of opsi-webgui application.
  opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
  Copyright (c) uib GmbH <info@uib.de> 2026
  All rights reserved.
  License: AGPL-3.0

  CoreAppPopover - UI library wrapper for popover rendering. Pass `open-on-hover` to also
  open it while the pointer rests on the trigger (click and keyboard still work as before).
-->
<template>
  <UPopover v-if="openOnHover" v-bind="$attrs" mode="hover" :open-delay="openDelay" :close-delay="closeDelay">
    <template v-for="(_, name) in $slots" :key="name" #[name]="slotData">
      <slot :name="name" v-bind="slotData || {}" />
    </template>
  </UPopover>
  <UPopover v-else v-bind="$attrs">
    <template v-for="(_, name) in $slots" :key="name" #[name]="slotData">
      <slot :name="name" v-bind="slotData || {}" />
    </template>
  </UPopover>
</template>

<script setup lang="ts">
  defineOptions({ inheritAttrs: false })

  withDefaults(defineProps<{ openOnHover?: boolean; openDelay?: number; closeDelay?: number }>(), {
    openDelay: 120,
    closeDelay: 280,
  })
</script>
