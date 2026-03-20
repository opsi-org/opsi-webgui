PasswordInput - A password input component with built-in visibility toggle.
<template>
	<UInput v-bind="$attrs" :model-value="modelValue" :type="show ? 'text' : 'password'" :placeholder="placeholder"
		:disabled="disabled" :size="size" :icon="icon" :ui="{ trailing: 'pe-1' }"
		@update:model-value="$emit('update:modelValue', $event)">
		<template #trailing>
			<UButton color="neutral" variant="link" size="sm" :icon="show ? icons.eyeOff : icons.eye"
				:aria-label="show ? String($t('hidePassword')) : String($t('showPassword'))" :aria-pressed="show"
				:disabled="disabled" @click="show = !show" />
		</template>
	</UInput>
</template>

<script setup lang="ts">
defineOptions({
	inheritAttrs: false
})

interface Props {
	modelValue?: string
	placeholder?: string
	disabled?: boolean
	size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
	icon?: string
}

withDefaults(defineProps<Props>(), {
	modelValue: '',
	placeholder: '',
	disabled: false,
	size: 'md',
	icon: undefined
})

defineEmits<{
	'update:modelValue': [value: string]
}>()

const icons = useIcons()
const { t: $t } = useI18n()

const show = ref(false)
</script>
