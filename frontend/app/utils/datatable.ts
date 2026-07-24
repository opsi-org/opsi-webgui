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
