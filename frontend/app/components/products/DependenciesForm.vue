<!--
  This file is part of opsi-webgui application.
  opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
  Copyright (c) uib GmbH <info@uib.de> 2026
  All rights reserved.
  License: AGPL-3.0

  ProductsDependenciesForm - Form displaying product dependency relationships.
-->
<template>
	<div class="flex flex-col h-full min-h-0">
		<div v-if="loading" class="py-8 flex justify-center">
			<CoreAppLoadingSpinner />
		</div>

		<CoreAppEmptyState v-else-if="dependencies.length === 0" :icon="icons.product"
			:message="String($t('noDependencies'))" />

		<template v-else>
			<div class="flex-1 overflow-auto min-h-0">
				<div class="space-y-0">
					<div v-for="(dep, index) in filteredDependencies" :key="`${dep.requiredProductId}-${index}`"
						class="form-row flex flex-col md:flex-row items-start md:items-center gap-y-1 gap-x-4 py-2 px-2 hover:bg-(--color-surface-hover) rounded transition-colors">
						<div class="min-w-0 md:w-2/5">
							<div class="flex items-center gap-2 flex-wrap">
								<span class="text-sm font-medium">
									{{ dep.requiredProductId }}
								</span>
								<CoreAppBadge v-if="dep.requiredVersion" color="neutral" variant="soft" size="xs">
									{{ dep.requiredVersion }}
								</CoreAppBadge>
							</div>
						</div>

						<div class="flex-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-(--color-text-muted)">
							<span v-if="dep.requiredAction" class="flex items-center gap-1">
								<strong>{{ $t('requiredAction') }}:</strong>
								<CoreAppBadge color="neutral" variant="soft" size="xs">
									{{ dep.requiredAction }}
								</CoreAppBadge>
							</span>
							<span v-if="dep.requiredInstallationStatus" class="flex items-center gap-1">
								<strong>{{ $t('requiredInstallationStatus') }}:</strong>
								<CoreAppBadge color="neutral" variant="soft" size="xs">
									{{ dep.requiredInstallationStatus }}
								</CoreAppBadge>
							</span>
							<span v-if="dep.requirementType" class="flex items-center gap-1">
								<strong>{{ $t('requirementType') }}:</strong>
								<CoreAppBadge color="neutral" variant="soft" size="xs">
									{{ dep.requirementType }}
								</CoreAppBadge>
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
</script>
