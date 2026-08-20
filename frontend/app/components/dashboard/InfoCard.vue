<!--
  This file is part of opsi-webgui application.
  opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
  Copyright (c) uib GmbH <info@uib.de> 2026
  All rights reserved.
  License: AGPL-3.0

  DashboardInfoCard - Information card for dashboard with description and link.
-->
<template>
  <!-- eslint-disable-next-line vuejs-accessibility/no-static-element-interactions -- conditionally interactive: role/tabindex/keyboard handlers are bound only when `clickable` is true -->
  <div
    :class="['opsi-card transition-all duration-200', clickable ? 'cursor-pointer opsi-card-hover group' : '']"
    :role="clickable ? 'button' : 'region'"
    :tabindex="0"
    :aria-label="clickable ? label : label + ': ' + (value ?? '-')"
    @click="clickable ? $emit('click') : undefined"
    @keydown.enter="clickable ? $emit('click') : undefined"
    @keydown.space.prevent="clickable ? $emit('click') : undefined"
  >
    <div class="flex items-center gap-3">
      <CoreAppIcon v-if="icon" :name="icon" class="w-5 h-5 shrink-0" />
      <div class="flex-1 min-w-0">
        <p class="font-heading text-xs text-(--color-text-muted) tracking-wider m-0">{{ label }}</p>
        <p class="truncate text-base font-semibold" :title="String(value)">{{ value || '-' }}</p>
      </div>
      <slot name="trailing" />
      <CoreAppIcon
        v-if="clickable"
        :name="arrowIcon"
        class="w-3 h-3 text-(--color-text-muted) shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
      />
    </div>
    <slot />
  </div>
</template>

<script setup lang="ts">
  const props = withDefaults(
    defineProps<{
      icon?: string
      label: string
      value?: string | number | null
      clickable?: boolean
    }>(),
    {
      clickable: false,
    },
  )

  defineEmits<{ click: [] }>()

  const icons = useIcons()
  const arrowIcon = icons.chevronRight
</script>
