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

test.describe('Keyboard shortcuts help modal', () => {
  test('opening keyboard shortcut help modal', async ({ page }) => {
    await runUITest(page, {
      name: 'layout-app-keyboard-shortcut-helper',
      route: '/clients',
      waitAfterNav: 3000,
      skipVisualRegression: true,
      docName: 'opsi-webgui-keyboard-shortcut-helper',
      prepareAfterNavigation: async (p) => {
        await p.keyboard.press('Control+Shift+?')
      },
      functional: async (p) => {
        const modal = p.getByRole('dialog')
        await expect(modal).toBeVisible({ timeout: 10000 })
      },
    })
  })
})
