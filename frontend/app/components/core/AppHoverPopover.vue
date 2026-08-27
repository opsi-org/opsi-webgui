<!--
  This file is part of opsi-webgui application.
  opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
  Copyright (c) uib GmbH <info@uib.de> 2026
  All rights reserved.
  License: AGPL-3.0

  CoreAppHoverPopover - Popover that opens on hover (and on click/keyboard for pointer-less
  use). It intentionally does not close on interaction: clicking a button, a select that
  renders in its own portal, or pressing Enter inside an input keeps it open. It closes when
  the pointer leaves trigger and content, on Escape, or when the trigger is clicked again.
-->
<template>
  <UPopover v-model:open="isOpen" :dismissible="false" :content="contentProps" :ui="{ content: 'pointer-events-auto' }">
    <!-- eslint-disable-next-line vuejs-accessibility/no-static-element-interactions -- wrapper only adds hover/escape handling around the interactive trigger it contains -->
    <span class="inline-flex" @pointerenter="scheduleOpen" @pointerleave="scheduleClose" @keydown.esc="closeNow">
      <slot :open="isOpen" />
    </span>

    <template #content>
      <!-- eslint-disable-next-line vuejs-accessibility/no-static-element-interactions -- dialog container only tracks hover and Escape so the popover stays open while it is used -->
      <div
        class="flex flex-col gap-2 p-2.5 rounded bg-(--color-background) shadow-lg"
        :class="contentClass"
        role="dialog"
        :aria-label="title || ariaLabel"
        @pointerenter="cancelClose"
        @pointerleave="scheduleClose"
        @keydown.esc="closeNow"
      >
        <h3 v-if="title" class="m-0 text-xs font-semibold uppercase tracking-wider text-(--color-text-muted)">
          {{ title }}
        </h3>
        <slot name="content" />
      </div>
    </template>
  </UPopover>
</template>

<script setup lang="ts">
  const props = withDefaults(
    defineProps<{
      title?: string
      ariaLabel?: string
      contentClass?: string
      side?: 'top' | 'right' | 'bottom' | 'left'
      align?: 'start' | 'center' | 'end'
      openDelay?: number
      closeDelay?: number
    }>(),
    {
      side: 'bottom',
      align: 'end',
      openDelay: 120,
      closeDelay: 280,
    },
  )

  const isOpen = ref(false)
  const openedByPointer = ref(false)
  let openTimer: ReturnType<typeof setTimeout> | null = null
  let closeTimer: ReturnType<typeof setTimeout> | null = null

  const contentProps = computed(() => ({
    side: props.side,
    align: props.align,
    onOpenAutoFocus: (event: Event) => {
      if (openedByPointer.value) event.preventDefault()
    },
    onCloseAutoFocus: (event: Event) => {
      if (openedByPointer.value) event.preventDefault()
    },
  }))

  function clearTimers() {
    if (openTimer) {
      clearTimeout(openTimer)
      openTimer = null
    }
    if (closeTimer) {
      clearTimeout(closeTimer)
      closeTimer = null
    }
  }

  function scheduleOpen() {
    if (closeTimer) {
      clearTimeout(closeTimer)
      closeTimer = null
    }
    if (isOpen.value || openTimer) return
    openTimer = setTimeout(() => {
      openTimer = null
      openedByPointer.value = true
      isOpen.value = true
    }, props.openDelay)
  }

  function cancelClose() {
    if (closeTimer) {
      clearTimeout(closeTimer)
      closeTimer = null
    }
  }

  function scheduleClose() {
    if (openTimer) {
      clearTimeout(openTimer)
      openTimer = null
    }
    if (!isOpen.value || closeTimer) return
    closeTimer = setTimeout(() => {
      closeTimer = null
      // A select or menu opened from inside renders in its own portal, so the pointer
      // "leaves" this popover while the user is still working in it.
      if (nestedOverlayOpen()) {
        scheduleClose()
        return
      }
      isOpen.value = false
    }, props.closeDelay)
  }

  function nestedOverlayOpen(): boolean {
    if (import.meta.server) return false
    return !!document.querySelector('[role="listbox"], [role="menu"]')
  }

  function closeNow() {
    clearTimers()
    isOpen.value = false
  }

  watch(isOpen, (open) => {
    if (!open) openedByPointer.value = false
  })

  onUnmounted(clearTimers)

  defineExpose({ close: closeNow })
</script>
