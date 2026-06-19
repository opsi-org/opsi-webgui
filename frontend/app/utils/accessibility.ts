/*
 * This file is part of opsi-webgui application.
 * opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
 * Copyright (c) uib GmbH <info@uib.de> 2026
 * All rights reserved.
 * License: AGPL-3.0
 *
 * accessibility - Helpers to ensure form controls expose an accessible name.
 */

export function withAccessibleName(attrs: Record<string, unknown>): Record<string, unknown> {
  const hasName = attrs['aria-label'] || attrs['aria-labelledby'] || attrs.id || attrs.title

  if (hasName) return attrs

  const placeholder = attrs.placeholder
  if (typeof placeholder === 'string' && placeholder.trim()) {
    return { ...attrs, 'aria-label': placeholder }
  }

  return attrs
}
