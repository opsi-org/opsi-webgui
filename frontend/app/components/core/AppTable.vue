<!--
  This file is part of opsi-webgui application.
  opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
  Copyright (c) uib GmbH <info@uib.de> 2026
  All rights reserved.
  License: AGPL-3.0

  CoreAppTable - UI library wrapper for simple table rendering.
-->
<template>
	<div class="border border-(--color-border) rounded-lg overflow-hidden" :class="wrapperClass">
		<div :class="['overflow-y-auto text-xs', scrollClass]" :style="maxHeight ? { maxHeight } : {}">
			<table class="min-w-full table-auto">
				<thead v-if="columns.length > 0" class="bg-(--color-surface) sticky top-0 z-10">
					<tr class="text-left text-(--color-text-muted)">
						<th v-for="col in columns" :key="col.key" class="px-2 py-1.5 font-medium" :class="[col.class,
						col.sortable ? 'cursor-pointer select-none hover:text-(--color-text)' : '']"
							:style="col.width ? { width: col.width } : {}"
							:aria-sort="col.sortable ? (sortKey === col.key ? (sortDir === 'asc' ? 'ascending' : 'descending') : 'none') : undefined"
							@click="col.sortable && emit('sort', col.key)">
							<span class="inline-flex items-center gap-1">
								{{ col.label }}
								<CoreAppIcon v-if="col.sortable"
									:name="sortKey === col.key ? (sortDir === 'asc' ? icons.sortAsc : icons.sortDesc) : icons.sort"
									:class="['w-3 h-3', sortKey === col.key ? '' : 'opacity-30']" />
							</span>
						</th>
					</tr>
				</thead>
				<tbody class="divide-y divide-(--color-border)">
					<slot />
				</tbody>
			</table>
		</div>
	</div>
</template>

<script setup lang="ts">
export interface TableColumn {
	key: string
	label: string
	class?: string
	width?: string
	sortable?: boolean
}

interface Props {
	columns?: TableColumn[]
	maxHeight?: string
	wrapperClass?: string
	sortKey?: string
	sortDir?: 'asc' | 'desc'
}

const props = withDefaults(defineProps<Props>(), {
	columns: () => [],
})

const emit = defineEmits<{
	(e: 'sort', key: string): void
}>()

const icons = useIcons()

const scrollClass = computed(() => props.maxHeight ? 'overflow-y-auto' : '')
</script>
