<!--
  This file is part of opsi-webgui application.
  opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
  Copyright (c) uib GmbH <info@uib.de> 2026
  All rights reserved.
  License: AGPL-3.0

  CoreAppErrorBanner - Sticky error alert shown above a page's content (e.g. a data table).
-->
<template>
	<div v-if="visible" class="sticky top-0 z-10 bg-(--color-surface) pb-2">
		<CoreAppAlertInline v-if="error" color="error" :title="$t('common.error')" :description="error" closable compact
			@close="$emit('close')" />
		<slot />
	</div>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{
	error?: string | null
	show?: boolean
}>(), {
	error: null,
})

defineEmits<{ (e: 'close'): void }>()

const { t: $t } = useI18n()

const visible = computed(() => props.show ?? !!props.error)
</script>
