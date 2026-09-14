<!--
  This file is part of opsi-webgui application.
  opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
  Copyright (c) uib GmbH <info@uib.de> 2026
  All rights reserved.
  License: AGPL-3.0

  ServersAdvancedFiltersPopover - Server-type filter for the servers table. Content-only (no
  popover/trigger of its own): rendered as the "Advanced Filters" section inside
  CoreAppDataTable's combined filters popover.
-->
<template>
  <CoreAppSectionHeader :title="String($t('common.advancedFilters'))" />

  <div class="flex flex-col gap-1">
    <span class="text-xs text-(--color-text-muted)">{{ $t('common.type') }}</span>
    <div class="flex gap-1">
      <CoreAppButton
        size="xs"
        class="flex-1 justify-center"
        :variant="modelValue.type === undefined ? 'solid' : 'outline'"
        color="primary"
        :aria-pressed="modelValue.type === undefined"
        @click="setFilter({ type: undefined })"
      >
        {{ $t('common.all') }}
      </CoreAppButton>
      <CoreAppButton
        size="xs"
        class="flex-1 justify-center"
        :icon="icons.serverStack"
        :variant="modelValue.type === 'OpsiConfigserver' ? 'solid' : 'outline'"
        color="primary"
        :aria-pressed="modelValue.type === 'OpsiConfigserver'"
        @click="setFilter({ type: 'OpsiConfigserver' })"
      >
        {{ 'OpsiConfigserver' }}
      </CoreAppButton>
      <CoreAppButton
        size="xs"
        class="flex-1 justify-center"
        :icon="icons.server"
        :variant="modelValue.type === 'OpsiDepotserver' ? 'solid' : 'outline'"
        color="primary"
        :aria-pressed="modelValue.type === 'OpsiDepotserver'"
        @click="setFilter({ type: 'OpsiDepotserver' })"
      >
        {{ 'OpsiDepotserver' }}
      </CoreAppButton>
    </div>
  </div>
</template>

<script setup lang="ts">
  export interface ServerAdvancedFilters {
    type?: 'OpsiConfigserver' | 'OpsiDepotserver'
  }

  const props = defineProps<{
    modelValue: ServerAdvancedFilters
    canSaveSearch?: boolean
  }>()
  const emit = defineEmits<{
    (e: 'update:modelValue', value: ServerAdvancedFilters): void
    (e: 'favorite'): void
  }>()

  const icons = useIcons()
  const { t: $t } = useI18n()

  function setFilter(patch: Partial<ServerAdvancedFilters>) {
    emit('update:modelValue', { ...props.modelValue, ...patch })
  }
</script>
