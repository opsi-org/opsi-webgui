/*
 * This file is part of the OPSI-WebGUI application.
 * OPSI-WebGUI is the web-based management interface for OPSI.
 * https://opsi.org/en/
 *
 * Copyright (c) UIB GmbH info@uib.de 2026
 * All rights reserved.
 * License: AGPL-3.0
 *
 * useWorkspaceLayout - Persisted panel layout sizes.
 */
import { readStorageJSON, writeStorageJSON } from '~/utils/storage'

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
  return readStorageJSON(key, fallback)
}

function writeJSON(key: string, value: unknown) {
  if (import.meta.server) return
  writeStorageJSON(key, value)
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
