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
    <CoreAppTooltip :text="tooltipText">
      <span class="inline-flex items-center justify-center rounded p-0.5" :aria-label="tooltipText">
        <CoreAppIcon v-if="reachable === true" :name="icons.clientReachable" class="w-4 h-4 text-(--color-success-soft-text)" />

        <CoreAppStackedIcons
          v-else-if="reachable === false"
          :primary-icon="icons.clientReachable"
          :secondary-icon="icons.x"
          size="sm"
          primary-class="w-4 h-4 text-(--color-error-soft-text)"
          secondary-class="w-2.5 h-2.5 text-(--color-error-soft-text)"
        />

        <CoreAppIcon v-else :name="icons.clientReachable" class="w-4 h-4 text-(--color-text-muted) opacity-50" />
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
