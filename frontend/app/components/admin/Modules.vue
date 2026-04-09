Modules - Component to display available opsi modules with verification status

<template>
	<UCard>
		<template #header>
			<div class="flex items-center justify-between">
				<h3 class="text-xs m-0">{{ $t('opsiModules') }}</h3>
				<div class="flex items-center gap-2">
					<UBadge v-if="obsoleteModules && obsoleteModules.length > 0" color="warning" variant="subtle"
						size="xs">
						{{ obsoleteModules.length }} {{ $t('obsolete') }}
					</UBadge>
					<span class="text-xs text-(--color-text-muted)">{{ filteredModules.length }} {{ $t('available')
					}}</span>
				</div>
			</div>
		</template>
		<div v-if="loading" class="py-8 text-center">
			<SharedLoadingSpinner />
		</div>
		<div v-else-if="filteredModules.length === 0" class="py-8 text-center text-(--color-text-muted)">
			{{ filter ? $t('noResultsFound') : $t('noModulesFound') }}
		</div>
		<div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
			<div v-for="module in filteredModules" :key="module"
				class="flex items-center gap-3 p-3 rounded-lg border transition-colors" :class="isObsolete(module)
					? 'border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-900/10'
					: 'border-(--color-border) hover:bg-(--color-surface-hover)'">
				<div class="w-10 h-10 rounded-lg flex items-center justify-center">
					<UIcon v-if="isObsolete(module)" :name="icons.warning"
						class="w-5 h-5 text-amber-600 dark:text-amber-400" />
					<UIcon v-else :name="icons.check" class="w-5 h-5 text-green-600 dark:text-green-400" />
				</div>
				<div class="flex-1 min-w-0">
					<div class="font-medium text-sm truncate" :title="module">{{ formatModuleName(module) }}</div>
					<div class="flex items-center gap-1.5 mt-0.5">
						<UBadge v-if="isObsolete(module)" color="warning" variant="subtle">{{ $t('obsolete')
						}}
						</UBadge>
						<UBadge v-else-if="getModuleState(module) === 'free'" color="info" variant="subtle">{{
							$t('freeModules') }}</UBadge>
						<UBadge v-else-if="getModuleState(module) === 'licensed'" color="success" variant="subtle">{{
							$t('licensedModules') }}</UBadge>
						<UBadge v-else-if="getModuleState(module) === 'unlicensed'" color="error" variant="subtle">{{
							$t('unlicensedModules') }}</UBadge>
					</div>
				</div>
			</div>
		</div>
	</UCard>
</template>

<script setup lang="ts">
const { t: $t } = useI18n()
const props = defineProps<{
	filteredModules: string[]
	loading: boolean
	icons: Record<string, string>
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
</script>