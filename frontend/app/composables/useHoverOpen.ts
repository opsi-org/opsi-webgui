/*
 * This file is part of opsi-webgui application.
 * opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
 * Copyright (c) uib GmbH <info@uib.de> 2026
 * All rights reserved.
 * License: AGPL-3.0
 *
 * useHoverOpen - Shared open/close-with-delay state for hover-enabled popovers, selects and
 * dropdown menus. Opening is debounced so moving the pointer across a table doesn't flash
 * every trigger it passes over.
 */
export interface UseHoverOpenOptions {
  openDelay?: number
  closeDelay?: number
}

export function useHoverOpen(options: UseHoverOpenOptions = {}) {
  const openDelay = options.openDelay ?? 120
  const closeDelay = options.closeDelay ?? 280

  const isOpen = ref(false)
  const triggerRef = ref<HTMLElement | null>(null)
  let openTimer: ReturnType<typeof setTimeout> | null = null
  let closeTimer: ReturnType<typeof setTimeout> | null = null

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
      isOpen.value = true
    }, openDelay)
  }

  function ownContentEl(): Element | null {
    if (import.meta.server) return null
    const contentId = triggerRef.value?.querySelector('[aria-controls]')?.getAttribute('aria-controls')
    return contentId ? document.getElementById(contentId) : null
  }

  function isPointerOverOwnTriggerOrContent(): boolean {
    if (import.meta.server) return false
    if (triggerRef.value?.matches(':hover')) return true
    return !!ownContentEl()?.matches(':hover')
  }

  function scheduleClose() {
    if (openTimer) {
      clearTimeout(openTimer)
      openTimer = null
    }
    if (!isOpen.value || closeTimer) return
    const check = () => {
      if (isPointerOverOwnTriggerOrContent()) {
        closeTimer = setTimeout(check, closeDelay)
        return
      }
      closeTimer = null
      isOpen.value = false
    }
    closeTimer = setTimeout(check, closeDelay)
  }

  function closeNow() {
    clearTimers()
    isOpen.value = false
  }

  onUnmounted(clearTimers)

  return { isOpen, triggerRef, scheduleOpen, scheduleClose, closeNow }
}
