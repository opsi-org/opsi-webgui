/*
 * This file is part of the OPSI-WebGUI application.
 * OPSI-WebGUI is the web-based management interface for OPSI.
 * https://opsi.org/en/
 *
 * Copyright (c) UIB GmbH info@uib.de 2026
 * All rights reserved.
 * License: AGPL-3.0
 */

import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@vueuse/core', () => ({ useColorMode: () => ({ value: 'light' }) }))

import { useUiStore } from '~/stores/uiStore'
import { useDataTableFilterStore } from '~/stores/dataTableFilterStore'
import { installLocalStorage } from '../helpers/localStorage'

describe('uiStore preferences', () => {
  beforeEach(() => {
    vi.unstubAllGlobals()
    setActivePinia(createPinia())
  })

  it('migrates legacy preferences into shared state once', () => {
    const storage = installLocalStorage()
    storage.setItem('opsi-webgui-save-and-process', '1')
    storage.setItem('opsi-webgui-process-actions-visibility', 'hidden')
    storage.setItem('opsi-webgui-show-all-client-row-actions', 'true')
    storage.setItem('opsi-webgui-terminal-quick-commands', JSON.stringify(['hostname']))
    storage.setItem('opsi-webgui-clients-advanced-filters', JSON.stringify({ reachable: true }))

    const store = useUiStore()
    store.initializePreferences()
    const filterStore = useDataTableFilterStore()
    filterStore.initialize()

    expect(store.productActions.processAfterSave).toBe(true)
    expect(store.productActions.visibility).toBe('hidden')
    expect(store.clients.showAllRowActions).toBe(true)
    expect(store.terminal.quickCommands).toEqual(['hostname'])
    expect(filterStore.advancedFilters.clients).toEqual({ reachable: true })
    expect(storage.getItem('opsi-webgui-save-and-process')).toBeNull()
    expect(storage.getItem('opsi-webgui-clients-advanced-filters')).toBeNull()

    store.productActions.processAfterSave = false
    store.initializePreferences()
    expect(store.productActions.processAfterSave).toBe(false)
  })

  it('ignores valid JSON with an unexpected legacy preference shape', () => {
    const storage = installLocalStorage()
    storage.setItem('opsi-webgui-terminal-quick-commands', JSON.stringify({ command: 'hostname' }))
    storage.setItem('opsi-webgui-products-advanced-filters', JSON.stringify(['unexpected']))

    const store = useUiStore()
    store.initializePreferences()
    const filterStore = useDataTableFilterStore()
    filterStore.initialize()

    expect(store.terminal.quickCommands).toEqual([])
    expect(filterStore.advancedFilters.products).toEqual({})
  })
})
