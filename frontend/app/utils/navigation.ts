/*
 * This file is part of opsi-webgui application.
 * opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
 * Copyright (c) uib GmbH <info@uib.de> 2026
 * All rights reserved.
 * License: AGPL-3.0
 *
 * navigation - Shared navigation constants and helpers.
 */

export const VALID_PAGES = [
  '/dashboard',
  '/clients',
  '/products',
  '/servers',
  '/admin/terminal',
  '/admin/maintenance',
  '/admin/diagnostics',
] as const

export function getDefaultPageFromCookie(fallback = '/clients'): string {
  if (typeof document === 'undefined') return fallback
  const match = document.cookie.match(/(?:^|; )opsi-webgui-default-page=([^;]*)/)
  const stored = match?.[1] ? decodeURIComponent(match[1]) : null
  if (stored && (VALID_PAGES as readonly string[]).includes(stored)) return stored
  return fallback
}
