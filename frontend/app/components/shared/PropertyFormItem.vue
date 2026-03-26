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

		<!-- Multi-value with possible values: select with checkmarks -->
		<template v-else-if="multiValue && hasPossibleValues">
			<div class="flex-1">
				<UPopover :ui="{ content: 'p-0 w-64' }">
					<UButton variant="ghost" color="neutral" size="sm"
						class="w-full justify-between font-normal border border-(--color-border) rounded"
						:disabled="disabled">
						<span v-if="arrayValue.length === 0" class="text-(--color-text-muted)">{{ $t('selectValues')
						}}</span>
						<span v-else class="truncate">{{ arrayValue.join(', ') }}</span>
						<UIcon name="i-lucide-chevron-down" class="w-3.5 h-3.5 shrink-0 text-(--color-text-muted)" />
					</UButton>
					<template #content>
						<div class="max-h-64 overflow-y-auto">
							<button v-for="opt in allMultiOptions" :key="opt" type="button"
								class="flex items-center gap-2 w-full px-3 py-1.5 text-sm hover:bg-(--color-surface-hover) transition-colors"
								@click="toggleMultiItem(opt)">
								<UIcon :name="arrayValue.includes(opt) ? 'i-lucide-square-check' : 'i-lucide-square'"
									class="w-4 h-4 shrink-0"
									:class="arrayValue.includes(opt) ? 'text-(--color-primary)' : 'text-(--color-text-muted)'" />
								<span class="truncate">{{ opt }}</span>
							</button>
							<div v-if="editable" class="border-t border-(--color-border) px-3 py-1.5">
								<div class="flex items-center gap-1">
									<UInput v-model="customInput" :placeholder="$t('pressEnterToAdd')" size="xs"
										class="flex-1" @keydown.enter.prevent="addCustomMultiItem" />
									<UButton size="xs" variant="ghost" color="primary" :icon="icons.add"
										:disabled="!customInput.trim()" @click="addCustomMultiItem" />
								</div>
							</div>
						</div>
					</template>
				</UPopover>
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
		<template v-else-if="hasPossibleValues && !editable">
			<USelect :model-value="selectModelValue" :items="selectItemsWithEmpty" :disabled="disabled" size="sm"
				class="flex-1" @update:model-value="handleNonEditableSelectChange" />
		</template>

		<!-- Single value, editable with possible values: select + custom input -->
		<template v-else-if="hasPossibleValues && editable">
			<div class="flex-1 flex items-center gap-1">
				<USelect :model-value="selectModelValue" :items="editableSelectItems" :disabled="disabled" size="sm"
					class="flex-1" @update:model-value="handleEditableSelectChange" />
				<UInput v-if="showCustomInput" :model-value="stringValue" size="sm" class="flex-1" :disabled="disabled"
					:placeholder="String($t('enterValue'))"
					@update:model-value="(v: string) => emit('update:modelValue', v)" />
				<UButton v-if="stringValue && !disabled" size="xs" variant="ghost" color="neutral" :icon="icons.close"
					:title="$t('clearValue')" @click="clearEditableValue" />
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
const EMPTY_SENTINEL = '__empty__'
const customInputMode = ref(false)

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
const filteredPossibleValueStrings = computed(() => possibleValueStrings.value.filter(v => v !== ''))
const hasPossibleValues = computed(() => filteredPossibleValueStrings.value.length > 0)

const selectModelValue = computed(() => {
	if (props.mixed) return ''
	const val = stringValue.value
	return val === '' ? EMPTY_SENTINEL : val
})

const availableMultiOptions = computed(() => {
	const current = new Set(arrayValue.value)
	return filteredPossibleValueStrings.value
		.filter(v => !current.has(v))
		.map(v => ({ label: v, value: v }))
})

const allMultiOptions = computed(() => {
	return filteredPossibleValueStrings.value
})

const selectItemsWithEmpty = computed(() => {
	const items = filteredPossibleValueStrings.value.map(v => ({ label: v, value: v }))
	return [{ label: `(${String($t('empty'))})`, value: EMPTY_SENTINEL }, ...items]
})

const editableSelectItems = computed(() => {
	const items = filteredPossibleValueStrings.value.map(v => ({ label: v, value: v }))
	return [
		{ label: `(${String($t('empty'))})`, value: EMPTY_SENTINEL },
		...items,
		{ label: `+ ${String($t('customValue'))}...`, value: '__custom__' },
	]
})

const showCustomInput = computed(() => {
	if (customInputMode.value) return true
	const val = stringValue.value
	if (!val) return false
	return !filteredPossibleValueStrings.value.includes(val)
})

function handleNonEditableSelectChange(v: string) {
	emit('update:modelValue', v === EMPTY_SENTINEL ? '' : v)
}

function handleEditableSelectChange(v: string) {
	if (v === '__custom__') {
		customInputMode.value = true
	} else {
		customInputMode.value = false
		emit('update:modelValue', v === EMPTY_SENTINEL ? '' : v)
	}
}

function clearEditableValue() {
	customInputMode.value = false
	emit('update:modelValue', '')
}

function toggleMultiItem(value: string) {
	const current = [...arrayValue.value]
	const idx = current.indexOf(value)
	if (idx >= 0) current.splice(idx, 1)
	else current.push(value)
	emit('update:modelValue', current)
}

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
