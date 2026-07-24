import { beforeEach, describe, expect, it } from 'vitest'
import {
	getStoredDataTableFilter,
	saveStoredDataTableFilter,
} from '~/app/composables/useDataTableFilter'

const STORAGE_KEY = 'opsi-webgui-datatable-filter-queries'

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
		; (globalThis as { localStorage?: Storage }).localStorage = storage
	return storage
}

describe('useDataTableFilter helpers', () => {
	beforeEach(() => {
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
		expect(stored.clients).toBe('abc')
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
