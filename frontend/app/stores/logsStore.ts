/**
This file is part of opsi-webgui application.
opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
Copyright (c) uib GmbH <info@uib.de> 2026
All rights reserved.
License: AGPL-3.0

Logs Store - manages log viewing preferences and state
*/
import { defineStore } from 'pinia'

export interface LogsStoreState {
  // Log level filter (0-9, where 6 is INFO)
  logLevel: number
  // Selected log type
  logType: string
  // Auto-fetch enabled
  autoFetch: boolean
  // Auto-scroll enabled
  autoScroll: boolean
  // Row marker position (-1 = no marker)
  markerLine: number
  // Client ID for marker
  markerClientId: string
  // Sync selection with client selection
  syncSelection: boolean
}

export const useLogsStore = defineStore('logs', {
  persist: { key: 'opsi-webgui-logs', storage: localStorage },
  state: (): LogsStoreState => ({
    logLevel: 6,
    logType: 'instlog',
    autoFetch: false,
    autoScroll: true,
    markerLine: -1,
    markerClientId: '',
    syncSelection: false,
  }),
  getters: {
    hasMarker: (state): boolean => state.markerLine >= 0,
    isMarkerForClient: (state) => (clientId: string): boolean =>
      state.markerClientId === clientId && state.markerLine >= 0,
  },
  actions: {
    setLogLevel(level: number) {
      this.logLevel = Math.max(0, Math.min(9, level))
    },
    setLogType(type: string) {
      this.logType = type
    },
    setAutoFetch(enabled: boolean) {
      this.autoFetch = enabled
    },
    setAutoScroll(enabled: boolean) {
      this.autoScroll = enabled
    },
    setMarker(line: number, clientId: string) {
      this.markerLine = line
      this.markerClientId = clientId
    },
    clearMarker() {
      this.markerLine = -1
      this.markerClientId = ''
    },
    setSyncSelection(enabled: boolean) {
      this.syncSelection = enabled
    },
  },
})
