/*
 * This file is part of the OPSI-WebGUI application.
 * OPSI-WebGUI is the web-based management interface for OPSI.
 * https://opsi.org/en/
 *
 * Copyright (c) UIB GmbH info@uib.de 2026
 * All rights reserved.
 * License: AGPL-3.0
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  readStorageJSON,
  readStorageValue,
  removeStorageValue,
  safeLocalStorage,
  writeStorageJSON,
  writeStorageValue,
} from '~/utils/storage'

function createStorage(): Storage {
  const values = new Map<string, string>()
  return {
    get length() {
      return values.size
    },
    clear: () => values.clear(),
    getItem: (key) => values.get(key) ?? null,
    key: (index) => Array.from(values.keys())[index] ?? null,
    removeItem: (key) => values.delete(key),
    setItem: (key, value) => values.set(key, String(value)),
  }
}

describe('storage utilities', () => {
  beforeEach(() => {
    vi.stubGlobal('localStorage', createStorage())
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('reads, writes, and removes string and JSON values', () => {
    writeStorageValue('plain', 'value')
    writeStorageJSON('structured', { enabled: true })

    expect(readStorageValue('plain')).toBe('value')
    expect(readStorageJSON('structured', {})).toEqual({ enabled: true })
    removeStorageValue('plain')
    expect(readStorageValue('plain')).toBeNull()
  })

  it('returns the supplied fallback for malformed JSON', () => {
    writeStorageValue('malformed', '{')
    expect(readStorageJSON('malformed', ['fallback'])).toEqual(['fallback'])
  })

  it('tolerates unavailable storage', () => {
    vi.stubGlobal('localStorage', {
      getItem: () => {
        throw new Error('blocked')
      },
      setItem: () => {
        throw new Error('blocked')
      },
      removeItem: () => {
        throw new Error('blocked')
      },
    })

    expect(readStorageValue('blocked')).toBeNull()
    expect(() => writeStorageJSON('blocked', {})).not.toThrow()
    expect(() => safeLocalStorage.setItem('blocked', 'value')).not.toThrow()
  })
})
