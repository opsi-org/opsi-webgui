<!--
  This file is part of opsi-webgui application.
  opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
  Copyright (c) uib GmbH <info@uib.de> 2026
  All rights reserved.
  License: AGPL-3.0

  CoreAppSelectMenu - UI library wrapper for searchable/multi-select dropdown rendering. Pass
  `open-on-hover` to also open it while the pointer rests on the trigger (click and keyboard
  still work as before). Pass `borderless` for a plain/ghost look (no ring/background) and
  `no-caret` to hide the trailing chevron, e.g. when the trigger already has its own icon.
-->
<template>
  <!-- eslint-disable-next-line vuejs-accessibility/no-static-element-interactions -- wrapper only adds hover/escape handling around the interactive select it contains -->
  <span
    v-if="openOnHover"
    ref="triggerRef"
    class="inline-flex w-full"
    @pointerenter="scheduleOpen"
    @pointerleave="scheduleClose"
    @keydown.esc="closeNow"
  >
    <USelectMenu v-bind="accessibleAttrs" class="w-full" v-model:open="isOpen">
      <template v-for="(_, name) in $slots" :key="name" #[name]="slotData">
        <slot :name="name" v-bind="slotData || {}" />
      </template>
    </USelectMenu>
  </span>
  <USelectMenu v-else v-bind="accessibleAttrs" class="w-full">
    <template v-for="(_, name) in $slots" :key="name" #[name]="slotData">
      <slot :name="name" v-bind="slotData || {}" />
    </template>
  </USelectMenu>
</template>

<script setup lang="ts">
  import { useUiStore } from '~/stores/uiStore'

  defineOptions({ inheritAttrs: false })

  const props = defineProps<{ openOnHover?: boolean; borderless?: boolean; noCaret?: boolean }>()
  const attrs = useAttrs()
  const uiStore = useUiStore()
  const accessibleAttrs = computed(() => {
    // withAccessibleName returns the raw (readonly) attrs proxy unchanged when it already
    // has a name, so it must be copied before any property below can be set on it.
    const a = { ...(withAccessibleName(attrs) as Record<string, unknown>) }
    if (uiStore.isMobile) a.size = 'xs'
    // Unlike USelect, USelectMenu has no default value-key: without one it emits the whole
    // { label, value } item instead of just its value. Every item list here is that shape,
    // so default it the same way USelect always did, unless a caller overrides it.
    if (a.valueKey === undefined) a.valueKey = 'value'
    if (props.borderless && a.variant === undefined) a.variant = 'ghost'
    if (props.noCaret) a.trailing = false
    // The theme clamps the popup to the trigger's own width; grow it to fit the item
    // labels instead (never narrower than the trigger), unless a caller already overrides it.
    const callerUi = (a.ui as Record<string, unknown> | undefined) ?? {}
    const callerContent = typeof callerUi.content === 'string' ? callerUi.content : ''
    a.ui = { ...callerUi, content: ['w-max min-w-(--reka-combobox-trigger-width)', callerContent].filter(Boolean).join(' ') }
    return a
  })

  const { isOpen, triggerRef, scheduleOpen, scheduleClose, closeNow } = useHoverOpen()
</script>
