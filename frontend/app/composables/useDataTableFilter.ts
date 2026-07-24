/*
 * This file is part of opsi-webgui application.
 * opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
 * Copyright (c) uib GmbH <info@uib.de> 2026
 * All rights reserved.
 * License: AGPL-3.0
 *
 * useDataTableFilter - Shared persisted filter-query helpers for data tables.
 */

const FILTER_STORAGE_KEY = 'opsi-webgui-datatable-filter-queries'

function getStoredFilters(): Record<string, string> {
	if (import.meta.server) return {}
	try {
		const raw = localStorage.getItem(FILTER_STORAGE_KEY)
		return raw ? JSON.parse(raw) : {}
	} catch {
		return {}
	}
}

export function getStoredDataTableFilter(filterId: string): string {
	const all = getStoredFilters()
	return all[filterId] || ''
}

export function saveStoredDataTableFilter(filterId: string, filterQuery: string) {
	if (import.meta.server) return
	try {
		const all = getStoredFilters()
		all[filterId] = filterQuery
		localStorage.setItem(FILTER_STORAGE_KEY, JSON.stringify(all))
	} catch {
		/* */
	}
}
