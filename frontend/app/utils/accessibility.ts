/*
 * This file is part of the OPSI-WebGUI application.
 * OPSI-WebGUI is the web-based management interface for OPSI.
 * https://opsi.org/en/
 *
 * Copyright (c) UIB GmbH info@uib.de 2026
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
