<!--
  This file is part of opsi-webgui application.
  opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
  Copyright (c) uib GmbH <info@uib.de> 2026
  All rights reserved.
  License: AGPL-3.0

  AdminModules - Displays available opsi modules and their licensing status.
-->

<template>
	<CoreAppCard class="h-full flex flex-col">
		<template #header>
			<div class="flex items-center justify-between">
				<h3 class="text-xs font-heading uppercase tracking-wide m-0">{{ $t('mods.title') }}</h3>
				<div class="flex items-center gap-2">
					<span class="text-xs text-(--color-text-muted)">{{ filteredModules.length }} {{ $t('mods.available')
					}}</span>
				</div>
			</div>
		</template>
		<div v-if="loading" class="py-8 text-center">
			<CoreAppLoadingSpinner />
		</div>
		<div v-else-if="filteredModules.length === 0" class="py-8 text-center text-(--color-text-muted)">
			{{ filter ? $t('common.noResults') : $t('mods.none') }}
		</div>
		<div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
			<div v-for="module in filteredModules" :key="module"
				class="flex items-center gap-3 p-3 rounded-lg border transition-colors border-(--color-border) hover:bg-(--color-surface-hover)">
				<div class="w-10 h-10 rounded-full flex items-center justify-center bg-(--color-success-soft-bg)">
					<CoreAppIcon :name="icons.check" class="w-5 h-5 text-(--color-success-soft-text)" />
				</div>
				<div class="flex-1 min-w-0">
					<div class="font-medium text-sm truncate" :title="module">{{ formatModuleName(module) }}</div>
					<div class="flex items-center gap-1.5 mt-0.5">
						<CoreAppTooltip v-if="isObsolete(module)" :text="$t('mods.obsolete.desc')">
							<CoreAppBadge color="warning" variant="subtle" class="cursor-help">{{ $t('mods.integrated')
								}}
							</CoreAppBadge>
						</CoreAppTooltip>
						<CoreAppBadge v-else-if="getModuleState(module) === 'free'" color="info" variant="subtle">{{
							$t('mods.free') }}</CoreAppBadge>
						<CoreAppBadge v-else-if="getModuleState(module) === 'licensed'" color="success"
							variant="subtle">{{
								$t('mods.licensed') }}</CoreAppBadge>
						<CoreAppBadge v-else-if="getModuleState(module) === 'unlicensed'" color="error"
							variant="subtle">{{
								$t('mods.unlicensed') }}</CoreAppBadge>
					</div>
				</div>
				<span v-if="getClientNumber(module) !== null"
					class="flex items-center gap-1 shrink-0 text-xs text-(--color-text-muted)">
					<CoreAppIcon :name="icons.client" class="w-3 h-3" />{{ getClientNumber(module) }}
				</span>
			</div>
		</div>
	</CoreAppCard>
</template>

<script setup lang="ts">
const { t: $t } = useI18n()
const props = defineProps<{
	filteredModules: string[]
	loading: boolean
	icons: ReturnType<typeof useIcons>
	modules: string[]
	filter: string
	formatModuleName: (name: string) => string
	modulesDetailed?: Record<string, { available: boolean; state: string; client_number: number }>
	obsoleteModules?: string[]
	freeModules?: string[]
}>()

function isObsolete(module: string): boolean {
	return props.obsoleteModules?.includes(module) ?? false
}

function getModuleState(module: string): string {
	if (props.modulesDetailed?.[module]) {
		return props.modulesDetailed[module].state
	}
	if (props.freeModules?.includes(module)) return 'free'
	return 'licensed'
}

function getClientNumber(module: string): number | null {
	const detail = props.modulesDetailed?.[module]
	if (detail && detail.client_number > 0 && !isObsolete(module)) return detail.client_number
	return null
}
</script>