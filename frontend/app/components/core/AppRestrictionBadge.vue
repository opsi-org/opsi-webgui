<!--
  This file is part of opsi-webgui application.
  opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
  Copyright (c) uib GmbH <info@uib.de> 2026
  All rights reserved.
  License: AGPL-3.0

  CoreAppRestrictionBadge - Badge indicating feature access restrictions.
-->
<template>
  <UTooltip :text="tooltipText">
    <div
      class="flex flex-col items-center gap-0.5 rounded-lg py-1.5 cursor-help transition-colors hover:bg-(--color-surface-hover)"
    >
      <div class="relative w-9 h-9 flex items-center justify-center overflow-visible">
        <div class="w-8 h-8 rounded-full flex items-center justify-center" :class="colorClasses.bg">
          <UIcon :name="icon" class="w-4.5 h-4.5" :class="colorClasses.text" />
        </div>
        <span
          class="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full inline-flex items-center justify-center ring-2 ring-(--color-background)"
          :class="colorClasses.badge"
        >
          <UIcon
            :name="restricted ? icons.lock : icons.check"
            class="w-3 h-3"
            :class="colorClasses.badgeIcon"
          />
        </span>
      </div>
      <span
        class="text-[11px] text-[--color-text-muted] font-medium leading-tight text-center max-w-13 line-clamp-2"
        >{{ label }}</span
      >
    </div>
  </UTooltip>
</template>

<script setup lang="ts">
  const icons = useIcons()

  const props = defineProps<{
    icon: string
    label: string
    restricted: boolean
    tooltipText: string
  }>()

  const colorClasses = computed(() =>
    props.restricted
      ? {
          bg: 'bg-(--color-warning-soft-bg)',
          text: 'text-(--color-warning-soft-text)',
          badge: 'bg-(--color-warning)',
          badgeIcon: 'text-(--color-warning-text)',
        }
      : {
          bg: 'bg-(--color-success-soft-bg)',
          text: 'text-(--color-success-soft-text)',
          badge: 'bg-(--color-success)',
          badgeIcon: 'text-(--color-success-text)',
        }
  )
</script>
