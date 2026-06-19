<!--
  This file is part of opsi-webgui application.
  opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
  Copyright (c) uib GmbH <info@uib.de> 2026
  All rights reserved.
  License: AGPL-3.0

  ProductsVersionCell - Table cell displaying product version information.
-->
<template>
	<div class="flex items-center gap-1.5">
		<span class="text-sm text-(--color-text)">{{ primaryVersion }}</span>
		<CoreAppTooltipTable v-if="hasVersionDetails" :rows="versionTooltipRows">
			<span class="flex items-center gap-0.5">
				<CoreAppBadge v-if="row.client_version_outdated" color="error" variant="subtle" size="xs"
					class="gap-0.5">
					<CoreAppIcon :name="icons.productsOutdated" class="w-3 h-3" />
					<span>{{ $t('versionOutdated') }}</span>
				</CoreAppBadge>
				<CoreAppBadge v-if="row.depot_version_diff" color="warning" variant="subtle" size="xs" class="gap-0.5">
					<CoreAppIcon :name="icons.unequal" class="w-3 h-3" />
				</CoreAppBadge>
				<CoreAppBadge v-if="row.not_on_all_depots" color="warning" variant="subtle" size="xs" class="gap-0.5">
					<CoreAppIcon :name="icons.warning" class="w-3 h-3" />
				</CoreAppBadge>
				<CoreAppIcon v-if="!row.client_version_outdated && !row.depot_version_diff && !row.not_on_all_depots"
					:name="icons.info" class="w-3 h-3 text-(--color-text-muted) cursor-help" />
			</span>
		</CoreAppTooltipTable>
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

const selectedDepotIds = computed(() => {
	return props.row.selectedDepots || props.row.selectedServers || []
})

const versionTooltipRows = computed(() => {
	const rows: Array<{ key: string; value: string; badge?: string; badgeColor?: string }> = []
	const depotVersions = props.row.depotVersions || []
	const clientVersions = props.row.clientVersions || []
	const depots = selectedDepotIds.value
	const selectedClients = props.row.selectedClients || []

	if (depotVersions.length > 0) {
		rows.push({ key: `── ${String($t('depots'))} ──`, value: '' })
		if (depots.length > 0 && depots.length === depotVersions.length) {
			depots.forEach((s, i) => rows.push({ key: s, value: depotVersions[i] || '-' }))
		} else {
			const unique = [...new Set(depotVersions.filter(Boolean))]
			unique.forEach(v => rows.push({ key: String($t('depot')), value: v }))
		}
	}

	if (props.row.not_on_all_depots && props.row.numDepots !== undefined) {
		const totalDepots = depots.length > 0 ? depots.length : 0
		if (totalDepots > 0 && props.row.numDepots < totalDepots) {
			rows.push({
				key: String($t('notOnAllDepots')),
				value: `${props.row.numDepots}/${totalDepots}`,
				badge: String($t('missing')),
				badgeColor: 'warning',
			})
		}
	}

	if (clientVersions.length > 0) {
		rows.push({ key: `── ${String($t('clients'))} ──`, value: '' })
		const depotUnique = new Set(depotVersions.filter(Boolean))
		if (selectedClients.length > 0 && selectedClients.length === clientVersions.length) {
			selectedClients.forEach((c, i) => {
				const cv = clientVersions[i] || '-'
				const isOutdated = props.row.client_version_outdated && !depotUnique.has(cv)
				rows.push({ key: c, value: cv, badge: isOutdated ? String($t('versionOutdated')) : undefined, badgeColor: isOutdated ? 'error' : undefined })
			})
		} else {
			const unique = [...new Set(clientVersions.filter(Boolean))]
			unique.forEach(v => {
				const isOutdated = props.row.client_version_outdated && !depotUnique.has(v)
				rows.push({ key: String($t('client')), value: v, badge: isOutdated ? String($t('versionOutdated')) : undefined, badgeColor: isOutdated ? 'error' : undefined })
			})
		}
	}

	if (props.row.depot_version_diff) rows.push({ key: '⚠', value: String($t('depotVersionDiff')) })

	return rows
})
</script>
