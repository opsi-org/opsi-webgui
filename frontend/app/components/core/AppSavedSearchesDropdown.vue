<!--
  This file is part of opsi-webgui application.
  opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
  Copyright (c) uib GmbH <info@uib.de> 2026
  All rights reserved.
  License: AGPL-3.0

  CoreAppSavedSearchesDropdown - Apply, save and delete named search presets (filter text +
  advanced filters). The entries are owned by the data table.
-->
<template>
  <CoreAppHoverPopover :title="String($t('savedSearches.title'))" content-class="min-w-80">
    <UButton
      :icon="icons.bookmark"
      :aria-label="String($t('savedSearches.title'))"
      variant="outline"
      :color="entries.length > 0 ? 'primary' : 'neutral'"
      size="sm"
      data-testid="saved-searches"
    />

    <template #content>
      <p class="m-0 text-[0.6875rem] text-(--color-text-muted)">{{ $t('savedSearches.help') }}</p>

      <CoreAppManagedList
        :items="entries"
        :empty-text="String($t('savedSearches.none'))"
        @apply="(id: string) => emit('apply', id)"
        @delete="(ids: string[]) => emit('delete', ids)"
      />

      <div class="flex items-center gap-1.5 pt-1 border-t border-(--color-border)">
        <CoreAppFilterInput
          v-model="filterQuery"
          class="flex-1"
          input-class="w-full"
          :placeholder="String($t('common.filter'))"
          @keydown.enter.prevent="emit('save')"
        />
        <UButton size="sm" color="primary" :icon="icons.bookmark" :disabled="!filterQuery.trim()" @click="emit('save')">
          {{ $t('common.save') }}
        </UButton>
      </div>
    </template>
  </CoreAppHoverPopover>
</template>

<script setup lang="ts">
  import type { ManagedListItem } from '~/components/core/AppManagedList.vue'

  defineProps<{
    entries: ManagedListItem[]
  }>()

  const emit = defineEmits<{
    (e: 'apply', id: string): void
    (e: 'delete', ids: string[]): void
    (e: 'save'): void
  }>()

  const filterQuery = defineModel<string>('filterQuery', { default: '' })

  const icons = useIcons()
  const { t: $t } = useI18n()
</script>
