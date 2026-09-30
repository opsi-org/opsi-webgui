/*
 * This file is part of the OPSI-WebGUI application.
 * OPSI-WebGUI is the web-based management interface for OPSI.
 * https://opsi.org/en/
 *
 * Copyright (c) UIB GmbH info@uib.de 2026
 * All rights reserved.
 * License: AGPL-3.0
 */

import { test, expect } from '../../fixtures'
import { runUITest } from '../../runner/runUITest'

test.describe('Support', () => {
  test('support page', async ({ page }) => {
    await runUITest(page, {
      name: 'support',
      route: '/support',
      waitAfterNav: 2000,
      docName: 'opsi-webgui-support',
      functional: async (p) => {
        // Support/WhatsNew content visible inside the main landmark
        await expect(p.locator('main')).toBeVisible()
        // Should have some informational content
        const content = p.locator('h1, h2, h3, [class*="card"], [class*="info"]')
        expect(await content.count()).toBeGreaterThan(0)
      },
    })
  })
})
