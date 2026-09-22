/*
 * This file is part of opsi-webgui application.
 * opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
 * Copyright (c) uib GmbH <info@uib.de> 2026
 * All rights reserved.
 * License: AGPL-3.0
 *
 * datatable - Pure helpers for the infinite-scroll data table.
 */

export interface FillCheckInput {
  scrollHeight: number
  clientHeight: number
  hasMore: boolean
  loading: boolean
}

/**
 * No scrollabr on large / high-resolution screens (e.g. 4K)
 */
export function needsMoreToFill(input: FillCheckInput): boolean {
  if (!input.hasMore || input.loading) return false
  return input.scrollHeight <= input.clientHeight + 1
}

/**
 * Detect a stalled infinite scroll: a next-page request finished but did not
 * add any new rows. This happens when the server reports a total larger than
 * the rows it actually returns (e.g. users with restricted depot access) and
 * would otherwise cause an endless page-request loop.
 *
 * @param rowCountAtRequest rows.length recorded when the next-page request
 *   was issued, or -1 if no auto page request is in flight
 * @param rowCountNow current rows.length after loading finished
 */
export function isAutoPageStalled(rowCountAtRequest: number, rowCountNow: number): boolean {
  return rowCountAtRequest >= 0 && rowCountNow <= rowCountAtRequest
}

/**
 * Whether more rows can be loaded via infinite scroll. Returns false when
 * auto-paging is stalled so the loading spinner row is hidden even if the
 * server-reported total exceeds the reachable rows (e.g. restricted depot
 * access).
 */
export function hasMoreInfiniteData(stalled: boolean, rowCount: number, serverTotal: number): boolean {
  return !stalled && rowCount < serverTotal
}

/**
 * Number of pages retained by an infinite table after older pages are discarded.
 *
 * Scrolling back up past the evicted window shows blank rows (the data is gone and
 * nothing re-fetches it), so this trades a bit of memory for a much larger scroll-back
 * range: at the default page size that is still only a few thousand plain row objects,
 * which is negligible next to the DOM savings virtualization already provides.
 */
export const INFINITE_WINDOW_PAGE_COUNT = 20

/**
 * Appends one server page to a bounded in-memory window without copying the
 * previously retained rows. Returns the number of discarded leading rows so
 * callers can retain their absolute virtual-scroll offset.
 */
export function appendInfinitePage<T>(rows: T[], page: T[], perPage: number, getKey?: (row: T) => string): number {
  if (getKey) {
    const existingKeys = new Set(rows.map(getKey))
    rows.push(
      ...page.filter((row) => {
        const key = getKey(row)
        if (existingKeys.has(key)) return false
        existingKeys.add(key)
        return true
      }),
    )
  } else {
    rows.push(...page)
  }
  const maxRows = Math.max(1, perPage) * INFINITE_WINDOW_PAGE_COUNT
  const overflow = Math.max(0, rows.length - maxRows)
  if (overflow > 0) rows.splice(0, overflow)
  return overflow
}

export interface PrefetchCheckInput {
  scrollTop: number
  scrollHeight: number
  clientHeight: number
}

/**
 * Whether the next page should be requested already. The trigger distance
 * grows with the viewport height so the next rows arrive before the user
 * reaches the end of the list.
 */
export function shouldPrefetchNextPage(input: PrefetchCheckInput): boolean {
  const threshold = Math.max(300, input.clientHeight * 0.75)
  return input.scrollTop + input.clientHeight >= input.scrollHeight - threshold
}
