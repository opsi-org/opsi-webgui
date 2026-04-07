SystemInfo - Component to display system diagnostic information with tree format

<template>
	<div class="space-y-0 dark:bg-(--color-surface)">
		<div v-if="loading" class="py-8 text-center">
			<SharedLoadingSpinner />
		</div>
		<template v-else>
			<!-- Top-level simple properties -->
			<div v-if="Object.keys(filteredSystemInfo).length > 0" class="system-tree-node">
				<div class="flex items-center gap-1.5 px-2 py-1.5 rounded cursor-pointer transition-colors hover:bg-(--color-surface-hover)"
					@click="toggleCard('_system')">
					<button type="button"
						class="w-5 h-5 flex items-center justify-center rounded transition-all shrink-0"
						:class="expandedCards['_system']
							? 'text-(--color-primary) bg-primary/10'
							: 'text-(--color-text-muted) hover:text-(--color-text) hover:bg-(--color-surface-hover)'">
						<UIcon :name="icons.chevronRight" class="w-3.5 h-3.5 transition-transform duration-200"
							:class="{ 'rotate-90': expandedCards['_system'] }" />
					</button>
					<span class="text-sm font-mono font-medium flex-1">{{ $t('systemProperties') }}</span>
					<span class="text-xs text-(--color-text-muted) opacity-60">{{ Object.keys(filteredSystemInfo).length }}</span>
				</div>
				<div v-if="expandedCards['_system']" class="pl-6 border-l border-(--color-border)/40 ml-4">
					<div v-for="(value, key) in filteredSystemInfo" :key="key"
						class="flex flex-col md:flex-row items-start md:items-center justify-between gap-2 md:gap-4 py-1.5 px-2 group hover:bg-(--color-surface-hover) rounded transition-colors">
						<span class="font-mono text-xs text-(--color-text-secondary) min-w-0 md:w-1/3 break-all">
							{{ key }}
						</span>
						<div class="flex items-center gap-2 w-full md:w-2/3">
							<UBadge v-if="typeof value === 'boolean'" :color="value ? 'success' : 'neutral'"
								variant="soft" size="xs">
								{{ value ? 'Yes' : 'No' }}
							</UBadge>
							<span v-else
								class="font-mono text-xs font-medium truncate max-w-full md:max-w-100 lg:max-w-200"
								:title="String(value)">
								{{ formatValue(value) }}
							</span>
							<UButton color="primary" variant="soft" size="xs" :icon="icons.copy"
								class="opacity-0 group-hover:opacity-100 transition-opacity"
								@click="$emit('copyToClipboard', String(value))" />
						</div>
					</div>
				</div>
			</div>

			<!-- Category nodes (objects from diagnostic data) -->
			<template v-for="(values, category) in filteredDiagnosticsData" :key="category">
				<div v-if="typeof values === 'object' && values !== null && Object.keys(values as object).length > 0"
					class="system-tree-node">
					<div class="flex items-center gap-1.5 px-2 py-1.5 rounded cursor-pointer transition-colors hover:bg-(--color-surface-hover)"
						@click="toggleCard(String(category))">
						<button type="button"
							class="w-5 h-5 flex items-center justify-center rounded transition-all shrink-0"
							:class="expandedCards[String(category)]
								? 'text-(--color-primary) bg-primary/10'
								: 'text-(--color-text-muted) hover:text-(--color-text) hover:bg-(--color-surface-hover)'">
							<UIcon :name="icons.chevronRight" class="w-3.5 h-3.5 transition-transform duration-200"
								:class="{ 'rotate-90': expandedCards[String(category)] }" />
						</button>
						<span class="text-sm font-mono font-medium flex-1">{{ String(category) }}</span>
						<span class="text-xs text-(--color-text-muted) opacity-60">{{ Object.keys(values as object).length }}</span>
					</div>
					<div v-if="expandedCards[String(category)]" class="pl-6 border-l border-(--color-border)/40 ml-4">
						<div v-for="(v, k) in (values as Record<string, unknown>)" :key="k"
							class="py-1.5 px-2 group hover:bg-(--color-surface-hover) rounded transition-colors">
							<div class="flex flex-col md:flex-row items-start justify-between gap-2 md:gap-4">
								<span class="font-mono text-xs text-(--color-text-secondary) min-w-0 md:w-1/3 break-all shrink-0">
									{{ k }}
								</span>
								<div class="flex items-start gap-2 w-full md:w-2/3 min-w-0">
									<UBadge v-if="typeof v === 'boolean'" :color="v ? 'success' : 'neutral'"
										variant="soft" size="xs">
										{{ v ? 'Yes' : 'No' }}
									</UBadge>
									<template v-else-if="isComplexValue(v)">
										<div class="w-full min-w-0">
											<pre class="font-mono text-xs bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3 overflow-x-auto max-h-64 overflow-y-auto whitespace-pre-wrap break-all">{{ formatJson(v) }}</pre>
										</div>
									</template>
									<span v-else class="font-mono text-xs font-medium break-all" :title="String(v)">
										{{ formatValue(v) }}
									</span>
									<UButton color="primary" variant="soft" size="xs" :icon="icons.copy"
										class="opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
										@click="$emit('copyToClipboard', typeof v === 'object' ? JSON.stringify(v, null, 2) : String(v))" />
								</div>
							</div>
						</div>
					</div>
				</div>
			</template>
			<div v-if="Object.keys(filteredSystemInfo).length === 0 && Object.keys(filteredDiagnosticsData).length === 0"
				class="text-center py-8 text-gray-500">
				{{ filter ? $t('noResultsFound') : $t('noDataAvailable') }}
			</div>
		</template>
	</div>
</template>

<script setup lang="ts">
const { t: $t } = useI18n()
const props = defineProps([
	'filteredSystemInfo', 'filteredDiagnosticsData', 'loading', 'icons', 'filter', 'formatKey', 'formatValue'
])
defineEmits(['copyToClipboard'])

const expandedCards = ref<Record<string, boolean>>({})

function toggleCard(key: string) {
	expandedCards.value[key] = !expandedCards.value[key]
}

function isComplexValue(value: unknown): boolean {
	if (value === null || value === undefined) return false
	if (typeof value !== 'object') return false
	if (Array.isArray(value)) return value.length > 3 || value.some(v => typeof v === 'object')
	return Object.keys(value as object).length > 0
}

function formatJson(value: unknown): string {
	try {
		return JSON.stringify(value, null, 2)
	} catch {
		return String(value)
	}
}
</script>

<style scoped>
.system-tree-node {
	position: relative;
	user-select: none;
}
</style>