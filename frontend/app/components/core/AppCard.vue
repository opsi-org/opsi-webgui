<!--
  This file is part of opsi-webgui application.
  opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
  Copyright (c) uib GmbH <info@uib.de> 2026
  All rights reserved.
  License: AGPL-3.0

  CoreAppCard - UI library wrapper for card rendering.
-->
<template>
  <UCard v-bind="forwardedAttrs" :ui="mergedUi">
    <template v-for="(_, name) in $slots" :key="name" #[name]="slotData">
      <slot :name="name" v-bind="slotData || {}" />
    </template>
  </UCard>
</template>

<script setup lang="ts">
  defineOptions({ inheritAttrs: false })

  const props = defineProps<{
    fill?: boolean
    scrollable?: boolean
  }>()

  const attrs = useAttrs()

  const forwardedAttrs = computed(() => {
    const { ui: _ui, ...rest } = attrs as Record<string, unknown>
    return rest
  })

  const mergedUi = computed(() => {
    const incoming = (attrs.ui as Record<string, string> | undefined) || {}
    if (!props.fill && !props.scrollable) return incoming

    const join = (...parts: (string | undefined | false)[]) => parts.filter(Boolean).join(' ')

    return {
      ...incoming,
      root: join('flex flex-col h-full min-h-0', incoming.root),
      body: join('flex-1 min-h-0', props.scrollable && 'overflow-y-auto', incoming.body),
    }
  })
</script>
