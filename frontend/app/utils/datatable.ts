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
export function hasMoreInfiniteData(
  stalled: boolean,
  rowCount: number,
  serverTotal: number
): boolean {
  return !stalled && rowCount < serverTotal
}
