<!--
This file is part of opsi-webgui application.
opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
Copyright (c) uib GmbH <info@uib.de> 2026
All rights reserved.
License: AGPL-3.0

Action result badge with icon for products table.
-->
<template>
	<div class="flex justify-center">
		<!-- Mixed results (multiple clients with different results) -->
		<UTooltip v-if="isMixed" :text="mixedTooltip">
			<UBadge color="warning" variant="subtle" size="xs">
				<UIcon :name="icons.unequal" class="w-3 h-3" />
			</UBadge>
		</UTooltip>

		<!-- Successful -->
		<UTooltip v-else-if="normalizedResult === 'successful'" :text="$t('successful')">
			<UBadge color="success" variant="subtle" size="xs">
				<UIcon :name="icons.productActionResultSuccessful" class="w-3 h-3" />
			</UBadge>
		</UTooltip>

		<!-- Failed -->
		<UTooltip v-else-if="normalizedResult === 'failed'" :text="$t('failed')">
			<UBadge color="error" variant="subtle" size="xs">
				<UIcon :name="icons.productsFailedActionResult" class="w-3 h-3" />
			</UBadge>
		</UTooltip>

		<!-- None / empty -->
		<span v-else-if="normalizedResult === 'none' || !normalizedResult"
			class="text-(--color-text-muted) text-xs">-</span>

		<!-- Other result -->
		<UBadge v-else color="neutral" variant="subtle" size="xs">
			{{ result }}
		</UBadge>
	</div>
</template>

<script setup lang="ts">
interface Props {
	result?: string
	resultDetails?: string[]
}

const props = defineProps<Props>()

const icons = useIcons()
const { t: $t } = useI18n()

const normalizedResult = computed(() => props.result?.toLowerCase())

const isMixed = computed(() => {
	if (!props.resultDetails || props.resultDetails.length <= 1) return false
	const uniqueResults = [...new Set(props.resultDetails.map(r => r?.toLowerCase()))]
	return uniqueResults.length > 1
})

const mixedTooltip = computed(() => {
	if (!props.resultDetails) return String($t('mixed'))
	const counts: Record<string, number> = {}
	props.resultDetails.forEach(r => {
		const key = r?.toLowerCase() || 'none'
		counts[key] = (counts[key] || 0) + 1
	})
	return Object.entries(counts).map(([k, v]) => `${k}: ${v}`).join(', ')
})
</script>
