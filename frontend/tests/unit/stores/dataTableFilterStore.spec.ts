import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useDataTableFilterStore } from '~/stores/dataTableFilterStore'
import { installLocalStorage } from '../helpers/localStorage'

describe('dataTableFilterStore', () => {
  beforeEach(() => {
    vi.unstubAllGlobals()
    setActivePinia(createPinia())
  })

  it('migrates legacy query maps and advanced-filter keys into one table-filter entry', () => {
    const storage = installLocalStorage()
    storage.setItem('opsi-webgui-datatable-filter-queries', JSON.stringify({ clients: 'name:pc' }))
    storage.setItem('opsi-webgui-products-advanced-filters', JSON.stringify({ unused: true }))

    const store = useDataTableFilterStore()
    store.initialize()

    expect(store.queries.clients).toBe('name:pc')
    expect(store.advancedFilters.products).toEqual({ unused: true })
    expect(JSON.parse(storage.getItem('opsi-webgui-datatable-filter-queries') ?? '{}')).toEqual({
      queries: { clients: 'name:pc' },
      advancedFilters: { clients: {}, products: { unused: true }, servers: {} },
    })
    expect(storage.getItem('opsi-webgui-products-advanced-filters')).toBeNull()
  })

  it('keeps advanced filters and queries together when either changes', () => {
    const storage = installLocalStorage()
    const store = useDataTableFilterStore()
    store.initialize()
    store.setAdvancedFilters('servers', { type: 'depot' })
    store.saveFilterQuery('servers', 'server01')

    const stored = JSON.parse(storage.getItem('opsi-webgui-datatable-filter-queries') ?? '{}')
    expect(stored.queries.servers).toBe('server01')
    expect(stored.advancedFilters.servers).toEqual({ type: 'depot' })
  })
})
