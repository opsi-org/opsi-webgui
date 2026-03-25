<template>
	<div class="flex items-center gap-1.5">
		<span class="font-mono text-xs">{{ primaryVersion }}</span>
		<SharedTooltipTable v-if="hasVersionDetails" :rows="versionTooltipRows">
			<span class="flex items-center gap-0.5">
				<UBadge v-if="row.client_version_outdated" color="error" variant="subtle" size="xs" class="gap-0.5">
					<UIcon :name="icons.productsOutdatedLocal" class="w-3 h-3" />
					<span>{{ $t('versionOutdated') }}</span>
				</UBadge>
				<UBadge v-if="row.depot_version_diff" color="warning" variant="subtle" size="xs" class="gap-0.5">
					<UIcon :name="icons.unequal" class="w-3 h-3" />
				</UBadge>
				<UBadge v-if="row.not_on_all_depots" color="warning" variant="subtle" size="xs" class="gap-0.5">
					<UIcon :name="icons.warning" class="w-3 h-3" />
				</UBadge>
				<UIcon v-if="!row.client_version_outdated && !row.depot_version_diff && !row.not_on_all_depots"
					name="i-lucide-info" class="w-3 h-3 text-(--color-text-muted) cursor-help" />
			</span>
		</SharedTooltipTable>
	</div>
</template>

<script setup lang="ts">
import type { ProductRow } from '~/types'

const props = defineProps<{
	row: ProductRow
}>()

const icons = useIcons()
const { t: $t } = useI18n()

const primaryVersion = computed(() => {
	const depotVersions = props.row.depotVersions
	if (!depotVersions || depotVersions.length === 0) return '-'
	const unique = [...new Set(depotVersions.filter(Boolean))]
	return unique[0] || '-'
})

const hasVersionDetails = computed(() => {
	return props.row.client_version_outdated ||
		props.row.depot_version_diff ||
		props.row.not_on_all_depots ||
		hasMultipleVersions.value
})

const hasMultipleVersions = computed(() => {
	const depot = props.row.depotVersions || []
	const client = props.row.clientVersions || []
	const allVersions = [...depot, ...client].filter(Boolean)
	return new Set(allVersions).size > 1
})

const versionTooltipRows = computed(() => {
	const rows: Array<{ key: string; value: string }> = []
	const depotVersions = props.row.depotVersions || []
	const clientVersions = props.row.clientVersions || []
	const selectedServers = props.row.selectedServers || []
	const selectedClients = props.row.selectedClients || []

	if (depotVersions.length > 0) {
		if (selectedServers.length > 0 && selectedServers.length === depotVersions.length) {
			selectedServers.forEach((s, i) => rows.push({ key: s, value: depotVersions[i] || '-' }))
		} else {
			const unique = [...new Set(depotVersions.filter(Boolean))]
			unique.forEach(v => rows.push({ key: String($t('depot')), value: v }))
		}
	}

	if (clientVersions.length > 0) {
		if (selectedClients && selectedClients.length > 0 && selectedClients.length === clientVersions.length) {
			selectedClients.forEach((c, i) => rows.push({ key: c, value: clientVersions[i] || '-' }))
		} else {
			const unique = [...new Set(clientVersions.filter(Boolean))]
			unique.forEach(v => rows.push({ key: String($t('client')), value: v }))
		}
	}

	if (props.row.client_version_outdated) rows.push({ key: '⚠', value: String($t('versionOutdated')) })
	if (props.row.depot_version_diff) rows.push({ key: '⚠', value: String($t('depotVersionDiff')) })
	if (props.row.not_on_all_depots) rows.push({ key: '⚠', value: String($t('notOnAllDepots')) })

	return rows
})
</script>
