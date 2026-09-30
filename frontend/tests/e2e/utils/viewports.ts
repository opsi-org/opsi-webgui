/*
 * This file is part of the OPSI-WebGUI application.
 * OPSI-WebGUI is the web-based management interface for OPSI.
 * https://opsi.org/en/
 *
 * Copyright (c) UIB GmbH info@uib.de 2026
 * All rights reserved.
 * License: AGPL-3.0
 */

/**
 * Standard viewport definitions for E2E tests.
 */

export const viewports = {
  desktop: { width: 1552, height: 920 },
  marketing: { width: 1920, height: 1080 },
  mobile: { width: 375, height: 812 },
} as const

export type ViewportName = keyof typeof viewports
