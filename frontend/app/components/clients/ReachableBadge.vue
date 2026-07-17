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
		<CoreAppTooltip v-if="reachable === true" :text="String($t('clients.reachable.is'))">
			<CoreAppIcon :name="icons.clientReachable" class="w-4 h-4 text-(--color-success-soft-text)" />
		</CoreAppTooltip>
		<CoreAppTooltip v-else-if="reachable === false" :text="String($t('clients.reachable.not'))">
			<CoreAppStackedIcons :primary-icon="icons.clientReachable" :secondary-icon="icons.x" size="sm"
				primary-class="w-4 h-4 text-(--color-error-soft-text)"
				secondary-class="w-2.5 h-2.5 text-(--color-error-soft-text)" />
		</CoreAppTooltip>

		<CoreAppTooltip v-else :text="String($t('clients.reachable.check'))">
			<CoreAppIcon :name="icons.clientReachable" class="w-4 h-4 text-(--color-text-muted)" />
		</CoreAppTooltip>
	</div>
</template>

<script setup lang="ts">
interface Props {
	clientId: string
	reachable?: boolean
}

defineProps<Props>()

const icons = useIcons()
const { t: $t } = useI18n()
</script>
