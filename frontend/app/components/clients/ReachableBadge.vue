<!--
  This file is part of opsi-webgui application.
  opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
  Copyright (c) uib GmbH <info@uib.de> 2026
  All rights reserved.
  License: AGPL-3.0

  ClientsReachableBadge - Badge showing client reachability status.
-->
<template>
  <div class="flex items-center justify-center">
    <CoreAppTooltip v-if="loading" :text="String($t('common.loading'))">
      <button
        type="button"
        class="inline-flex items-center justify-center rounded p-0.5 hover:bg-(--color-surface-hover) focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-opsi-blue"
        :aria-label="String($t('clients.reachable.check'))"
        @click="$emit('check')"
      >
        <CoreAppLoadingSpinner size="sm" />
      </button>
    </CoreAppTooltip>

    <CoreAppTooltip v-else-if="reachable === true" :text="String($t('clients.reachable.is'))">
      <button
        type="button"
        class="inline-flex items-center justify-center rounded p-0.5 hover:bg-(--color-surface-hover) focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-opsi-blue"
        :aria-label="String($t('clients.reachable.is'))"
        @click="$emit('check')"
      >
        <CoreAppIcon :name="icons.clientReachable" class="w-4 h-4 text-(--color-success-soft-text)" />
      </button>
    </CoreAppTooltip>

    <CoreAppTooltip v-else-if="reachable === false" :text="String($t('clients.reachable.not'))">
      <button
        type="button"
        class="inline-flex items-center justify-center rounded p-0.5 hover:bg-(--color-surface-hover) focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-opsi-blue"
        :aria-label="String($t('clients.reachable.not'))"
        @click="$emit('check')"
      >
        <CoreAppStackedIcons
          :primary-icon="icons.clientReachable"
          :secondary-icon="icons.x"
          size="sm"
          primary-class="w-4 h-4 text-(--color-error-soft-text)"
          secondary-class="w-2.5 h-2.5 text-(--color-error-soft-text)"
        />
      </button>
    </CoreAppTooltip>

    <CoreAppTooltip v-else :text="String($t('clients.reachable.check'))">
      <button
        type="button"
        class="inline-flex items-center justify-center rounded p-0.5 hover:bg-(--color-surface-hover) focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-opsi-blue"
        :aria-label="String($t('clients.reachable.check'))"
        @click="$emit('check')"
      >
        <CoreAppIcon :name="icons.clientReachable" class="w-4 h-4 text-(--color-text-muted)" />
      </button>
    </CoreAppTooltip>
  </div>
</template>

<script setup lang="ts">
  interface Props {
    clientId: string
    reachable?: boolean
    loading?: boolean
  }

  defineProps<Props>()
  defineEmits<{
    check: []
  }>()

  const icons = useIcons()
  const { t: $t } = useI18n()
</script>
