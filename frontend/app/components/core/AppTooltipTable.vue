<!--
  This file is part of opsi-webgui application.
  opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
  Copyright (c) uib GmbH <info@uib.de> 2026
  All rights reserved.
  License: AGPL-3.0

  CoreAppTooltipTable - Tooltip with tabular data display.
-->
<template>
  <UTooltip v-if="visibleRows.length > 0" :delay="{ open: 200 }" :ui="{ content: 'p-0 bg-transparent shadow-none border-0' }">
    <slot />
    <template #content>
      <div
        class="max-h-[70vh] max-w-[22rem] sm:max-w-[26rem] lg:max-w-[30rem] overflow-auto rounded-md border border-(--color-border) bg-(--color-background) p-2 shadow-lg select-text text-xs"
      >
        <table class="min-w-full border-collapse">
          <tr v-for="(row, i) in visibleRows" :key="i" class="border-b border-(--color-border)/30 last:border-0">
            <td class="pr-2 py-0.5 text-(--color-text-muted) whitespace-nowrap align-top">
              {{ row.key }}
            </td>
            <td class="py-0.5 text-(--color-text) font-medium align-top max-w-64 break-words whitespace-normal">
              <span class="inline-flex items-center gap-1 flex-wrap">
                <span v-if="shouldShowValue(row)">{{ row.value }}</span>
                <CoreAppStatusBadge
                  v-if="row.badge"
                  :status="
                    row.badgeColor === 'success'
                      ? 'success'
                      : row.badgeColor === 'warning'
                        ? 'warning'
                        : row.badgeColor === 'info'
                          ? 'info'
                          : row.badgeColor === 'neutral'
                            ? 'neutral'
                            : 'error'
                  "
                  :label="row.badge"
                  size="xs"
                />
              </span>
            </td>
          </tr>
        </table>
      </div>
    </template>
  </UTooltip>
  <template v-else>
    <slot />
  </template>
</template>

<script setup lang="ts">
  interface TooltipRow {
    key: string
    value: string
    badge?: string
    badgeColor?: string
  }

  const props = defineProps<{
    rows: TooltipRow[]
  }>()

  const visibleRows = computed(() => props.rows.filter((r) => r.key?.trim() || r.value?.trim()))

  function shouldShowValue(row: TooltipRow): boolean {
    const value = (row.value || '').trim()
    if (!value) return false
    if (!row.badge) return true
    return value.toLowerCase() !== row.badge.trim().toLowerCase()
  }
</script>
