/*
 * This file is part of the OPSI-WebGUI application.
 * OPSI-WebGUI is the web-based management interface for OPSI.
 * https://opsi.org/en/
 *
 * Copyright (c) UIB GmbH info@uib.de 2026
 * All rights reserved.
 * License: AGPL-3.0
 */

import { beforeEach, describe, expect, it, vi } from 'vitest'
import { getStoredDataTableFilter, saveStoredDataTableFilter } from '~/app/composables/data-table/useDataTableFilter'
import { installLocalStorage } from '../helpers/localStorage'

const STORAGE_KEY = 'opsi-webgui-datatable-filter-queries'

describe('useDataTableFilter helpers', () => {
  beforeEach(() => {
    vi.unstubAllGlobals()
    installLocalStorage()
  })

  it('returns an empty string when no filter is stored', () => {
    expect(getStoredDataTableFilter('clients')).toBe('')
  })

  it('saves and restores a stored filter by id', () => {
    saveStoredDataTableFilter('clients', 'abc')

    expect(getStoredDataTableFilter('clients')).toBe('abc')
    expect(getStoredDataTableFilter('servers')).toBe('')

    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}')
    expect(stored.queries.clients).toBe('abc')
  })

  it('keeps a shared products filter for whichever product table reads it', () => {
    saveStoredDataTableFilter('products', 'opsi-linux')

    expect(getStoredDataTableFilter('products')).toBe('opsi-linux')
  })

  it('tolerates malformed storage data', () => {
    localStorage.setItem(STORAGE_KEY, '{invalid-json')

    expect(getStoredDataTableFilter('clients')).toBe('')
  })
})
