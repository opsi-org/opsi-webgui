/*
 * This file is part of opsi-webgui application.
 * opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
 * Copyright (c) uib GmbH <info@uib.de> 2026
 * All rights reserved.
 * License: AGPL-3.0
 *
 * useSavedSearches - Named, per-table saved search presets (free-text filter + advanced
 * filters) persisted in localStorage.
 */
import type { ShallowRef } from 'vue'

export interface SavedSearch<T> {
  id: string
  name: string
  filterQuery: string
  advancedFilters: T
  createdAt: number
  favorite?: boolean
}

function storageKey(scopeId: string) {
  return `opsi-webgui-saved-searches-${scopeId}`
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
    // localStorage may be unavailable (private mode / quota) - saved searches just won't persist.
  }
}

const storeCache = new Map<string, ShallowRef<SavedSearch<unknown>[]>>()

function getSharedStore<T>(key: string) {
  let store = storeCache.get(key)
  if (!store) {
    store = shallowRef<SavedSearch<unknown>[]>(readJSON(key, []))
    storeCache.set(key, store)
  }
  return store as ShallowRef<SavedSearch<T>[]>
}

export function useSavedSearches<T>(scopeId: MaybeRefOrGetter<string>) {
  const key = computed(() => storageKey(toValue(scopeId)))

  const savedSearches = computed<SavedSearch<T>[]>({
    get: () => getSharedStore<T>(key.value).value,
    set: (value) => {
      getSharedStore<T>(key.value).value = value
    },
  })

  function persist() {
    writeJSON(key.value, savedSearches.value)
  }

  function save(name: string, filterQuery: string, advancedFilters: T) {
    const previous = savedSearches.value.find((s) => s.name === name)
    const entry: SavedSearch<T> = {
      id: previous?.id ?? `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      name,
      filterQuery,
      advancedFilters,
      createdAt: previous?.createdAt ?? Date.now(),
      favorite: previous?.favorite,
    }
    savedSearches.value = [...savedSearches.value.filter((s) => s.name !== name), entry]
    persist()
    return entry
  }

  function remove(ids: string | string[]) {
    const removed = new Set(Array.isArray(ids) ? ids : [ids])
    savedSearches.value = savedSearches.value.filter((s) => !removed.has(s.id))
    persist()
  }

  function get(id: string): SavedSearch<T> | undefined {
    return savedSearches.value.find((s) => s.id === id)
  }

  function toggleFavorite(id: string) {
    savedSearches.value = savedSearches.value.map((s) => (s.id === id ? { ...s, favorite: !s.favorite } : s))
    persist()
  }

  return { savedSearches, save, remove, get, toggleFavorite }
}
