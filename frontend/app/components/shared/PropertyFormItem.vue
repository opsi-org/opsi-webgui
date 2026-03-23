Shared form item for both host parameters and product properties.
Supports: Bool (checkbox), password, multi-value (tags + select), single non-editable (select),
single editable (select + custom input), plain input.
<template>
	<div class="flex-1 flex items-center gap-2 min-w-0 w-full">
		<!-- Bool: checkbox -->
		<template v-if="type === 'bool'">
			<UCheckbox :model-value="boolValue" :indeterminate="mixed" :disabled="disabled" size="sm"
				@update:model-value="(v: boolean | 'indeterminate') => emit('update:modelValue', v === 'indeterminate' ? false : v)" />
			<span v-if="mixed" class="text-xs text-(--color-text-muted) italic">{{ $t('mixed') }}</span>
		</template>

		<!-- Password -->
		<template v-else-if="password">
			<SharedPasswordInput :model-value="stringValue" :disabled="disabled" size="sm" class="flex-1 font-mono"
				@update:model-value="(v: string) => emit('update:modelValue', v)" />
		</template>

		<!-- Multi-value with possible values: tags + select -->
		<template v-else-if="multiValue && possibleValues.length > 0">
			<div class="flex-1 space-y-1">
				<div v-if="arrayValue.length > 0" class="flex flex-wrap gap-1">
					<span v-for="(val, idx) in arrayValue" :key="idx"
						class="inline-flex items-center gap-1 px-2 py-0.5 text-xs rounded-full bg-primary/10 text-(--color-primary) border border-primary/20">
						{{ val }}
						<button v-if="!disabled" type="button" class="hover:text-red-500 transition-colors"
							@click="removeMultiItem(idx)">
							<UIcon name="i-heroicons-x-mark" class="w-3 h-3" />
						</button>
					</span>
				</div>
				<div class="flex items-center gap-1">
					<USelect :model-value="''" :items="availableMultiOptions" :disabled="disabled" size="sm"
						class="flex-1" :placeholder="$t('addValue')"
						@update:model-value="(v: string) => v && addMultiItem(v)" />
					<UInput v-if="editable" v-model="customInput" :placeholder="$t('pressEnterToAdd')" size="sm"
						class="flex-1" :disabled="disabled" @keydown.enter.prevent="addCustomMultiItem" />
				</div>
			</div>
		</template>

		<!-- Multi-value without possible values: tags + input -->
		<template v-else-if="multiValue">
			<div class="flex-1 space-y-1">
				<div v-if="arrayValue.length > 0" class="flex flex-wrap gap-1">
					<span v-for="(val, idx) in arrayValue" :key="idx"
						class="inline-flex items-center gap-1 px-2 py-0.5 text-xs rounded-full bg-primary/10 text-(--color-primary) border border-primary/20">
						{{ val }}
						<button v-if="!disabled" type="button" class="hover:text-red-500 transition-colors"
							@click="removeMultiItem(idx)">
							<UIcon name="i-heroicons-x-mark" class="w-3 h-3" />
						</button>
					</span>
				</div>
				<UInput v-if="editable" v-model="customInput" :placeholder="$t('pressEnterToAdd')" size="sm"
					class="flex-1" :disabled="disabled" @keydown.enter.prevent="addCustomMultiItem" />
			</div>
		</template>

		<!-- Single value, non-editable with possible values: select -->
		<template v-else-if="possibleValues.length > 0 && !editable">
			<USelect :model-value="stringValue" :items="selectItemsWithEmpty" :disabled="disabled" size="sm"
				class="flex-1" @update:model-value="(v: string) => emit('update:modelValue', v)" />
		</template>

		<!-- Single value, editable with possible values: select + custom input -->
		<template v-else-if="possibleValues.length > 0 && editable">
			<div class="flex-1 flex items-center gap-1">
				<USelect :model-value="stringValue" :items="editableSelectItems" :disabled="disabled" size="sm"
					class="flex-1"
					@update:model-value="(v: string) => emit('update:modelValue', v === '__custom__' ? '' : v)" />
				<UInput v-if="showCustomInput" :model-value="stringValue" size="sm" class="flex-1" :disabled="disabled"
					:placeholder="String($t('enterValue'))"
					@update:model-value="(v: string) => emit('update:modelValue', v)" />
				<UButton v-if="stringValue && !disabled" size="xs" variant="ghost" color="neutral" :icon="icons.close"
					:title="$t('clearValue')" @click="emit('update:modelValue', '')" />
			</div>
		</template>

		<!-- Plain input (no possible values, single value) -->
		<template v-else>
			<UInput :model-value="stringValue" :disabled="disabled" size="sm" class="flex-1 font-mono"
				@update:model-value="(v: string) => emit('update:modelValue', v)" />
		</template>
	</div>
</template>

<script setup lang="ts">
interface Props {
	modelValue: unknown
	type?: 'bool' | 'unicode' | 'string'
	possibleValues?: unknown[]
	multiValue?: boolean
	editable?: boolean
	disabled?: boolean
	password?: boolean
	mixed?: boolean
}

const props = withDefaults(defineProps<Props>(), {
	type: 'unicode',
	possibleValues: () => [],
	multiValue: false,
	editable: true,
	disabled: false,
	password: false,
	mixed: false,
})

const emit = defineEmits<{
	'update:modelValue': [value: unknown]
}>()

const icons = useIcons()
const { t: $t } = useI18n()

const customInput = ref('')

const boolValue = computed(() => {
	if (props.mixed) return false
	if (typeof props.modelValue === 'boolean') return props.modelValue
	if (typeof props.modelValue === 'string') return props.modelValue === 'true' || props.modelValue === '1'
	return false
})

const stringValue = computed(() => {
	if (props.mixed) return String($t('mixed'))
	if (typeof props.modelValue === 'string') return props.modelValue
	if (typeof props.modelValue === 'boolean') return String(props.modelValue)
	if (Array.isArray(props.modelValue)) return props.modelValue[0] || ''
	return ''
})

const arrayValue = computed(() => {
	if (Array.isArray(props.modelValue)) return props.modelValue.map(String)
	if (typeof props.modelValue === 'string' && props.modelValue) return [props.modelValue]
	return []
})

const possibleValueStrings = computed(() => props.possibleValues.map(String))

const availableMultiOptions = computed(() => {
	const current = new Set(arrayValue.value)
	return possibleValueStrings.value
		.filter(v => !current.has(v))
		.map(v => ({ label: v, value: v }))
})

const selectItemsWithEmpty = computed(() => {
	const items = possibleValueStrings.value.map(v => ({ label: v, value: v }))
	return [{ label: `(${String($t('empty'))})`, value: '' }, ...items]
})

const editableSelectItems = computed(() => {
	const items = possibleValueStrings.value.map(v => ({ label: v, value: v }))
	return [
		{ label: `(${String($t('empty'))})`, value: '' },
		...items,
		{ label: `+ ${String($t('customValue'))}...`, value: '__custom__' },
	]
})

const showCustomInput = computed(() => {
	const val = stringValue.value
	if (!val) return false
	return !possibleValueStrings.value.includes(val)
})

function removeMultiItem(idx: number) {
	const updated = [...arrayValue.value]
	updated.splice(idx, 1)
	emit('update:modelValue', updated)
}

function addMultiItem(value: string) {
	if (!arrayValue.value.includes(value)) {
		emit('update:modelValue', [...arrayValue.value, value])
	}
}

function addCustomMultiItem() {
	const input = customInput.value.trim()
	if (!input) return
	if (!arrayValue.value.includes(input)) {
		emit('update:modelValue', [...arrayValue.value, input])
	}
	customInput.value = ''
}
</script>
