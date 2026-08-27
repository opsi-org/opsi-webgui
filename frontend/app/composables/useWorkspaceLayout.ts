/*
 * This file is part of opsi-webgui application.
 * opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
 * Copyright (c) uib GmbH <info@uib.de> 2026
 * All rights reserved.
 * License: AGPL-3.0
 *
 * useWorkspaceLayout - Persisted panel sizes (quickpanel width, detail panel / groups split width).
 * The user's last arrangement is auto-saved to localStorage on every change.
 */

export interface WorkspaceLayoutState {
  quickpanelWidth: number
  detailPanelWidthPercent: number
  groupsSidebarWidthPercent: number
}

const CURRENT_KEY = 'opsi-webgui-workspace-layout'

export const DEFAULT_WORKSPACE_LAYOUT: WorkspaceLayoutState = {
  quickpanelWidth: 264,
  detailPanelWidthPercent: 50,
  groupsSidebarWidthPercent: 50,
}

function readJSON<T>(key: string, fallback: T): T {
  if (import.meta.server) return fallback
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

function writeJSON(key: string, value: unknown) {
  if (import.meta.server) return
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // localStorage may be unavailable (private mode / quota) - layout just won't persist.
  }
}

// Module-level singleton so every component (layout shell, page panels) shares one
// reactive layout state instead of re-reading/writing localStorage independently.
const layout = reactive<WorkspaceLayoutState>({
  ...DEFAULT_WORKSPACE_LAYOUT,
  ...readJSON(CURRENT_KEY, DEFAULT_WORKSPACE_LAYOUT),
})
let persistWatchStarted = false

export function useWorkspaceLayout() {
  if (!persistWatchStarted && !import.meta.server) {
    persistWatchStarted = true
    watch(
      layout,
      (value) => {
        writeJSON(CURRENT_KEY, { ...value })
      },
      { deep: true },
    )
  }

  return { layout }
}
