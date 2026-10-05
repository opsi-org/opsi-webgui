import { readClientStorageJSON, writeClientStorageJSON } from '~/utils/storage'

export type AdvancedFilterScope = 'clients' | 'products' | 'servers'

export interface DataTableFilterStorage {
  queries: Record<string, string>
  advancedFilters: Partial<Record<AdvancedFilterScope, object>>
}

const STORAGE_KEY = 'opsi-webgui-datatable-filter-queries'
const scopes: AdvancedFilterScope[] = ['clients', 'products', 'servers']

export function isStorageRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
}

function readQueries(value: unknown): Record<string, string> {
  if (!isStorageRecord(value)) return {}
  return Object.fromEntries(Object.entries(value).filter((entry): entry is [string, string] => typeof entry[1] === 'string'))
}

function readAdvancedFilters(value: unknown): DataTableFilterStorage['advancedFilters'] {
  const filters: DataTableFilterStorage['advancedFilters'] = {}
  for (const scope of scopes) {
    if (isStorageRecord(value) && isStorageRecord(value[scope])) filters[scope] = value[scope]
  }
  return filters
}

export function readDataTableFilterStorage(): DataTableFilterStorage {
  const stored = readClientStorageJSON<unknown>(STORAGE_KEY, {})
  if (!isStorageRecord(stored)) return { queries: {}, advancedFilters: readAdvancedFilters({}) }

  const isCurrentFormat = 'queries' in stored
  return {
    queries: readQueries(isCurrentFormat ? stored.queries : stored),
    advancedFilters: readAdvancedFilters(isCurrentFormat ? stored.advancedFilters : {}),
  }
}

export function writeDataTableFilterStorage(value: DataTableFilterStorage): void {
  writeClientStorageJSON(STORAGE_KEY, value)
}
