import { describe, expect, it } from 'vitest'
import {
  createRequestGuard,
  filterHardwareItems,
  filterSoftwareItems,
  isInventoryPresent,
  sortInventoryItems,
} from '~/app/composables/useInventoryFilters'
import type { HardwareInventoryItem, SoftwareInventoryItem } from '~/app/types'

function hwItem(overrides: Partial<HardwareInventoryItem> = {}): HardwareInventoryItem {
  return {
    identifier: 'id-1',
    hardwareClass: 'COMPUTER_SYSTEM',
    className: 'Computer',
    displayName: 'PC1',
    firstseen: '2026-01-01 10:00:00',
    lastseen: '2026-09-01 10:00:00',
    state: 1,
    attributes: [],
    ...overrides,
  }
}

function swItem(overrides: Partial<SoftwareInventoryItem> = {}): SoftwareInventoryItem {
  return {
    identifier: 'id-1',
    name: 'Firefox',
    version: '128.0',
    subVersion: '',
    language: '',
    architecture: 'x64',
    displayName: 'Firefox',
    windowsSoftwareId: null,
    windowsDisplayName: null,
    windowsDisplayVersion: null,
    isOperatingSystem: false,
    isKbUpdate: false,
    installSize: null,
    firstseen: '2026-01-01 10:00:00',
    lastseen: '2026-09-01 10:00:00',
    state: 1,
    usageFrequency: -1,
    lastUsed: '0000-00-00 00:00:00',
    licenseKey: null,
    binaryName: null,
    uninstallString: null,
    ...overrides,
  }
}

describe('isInventoryPresent', () => {
  it('treats null/undefined state as present (default)', () => {
    expect(isInventoryPresent(null)).toBe(true)
    expect(isInventoryPresent(undefined)).toBe(true)
  })

  it('treats state 0 as absent, any other value as present', () => {
    expect(isInventoryPresent(0)).toBe(false)
    expect(isInventoryPresent(1)).toBe(true)
  })
})

describe('filterHardwareItems', () => {
  it('returns an empty list unchanged (no crash on empty/null data)', () => {
    expect(filterHardwareItems([])).toEqual([])
  })

  it('filters by hardware class', () => {
    const items = [hwItem({ className: 'Computer' }), hwItem({ identifier: 'id-2', className: 'Disk' })]
    expect(filterHardwareItems(items, { classFilter: 'Disk' })).toHaveLength(1)
  })

  it('filters by free-text query across displayName, className and attribute values', () => {
    const items = [
      hwItem({ displayName: 'PC1', attributes: [{ key: 'vendor', label: 'Vendor', value: 'Acme' }] }),
      hwItem({ identifier: 'id-2', displayName: 'PC2', attributes: [{ key: 'vendor', label: 'Vendor', value: 'Contoso' }] }),
    ]
    expect(filterHardwareItems(items, { query: 'acme' })).toHaveLength(1)
    expect(filterHardwareItems(items, { query: 'PC' })).toHaveLength(2)
  })

  it('does not crash when an attribute value is null', () => {
    const items = [hwItem({ attributes: [{ key: 'vendor', label: 'Vendor', value: null }] })]
    expect(() => filterHardwareItems(items, { query: 'anything' })).not.toThrow()
  })
})

describe('filterSoftwareItems', () => {
  it('returns an empty list unchanged (no crash on empty/null data)', () => {
    expect(filterSoftwareItems([])).toEqual([])
  })

  it('excludes KB updates when includeKbUpdates is false', () => {
    const items = [swItem({ isKbUpdate: true }), swItem({ identifier: 'id-2', isKbUpdate: false })]
    expect(filterSoftwareItems(items, { includeKbUpdates: false })).toHaveLength(1)
    expect(filterSoftwareItems(items, { includeKbUpdates: true })).toHaveLength(2)
  })

  it('filters by free-text query across name, windowsDisplayName and version', () => {
    const items = [swItem({ name: 'Firefox' }), swItem({ identifier: 'id-2', name: 'Chrome', windowsDisplayName: 'Google Chrome' })]
    expect(filterSoftwareItems(items, { query: 'chrome' })).toHaveLength(1)
  })
})

describe('sortInventoryItems', () => {
  it('sorts ascending/descending and keeps duplicate identities as separate entries', () => {
    const items = [
      { identifier: 'a', displayName: 'Beta' },
      { identifier: 'b', displayName: 'Alpha' },
      { identifier: 'c', displayName: 'Alpha' },
    ]
    const asc = sortInventoryItems(items, 'displayName', false)
    expect(asc.map((i) => i.identifier)).toEqual(['b', 'c', 'a'])
    expect(asc).toHaveLength(3)

    const desc = sortInventoryItems(items, 'displayName', true)
    expect(desc[0].identifier).toBe('a')
  })

  it('sorts null/undefined values to the end regardless of direction', () => {
    const items = [{ v: null }, { v: 'x' }, { v: undefined }]
    const sorted = sortInventoryItems(items, 'v', false)
    expect(sorted[0].v).toBe('x')
  })
})

describe('createRequestGuard (client switching / race condition protection)', () => {
  it('marks only the most recently issued id as current', () => {
    const guard = createRequestGuard()
    const first = guard.next()
    const second = guard.next()

    expect(guard.isCurrent(first)).toBe(false)
    expect(guard.isCurrent(second)).toBe(true)
  })

  it('simulates an out-of-order response (slow first fetch resolves after a faster second one)', () => {
    const guard = createRequestGuard()
    const requestForClientA = guard.next()
    const requestForClientB = guard.next()

    // Client B's response arrives first (fast network).
    expect(guard.isCurrent(requestForClientB)).toBe(true)
    // Client A's slower response arrives afterwards and must be discarded.
    expect(guard.isCurrent(requestForClientA)).toBe(false)
  })
})
