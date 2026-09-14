<!--
  This file is part of opsi-webgui application.
  opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
  Copyright (c) uib GmbH <info@uib.de> 2026
  All rights reserved.
  License: AGPL-3.0

  CoreAppSavedSearchesDropdown - Apply, save and delete named search presets (filter text +
  advanced filters). Content-only (no popover/trigger of its own): rendered as the "Saved
  Searches" section inside CoreAppDataTable's combined filters popover, right below the
  scope's own advanced-filters section, so saving/favoriting and reusing a search happen in
  one place instead of two separate popovers.
-->
<template>
  <div class="flex flex-col gap-1.5">
    <h4 class="m-0 text-xs font-semibold uppercase tracking-wider text-(--color-text-muted)">{{ $t('savedSearches.title') }}</h4>
    <div class="flex items-center gap-1.5 pt-1">
      <CoreAppFilterInput
        v-model="filterQuery"
        class="flex-1"
        input-class="w-full"
        :placeholder="String($t('savedSearches.namePlaceholder'))"
        @keydown.enter.prevent="emit('save')"
      />
      <CoreAppButton size="sm" color="primary" :icon="icons.bookmark" :disabled="!canSave" @click="emit('save')" />
    </div>

    <div v-if="entries.length > 0" class="flex justify-end">
      <CoreAppTooltip :text="String($t('savedSearches.clearAll'))">
        <CoreAppButton
          size="xs"
          variant="ghost"
          color="error"
          :icon="icons.xCircle"
          :aria-label="String($t('savedSearches.clearAll'))"
          @click="
            emit(
              'delete',
              entries.map((entry) => entry.id),
            )
          "
        />
      </CoreAppTooltip>
    </div>

    <CoreAppManagedList
      :items="entries"
      :empty-text="String($t('savedSearches.none'))"
      show-favorite
      :selectable="false"
      @apply="(id: string) => emit('apply', id)"
      @delete="(ids: string[]) => emit('delete', ids)"
      @toggle-favorite="(id: string) => emit('toggle-favorite', id)"
    />
  </div>
</template>

<script setup lang="ts">
  import type { ManagedListItem } from '~/components/core/AppManagedList.vue'

  defineProps<{
    entries: ManagedListItem[]
    canSave?: boolean
  }>()

  const emit = defineEmits<{
    (e: 'apply', id: string): void
    (e: 'delete', ids: string[]): void
    (e: 'save'): void
    (e: 'toggle-favorite', id: string): void
  }>()

  const filterQuery = defineModel<string>('filterQuery', { default: '' })

  const icons = useIcons()
  const { t: $t } = useI18n()
</script>
