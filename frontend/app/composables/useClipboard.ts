/*
 * This file is part of opsi-webgui application.
 * opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
 * Copyright (c) uib GmbH <info@uib.de> 2026
 * All rights reserved.
 * License: AGPL-3.0
 *
 * useClipboard - Copy text to clipboard with transient "copied" feedback per key.
 */

const COPIED_RESET_MS = 1500

export function useClipboard() {
  const copiedKey = ref<string | null>(null)
  let resetTimer: ReturnType<typeof setTimeout> | undefined

  async function copy(text: string, key: string = text) {
    try {
      await navigator.clipboard.writeText(text)
    } catch {
      const textArea = document.createElement('textarea')
      textArea.value = text
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
    }
    copiedKey.value = key
    if (resetTimer) clearTimeout(resetTimer)
    resetTimer = setTimeout(() => {
      copiedKey.value = null
    }, COPIED_RESET_MS)
  }

  function isCopied(key: string) {
    return copiedKey.value === key
  }

  return { copy, isCopied }
}
