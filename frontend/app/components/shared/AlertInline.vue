<template>
	<UAlert :color="color" :variant="variant" :title="title" :description="description" :close="closable"
		:class="alertClass" @update:open="$emit('close')">
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
</template>

<script setup lang="ts">
withDefaults(defineProps<{
	color?: 'error' | 'warning' | 'success' | 'info' | 'neutral' | 'primary'
	variant?: 'solid' | 'outline' | 'soft' | 'subtle'
	title?: string
	description?: string
	closable?: boolean
	alertClass?: string
}>(), {
	color: 'info',
	variant: 'subtle',
	closable: false,
})

defineEmits<{
	(e: 'close'): void
}>()
</script>
