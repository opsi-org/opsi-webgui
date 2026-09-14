<!--
  This file is part of opsi-webgui application.
  opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
  Copyright (c) uib GmbH <info@uib.de> 2026
  All rights reserved.
  License: AGPL-3.0

  ProductsAdvancedFiltersPopover - Installation status / action result / usage filters for the
  products table. Content-only (no popover/trigger of its own): rendered as the "Advanced
  Filters" section inside CoreAppDataTable's combined filters popover.
-->
<template>
  <CoreAppSectionHeader :title="String($t('common.advancedFilters'))" />

  <p class="m-0 text-xs text-(--color-text-muted)">{{ $t('products.advancedFilters.scopeHelp') }}</p>

  <div class="flex flex-col gap-1">
    <span class="text-xs text-(--color-text-muted)">{{ $t('products.status') }}</span>
    <CoreAppSelectMenu
      :model-value="modelValue.installationStatus || 'all'"
      :items="installationStatusOptions"
      size="sm"
      open-on-hover
      :aria-label="String($t('products.status'))"
      @update:model-value="(v: string) => setFilter({ installationStatus: v === 'all' ? undefined : v })"
    />
  </div>

  <CoreAppCheckbox
    v-for="option in toggleOptions"
    :key="option.key"
    :model-value="!!modelValue[option.key]"
    :label="option.label"
    size="xs"
    :ui="{ root: 'w-full px-1 py-1 rounded hover:bg-(--color-surface-hover)', label: 'text-xs w-full cursor-pointer' }"
    @update:model-value="(v: boolean) => setFilter({ [option.key]: v || undefined })"
  />
</template>

<script setup lang="ts">
  export interface ProductAdvancedFilters {
    installationStatus?: string
    hasFailedActionResult?: boolean
    hasPendingActionRequest?: boolean
    unused?: boolean
  }

  type ProductAdvancedFilterToggle = 'hasFailedActionResult' | 'hasPendingActionRequest' | 'unused'

  const props = defineProps<{
    modelValue: ProductAdvancedFilters
    canSaveSearch?: boolean
  }>()
  const emit = defineEmits<{
    (e: 'update:modelValue', value: ProductAdvancedFilters): void
    (e: 'favorite'): void
  }>()

  const icons = useIcons()
  const { t: $t } = useI18n()

  const installationStatusOptions = computed(() => [
    { value: 'all', label: String($t('common.all')), icon: icons.filter },
    { value: 'installed', label: String($t('products.statusInstalled')), icon: icons.productInstallationStatusInstalled },
    { value: 'not_installed', label: String($t('products.statusNotInstalled')), icon: icons.xCircle },
    { value: 'unknown', label: String($t('products.statusUnknown')), icon: icons.productInstallationStatusUnknown },
  ])

  const toggleOptions = computed<Array<{ key: ProductAdvancedFilterToggle; label: string }>>(() => [
    { key: 'hasFailedActionResult', label: String($t('products.advancedFilters.hasFailedActionResult')) },
    { key: 'hasPendingActionRequest', label: String($t('products.advancedFilters.hasPendingActionRequest')) },
    { key: 'unused', label: String($t('products.advancedFilters.unused')) },
  ])

  function setFilter(patch: Partial<ProductAdvancedFilters>) {
    emit('update:modelValue', { ...props.modelValue, ...patch })
  }
</script>
