<!--
This file is part of opsi-webgui application.
opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
Copyright (c) uib GmbH <info@uib.de> 2026
All rights reserved.
License: AGPL-3.0

Modules - Component to display available opsi modules
-->

<template>
	<UCard>
		<template #header>
			<div class="flex items-center justify-between">
				<span class="font-medium">{{ $t('availableModules') }}</span>
				<span class="text-xs text-gray-500">{{ filteredModules.length }} {{ $t('active') }}</span>
			</div>
		</template>
		<div v-if="loading" class="py-8 text-center">
			<UIcon :name="icons.loading" class="w-6 h-6 animate-spin text-gray-400" />
		</div>
		<div v-else-if="filteredModules.length === 0" class="py-8 text-center text-gray-500">
			{{ filter ? $t('noResultsFound') : $t('noModulesFound') }}
		</div>
		<div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
			<div v-for="module in filteredModules" :key="module"
				class="flex items-center gap-3 p-3 rounded-lg border border-(--color-border) bg-(--color-surface) hover:bg-(--color-surface-hover) transition-colors">
				<div class="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
					<UIcon :name="icons.check" class="w-5 h-5 text-green-600 dark:text-green-400" />
				</div>
				<div class="flex-1 min-w-0">
					<div class="font-medium text-sm truncate" :title="module">{{ formatModuleName(module) }}</div>
					<div class="text-xs text-gray-500 truncate">{{ module }}</div>
				</div>
			</div>
		</div>
	</UCard>
</template>

<script setup lang="ts">
const { t: $t } = useI18n()
defineProps([
	'filteredModules', 'loading', 'icons', 'modules', 'filter', 'formatModuleName'
])
</script>