<template>
	<UInput v-model="model" :placeholder="placeholder || $t('typeToFilter')" :icon="icons.filter" :size="size"
		:class="inputClass">
		<template v-if="model" #trailing>
			<UButton :icon="icons.x" size="xs" variant="link" color="neutral" @click="model = ''" />
		</template>
	</UInput>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{
	placeholder?: string
	size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
	inputClass?: string
}>(), {
	size: 'sm',
	inputClass: 'w-full sm:w-48 md:w-64',
})

const model = defineModel<string>({ default: '' })

const icons = useIcons()
const { t: $t } = useI18n()
</script>
