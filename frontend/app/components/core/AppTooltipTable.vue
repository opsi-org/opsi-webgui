<!--
  This file is part of opsi-webgui application.
  opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
  Copyright (c) uib GmbH <info@uib.de> 2026
  All rights reserved.
  License: AGPL-3.0

  CoreAppTooltipTable - Tooltip with tabular data display.
-->
<template>
  <UTooltip
    v-if="visibleRows.length > 0"
    :delay="{ open: 200 }"
    :ui="{ content: 'p-0 bg-transparent shadow-none border-0' }"
  >
    <slot />
    <template #content>
      <div class="max-h-[70vh] max-w-[min(92vw,72rem)] overflow-auto rounded-md bg-(--color-surface) p-4 shadow-lg">
        <table class="min-w-full border-collapse text-sm">
          <tr
            v-for="(row, i) in visibleRows"
            :key="i"
            class="border-b border-(--color-border)/30 last:border-0"
          >
            <td class="pr-4 py-1 text-(--color-text-muted) whitespace-nowrap align-top">
              {{ row.key }}
            </td>
            <td class="py-1 pr-2 text-(--color-text) font-medium whitespace-nowrap align-top">
              <span class="inline-flex items-center gap-1">
                <span v-if="row.value !== 'installed' && row.value !== 'successful'">{{
                  row.value
                }}</span>
                <CoreAppStatusBadge
                  v-if="row.badge"
                  :status="
                    row.badgeColor === 'success'
                      ? 'success'
                      : row.badgeColor === 'warning'
                        ? 'warning'
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
  const props = defineProps<{
    rows: Array<{ key: string; value: string; badge?: string; badgeColor?: string }>
  }>()

  const visibleRows = computed(() => props.rows.filter((r) => r.key?.trim() || r.value?.trim()))
</script>
