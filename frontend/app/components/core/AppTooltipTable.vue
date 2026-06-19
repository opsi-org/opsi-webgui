<!--
  This file is part of opsi-webgui application.
  opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
  Copyright (c) uib GmbH <info@uib.de> 2026
  All rights reserved.
  License: AGPL-3.0

  CoreAppTooltipTable - Tooltip with tabular data display.
-->
<template>
	<UTooltip v-if="visibleRows.length > 0" :delay="{ open: 200 }">
		<slot />
		<template #content>
			<div class="max-w-sm max-h-100 overflow-auto p-5 bg-(--color-surface) rounded">
				<CoreAppTable :columns="tooltipColumns" wrapper-class="border-none">
					<tr v-for="(row, i) in visibleRows" :key="i"
						class="border-b border-(--color-border)/30 last:border-0">
						<td class="pr-3 py-0.5 text-(--color-text-muted) whitespace-nowrap max-w-40 truncate">
							{{ row.key }}
						</td>
						<td class="py-0.5 text-(--color-text) font-medium whitespace-nowrap">
							<span class="inline-flex items-center gap-1">
								<CoreAppStatusBadge v-if="row.badge"
									:status="row.badgeColor === 'success' ? 'success' : row.badgeColor === 'warning' ? 'warning' : 'error'"
									:label="row.badge" size="xs" />
								<span v-else>{{ row.value }}</span>
							</span>
						</td>
					</tr>
				</CoreAppTable>
			</div>
		</template>
	</UTooltip>
	<template v-else>
		<slot />
	</template>
</template>

<script setup lang="ts">
import type { TableColumn } from '~/components/core/AppTable.vue'

const props = defineProps<{
	rows: Array<{ key: string; value: string; badge?: string; badgeColor?: string }>
}>()

const tooltipColumns: TableColumn[] = []

const visibleRows = computed(() =>
	props.rows.filter(r => r.key?.trim() || r.value?.trim())
)
</script>
