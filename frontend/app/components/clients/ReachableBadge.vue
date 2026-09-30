<!--
  This file is part of the OPSI-WebGUI application.
  OPSI-WebGUI is the web-based management interface for OPSI.
https://opsi.org/en/

  Copyright (c) UIB GmbH info@uib.de 2026
  All rights reserved.
  License: AGPL-3.0

  ClientsReachableBadge - Badge showing client reachability status.
-->
<template>
  <div class="flex items-center justify-center">
    <CoreAppTooltip :text="tooltipText">
      <span class="inline-flex items-center justify-center rounded p-0.5" :aria-label="tooltipText">
        <CoreAppStackedIcons
          v-if="reachable === true"
          :primary-icon="icons.client"
          :secondary-icon="icons.check"
          size="sm"
          primary-class="w-4 h-4 text-(--color-text-muted)"
          secondary-class="w-2.5 h-2.5 text-(--color-success-soft-text)"
        />

        <CoreAppStackedIcons
          v-else-if="reachable === false"
          :primary-icon="icons.client"
          :secondary-icon="icons.x"
          size="sm"
          primary-class="w-4 h-4 text-(--color-text-muted)"
          secondary-class="w-2.5 h-2.5 text-(--color-error-soft-text)"
        />

        <CoreAppIcon v-else :name="icons.client" class="w-4 h-4 text-(--color-text-muted) opacity-50" />
      </span>
    </CoreAppTooltip>
  </div>
</template>

<script setup lang="ts">
  interface Props {
    reachable?: boolean
  }

  const props = defineProps<Props>()

  const icons = useIcons()
  const { t: $t } = useI18n()

  const tooltipText = computed(() =>
    props.reachable === true
      ? String($t('clients.reachable.is'))
      : props.reachable === false
        ? String($t('clients.reachable.not'))
        : String($t('clients.reachable.unknown')),
  )
</script>
