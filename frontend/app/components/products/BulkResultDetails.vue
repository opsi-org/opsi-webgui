<!--
  This file is part of opsi-webgui application.
  opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
  Copyright (c) uib GmbH <info@uib.de> 2026
  All rights reserved.
  License: AGPL-3.0

  ProductsBulkResultDetails - Filterable per-client result list for bulk product actions.
-->
<template>
  <div>
    <div class="flex gap-1.5 mb-3">
      <CoreAppButton
        v-for="filterOption in filterOptions"
        :key="filterOption.value"
        size="xs"
        :variant="filter === filterOption.value ? 'solid' : 'outline'"
        :color="filterOption.value === 'failed' ? 'error' : filterOption.value === 'succeeded' ? 'success' : 'neutral'"
        @click="filter = filterOption.value"
      >
        {{ filterOption.label }} ({{ filterOption.count }})
      </CoreAppButton>
    </div>

    <div class="max-h-96 overflow-y-auto space-y-1.5">
      <div
        v-for="detail in filteredDetails"
        :key="detail.clientId"
        class="p-2.5 rounded-lg border text-sm"
        :class="detail.success ? 'bg-(--color-success-soft-bg) border-success/30' : 'bg-(--color-error-soft-bg) border-error/30'"
      >
        <div class="flex items-center justify-between gap-2">
          <div class="flex items-center gap-2 min-w-0">
            <CoreAppIcon
              :name="detail.success ? icons.checkCircle : icons.xCircle"
              class="w-4 h-4 shrink-0"
              :class="detail.success ? 'text-(--color-success-soft-text)' : 'text-(--color-error-soft-text)'"
            />
            <span class="font-medium truncate">{{ detail.clientId }}</span>
          </div>
          <CoreAppBadge :color="detail.success ? 'success' : 'error'" size="xs" variant="subtle">
            {{ detail.success ? $t('common.success') : $t('common.failed') }}
          </CoreAppBadge>
        </div>
        <div
          v-if="detail.message"
          class="mt-1.5 pl-6 text-sm wrap-break-word"
          :class="detail.success ? 'text-(--color-success-soft-text)' : 'text-(--color-error-soft-text)'"
        >
          {{ detail.message }}
        </div>
      </div>
      <p v-if="filteredDetails.length === 0" class="text-sm text-center py-4">
        {{ $t('common.noResults') }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
  import type { BulkActionDetail } from '~/types'

  interface Props {
    details: BulkActionDetail[]
  }

  const props = defineProps<Props>()
  // Defaults to 'failed' so attention goes to what needs it; falls back to 'all' when nothing failed.
  const filter = defineModel<'all' | 'failed' | 'succeeded'>('filter', {
    default: 'failed',
  })

  const icons = useIcons()
  const { t: $t } = useI18n()

  const filterOptions = computed(() => [
    { value: 'all' as const, label: String($t('common.all')), count: props.details.length },
    { value: 'failed' as const, label: String($t('common.failed')), count: props.details.filter((d) => !d.success).length },
    { value: 'succeeded' as const, label: String($t('common.success')), count: props.details.filter((d) => d.success).length },
  ])

  const filteredDetails = computed(() => {
    if (filter.value === 'failed') return props.details.filter((d) => !d.success)
    if (filter.value === 'succeeded') return props.details.filter((d) => d.success)
    return props.details
  })
</script>
