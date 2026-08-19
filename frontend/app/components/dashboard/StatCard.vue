<!--
  This file is part of opsi-webgui application.
  opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
  Copyright (c) uib GmbH <info@uib.de> 2026
  All rights reserved.
  License: AGPL-3.0

  DashboardStatCard - Reusable statistic card for dashboard metrics.
-->
<template>
  <div
    class="group opsi-card opsi-card-hover cursor-pointer transition-all duration-200"
    role="button"
    tabindex="0"
    @click="$emit('click')"
    @keydown.enter="$emit('click')"
    @keydown.space.prevent="$emit('click')"
  >
    <div class="flex items-center justify-between mb-2">
      <CoreAppIcon :name="icon" class="w-5 h-5" />
      <CoreAppIcon :name="arrowIcon" class="w-3 h-3 text-(--color-text-muted) opacity-0 group-hover:opacity-100 transition-opacity" />
    </div>
    <div class="min-h-8 mb-1 flex items-center">
      <CoreAppLoadingSpinner v-if="loading && value === null" size="sm" />
      <p v-else class="text-2xl font-bold">{{ value ?? '-' }}</p>
    </div>
    <p class="text-sm">
      {{ label }}
      <span v-if="subtitle">({{ subtitle }})</span>
    </p>
    <div v-if="$slots.default" class="mt-2 flex gap-2 text-xs">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
  defineProps<{
    icon: string
    value: number | string | null
    loading?: boolean
    label: string
    subtitle?: string
  }>()

  defineEmits<{ click: [] }>()

  const icons = useIcons()
  const arrowIcon = icons.chevronRight
</script>
