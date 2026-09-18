<!--
  This file is part of opsi-webgui application.
  opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
  Copyright (c) uib GmbH <info@uib.de> 2026
  All rights reserved.
  License: AGPL-3.0

  CoreAppActionResultsTable - Table showing action results for clients
-->

<template>
  <div class="space-y-2">
    <div class="flex flex-wrap items-center gap-1.5">
      <CoreAppButton
        v-for="option in filterOptions"
        :key="option.value"
        size="xs"
        :variant="filter === option.value ? 'solid' : 'outline'"
        :color="option.value === 'failed' ? 'error' : option.value === 'succeeded' ? 'success' : 'neutral'"
        @click="filter = option.value"
      >
        {{ option.label }} ({{ option.count }})
      </CoreAppButton>
      <CoreAppFilterInput v-model="searchQuery" size="xs" input-class="w-full sm:w-56" :placeholder="String($t('common.filter'))" />
    </div>

    <div class="max-h-[min(60vh,32rem)] overflow-auto rounded-md border border-(--color-border)">
      <table class="w-full text-xs">
        <thead class="sticky top-0 z-10 bg-(--color-surface) text-left text-(--color-text-muted)">
          <tr>
            <th class="px-2 py-1.5 font-medium">{{ $t('clients.id') }}</th>
            <th class="px-2 py-1.5 font-medium">{{ $t('common.results') }}</th>
            <th class="px-2 py-1.5 font-medium">{{ $t('common.message') }}</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-(--color-border)">
          <tr v-for="detail in filteredDetails" :key="detail.clientId" class="align-top hover:bg-(--color-surface-hover)">
            <td class="whitespace-nowrap px-2 py-1.5 font-medium">{{ detail.clientId }}</td>
            <td class="whitespace-nowrap px-2 py-1.5">
              <CoreAppBadge :color="detail.success ? 'success' : 'error'" size="xs" variant="subtle">
                {{ detail.success ? $t('common.success') : $t('common.failed') }}
              </CoreAppBadge>
            </td>
            <td class="px-2 py-1.5 wrap-break-word text-(--color-text)">{{ detail.message || '-' }}</td>
          </tr>
        </tbody>
      </table>
      <p v-if="filteredDetails.length === 0" class="px-2 py-4 text-center text-sm text-(--color-text-muted)">
        {{ $t('common.noResults') }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
  import type { BulkActionDetail } from '~/types'

  const props = defineProps<{ details: BulkActionDetail[] }>()
  const filter = defineModel<'all' | 'failed' | 'succeeded'>('filter', { default: 'failed' })
  const { t: $t } = useI18n()
  const searchQuery = ref('')

  const filterOptions = computed(() => [
    { value: 'all' as const, label: String($t('common.all')), count: props.details.length },
    { value: 'failed' as const, label: String($t('common.failed')), count: props.details.filter((d) => !d.success).length },
    { value: 'succeeded' as const, label: String($t('common.success')), count: props.details.filter((d) => d.success).length },
  ])

  const filteredDetails = computed(() => {
    const query = searchQuery.value.trim().toLowerCase()
    return props.details.filter((detail) => {
      const matchesFilter = filter.value === 'failed' ? !detail.success : filter.value === 'succeeded' ? detail.success : true
      const matchesSearch = !query || detail.clientId.toLowerCase().includes(query) || detail.message?.toLowerCase().includes(query)
      return matchesFilter && matchesSearch
    })
  })
</script>
