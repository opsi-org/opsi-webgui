<!--
This file is part of opsi-webgui application.
opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
Copyright (c) uib GmbH <info@uib.de> 2026
All rights reserved.
License: AGPL-3.0

SystemInfo - Component to display system diagnostic information
-->

<template>
	<div class="space-y-4">
		<div v-if="loading" class="py-8 text-center">
			<UIcon :name="icons.loading" class="w-6 h-6 animate-spin text-gray-400" />
		</div>
		<template v-else>
			<UCard v-if="Object.keys(filteredSystemInfo).length > 0">
				<template #header>
					<div class="flex items-center gap-2">
						<span class="font-medium">{{ $t('systemProperties') }}</span>
					</div>
				</template>
				<div class="divide-y divide-(--color-border)">
					<div v-for="(value, key) in filteredSystemInfo" :key="key"
						class="flex flex-col md:flex-row items-start md:items-center justify-between gap-2 md:gap-4 py-2.5 group hover:bg-(--color-surface-hover) -mx-4 px-4 transition-colors">
						<span class="text-sm text-gray-600 dark:text-gray-400 min-w-0 md:w-1/3 break-all">
							{{ formatKey(String(key)) }}
						</span>
						<div class="flex items-center gap-2 w-full md:w-2/3">
							<UBadge v-if="typeof value === 'boolean'" :color="value ? 'success' : 'neutral'"
								variant="soft" size="xs">
								{{ value ? 'Yes' : 'No' }}
							</UBadge>
							<span v-else
								class="font-mono text-sm font-medium truncate max-w-full md:max-w-[400px] lg:max-w-[800px]"
								:title="String(value)" v-tooltip="String(value).length > 40 ? String(value) : ''">
								{{ formatValue(value) }}
							</span>
							<UButton variant="ghost" size="xs" :icon="icons.copy"
								class="opacity-0 group-hover:opacity-100 transition-opacity"
								@click="$emit('copyToClipboard', String(value))" />
						</div>
					</div>
				</div>
			</UCard>
			<template v-for="(values, category) in filteredDiagnosticsData" :key="category">
				<UCard v-if="typeof values === 'object' && values !== null && Object.keys(values as object).length > 0">
					<template #header>
						<div class="flex items-center gap-2">
							<span class="font-medium capitalize">{{ formatKey(String(category)) }}</span>
							<UBadge color="neutral" variant="soft" size="xs">{{ Object.keys(values as object).length }}
							</UBadge>
						</div>
					</template>
					<div>
						<div v-for="(v, k) in (values as Record<string, unknown>)" :key="k"
							class="flex flex-col md:flex-row items-start md:items-center justify-between gap-2 md:gap-4 py-2.5 group hover:bg-(--color-surface-hover) -mx-4 px-4 transition-colors">
							<span class="text-sm text-gray-600 dark:text-gray-400 min-w-0 md:w-1/3 break-all">
								{{ k }}
							</span>
							<div class="flex items-center gap-2 w-full md:w-2/3">
								<UBadge v-if="typeof v === 'boolean'" :color="v ? 'success' : 'neutral'" variant="soft"
									size="xs">
									{{ v ? 'Yes' : 'No' }}
								</UBadge>
								<span v-else
									class="font-mono text-sm font-medium truncate max-w-full md:max-w-[400px] lg:max-w-[800px]"
									:title="String(v)" v-tooltip="String(v).length > 40 ? String(v) : ''">
									{{ formatValue(v) }}
								</span>
								<UButton variant="ghost" size="xs" :icon="icons.copy"
									class="opacity-0 group-hover:opacity-100 transition-opacity"
									@click="$emit('copyToClipboard', String(v))" />
							</div>
						</div>
					</div>
				</UCard>
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
defineProps([
	'filteredSystemInfo', 'filteredDiagnosticsData', 'loading', 'icons', 'filter', 'formatKey', 'formatValue'
])
defineEmits(['copyToClipboard'])
</script>