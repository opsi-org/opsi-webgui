/*
 * This file is part of the OPSI-WebGUI application.
 * OPSI-WebGUI is the web-based management interface for OPSI.
 * https://opsi.org/en/
 *
 * Copyright (c) UIB GmbH info@uib.de 2026
 * All rights reserved.
 * License: AGPL-3.0
 */

function getLocalStorage(): Storage | undefined {
  try {
    if (typeof window !== 'undefined') return window.localStorage
    if (typeof globalThis.localStorage !== 'undefined') return globalThis.localStorage
  } catch {
    return undefined
  }
}

export function readStorageValue(key: string): string | null {
  try {
    return getLocalStorage()?.getItem(key) ?? null
  } catch {
    return null
  }
}

export function readStorageJSON<T>(key: string, fallback: T): T {
  try {
    const value = readStorageValue(key)
    return value ? (JSON.parse(value) as T) : fallback
  } catch {
    return fallback
  }
}

export function writeStorageValue(key: string, value: string): void {
  try {
    getLocalStorage()?.setItem(key, value)
  } catch {
    // Storage is optional; the application state remains usable without persistence.
  }
}

export function writeStorageJSON(key: string, value: unknown): void {
  try {
    writeStorageValue(key, JSON.stringify(value))
  } catch {
    // Ignore unserializable values and continue without persistence.
  }
}

export function removeStorageValue(key: string): void {
  try {
    getLocalStorage()?.removeItem(key)
  } catch {
    // Storage is optional; the application state remains usable without persistence.
  }
}

export const safeLocalStorage: Storage = {
  get length() {
    try {
      return getLocalStorage()?.length ?? 0
    } catch {
      return 0
    }
  },
  clear() {
    try {
      getLocalStorage()?.clear()
    } catch {
      // Storage is optional; the application state remains usable without persistence.
    }
  },
  getItem: readStorageValue,
  key(index: number) {
    try {
      return getLocalStorage()?.key(index) ?? null
    } catch {
      return null
    }
  },
  removeItem: removeStorageValue,
  setItem: writeStorageValue,
}
