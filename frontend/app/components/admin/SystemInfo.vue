SystemInfo - Component to display system diagnostic information

<template>
	<div class="space-y-4  dark:bg-(--color-surface)">
		<div v-if="loading" class="py-8 text-center">
			<UIcon :name="icons.refresh" class="w-6 h-6 animate-spin text-gray-400" />
		</div>
		<template v-else>
			<div v-if="Object.keys(filteredSystemInfo).length > 0" class="rounded-lg overflow-hidden">
				<button @click="toggleCard('_system')"
					class="w-full flex items-center gap-2 px-4 py-3 hover:bg-(--color-surface-hover) transition-colors">
					<UIcon :name="expandedCards['_system'] ? icons.chevronDown : icons.chevronRight"
						class="w-4 h-4 shrink-0 text-gray-500" />
					<span class="font-heading text-xs">{{ $t('systemProperties') }}</span>
					<UBadge color="neutral" variant="soft" size="xs" class="ml-auto">
						{{ Object.keys(filteredSystemInfo).length }}
					</UBadge>
				</button>
				<div v-if="expandedCards['_system']" class="px-4">
					<div v-for="(value, key) in filteredSystemInfo" :key="key"
						class="flex flex-col md:flex-row items-start md:items-center justify-between gap-2 md:gap-4 py-2.5 group hover:bg-(--color-surface-hover) -mx-4 px-4 transition-colors">
						<span
							class="font-mono text-xs text-(--color-text) dark:text-(--color-text) min-w-0 md:w-1/3 break-all">
							{{ formatKey(String(key)) }}
						</span>
						<div class="flex items-center gap-2 w-full md:w-2/3">
							<UBadge v-if="typeof value === 'boolean'" :color="value ? 'success' : 'neutral'"
								variant="soft" size="xs">
								{{ value ? 'Yes' : 'No' }}
							</UBadge>
							<span v-else
								class="font-mono text-xs font-medium truncate max-w-full md:max-w-100 lg:max-w-200"
								:title="String(value)" v-tooltip="String(value).length > 40 ? String(value) : ''">
								{{ formatValue(value) }}
							</span>
							<UButton color="primary" variant="soft" size="xs" :icon="icons.copy"
								class="opacity-0 group-hover:opacity-100 transition-opacity"
								@click="$emit('copyToClipboard', String(value))" />
						</div>
					</div>
				</div>
			</div>
			<template v-for="(values, category) in filteredDiagnosticsData" :key="category">
				<div v-if="typeof values === 'object' && values !== null && Object.keys(values as object).length > 0"
					class="rounded-lg overflow-hidden">
					<button @click="toggleCard(String(category))"
						class="w-full flex items-center gap-2 px-4 py-3  hover:bg-(--color-surface-hover) transition-colors">
						<UIcon :name="expandedCards[String(category)] ? icons.chevronDown : icons.chevronRight"
							class="w-4 h-4 shrink-0 text-gray-500" />
						<span class="capitalize font-heading text-xs">{{ formatKey(String(category)) }}</span>
						<UBadge color="neutral" variant="soft" size="xs" class="ml-auto">
							{{ Object.keys(values as object).length }}
						</UBadge>
					</button>
					<div v-if="expandedCards[String(category)]" class="px-4">
						<div v-for="(v, k) in (values as Record<string, unknown>)" :key="k"
							class="py-2.5 group hover:bg-(--color-surface-hover) -mx-4 px-4 transition-colors">
							<div class="flex flex-col md:flex-row items-start justify-between gap-2 md:gap-4">
								<span
									class="font-mono text-xs text-(--color-text-secondary) dark:text-(--color-text-secondary) min-w-0 md:w-1/3 break-all shrink-0">
									{{ k }}
								</span>
								<div class="flex items-start gap-2 w-full md:w-2/3 min-w-0">
									<UBadge v-if="typeof v === 'boolean'" :color="v ? 'success' : 'neutral'"
										variant="soft" size="xs">
										{{ v ? 'Yes' : 'No' }}
									</UBadge>
									<template v-else-if="isComplexValue(v)">
										<div class="w-full min-w-0">
											<pre
												class="font-mono text-xs bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3 overflow-x-auto max-h-64 overflow-y-auto whitespace-pre-wrap break-all">{{ formatJson(v) }}</pre>
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
const expandedNested = ref<Record<string, boolean>>({})

function toggleCard(key: string) {
	expandedCards.value[key] = !expandedCards.value[key]
}

function toggleNestedCard(key: string) {
	expandedNested.value[key] = !expandedNested.value[key]
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