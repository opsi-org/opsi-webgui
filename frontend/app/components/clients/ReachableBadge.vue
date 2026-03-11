<!--
This file is part of opsi-webgui application.
opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
Copyright (c) uib GmbH <info@uib.de> 2026
All rights reserved.
License: AGPL-3.0

Reachable status badge with check button functionality.
-->
<template>
	<div class="flex items-center justify-center">
		<!-- Loading state -->
		<UIcon v-if="loading" :name="icons.loading" class="w-4 h-4 animate-spin text-(--color-text-muted)" />

		<!-- Reachable status icon -->
		<UIcon v-else-if="reachable === true" :name="icons.check" class="w-4 h-4 text-green-500"
			:title="$t('message.clientIsReachable')" />
		<UIcon v-else-if="reachable === false" :name="icons.x" class="w-4 h-4 text-red-500"
			:title="$t('message.clientIsNotReachable')" />

		<!-- Check button (when status is unknown) -->
		<UButton v-else variant="ghost" color="neutral" size="2xs" :icon="icons.clientReachable"
			:title="$t('checkClientReachability')" @click.stop="$emit('check')" />
	</div>
</template>

<script setup lang="ts">
interface Props {
	clientId: string
	reachable?: boolean
	loading?: boolean
}

defineProps<Props>()

defineEmits<{
	(e: 'check'): void
}>()

const icons = useIcons()
const { t: $t } = useI18n()
</script>
