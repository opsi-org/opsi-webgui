import { describe, it, expect, beforeEach, vi } from 'vitest'
import { nextTick } from 'vue'
import type { DataTableColumnDef } from '~/app/composables/useDataTableSettings'
import { useDataTableSettings } from '~/app/composables/useDataTableSettings'

const STORAGE_KEY = 'opsi-webgui-datatable-settings'

/** Minimal in-memory localStorage stub (vitest runs in the node environment). */
function installLocalStorage(): Storage {
  const map = new Map<string, string>()
  const storage: Storage = {
    get length() {
      return map.size
    },
    clear: () => map.clear(),
    getItem: (k: string) => (map.has(k) ? map.get(k)! : null),
    key: (i: number) => Array.from(map.keys())[i] ?? null,
    removeItem: (k: string) => map.delete(k),
    setItem: (k: string, v: string) => map.set(k, String(v)),
  }
  ;(globalThis as { localStorage?: Storage }).localStorage = storage
  return storage
}

const columns: DataTableColumnDef[] = [
  { key: 'id', label: 'ID', alwaysVisible: true },
  { key: 'name', label: 'Name', visible: true },
  { key: 'notes', label: 'Notes', visible: false },
]

describe('useDataTableSettings', () => {
  beforeEach(() => {
    installLocalStorage()
  })

  describe('defaults', () => {
    it('uses the predefined defaults for a known table id', () => {
      const { settings } = useDataTableSettings('servers')
      expect(settings.visibleColumns).toEqual(['depotId', 'description', 'type', 'ip'])
      expect(settings.sortColumn).toBe('depotId')
      expect(settings.selectionMode).toBe('single')
    })

    it('falls back to generic defaults for an unknown table id', () => {
      const { settings } = useDataTableSettings('does-not-exist')
      expect(settings.visibleColumns).toEqual([])
      expect(settings.sortColumn).toBe('')
      expect(settings.pageSize).toBe(50)
      expect(settings.selectionMode).toBe('multi')
    })
  })

  describe('column visibility', () => {
    it('setVisibleColumns replaces the list', () => {
      const { settings, setVisibleColumns } = useDataTableSettings('clients')
      setVisibleColumns(['a', 'b'])
      expect(settings.visibleColumns).toEqual(['a', 'b'])
    })

    it('toggleColumn adds a missing column and removes a present one', () => {
      const { settings, setVisibleColumns, toggleColumn } = useDataTableSettings('clients')
      setVisibleColumns(['a'])
      toggleColumn('b')
      expect(settings.visibleColumns).toEqual(['a', 'b'])
      toggleColumn('a')
      expect(settings.visibleColumns).toEqual(['b'])
    })

    it('isColumnVisible respects alwaysVisible regardless of selection', () => {
      const { setVisibleColumns, isColumnVisible } = useDataTableSettings('clients')
      setVisibleColumns(['name'])
      expect(isColumnVisible('id', columns)).toBe(true)
    })

    it('isColumnVisible falls back to the column default when nothing is selected', () => {
      const { setVisibleColumns, isColumnVisible } = useDataTableSettings('clients')
      setVisibleColumns([])
      expect(isColumnVisible('name', columns)).toBe(true)
      expect(isColumnVisible('notes', columns)).toBe(false)
    })

    it('isColumnVisible uses the selected list when columns are chosen', () => {
      const { setVisibleColumns, isColumnVisible } = useDataTableSettings('clients')
      setVisibleColumns(['name'])
      expect(isColumnVisible('name', columns)).toBe(true)
      expect(isColumnVisible('notes', columns)).toBe(false)
    })
  })

  describe('sorting', () => {
    it('setSort with an explicit direction sets both column and direction', () => {
      const { settings, setSort } = useDataTableSettings('clients')
      setSort('name', 'desc')
      expect(settings.sortColumn).toBe('name')
      expect(settings.sortDirection).toBe('desc')
    })

    it('setSort toggles the direction when the same column is sorted again', () => {
      const { settings, setSort } = useDataTableSettings('clients')
      setSort('name', 'asc')
      setSort('name')
      expect(settings.sortDirection).toBe('desc')
      setSort('name')
      expect(settings.sortDirection).toBe('asc')
    })

    it('setSort on a new column resets to ascending', () => {
      const { settings, setSort } = useDataTableSettings('clients')
      setSort('name', 'desc')
      setSort('description')
      expect(settings.sortColumn).toBe('description')
      expect(settings.sortDirection).toBe('asc')
    })
  })

  describe('display / selection / page size setters', () => {
    it('setPageSize, setDisplayMode and setSelectionMode update the settings', () => {
      const { settings, setPageSize, setDisplayMode, setSelectionMode } = useDataTableSettings('clients')
      setPageSize(50)
      setDisplayMode('pagination')
      setSelectionMode('single')
      expect(settings.pageSize).toBe(20)
      expect(settings.displayMode).toBe('pagination')
      expect(settings.selectionMode).toBe('single')
    })
  })

  describe('reset', () => {
    it('restores the original defaults for the table id', () => {
      const { settings, setVisibleColumns, setPageSize, reset } = useDataTableSettings('servers')
      setVisibleColumns(['x'])
      setPageSize(99)
      reset()
      expect(settings.visibleColumns).toEqual(['depotId', 'description', 'type', 'ip'])
      expect(settings.pageSize).toBe(20)
    })
  })

  describe('persistence', () => {
    it('seeds the settings from a previously stored value', () => {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          clients: {
            visibleColumns: ['only-this'],
            sortColumn: 'lastSeen',
            sortDirection: 'desc',
            pageSize: 100,
            displayMode: 'pagination',
            selectionMode: 'single',
          },
        }),
      )
      const { settings } = useDataTableSettings('clients')
      expect(settings.visibleColumns).toEqual(['only-this'])
      expect(settings.sortColumn).toBe('lastSeen')
      expect(settings.pageSize).toBe(100)
    })

    it('writes changes back to localStorage', async () => {
      const { setPageSize } = useDataTableSettings('clients')
      setPageSize(75)
      await nextTick()
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}')
      expect(stored.clients.pageSize).toBe(75)
    })

    it('tolerates malformed stored JSON without throwing', () => {
      localStorage.setItem(STORAGE_KEY, '{not valid json')
      expect(() => useDataTableSettings('clients')).not.toThrow()
      const { settings } = useDataTableSettings('clients')
      // Falls back to defaults because the stored blob could not be parsed.
      expect(settings.sortColumn).toBe('clientId')
    })

    it('tolerates a throwing localStorage (e.g. disabled storage)', () => {
      const throwing = {
        getItem: vi.fn(() => {
          throw new Error('blocked')
        }),
        setItem: vi.fn(() => {
          throw new Error('blocked')
        }),
      } as unknown as Storage
      ;(globalThis as { localStorage?: Storage }).localStorage = throwing
      expect(() => useDataTableSettings('clients')).not.toThrow()
    })
  })
})
