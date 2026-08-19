/*
 * This file is part of opsi-webgui application.
 * opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
 * Copyright (c) uib GmbH <info@uib.de> 2026
 * All rights reserved.
 * License: AGPL-3.0
 *
 * requestHeaders - Pure helpers for building API request headers (used by the
 * customFetch plugin, extracted for unit testing).
 */

export const urlsWithoutSession = ['/auth/logout', '/user/configuration']

const SESSION_LIFETIME_HEADER = 'X-opsi-session-lifetime'

export function headersToObject(headers: Headers | Record<string, string> | undefined): Record<string, string> {
  if (!headers) return {}
  if (headers instanceof Headers) {
    const obj: Record<string, string> = {}
    headers.forEach((value, key) => {
      obj[key] = value
    })
    return obj
  }
  return headers
}

export function shouldSendSessionHeader(url: string): boolean {
  return !urlsWithoutSession.some((path) => url.includes(path))
}

/**
 * Merge existing request headers with the session-lifetime header.
 *
 * Any pre-existing session-lifetime header is removed case-insensitively
 * first: on retries/interceptor re-entry the headers may already contain a
 * lowercased 'x-opsi-session-lifetime' (Headers normalization). Merging both
 * keys would send a duplicated header value like '1800, 1800', which the
 * server rejects ("Invalid X-opsi-session-lifetime header").
 */
export function mergeRequestHeaders(
  existingHeaders: Record<string, string>,
  url: string,
  sessionExpiry: number | string,
  isFormData: boolean,
): Record<string, string> {
  const merged: Record<string, string> = {}
  for (const [key, value] of Object.entries(existingHeaders)) {
    if (key.toLowerCase() === SESSION_LIFETIME_HEADER.toLowerCase()) continue
    merged[key] = value
  }
  if (shouldSendSessionHeader(url)) {
    merged[SESSION_LIFETIME_HEADER] = String(sessionExpiry)
  }
  merged['Accept'] = 'application/json, text/plain, */*'
  if (!isFormData) {
    merged['Content-Type'] = 'application/json'
  }
  return merged
}
