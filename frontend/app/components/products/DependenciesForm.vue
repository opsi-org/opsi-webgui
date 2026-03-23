<template>
	<div class="flex flex-col h-full min-h-0">
		<div v-if="loading" class="py-8 flex justify-center">
			<UIcon :name="icons.loading" class="w-6 h-6 animate-spin text-opsi-blue" />
		</div>

		<div v-else-if="dependencies.length === 0" class="py-8 text-center text-sm text-(--color-text-muted)">
			<UIcon :name="icons.product" class="w-10 h-10 mx-auto mb-2 opacity-40" />
			<p>{{ $t('noDependencies') }}</p>
		</div>

		<template v-else>
			<div class="flex-1 overflow-auto min-h-0">
				<div class="space-y-0">
					<div v-for="(dep, index) in filteredDependencies" :key="`${dep.requiredProductId}-${index}`"
						class="form-row flex flex-col md:flex-row items-start md:items-center gap-y-1 gap-x-4 py-2 px-2 hover:bg-(--color-surface-hover) rounded transition-colors">
						<div class="min-w-0 md:w-2/5">
							<div class="flex items-center gap-2 flex-wrap">
								<span class="font-mono text-sm text-opsi-blue font-medium">
									{{ dep.requiredProductId }}
								</span>
								<UBadge v-if="dep.requiredVersion" color="neutral" variant="soft" size="xs">
									{{ dep.requiredVersion }}
								</UBadge>
							</div>
						</div>

						<div class="flex-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-(--color-text-muted)">
							<span v-if="dep.requiredAction" class="flex items-center gap-1">
								<strong>requiredAction:</strong>
								<UBadge color="neutral" variant="soft" size="xs">
									{{ dep.requiredAction }}
								</UBadge>
							</span>
							<span v-if="dep.requiredInstallationStatus" class="flex items-center gap-1">
								<strong>requiredInstallationStatus:</strong>
								<UBadge color="neutral" variant="soft" size="xs">
									{{ dep.requiredInstallationStatus }}
								</UBadge>
							</span>
							<span v-if="dep.requirementType" class="flex items-center gap-1">
								<strong>requirementType:</strong>
								<UBadge color="neutral" variant="soft" size="xs">
									{{ dep.requirementType }}
								</UBadge>
							</span>
						</div>
					</div>
				</div>
			</div>
		</template>
	</div>
</template>

<script setup lang="ts">
import type { ProductDependency } from '~/types'

interface Props {
	dependencies: ProductDependency[]
	loading?: boolean
	externalFilter?: string
}

const props = withDefaults(defineProps<Props>(), {
	loading: false,
	externalFilter: '',
})

const icons = useIcons()
const { t: $t } = useI18n()

const filteredDependencies = computed(() => {
	const q = (props.externalFilter || '').trim().toLowerCase()
	if (!q) return props.dependencies
	return props.dependencies.filter(
		d => d.requiredProductId.toLowerCase().includes(q) ||
			(d.requirementType || '').toLowerCase().includes(q) ||
			(d.requiredAction || '').toLowerCase().includes(q)
	)
})

function getDependencyTypeColor(type: string | null): 'success' | 'warning' | 'error' | 'info' | 'neutral' {
	if (!type) return 'neutral'
	if (type === 'before') return 'warning'
	if (type === 'after') return 'info'
	return 'neutral'
}

function getDependencyTypeLabel(type: string | null, action: string | null): string {
	const key = `${type}-${action}`
	const labels: Record<string, string> = {
		'null-setup': String($t('required')),
		'after-setup': String($t('postRequired')),
		'before-setup': String($t('preRequired')),
		'before-uninstall': String($t('onUninstall')),
	}
	return labels[key] || type || String($t('unknown'))
}
</script>
