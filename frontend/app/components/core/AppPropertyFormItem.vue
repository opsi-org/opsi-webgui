<!--
  This file is part of the OPSI-WebGUI application.
  OPSI-WebGUI is the web-based management interface for OPSI.
  https://opsi.org/en/

  Copyright (c) UIB GmbH info@uib.de 2026
  All rights reserved.
  License: AGPL-3.0

  CoreAppPropertyFormItem - Form item for editing typed property values (bool, unicode, etc).
-->

<template>
  <div class="flex-1 flex items-center gap-1.5 min-w-0 w-full">
    <!-- Bool: checkbox -->
    <template v-if="type === 'bool'">
      <CoreAppCheckbox
        :model-value="boolValue"
        :indeterminate="mixed"
        :disabled="disabled"
        :aria-label="controlAriaLabel"
        @update:model-value="(v: boolean | 'indeterminate') => emit('update:modelValue', v === 'indeterminate' ? false : v)"
      />
      <span v-if="mixed" class="text-xs text-(--color-text-muted) italic">{{ $t('common.mixed') }}</span>
    </template>

    <!-- Password -->
    <template v-else-if="password">
      <div class="flex-1 min-w-0 group/paramrow">
        <span class="flex gap-1 min-w-0 items-center shrink-0">
          <CoreAppPasswordInput
            :model-value="stringValue"
            :disabled="disabled"
            :size="controlSize"
            class="flex-1 min-w-0"
            :aria-label="controlAriaLabel"
            @update:model-value="(v: string) => emit('update:modelValue', v)"
          />
          <CoreAppButton
            size="xs"
            :icon="clipboard.isCopied(stringValue) ? icons.check : icons.copy"
            variant="ghost"
            :color="clipboard.isCopied(stringValue) ? 'success' : 'neutral'"
            class="h-5! min-h-5! px-1! opacity-0 group-hover/paramrow:opacity-100 group-focus-within/paramrow:opacity-100 transition-opacity"
            :title="String(clipboard.isCopied(stringValue) ? $t('common.copied') : $t('common.copy'))"
            :aria-label="`${String($t('common.copyValue', { id: props.configId }))}`"
            @click="copyToClipboard(stringValue)"
          />
        </span>
      </div>
    </template>

    <!-- Multi-value with possible values: popover with checkmarks + inline add -->
    <template v-else-if="multiValue && hasPossibleValues">
      <div class="flex-1 min-w-0 group/paramrow">
        <span class="flex gap-1 min-w-0 items-center shrink-0">
          <UPopover :ui="{ content: 'p-0 w-72' }">
            <button
              type="button"
              :aria-label="controlAriaLabel"
              class="w-full flex items-center justify-between gap-2 px-2 text-sm font-normal border border-(--color-border) rounded-md bg-(--color-surface-elevated) hover:border-primary/50 transition-colors text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--color-primary) focus-visible:ring-offset-1 focus-visible:ring-offset-(--color-surface-elevated)"
              :class="[
                size === 'xs' ? 'py-1 min-h-8' : 'py-1.5 md:py-1 min-h-11 md:min-h-8',
                disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer',
              ]"
              :disabled="disabled"
            >
              <span v-if="arrayValue.length === 0" class="truncate text-(--color-text-muted)">{{ $t('config.selectValues') }}</span>
              <span v-else class="flex flex-wrap gap-1 min-w-0">
                <span
                  v-for="val in arrayValue.slice(0, 3)"
                  :key="val"
                  class="inline-flex items-center px-1.5 py-0.5 text-xs rounded bg-(--color-primary-soft-bg) text-(--color-primary-soft-text) border border-primary/20 max-w-[min(8rem,100%)] truncate"
                >
                  {{ formatDisplayValue(val) }}
                </span>
                <span
                  v-if="arrayValue.length > 3"
                  class="inline-flex items-center px-1.5 py-0.5 text-xs rounded bg-(--color-surface) text-(--color-text-muted)"
                >
                  +{{ arrayValue.length - 3 }}
                </span>
              </span>
              <span class="flex gap-1">
                <CoreAppIcon :name="icons.chevronDown" class="w-3.5 h-3.5 shrink-0 text-(--color-text-muted)" />
              </span>
            </button>

            <template #content>
              <div class="max-h-72 overflow-y-auto">
                <div v-if="editable" class="sticky top-0 z-10 bg-(--color-surface-elevated) border-b border-(--color-border) px-2 py-1">
                  <div class="flex items-center gap-1">
                    <CoreAppInput
                      ref="multiAddInputRef"
                      v-model="customInput"
                      :placeholder="$t('groups.membersSearch')"
                      size="xs"
                      class="flex-1"
                      @keydown.enter.prevent="addCustomMultiItem"
                    />
                    <CoreAppButton
                      size="xs"
                      variant="ghost"
                      color="primary"
                      :icon="icons.add"
                      :disabled="!customInput.trim()"
                      @click="addCustomMultiItem"
                    />
                  </div>
                </div>
                <button
                  v-for="opt in filteredMultiOptions"
                  :key="opt"
                  type="button"
                  class="flex items-center gap-2 w-full px-2.5 text-sm hover:bg-(--color-surface-hover) transition-colors"
                  :class="size === 'xs' ? 'py-0.5 min-h-8' : 'py-1 min-h-10 md:min-h-8'"
                  @click="toggleMultiItem(opt)"
                >
                  <CoreAppIcon
                    :name="arrayValue.includes(opt) ? icons.squareCheck : icons.square"
                    class="w-4 h-4 shrink-0"
                    :class="arrayValue.includes(opt) ? 'text-(--color-primary-soft-text)' : 'text-(--color-text-muted)'"
                  />
                  <span class="truncate text-left" :title="opt">{{ formatDisplayValue(opt) }}</span>
                </button>
                <div
                  v-if="filteredMultiOptions.length === 0 && customInput.trim()"
                  class="px-3 py-2 text-xs text-(--color-text-muted) text-center"
                >
                  {{ $t('common.pressEnterToAdd') }}
                </div>
              </div>
            </template>
          </UPopover>
          <CoreAppButton
            size="xs"
            :icon="clipboard.isCopied(arrayValue.join(', ')) ? icons.check : icons.copy"
            variant="ghost"
            :color="clipboard.isCopied(arrayValue.join(', ')) ? 'success' : 'neutral'"
            class="h-5! min-h-5! px-1! opacity-0 group-hover/paramrow:opacity-100 group-focus-within/paramrow:opacity-100 transition-opacity"
            :title="String(clipboard.isCopied(arrayValue.join(',')) ? $t('common.copied') : $t('common.copy'))"
            :aria-label="`${String($t('common.copyValue', { id: props.configId }))}`"
            @click="copyToClipboard(arrayValue.join(', '))"
          />
        </span>
      </div>
    </template>

    <!-- Multi-value without possible values: tags + inline input -->
    <template v-else-if="multiValue">
      <div class="flex-1 min-w-0 group/paramrow">
        <span class="flex gap-1 min-w-0 items-center shrink-0">
          <div
            class="flex flex-wrap items-center gap-1 p-1 border border-(--color-border) rounded-md bg-(--color-background) w-full"
            :class="[size === 'xs' ? 'min-h-8' : 'min-h-11 md:min-h-8', disabled ? 'opacity-50' : '']"
          >
            <span
              v-for="(val, idx) in arrayValue"
              :key="idx"
              class="inline-flex items-center gap-1 px-1.5 py-0.5 text-xs rounded-full bg-(--color-primary-soft-bg) text-(--color-primary-soft-text) border border-primary/20 max-w-[min(12rem,100%)] group/tag"
            >
              <span class="min-w-0 truncate" :title="val">{{ formatDisplayValue(val) }}</span>
              <CoreAppButton
                v-if="!disabled"
                type="button"
                variant="ghost"
                color="neutral"
                size="xs"
                class="shrink-0 p-0! hover:text-(--color-error-soft-text) transition-colors opacity-60 group-hover/tag:opacity-100"
                @click="removeMultiItem(idx)"
              >
                <CoreAppIcon :name="icons.x" class="w-3 h-3" />
              </CoreAppButton>
            </span>
            <CoreAppButton
              v-if="hasMultilineValues(arrayValue)"
              type="button"
              variant="ghost"
              color="neutral"
              size="xs"
              class="p-0! inline-flex items-center gap-0.5 px-1 py-0.5 text-xs text-(--color-text-muted) hover:text-(--color-primary) transition-colors"
              @click="openMultilineEditor"
            >
              <CoreAppIcon :name="icons.pencilSquare" class="w-3 h-3" />
            </CoreAppButton>
            <CoreAppInput
              v-if="editable && !disabled"
              v-model="customInput"
              class="flex-1 basis-24 min-w-0"
              size="xs"
              :aria-label="controlAriaLabel"
              :placeholder="arrayValue.length === 0 ? $t('common.pressEnterToAdd') : ''"
              @keydown.enter.prevent="addCustomMultiItem"
              @keydown.backspace="handleTagBackspace"
            />
          </div>
          <CoreAppButton
            size="xs"
            :icon="clipboard.isCopied(arrayValue.join(', ')) ? icons.check : icons.copy"
            variant="ghost"
            :color="clipboard.isCopied(arrayValue.join(', ')) ? 'success' : 'neutral'"
            class="h-5! min-h-5! px-1! opacity-0 group-hover/paramrow:opacity-100 group-focus-within/paramrow:opacity-100 transition-opacity"
            :title="String(clipboard.isCopied(arrayValue.join(', ')) ? $t('common.copied') : $t('common.copy'))"
            :aria-label="`${String($t('common.copyValue', { id: props.configId }))}`"
            @click="copyToClipboard(arrayValue.join(', '))"
          />
        </span>
      </div>
    </template>

    <!-- Single value, non-editable with possible values: select -->
    <template v-else-if="hasPossibleValues && !editable">
      <div class="flex-1 min-w-0 group/paramrow">
        <span class="flex gap-1 min-w-0 items-center shrink-0">
          <CoreAppSelectMenu
            :model-value="selectModelValue"
            :items="selectItemsWithEmpty"
            :disabled="disabled"
            :size="controlSize"
            :aria-label="controlAriaLabel"
            class="flex-1 min-w-0"
            @update:model-value="handleNonEditableSelectChange"
          />
          <CoreAppButton
            size="xs"
            :icon="clipboard.isCopied(selectModelValue) ? icons.check : icons.copy"
            variant="ghost"
            :color="clipboard.isCopied(selectModelValue) ? 'success' : 'neutral'"
            class="h-5! min-h-5! px-1! opacity-0 group-hover/paramrow:opacity-100 group-focus-within/paramrow:opacity-100 transition-opacity"
            :title="String(clipboard.isCopied(selectModelValue) ? $t('common.copied') : $t('common.copy'))"
            :aria-label="`${String($t('common.copyValue', { id: props.configId }))}`"
            @click="copyToClipboard(selectModelValue)"
          />
        </span>
      </div>
    </template>

    <!-- Single value, editable with possible values: combobox-style -->
    <template v-else-if="hasPossibleValues && editable">
      <div class="flex-1 min-w-0 group/paramrow">
        <span class="flex gap-1 min-w-0 items-center shrink-0">
          <UPopover :ui="{ content: 'p-0 w-64' }">
            <button
              type="button"
              :aria-label="controlAriaLabel"
              class="w-full flex items-center justify-between gap-2 px-2 text-sm font-normal border border-(--color-border) rounded-md bg-(--color-surface-elevated) hover:border-primary/50 transition-colors text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--color-primary) focus-visible:ring-offset-1 focus-visible:ring-offset-(--color-surface-elevated)"
              :class="[
                size === 'xs' ? 'py-1 min-h-8' : 'py-1.5 md:py-1 min-h-11 md:min-h-8',
                disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer',
              ]"
              :disabled="disabled"
            >
              <span :class="stringValue ? '' : 'text-(--color-text-muted)'" class="truncate">
                {{ stringValue ? formatDisplayValue(stringValue) : `(${$t('common.empty')})` }}
              </span>
              <CoreAppIcon :name="icons.chevronDown" class="w-3.5 h-3.5 shrink-0 text-(--color-text-muted)" />
            </button>
            <template #content>
              <div class="max-h-64 overflow-y-auto">
                <div class="sticky top-0 z-10 bg-(--color-surface-elevated) border-b border-(--color-border) px-2 py-1">
                  <CoreAppInput
                    v-model="editableSearchInput"
                    :placeholder="$t('common.enterValue')"
                    size="xs"
                    class="w-full"
                    @keydown.enter.prevent="applyEditableCustomValue"
                  />
                </div>
                <button
                  type="button"
                  class="flex items-center gap-2 w-full px-2.5 text-sm hover:bg-(--color-surface-hover) transition-colors"
                  :class="[
                    size === 'xs' ? 'py-0.5 min-h-8' : 'py-1 min-h-10 md:min-h-8',
                    !stringValue
                      ? 'text-(--color-primary-soft-text) font-medium bg-(--color-primary-soft-bg)'
                      : 'text-(--color-text-muted)',
                  ]"
                  @click="setEmptyEditableValue"
                >
                  <span>({{ $t('common.empty') }})</span>
                </button>
                <button
                  v-for="opt in filteredEditableOptions"
                  :key="opt"
                  type="button"
                  class="flex items-center gap-2 w-full px-3 text-sm hover:bg-(--color-surface-hover) transition-colors"
                  :class="[
                    size === 'xs' ? 'py-0.5 min-h-8' : 'py-1.5 min-h-10 md:min-h-8',
                    stringValue === opt ? 'text-(--color-text) font-medium bg-(--color-primary-soft-bg)' : '',
                  ]"
                  @click="setEditableValue(opt)"
                >
                  <span class="truncate" :title="opt">{{ formatDisplayValue(opt) }}</span>
                </button>
                <button
                  v-if="editableSearchInput.trim() && !filteredPossibleValueStrings.includes(editableSearchInput.trim())"
                  type="button"
                  class="flex items-center gap-2 w-full px-2.5 text-sm text-(--color-primary) hover:bg-(--color-surface-hover) transition-colors border-t border-(--color-border)"
                  :class="size === 'xs' ? 'py-0.5 min-h-8' : 'py-1 min-h-10 md:min-h-8'"
                  @click="applyEditableCustomValue"
                >
                  <CoreAppIcon :name="icons.add" class="w-3.5 h-3.5" />
                  <span>{{ editableSearchInput.trim() }}</span>
                </button>
              </div>
            </template>
          </UPopover>
          <CoreAppButton
            size="xs"
            :icon="clipboard.isCopied(stringValue) ? icons.check : icons.copy"
            variant="ghost"
            :color="clipboard.isCopied(stringValue) ? 'success' : 'neutral'"
            class="h-5! min-h-5! px-1! opacity-0 group-hover/paramrow:opacity-100 group-focus-within/paramrow:opacity-100 transition-opacity"
            :title="String(clipboard.isCopied(stringValue) ? $t('common.copied') : $t('common.copy'))"
            :aria-label="`${String($t('common.copyValue', { id: props.configId }))}`"
            @click="copyToClipboard(stringValue)"
          />
        </span>
      </div>
    </template>

    <!-- Multiline single value: show preview + edit button -->
    <template v-else-if="isMultilineValue">
      <div class="flex-1 flex items-center gap-1 min-w-0 group/paramrow">
        <span class="flex gap-1 min-w-0 items-center shrink-0">
          <div
            class="flex-1 px-2 text-sm border border-(--color-border) rounded-md bg-(--color-surface-elevated) cursor-pointer hover:border-primary/50 transition-colors truncate focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--color-primary) focus-visible:ring-offset-1 focus-visible:ring-offset-(--color-surface-elevated)"
            :class="[
              size === 'xs' ? 'py-1 min-h-8' : 'py-1.5 md:py-1 min-h-11 md:min-h-8',
              disabled ? 'opacity-50 cursor-not-allowed' : '',
            ]"
            :title="stringValue"
            role="button"
            tabindex="0"
            @click="!disabled && openMultilineEditor()"
            @keydown.enter="!disabled && openMultilineEditor()"
            @keydown.space.prevent="!disabled && openMultilineEditor()"
          >
            {{ formatDisplayValue(stringValue) }}
          </div>
          <CoreAppButton
            v-if="!disabled"
            size="xs"
            variant="ghost"
            color="neutral"
            :icon="icons.pencilSquare"
            @click="openMultilineEditor"
          />
          <CoreAppButton
            size="xs"
            :icon="clipboard.isCopied(stringValue) ? icons.check : icons.copy"
            variant="ghost"
            :color="clipboard.isCopied(stringValue) ? 'success' : 'neutral'"
            class="h-5! min-h-5! px-1! opacity-0 group-hover/paramrow:opacity-100 group-focus-within/paramrow:opacity-100 transition-opacity"
            :title="String(clipboard.isCopied(stringValue) ? $t('common.copied') : $t('common.copy'))"
            :aria-label="`${String($t('common.copyValue', { id: props.configId }))}`"
            @click="copyToClipboard(stringValue)"
          />
        </span>
      </div>
    </template>

    <!-- Plain input (no possible values, single value) -->
    <template v-else>
      <div class="flex-1 min-w-0 group/paramrow">
        <span class="flex gap-1 min-w-0 items-center shrink-0">
          <CoreAppInput
            :model-value="stringValue"
            :disabled="disabled"
            :size="controlSize"
            class="flex-1 min-w-0"
            :aria-label="controlAriaLabel"
            @update:model-value="(v: string) => emit('update:modelValue', v)"
          />
          <CoreAppButton
            size="xs"
            :icon="clipboard.isCopied(stringValue) ? icons.check : icons.copy"
            variant="ghost"
            :color="clipboard.isCopied(stringValue) ? 'success' : 'neutral'"
            class="h-5! min-h-5! px-1! opacity-0 group-hover/paramrow:opacity-100 group-focus-within/paramrow:opacity-100 transition-opacity"
            :title="String(clipboard.isCopied(stringValue) ? $t('common.copied') : $t('common.copy'))"
            :aria-label="`${String($t('common.copyValue', { id: props.configId }))}`"
            @click="copyToClipboard(stringValue)"
          />
        </span>
      </div>
    </template>

    <!-- Multiline editor modal -->
    <CoreAppModal v-model:open="showMultilineEditor" :title="$t('common.editValue')" :ui="{ content: 'max-w-sm sm:max-w-xl' }">
      <template #body>
        <CoreAppTextarea ref="multilineTextareaRef" v-model="multilineEditValue" class="w-full" :rows="12" :disabled="disabled" />
      </template>
      <template #footer>
        <div class="flex gap-2 justify-end">
          <CoreAppButton variant="ghost" color="neutral" @click="showMultilineEditor = false">{{ $t('common.cancel') }} </CoreAppButton>
          <CoreAppButton color="primary" @click="applyMultilineEdit">{{ $t('common.apply') }}</CoreAppButton>
        </div>
      </template>
    </CoreAppModal>
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
    configId?: string
    size?: 'xs' | 'sm'
  }

  const props = withDefaults(defineProps<Props>(), {
    type: 'unicode',
    possibleValues: () => [],
    multiValue: false,
    editable: true,
    disabled: false,
    password: false,
    mixed: false,
    size: 'sm',
  })

  const emit = defineEmits<{
    'update:modelValue': [value: unknown]
  }>()

  const icons = useIcons()
  const { t: $t } = useI18n()
  const controlSize = computed<'xs' | 'sm'>(() => props.size)

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
  const filteredPossibleValueStrings = computed(() => possibleValueStrings.value.filter((v) => v !== ''))
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
    // This ensures manually-added values can be unchecked/deleted too.
    const customSelected = props.editable ? arrayValue.value.filter((v) => !filteredPossibleValueStrings.value.includes(v)) : []
    const all = [...allMultiOptions.value, ...customSelected]
    if (!q) return all
    return all.filter((v) => v.toLowerCase().includes(q))
  })

  const filteredEditableOptions = computed(() => {
    const q = editableSearchInput.value.trim().toLowerCase()
    if (!q) return filteredPossibleValueStrings.value
    return filteredPossibleValueStrings.value.filter((v) => v.toLowerCase().includes(q))
  })

  const selectItemsWithEmpty = computed(() => {
    const items = filteredPossibleValueStrings.value.map((v) => ({ label: v, value: v }))
    return [{ label: `(${String($t('common.empty'))})`, value: EMPTY_SENTINEL }, ...items]
  })

  const clipboard = useClipboard()

  async function copyToClipboard(text: string) {
    await clipboard.copy(text)
  }

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
    console.log(
      'Checking for multiline values in array:',
      values,
      'has multiline:',
      values.some((v) => v.includes('\n')),
    )
    return values.some((v) => v.includes('\n'))
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

  function setEmptyEditableValue() {
    emit('update:modelValue', '')
    editableSearchInput.value = ''
  }

  function setEditableValue(value: string) {
    emit('update:modelValue', value)
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
      const values = multilineEditValue.value.split('\n').filter((v) => v.trim() !== '')
      emit('update:modelValue', values)
    } else {
      emit('update:modelValue', multilineEditValue.value)
    }
    showMultilineEditor.value = false
  }
</script>
