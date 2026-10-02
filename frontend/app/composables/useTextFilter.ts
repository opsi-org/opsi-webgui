/*
 * This file is part of the OPSI-WebGUI application.
 * OPSI-WebGUI is the web-based management interface for OPSI.
 * https://opsi.org/en/
 *
 * Copyright (c) UIB GmbH info@uib.de 2026
 * All rights reserved.
 * License: AGPL-3.0
 *
 * useTextFilter - Shared text-filter options and matching.
 */

export interface TextFilterOptions {
  matchCase: boolean
  wholeWord: boolean
  regex: boolean
}

export interface TextMatcher {
  /** Null when there is nothing to match against (empty or invalid pattern). */
  test: ((value: string) => boolean) | null
  valid: boolean
}

// Guards against pathological user supplied patterns being evaluated per row.
const MAX_PATTERN_LENGTH = 200

export function createTextFilterOptions(): TextFilterOptions {
  return { matchCase: false, wholeWord: false, regex: false }
}

export function hasTextFilterOptions(options: TextFilterOptions | undefined): boolean {
  return !!options && (options.matchCase || options.wholeWord || options.regex)
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

export function createTextMatcher(query: string, options: TextFilterOptions): TextMatcher {
  const pattern = query.trim().slice(0, MAX_PATTERN_LENGTH)
  if (!pattern) return { test: null, valid: true }

  if (!options.regex && !options.wholeWord) {
    if (options.matchCase) return { test: (value) => value.includes(pattern), valid: true }
    const lower = pattern.toLowerCase()
    return { test: (value) => value.toLowerCase().includes(lower), valid: true }
  }

  const source = options.regex ? pattern : escapeRegExp(pattern)
  const wrapped = options.wholeWord ? `(?<![\\p{L}\\p{N}_])(?:${source})(?![\\p{L}\\p{N}_])` : source
  try {
    const re = new RegExp(wrapped, options.matchCase ? 'u' : 'iu')
    return { test: (value) => re.test(value), valid: true }
  } catch {
    return { test: null, valid: false }
  }
}
