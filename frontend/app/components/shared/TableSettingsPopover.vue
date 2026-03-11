<!--
This file is part of opsi-webgui application.
opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
Copyright (c) uib GmbH <info@uib.de> 2026
All rights reserved.
License: AGPL-3.0

TableSettingsPopover - Unified settings component for table columns and sorting.
Uses cookies to persist settings separately for servers, clients, and products.
-->
<template>
	<UPopover>
		<UButton :icon="icons.settings" variant="outline" color="neutral" size="sm" :title="$t('tableSettings')" />
		<template #content>
			<div class="p-3 w-56">
				<div class="text-xs font-medium text-muted uppercase mb-2">{{ $t('tableSettings') }}</div>

				<!-- Sort By -->
				<div class="mb-3">
					<label class="text-xs text-muted">{{ $t('sortBy') }}</label>
					<USelect v-model="localSortColumn" :items="sortableColumnOptions" size="xs" class="w-full mt-1" />
					<div class="flex gap-1 mt-1">
						<UButton size="xs" :variant="localSortDirection === 'asc' ? 'solid' : 'outline'" color="neutral"
							class="flex-1" @click="localSortDirection = 'asc'">
							<UIcon :name="icons.sortAsc" class="w-3 h-3 mr-1" /> {{ $t('ascending') }}
						</UButton>
						<UButton size="xs" :variant="localSortDirection === 'desc' ? 'solid' : 'outline'"
							color="neutral" class="flex-1" @click="localSortDirection = 'desc'">
							<UIcon :name="icons.sortDesc" class="w-3 h-3 mr-1" /> {{ $t('descending') }}
						</UButton>
					</div>
				</div>

				<!-- Visible Columns -->
				<div class="mb-3">
					<label class="text-xs text-muted">{{ $t('columns') }}</label>
					<div class="mt-1 max-h-40 overflow-y-auto space-y-1">
						<label v-for="col in toggleableColumns" :key="col.key"
							class="flex items-center gap-2 p-1 rounded hover:bg-(--color-surface)] cursor-pointer">
							<input type="checkbox" :checked="tableSettings.isColumnVisible(col.key)"
								@change="tableSettings.toggleColumn(col.key)"
								class="rounded border-gray-300 text-opsi-blue" />
							<span class="text-xs">{{ col.label }}</span>
						</label>
					</div>
				</div>

				<!-- Reset -->
				<UButton variant="ghost" color="neutral" size="xs" block @click="tableSettings.reset">
					{{ $t('resetDefaults') }}
				</UButton>
			</div>
		</template>
	</UPopover>
</template>

<script setup lang="ts">
import type { TableColumn } from '~/types/table.types'
import { useTableSettings, type TableType } from '~/composables/useTableSettings'

const props = defineProps<{
	tableType: TableType
	columns: TableColumn[]
}>()

const icons = useIcons()
const { t: $t } = useI18n()

const tableSettings = useTableSettings(props.tableType)

const localSortColumn = computed({
	get: () => tableSettings.sortColumn.value,
	set: (val: string) => tableSettings.setSort(val, tableSettings.sortDirection.value),
})

const localSortDirection = computed({
	get: () => tableSettings.sortDirection.value,
	set: (val: 'asc' | 'desc') => tableSettings.setSort(tableSettings.sortColumn.value, val),
})

const sortableColumnOptions = computed(() =>
	props.columns
		.filter(c => c.sortable)
		.map(c => ({ value: c.key, label: c.label }))
)

const toggleableColumns = computed(() =>
	props.columns.filter(c => !c.alwaysVisible && c.key !== 'selected' && c.key !== 'actions')
)
</script>
