<template>
	<UTooltip v-if="visibleRows.length > 0" :delay="{ open: 200 }">
		<slot />
		<template #content>
			<div class="max-w-sm max-h-100 overflow-auto p-5 bg-(--color-surface) dark:bg-black rounded">
				<table class="text-xs w-full">
					<tr v-for="(row, i) in visibleRows" :key="i"
						class="border-b border-(--color-border)/30 last:border-0">
						<td class="pr-3 py-0.5 text-(--color-text-muted) whitespace-nowrap max-w-40 truncate">
							{{ row.key }}
						</td>
						<td class="py-0.5 text-(--color-text) font-medium whitespace-nowrap">
							<span class="inline-flex items-center gap-1">
								<span v-if="row.badge"
									class="inline-flex items-center px-1 py-0.5 rounded text-xs font-semibold leading-none"
									:class="row.badgeColor === 'warning' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400'
										: row.badgeColor === 'success' ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400'
											: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400'">
									{{ row.badge }}
								</span>
								<span v-else>{{ row.value }}</span>
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

const visibleRows = computed(() =>
	props.rows.filter(r => r.key?.trim() || r.value?.trim())
)
</script>
