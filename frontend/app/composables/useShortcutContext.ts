/*
 * This file is part of opsi-webgui application.
 * opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
 * Copyright (c) uib GmbH <info@uib.de> 2026
 * All rights reserved.
 * License: AGPL-3.0
 *
 * useShortcutContext - Shared ephemeral shortcut context for components.
 */

export interface ShortcutContextActions {
  save?: () => void | Promise<void>
  canSave?: () => boolean
  discard?: () => void
  canDiscard?: () => boolean
  saveAndExecute?: () => void | Promise<void>
  canSaveAndExecute?: () => boolean
  closeActivePanel?: () => boolean
}

const activeShortcutActions = reactive<ShortcutContextActions>({})
const registrations = new Map<number, ShortcutContextActions>()
let nextRegistrationId = 0

function syncActiveActions() {
  for (const key of Object.keys(activeShortcutActions)) {
    delete (activeShortcutActions as Record<string, unknown>)[key]
  }

  const latestRegistration = [...registrations.entries()].at(-1)?.[1]
  if (latestRegistration) {
    Object.assign(activeShortcutActions, latestRegistration)
  }
}

export function useShortcutContext(actions: ShortcutContextActions) {
  const registrationId = ++nextRegistrationId
  registrations.set(registrationId, actions)
  syncActiveActions()

  onUnmounted(() => {
    registrations.delete(registrationId)
    syncActiveActions()
  })
}

export function useActiveShortcutActions() {
  return activeShortcutActions
}
