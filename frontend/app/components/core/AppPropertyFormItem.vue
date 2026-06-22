<!--
  This file is part of opsi-webgui application.
  opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
  Copyright (c) uib GmbH <info@uib.de> 2026
  All rights reserved.
  License: AGPL-3.0

  CoreAppPropertyFormItem - Form item for editing typed property values (bool, unicode, etc).
-->

<template>
	<div class="flex-1 flex items-center gap-2 min-w-0 w-full">
		<!-- Bool: checkbox -->
		<template v-if="type === 'bool'">
			<UCheckbox :model-value="boolValue" :indeterminate="mixed" :disabled="disabled" size="sm"
				:aria-label="controlAriaLabel"
				@update:model-value="(v: boolean | 'indeterminate') => emit('update:modelValue', v === 'indeterminate' ? false : v)" />
			<span v-if="mixed" class="text-xs text-(--color-text-muted) italic">{{ $t('common.mixed') }}</span>
		</template>

		<!-- Password -->
		<template v-else-if="password">
			<CoreAppPasswordInput :model-value="stringValue" :disabled="disabled" size="sm" class="flex-1"
				:aria-label="controlAriaLabel" @update:model-value="(v: string) => emit('update:modelValue', v)" />
		</template>

		<!-- Multi-value with possible values: popover with checkmarks + inline add -->
		<template v-else-if="multiValue && hasPossibleValues">
			<div class="flex-1">
				<UPopover :ui="{ content: 'p-0 w-72' }">
					<button type="button" :aria-label="controlAriaLabel"
						class="w-full flex items-center justify-between gap-2 px-2.5 py-1.5 text-sm font-normal border border-(--color-border) rounded-md bg-(--color-surface-elevated) hover:border-(--color-primary)/50 transition-colors text-left min-h-8"
						:class="disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'" :disabled="disabled">
						<span v-if="arrayValue.length === 0" class="text-(--color-text-muted)">{{ $t('config.selectValues')
						}}</span>
						<span v-else class="flex flex-wrap gap-1 min-w-0">
							<span v-for="val in arrayValue.slice(0, 3)" :key="val"
								class="inline-flex items-center px-1.5 py-0.5 text-xs rounded bg-(--color-primary-soft-bg) text-(--color-primary-soft-text) border border-(--color-primary)/20 max-w-32 truncate">
								{{ formatDisplayValue(val) }}
							</span>
							<span v-if="arrayValue.length > 3"
								class="inline-flex items-center px-1.5 py-0.5 text-xs rounded bg-(--color-surface) text-(--color-text-muted)">
								+{{ arrayValue.length - 3 }}
							</span>
						</span>
						<UIcon :name="icons.chevronDown" class="w-3.5 h-3.5 shrink-0 text-(--color-text-muted)" />
					</button>
					<template #content>
						<div class="max-h-72 overflow-y-auto">
							<div v-if="editable"
								class="sticky top-0 z-10 bg-(--color-surface-elevated) border-b border-(--color-border) px-2 py-1.5">
								<div class="flex items-center gap-1">
									<UInput ref="multiAddInputRef" v-model="customInput"
										:placeholder="$t('groups.membersSearch')" size="xs" class="flex-1"
										@keydown.enter.prevent="addCustomMultiItem" />
									<UButton size="xs" variant="ghost" color="primary" :icon="icons.add"
										:disabled="!customInput.trim()" @click="addCustomMultiItem" />
								</div>
							</div>
							<button v-for="opt in filteredMultiOptions" :key="opt" type="button"
								class="flex items-center gap-2 w-full px-3 py-1.5 text-sm hover:bg-(--color-surface-hover) transition-colors"
								@click="toggleMultiItem(opt)">
								<UIcon :name="arrayValue.includes(opt) ? icons.squareCheck : icons.square"
									class="w-4 h-4 shrink-0"
									:class="arrayValue.includes(opt) ? 'text-(--color-primary)' : 'text-(--color-text-muted)'" />
								<span class="truncate text-left" :title="opt">{{ formatDisplayValue(opt) }}</span>
							</button>
							<div v-if="filteredMultiOptions.length === 0 && customInput.trim()"
								class="px-3 py-2 text-xs text-(--color-text-muted) text-center">
								{{ $t('common.pressEnterToAdd') }}
							</div>
						</div>
					</template>
				</UPopover>
			</div>
		</template>

		<!-- Multi-value without possible values: tags + inline input -->
		<template v-else-if="multiValue">
			<div class="flex-1">
				<div class="flex flex-wrap items-center gap-1 p-1 border border-(--color-border) rounded-md bg-(--color-background) min-h-8"
					:class="disabled ? 'opacity-50' : ''">
					<span v-for="(val, idx) in arrayValue" :key="idx"
						class="inline-flex items-center gap-1 px-1.5 py-0.5 text-xs rounded-full bg-(--color-primary-soft-bg) text-(--color-primary-soft-text) border border-(--color-primary)/20 max-w-48 group/tag">
						<span class="truncate" :title="val">{{ formatDisplayValue(val) }}</span>
						<UButton v-if="!disabled" type="button" variant="ghost" color="neutral" size="xs"
							class="p-0! hover:text-(--color-error-soft-text) transition-colors opacity-60 group-hover/tag:opacity-100"
							@click="removeMultiItem(idx)">
							<UIcon :name="icons.x" class="w-3 h-3" />
						</UButton>
					</span>
					<UButton v-if="hasMultilineValues(arrayValue)" type="button" variant="ghost" color="neutral"
						size="xs"
						class="p-0! inline-flex items-center gap-0.5 px-1 py-0.5 text-xs text-(--color-text-muted) hover:text-(--color-primary) transition-colors"
						@click="openMultilineEditor">
						<UIcon :name="icons.pencilSquare" class="w-3 h-3" />
					</UButton>
					<UInput v-if="editable && !disabled" v-model="customInput" class="flex-1 min-w-24" size="xs"
						:aria-label="controlAriaLabel"
						:placeholder="arrayValue.length === 0 ? $t('common.pressEnterToAdd') : ''"
						@keydown.enter.prevent="addCustomMultiItem" @keydown.backspace="handleTagBackspace" />
				</div>
			</div>
		</template>

		<!-- Single value, non-editable with possible values: select -->
		<template v-else-if="hasPossibleValues && !editable">
			<USelect :model-value="selectModelValue" :items="selectItemsWithEmpty" :disabled="disabled" size="sm"
				:aria-label="controlAriaLabel" class="flex-1" @update:model-value="handleNonEditableSelectChange" />
		</template>

		<!-- Single value, editable with possible values: combobox-style -->
		<template v-else-if="hasPossibleValues && editable">
			<div class="flex-1">
				<UPopover :ui="{ content: 'p-0 w-64' }">
					<button type="button" :aria-label="controlAriaLabel"
						class="w-full flex items-center justify-between gap-2 px-2.5 py-1.5 text-sm font-normal border border-(--color-border) rounded-md bg-(--color-surface-elevated) hover:border-(--color-primary)/50 transition-colors text-left min-h-8"
						:class="disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'" :disabled="disabled">
						<span :class="stringValue ? '' : 'text-(--color-text-muted)'" class="truncate">
							{{ stringValue ? formatDisplayValue(stringValue) : `(${$t('common.empty')})` }}
						</span>
						<UIcon :name="icons.chevronDown" class="w-3.5 h-3.5 shrink-0 text-(--color-text-muted)" />
					</button>
					<template #content>
						<div class="max-h-64 overflow-y-auto">
							<div
								class="sticky top-0 z-10 bg-(--color-surface-elevated) border-b border-(--color-border) px-2 py-1.5">
								<UInput v-model="editableSearchInput" :placeholder="$t('common.enterValue')" size="xs"
									class="w-full" @keydown.enter.prevent="applyEditableCustomValue" />
							</div>
							<button type="button"
								class="flex items-center gap-2 w-full px-3 py-1.5 text-sm hover:bg-(--color-surface-hover) transition-colors"
								:class="!stringValue ? 'text-(--color-primary) font-medium' : 'text-(--color-text-muted)'"
								@click="emit('update:modelValue', ''); editableSearchInput = ''">
								<span>({{ $t('common.empty') }})</span>
							</button>
							<button v-for="opt in filteredEditableOptions" :key="opt" type="button"
								class="flex items-center gap-2 w-full px-3 py-1.5 text-sm hover:bg-(--color-surface-hover) transition-colors"
								:class="stringValue === opt ? 'text-(--color-primary) font-medium bg-primary/5' : ''"
								@click="emit('update:modelValue', opt); editableSearchInput = ''">
								<span class="truncate" :title="opt">{{ formatDisplayValue(opt) }}</span>
							</button>
							<button
								v-if="editableSearchInput.trim() && !filteredPossibleValueStrings.includes(editableSearchInput.trim())"
								type="button"
								class="flex items-center gap-2 w-full px-3 py-1.5 text-sm text-(--color-primary) hover:bg-(--color-surface-hover) transition-colors border-t border-(--color-border)"
								@click="applyEditableCustomValue">
								<UIcon :name="icons.add" class="w-3.5 h-3.5" />
								<span>{{ editableSearchInput.trim() }}</span>
							</button>
						</div>
					</template>
				</UPopover>
			</div>
		</template>

		<!-- Multiline single value: show preview + edit button -->
		<template v-else-if="isMultilineValue">
			<div class="flex-1 flex items-center gap-1 min-w-0">
				<div v-clickable
					class="flex-1 px-2.5 py-1.5 text-sm border border-(--color-border) rounded-md bg-(--color-surface-elevated) min-h-8 cursor-pointer hover:border-(--color-primary)/50 transition-colors truncate"
					:class="disabled ? 'opacity-50 cursor-not-allowed' : ''" :title="stringValue"
					@click="!disabled && openMultilineEditor()">
					{{ formatDisplayValue(stringValue) }}
				</div>
				<UButton v-if="!disabled" size="xs" variant="ghost" color="neutral" :icon="icons.pencilSquare"
					@click="openMultilineEditor" />
			</div>
		</template>

		<!-- Plain input (no possible values, single value) -->
		<template v-else>
			<UInput :model-value="stringValue" :disabled="disabled" size="sm" class="flex-1"
				:aria-label="controlAriaLabel" @update:model-value="(v: string) => emit('update:modelValue', v)" />
		</template>

		<!-- Multiline editor modal -->
		<UModal v-model:open="showMultilineEditor" :title="$t('common.editValue')" :ui="{ content: 'max-w-sm sm:max-w-xl' }">
			<template #body>
				<CoreAppTextarea ref="multilineTextareaRef" v-model="multilineEditValue" class="w-full" :rows="12"
					:disabled="disabled" />
			</template>
			<template #footer>
				<div class="flex gap-2 justify-end">
					<UButton variant="ghost" color="neutral" @click="showMultilineEditor = false">{{ $t('common.cancel') }}
					</UButton>
					<UButton color="primary" @click="applyMultilineEdit">{{ $t('common.apply') }}</UButton>
				</div>
			</template>
		</UModal>
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
	ariaLabel?: string
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

// Accessible name for the rendered control. Falls back to a generic label so the
// control always exposes an accessible name (WCAG 4.1.2 / 1.3.1).
const controlAriaLabel = computed(() => props.ariaLabel || String($t('common.value')))

const customInput = ref('')
const editableSearchInput = ref('')
const EMPTY_SENTINEL = '__empty__'

// Multiline editor state
const showMultilineEditor = ref(false)
const multilineEditValue = ref('')
const multilineTextareaRef = ref<HTMLTextAreaElement | null>(null)

const boolValue = computed(() => {
	if (props.mixed) return false
	if (typeof props.modelValue === 'boolean') return props.modelValue
	if (typeof props.modelValue === 'string') return props.modelValue === 'true' || props.modelValue === '1'
	return false
})

const stringValue = computed(() => {
	if (props.mixed) return String($t('common.mixed'))
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

const isMultilineValue = computed(() => {
	if (props.multiValue || props.type === 'bool' || props.password) return false
	return typeof props.modelValue === 'string' && props.modelValue.includes('\n')
})

const selectModelValue = computed(() => {
	if (props.mixed) return ''
	const val = stringValue.value
	return val === '' ? EMPTY_SENTINEL : val
})

const allMultiOptions = computed(() => filteredPossibleValueStrings.value)

const filteredMultiOptions = computed(() => {
	const q = customInput.value.trim().toLowerCase()
	if (!q) return allMultiOptions.value
	return allMultiOptions.value.filter(v => v.toLowerCase().includes(q))
})

const filteredEditableOptions = computed(() => {
	const q = editableSearchInput.value.trim().toLowerCase()
	if (!q) return filteredPossibleValueStrings.value
	return filteredPossibleValueStrings.value.filter(v => v.toLowerCase().includes(q))
})

const selectItemsWithEmpty = computed(() => {
	const items = filteredPossibleValueStrings.value.map(v => ({ label: v, value: v }))
	return [{ label: `(${String($t('common.empty'))})`, value: EMPTY_SENTINEL }, ...items]
})

/** Format a value for display: show first line + "..." for multiline, truncate long values */
function formatDisplayValue(value: string): string {
	if (value.includes('\n')) {
		const firstLine = value.substring(0, value.indexOf('\n'))
		return firstLine + '...'
	}
	return value
}

/** Check if any value in the array contains newlines */
function hasMultilineValues(values: string[]): boolean {
	return values.some(v => v.includes('\n'))
}

function handleNonEditableSelectChange(v: string) {
	emit('update:modelValue', v === EMPTY_SENTINEL ? '' : v)
}

function applyEditableCustomValue() {
	const input = editableSearchInput.value.trim()
	if (!input) return
	emit('update:modelValue', input)
	editableSearchInput.value = ''
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

function addCustomMultiItem() {
	const input = customInput.value.trim()
	if (!input) return
	if (!arrayValue.value.includes(input)) {
		emit('update:modelValue', [...arrayValue.value, input])
	}
	customInput.value = ''
}

function handleTagBackspace() {
	if (customInput.value === '' && arrayValue.value.length > 0) {
		const updated = [...arrayValue.value]
		updated.pop()
		emit('update:modelValue', updated)
	}
}

function openMultilineEditor() {
	if (props.multiValue) {
		// For multi-value, join all values with newline for editing
		multilineEditValue.value = arrayValue.value.join('\n')
	} else {
		multilineEditValue.value = stringValue.value
	}
	showMultilineEditor.value = true
	nextTick(() => {
		multilineTextareaRef.value?.focus()
	})
}

function applyMultilineEdit() {
	if (props.multiValue) {
		// Split by newlines, filter empty lines, and emit as array
		const values = multilineEditValue.value.split('\n').filter(v => v.trim() !== '')
		emit('update:modelValue', values)
	} else {
		emit('update:modelValue', multilineEditValue.value)
	}
	showMultilineEditor.value = false
}
</script>
