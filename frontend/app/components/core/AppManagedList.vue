<!--
  This file is part of opsi-webgui application.
  opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
  Copyright (c) uib GmbH <info@uib.de> 2026
  All rights reserved.
  License: AGPL-3.0

  CoreAppManagedList - Dense list of saved entries (saved searches, terminal quick commands)
  with select all / shift-click range selection and bulk delete.
-->
<template>
  <div class="flex flex-col gap-1">
    <p v-if="items.length === 0" class="m-0 text-xs text-(--color-text-muted) italic">{{ emptyText }}</p>

    <template v-else>
      <div class="flex items-center gap-1.5 pb-0.5 border-b border-(--color-border)">
        <CoreAppCheckbox
          :model-value="someSelected ? 'indeterminate' : allSelected"
          size="xs"
          :aria-label="String($t('common.selectAll'))"
          @update:model-value="toggleAll"
        />
        <span class="text-[0.6875rem] text-(--color-text-muted)">
          {{ selectedIds.length > 0 ? `${selectedIds.length} ${$t('common.selected')}` : $t('common.rangeSelectHint') }}
        </span>
        <CoreAppTooltip :text="String($t('common.deleteSelected'))">
          <UButton
            class="ml-auto"
            size="xs"
            variant="ghost"
            color="error"
            :icon="icons.delete"
            :disabled="selectedIds.length === 0"
            :aria-label="String($t('common.deleteSelected'))"
            @click="deleteSelected"
          />
        </CoreAppTooltip>
      </div>

      <ul class="m-0 p-0 list-none flex flex-col max-h-52 overflow-y-auto">
        <li v-for="(item, index) in items" :key="item.id" class="flex items-center gap-1 px-0.5 rounded hover:bg-(--color-surface-hover)">
          <CoreAppCheckbox
            :model-value="selectedSet.has(item.id)"
            size="xs"
            :aria-label="`${$t('common.select')}: ${item.label}`"
            @click="rememberShift"
            @update:model-value="() => onCheckboxChange(index)"
          />
          <button
            type="button"
            class="flex-1 min-w-0 truncate text-left bg-transparent border-0 px-0.5 py-0.5 cursor-pointer text-xs"
            :class="monospace ? 'font-mono' : ''"
            :title="item.label"
            @click="emit('apply', item.id)"
          >
            {{ item.label }}
          </button>
          <CoreAppTooltip :text="`${$t('common.delete')}: ${item.label}`">
            <UButton
              :icon="icons.delete"
              size="xs"
              variant="ghost"
              color="error"
              :aria-label="`${$t('common.delete')}: ${item.label}`"
              @click="emit('delete', [item.id])"
            />
          </CoreAppTooltip>
        </li>
      </ul>
    </template>
  </div>
</template>

<script setup lang="ts">
  export interface ManagedListItem {
    id: string
    label: string
  }

  const props = withDefaults(
    defineProps<{
      items: ManagedListItem[]
      emptyText: string
      monospace?: boolean
    }>(),
    { monospace: false },
  )

  const emit = defineEmits<{
    (e: 'apply', id: string): void
    (e: 'delete', ids: string[]): void
  }>()

  const icons = useIcons()
  const { t: $t } = useI18n()

  const selectedIds = ref<string[]>([])
  const selectedSet = computed(() => new Set(selectedIds.value))
  const lastIndex = ref<number | null>(null)

  const allSelected = computed(() => props.items.length > 0 && selectedIds.value.length === props.items.length)
  const someSelected = computed(() => selectedIds.value.length > 0 && !allSelected.value)

  watch(
    () => props.items,
    (items) => {
      const known = new Set(items.map((item) => item.id))
      selectedIds.value = selectedIds.value.filter((id) => known.has(id))
    },
  )

  // Selection is kept here so that shift-click extends the range instead of toggling a
  // single entry; the shift state is captured on click and applied on the change event.
  let pendingShift = false

  function rememberShift(event: MouseEvent) {
    pendingShift = event.shiftKey
  }

  function onCheckboxChange(index: number) {
    const item = props.items[index]
    const shift = pendingShift
    pendingShift = false
    if (!item) return
    if (shift && lastIndex.value !== null) {
      const start = Math.min(lastIndex.value, index)
      const end = Math.max(lastIndex.value, index)
      const rangeIds = props.items.slice(start, end + 1).map((entry) => entry.id)
      selectedIds.value = [...new Set([...selectedIds.value, ...rangeIds])]
      return
    }
    lastIndex.value = index
    selectedIds.value = selectedSet.value.has(item.id) ? selectedIds.value.filter((id) => id !== item.id) : [...selectedIds.value, item.id]
  }

  function toggleAll(checked: boolean | 'indeterminate') {
    selectedIds.value = checked === true ? props.items.map((item) => item.id) : []
    lastIndex.value = null
  }

  function deleteSelected() {
    if (selectedIds.value.length === 0) return
    emit('delete', [...selectedIds.value])
    selectedIds.value = []
    lastIndex.value = null
  }
</script>
