<!--
  This file is part of opsi-webgui application.
  opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
  Copyright (c) uib GmbH <info@uib.de> 2026
  All rights reserved.
  License: AGPL-3.0

  ClientsAdvancedFiltersPopover - Reachable/not-seen-since/failed-products filters for the clients table.
-->
<template>
  <CoreAppHoverPopover :title="String($t('common.advancedFilters'))" content-class="min-w-80">
    <CoreAppButton
      :aria-label="String($t('common.advancedFilters'))"
      variant="outline"
      color="primary"
      size="sm"
      data-testid="clients-advanced-filters"
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
        <span class="text-xs text-(--color-text-muted)">{{ $t('clients.reachable.status') }}</span>
        <div class="flex gap-1">
          <CoreAppButton
            size="xs"
            class="flex-1 justify-center"
            :variant="modelValue.reachable === undefined ? 'solid' : 'outline'"
            color="primary"
            :aria-pressed="modelValue.reachable === undefined"
            @click="setFilter({ reachable: undefined })"
          >
            {{ $t('common.all') }}
          </CoreAppButton>
          <CoreAppButton
            size="xs"
            class="flex-1 justify-center gap-1"
            :variant="modelValue.reachable === true ? 'solid' : 'outline'"
            color="primary"
            :aria-pressed="modelValue.reachable === true"
            @click="setFilter({ reachable: true })"
          >
            <CoreAppStackedIcons
              :primary-icon="icons.client"
              :secondary-icon="icons.checkCircle"
              size="sm"
              primary-class="w-4 h-4"
              secondary-class="w-2.5 h-2.5 text-(--color-success-soft-text)"
            />
            {{ $t('clients.reachable.yes') }}
          </CoreAppButton>
          <CoreAppButton
            size="xs"
            class="flex-1 justify-center gap-1"
            :variant="modelValue.reachable === false ? 'solid' : 'outline'"
            color="primary"
            :aria-pressed="modelValue.reachable === false"
            @click="setFilter({ reachable: false })"
          >
            <CoreAppStackedIcons
              :primary-icon="icons.client"
              :secondary-icon="icons.xCircle"
              size="sm"
              primary-class="w-4 h-4"
              secondary-class="w-2.5 h-2.5 text-(--color-error-soft-text)"
            />{{ $t('clients.reachable.no') }}
          </CoreAppButton>
        </div>
      </div>

      <div class="flex flex-col gap-1">
        <span class="text-xs text-(--color-text-muted)">{{ $t('clients.advancedFilters.notSeenSince') }}</span>
        <CoreAppInput
          v-model.number="notSeenSinceDraft"
          type="number"
          min="0"
          size="sm"
          :placeholder="String($t('common.days'))"
          :aria-label="String($t('clients.advancedFilters.notSeenSince'))"
          @blur="commitNotSeenSince"
          @keydown.enter.prevent="commitNotSeenSince"
        />
      </div>

      <CoreAppCheckbox
        :model-value="!!modelValue.hasFailedProducts"
        :label="String($t('clients.advancedFilters.hasFailedProducts'))"
        size="xs"
        :ui="{ root: 'w-full px-1 py-1 rounded hover:bg-(--color-surface-hover)', label: 'text-xs w-full cursor-pointer' }"
        @update:model-value="(v: boolean) => setFilter({ hasFailedProducts: v })"
      />

      <CoreAppCheckbox
        :model-value="!!modelValue.hasOutdatedProducts"
        :label="String($t('clients.advancedFilters.hasOutdatedProducts'))"
        size="xs"
        :ui="{ root: 'w-full px-1 py-1 rounded hover:bg-(--color-surface-hover)', label: 'text-xs w-full cursor-pointer' }"
        @update:model-value="(v: boolean) => setFilter({ hasOutdatedProducts: v })"
      />

      <div class="pt-1">
        <CoreAppButton variant="outline" color="primary" size="xs" block @click="reset">{{ $t('common.resetDefaults') }}</CoreAppButton>
      </div>
    </template>
  </CoreAppHoverPopover>
</template>

<script setup lang="ts">
  export interface ClientAdvancedFilters {
    reachable?: boolean
    notSeenSinceDays?: number
    hasFailedProducts?: boolean
    hasOutdatedProducts?: boolean
  }

  const props = defineProps<{
    modelValue: ClientAdvancedFilters
  }>()
  const emit = defineEmits<{
    (e: 'update:modelValue', value: ClientAdvancedFilters): void
  }>()

  const icons = useIcons()
  const { t: $t } = useI18n()
  const notSeenSinceDraft = ref(props.modelValue.notSeenSinceDays)

  watch(
    () => props.modelValue.notSeenSinceDays,
    (v) => {
      notSeenSinceDraft.value = v
    },
  )

  const activeCount = computed(() => {
    let count = 0
    if (props.modelValue.reachable !== undefined) count++
    if (props.modelValue.notSeenSinceDays !== undefined && props.modelValue.notSeenSinceDays !== null) count++
    if (props.modelValue.hasFailedProducts) count++
    if (props.modelValue.hasOutdatedProducts) count++
    return count
  })

  function setFilter(patch: Partial<ClientAdvancedFilters>) {
    emit('update:modelValue', { ...props.modelValue, ...patch })
  }

  function commitNotSeenSince() {
    setFilter({ notSeenSinceDays: notSeenSinceDraft.value ?? undefined })
  }

  function reset() {
    notSeenSinceDraft.value = undefined
    emit('update:modelValue', {})
  }
</script>
