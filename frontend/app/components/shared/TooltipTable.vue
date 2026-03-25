<template>
	<UTooltip v-if="visibleRows.length > 0" :delay="{ open: 200 }">
		<slot />
		<template #content>
			<div class="max-w-sm max-h-100 overflow-auto p-5 bg-(--color-surface) dark:bg-black rounded">
				<table class="text-xs w-full">
					<tr v-for="(row, i) in visibleRows" :key="i"
						class="border-b border-(--color-border)/30 last:border-0">
						<td class="pr-3 py-0.5 font-mono text-(--color-text-muted) whitespace-nowrap max-w-40 truncate">
							{{ row.key }}
						</td>
						<td class="py-0.5 text-(--color-text) font-medium whitespace-nowrap">{{ row.value }}</td>
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
	rows: Array<{ key: string; value: string }>
}>()

const visibleRows = computed(() =>
	props.rows.filter(r => r.key?.trim() || r.value?.trim())
)
</script>
