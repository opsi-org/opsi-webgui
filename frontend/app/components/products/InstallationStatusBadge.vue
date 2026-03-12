<!--
This file is part of opsi-webgui application.
opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
Copyright (c) uib GmbH <info@uib.de> 2026
All rights reserved.
License: AGPL-3.0

Installation status badge with icon for products table.
-->
<template>
	<div class="flex justify-center">
		<!-- Mixed status (multiple clients with different statuses) -->
		<UTooltip v-if="isMixed" :text="mixedTooltip">
			<UBadge color="warning" variant="subtle" size="xs">
				<UIcon :name="icons.unequal" class="w-3 h-3" />
			</UBadge>
		</UTooltip>

		<!-- Installed -->
		<UTooltip v-else-if="normalizedStatus === 'installed'" :text="$t('installed')">
			<UBadge color="success" variant="subtle" size="xs">
				<UIcon :name="icons.productInstallationStatusInstalled" class="w-3 h-3" />
			</UBadge>
		</UTooltip>

		<!-- Unknown -->
		<UTooltip v-else-if="normalizedStatus === 'unknown'" :text="$t('unknown')">
			<UBadge color="warning" variant="subtle" size="xs">
				<UIcon :name="icons.productInstallationStatusUnknown" class="w-3 h-3" />
			</UBadge>
		</UTooltip>

		<!-- Not installed / None -->
		<span v-else-if="normalizedStatus === 'not_installed' || normalizedStatus === 'none' || !normalizedStatus"
			class="text-(--color-text-muted) text-xs">-</span>

		<!-- Other status -->
		<UBadge v-else color="neutral" variant="subtle" size="xs">
			{{ status }}
		</UBadge>
	</div>
</template>

<script setup lang="ts">
interface Props {
	status?: string
	statusDetails?: string[]
}

const props = defineProps<Props>()

const icons = useIcons()
const { t: $t } = useI18n()

const normalizedStatus = computed(() => props.status?.toLowerCase())

const isMixed = computed(() => {
	if (!props.statusDetails || props.statusDetails.length <= 1) return false
	const uniqueStatuses = [...new Set(props.statusDetails.map(s => s?.toLowerCase()))]
	return uniqueStatuses.length > 1
})

const mixedTooltip = computed(() => {
	if (!props.statusDetails) return String($t('mixed'))
	const counts: Record<string, number> = {}
	props.statusDetails.forEach(s => {
		const key = s?.toLowerCase() || 'none'
		counts[key] = (counts[key] || 0) + 1
	})
	return Object.entries(counts).map(([k, v]) => `${k}: ${v}`).join(', ')
})
</script>
