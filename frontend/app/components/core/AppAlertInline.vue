<!--
  This file is part of opsi-webgui application.
  opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
  Copyright (c) uib GmbH <info@uib.de> 2026
  All rights reserved.
  License: AGPL-3.0

  CoreAppAlertInline - Inline alert component for success, error, and info messages.
-->
<template>
	<UAlert v-if="!compact" :color="color" :variant="variant" :title="title" :description="description"
		:close="closable" :class="alertClass" @update:open="$emit('close')">
		<template v-if="$slots.title" #title>
			<slot name="title" />
		</template>
		<template v-if="$slots.description" #description>
			<slot name="description" />
		</template>
		<template v-if="$slots.actions" #actions>
			<slot name="actions" />
		</template>
	</UAlert>
	<UAlert v-else :color="color" :variant="variant" :close="closable" :class="alertClass"
		@update:open="$emit('close')">
		<template #title>
			<span class="inline-flex items-center gap-2 flex-wrap">
				<span class="uppercase font-bold text-xs tracking-wide">{{ $slots.title ? '' : title }}</span>
				<slot v-if="$slots.title" name="title" />
				<span v-if="description" class="font-normal text-xs">{{ description }}</span>
				<slot v-if="$slots.description" name="description" />
			</span>
		</template>
		<template v-if="$slots.actions" #actions>
			<slot name="actions" />
		</template>
	</UAlert>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
	color?: 'error' | 'warning' | 'success' | 'info' | 'neutral' | 'primary'
	variant?: 'solid' | 'outline' | 'soft' | 'subtle'
	title?: string
	description?: string
	closable?: boolean
	alertClass?: string
	compact?: boolean
}>(), {
	color: 'info',
	variant: 'subtle',
	closable: false,
	compact: false,
})

defineEmits<{
	(e: 'close'): void
}>()
</script>
