<!--
  This file is part of opsi-webgui application.
  opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
  Copyright (c) uib GmbH <info@uib.de> 2026
  All rights reserved.
  License: AGPL-3.0

  ClientsReachableBadge - Badge showing client reachability status.
-->
<template>
	<div class="flex items-center justify-center">
		<CoreAppLoadingSpinner v-if="loading" size="xs" :centered="false" />

		<CoreAppTooltip v-else-if="reachable === true" :text="String($t('clients.reachable.is'))">
			<CoreAppIcon :name="icons.clientReachable" class="w-4 h-4 text-(--color-success-soft-text) cursor-pointer"
				@click.stop="$emit('check')" />
		</CoreAppTooltip>
		<CoreAppTooltip v-else-if="reachable === false" :text="String($t('clients.reachable.not'))">
			<CoreAppStackedIcons :primary-icon="icons.clientReachable" :secondary-icon="icons.x" size="sm"
				primary-class="w-4 h-4 text-(--color-error-soft-text)"
				secondary-class="w-2.5 h-2.5 text-(--color-error-soft-text)" class="cursor-pointer"
				@click.stop="$emit('check')" />
		</CoreAppTooltip>

		<CoreAppTooltip v-else :text="String($t('clients.reachable.check'))">
			<CoreAppIcon :name="icons.clientReachable" class="w-4 h-4 text-(--color-text-muted) cursor-pointer"
				@click.stop="$emit('check')" />
		</CoreAppTooltip>
	</div>
</template>

<script setup lang="ts">
interface Props {
	clientId: string
	reachable?: boolean
	loading?: boolean
}

const props = defineProps<Props>()

defineEmits<{
	(e: 'check'): void
}>()

const icons = useIcons()
const { t: $t } = useI18n()

onMounted(() => {
	if (props.reachable === undefined && !props.loading) {
		// Small delay to avoid all badges firing at once
		// Will be batched in parent component
	}
})
</script>
