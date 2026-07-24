<!--
  This file is part of opsi-webgui application.
  opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
  Copyright (c) uib GmbH <info@uib.de> 2026
  All rights reserved.
  License: AGPL-3.0

  CoreAppStackedIcons - Primary icon with a smaller secondary icon at the bottom-right corner.
-->
<template>
  <span class="relative inline-flex items-center justify-center shrink-0 overflow-visible">
    <CoreAppIcon :name="primaryIcon" :class="primaryClass || primarySizeClass" />
    <template v-if="secondaryIcon">
      <span
        v-if="badge"
        class="absolute -bottom-1 -right-3 inline-flex items-center justify-center rounded-full ring-2"
        :class="[badgeWrapperSizeClass, badgeBgClass, badgeRingClass]"
      >
        <CoreAppIcon :name="secondaryIcon" :class="[badgeIconSizeClass, badgeIconColorClass]" />
      </span>
      <CoreAppIcon
        v-else
        :name="secondaryIcon"
        class="absolute -bottom-1 -right-1 shrink-0"
        :class="[secondaryClass || secondarySizeClass, secondaryColorClass]"
      />
    </template>
  </span>
</template>

<script setup lang="ts">
  interface Props {
    primaryIcon: string
    secondaryIcon?: string
    size?: 'xs' | 'sm' | 'md' | 'lg'
    primaryClass?: string
    secondaryClass?: string
    secondaryColor?: 'warning' | 'error' | 'success' | 'info' | 'neutral'
    badge?: boolean
    badgeColor?: 'primary' | 'success' | 'warning' | 'error' | 'neutral' | 'none'
  }

  const props = withDefaults(defineProps<Props>(), {
    size: 'sm',
    badge: false,
    badgeColor: 'primary',
  })

  const primarySizeClass = computed(() => {
    switch (props.size) {
      case 'xs':
        return 'w-3 h-3'
      case 'sm':
        return 'w-4 h-4'
      case 'md':
        return 'w-5 h-5'
      case 'lg':
        return 'w-6 h-6'
      default:
        return 'w-4 h-4'
    }
  })

  const secondarySizeClass = computed(() => {
    switch (props.size) {
      case 'xs':
        return 'w-2 h-2'
      case 'sm':
        return 'w-2.5 h-2.5'
      case 'md':
        return 'w-3 h-3'
      case 'lg':
        return 'w-3.5 h-3.5'
      default:
        return 'w-2.5 h-2.5'
    }
  })

  const secondaryColorClass = computed(() => {
    switch (props.secondaryColor) {
      case 'warning':
        return 'text-(--color-warning)'
      case 'error':
        return 'text-(--color-error)'
      case 'success':
        return 'text-(--color-success)'
      case 'info':
        return 'text-(--color-info)'
      case 'neutral':
        return 'text-(--color-text-muted)'
      default:
        return ''
    }
  })

  const badgeWrapperSizeClass = computed(() => {
    switch (props.size) {
      case 'xs':
        return 'w-2.5 h-2.5'
      case 'sm':
        return 'w-3 h-3'
      case 'md':
        return 'w-3.5 h-3.5'
      case 'lg':
        return 'w-4.5 h-4.5'
      default:
        return 'w-3 h-3'
    }
  })

  const badgeIconSizeClass = computed(() => {
    switch (props.size) {
      case 'xs':
        return 'w-1.5 h-1.5'
      case 'sm':
        return 'w-2 h-2'
      case 'md':
        return 'w-2.5 h-2.5'
      case 'lg':
        return 'w-3 h-3'
      default:
        return 'w-2 h-2'
    }
  })

  const badgeBgClass = computed(() => {
    switch (props.badgeColor) {
      case 'success':
        return 'bg-(--color-success)'
      case 'warning':
        return 'bg-(--color-warning)'
      case 'error':
        return 'bg-(--color-error)'
      case 'neutral':
        return 'bg-(--color-text-muted)'
      case 'none':
        return 'bg-(--color-surface)'
      case 'primary':
      default:
        return 'bg-opsi-blue'
    }
  })

  const badgeRingClass = computed(() =>
    props.badgeColor === 'none' ? 'ring-(--color-border)' : 'ring-(--color-surface)'
  )

  const badgeIconColorClass = computed(() =>
    props.badgeColor === 'none' ? 'text-(--color-text)' : 'text-white'
  )
</script>
