<!--
  This file is part of opsi-webgui application.
  opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
  Copyright (c) uib GmbH <info@uib.de> 2026
  All rights reserved.
  License: AGPL-3.0

  ServersAdvancedFiltersPopover - Server-type filter for the servers table.
-->
<template>
  <CoreAppHoverPopover :title="String($t('common.advancedFilters'))" content-class="min-w-80">
    <CoreAppButton
      :aria-label="String($t('common.advancedFilters'))"
      variant="outline"
      color="primary"
      size="sm"
      data-testid="servers-advanced-filters"
    >
      <CoreAppStackedIcons
        :primary-icon="icons.filter"
        :secondary-icon="icons.starSolid"
        size="sm"
        primary-class="w-4 h-4"
        secondary-class="w-2.5 h-2.5"
      />
      <template v-if="activeCount > 0">{{ activeCount }}</template>
    </CoreAppButton>

    <template #content>
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

      <div class="pt-1">
        <CoreAppButton variant="outline" color="primary" size="xs" block @click="reset">{{ $t('common.resetDefaults') }}</CoreAppButton>
      </div>
    </template>
  </CoreAppHoverPopover>
</template>

<script setup lang="ts">
  export interface ServerAdvancedFilters {
    type?: 'OpsiConfigserver' | 'OpsiDepotserver'
  }

  const props = defineProps<{
    modelValue: ServerAdvancedFilters
  }>()
  const emit = defineEmits<{
    (e: 'update:modelValue', value: ServerAdvancedFilters): void
  }>()

  const icons = useIcons()
  const { t: $t } = useI18n()

  const activeCount = computed(() => (props.modelValue.type !== undefined ? 1 : 0))

  function setFilter(patch: Partial<ServerAdvancedFilters>) {
    emit('update:modelValue', { ...props.modelValue, ...patch })
  }

  function reset() {
    emit('update:modelValue', {})
  }
</script>
