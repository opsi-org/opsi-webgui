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
        const settingsShortcut = modal.getByRole('listitem').filter({ has: p.locator('kbd', { hasText: /^,$/ }) })
        await expect(settingsShortcut).toContainText(/Einstellungen|Settings|Paramètres/)
        await p.keyboard.press('Control+,')
        await expect(modal).toBeVisible()
        await expect(p.getByTestId('settings-dialog')).toBeHidden()
      },
    })
  })

  test('opening settings with Control+Comma restores focus', async ({ page }) => {
    await page.goto('/clients')
    await expect(page.getByTestId('settings-toggle')).toHaveAttribute('aria-keyshortcuts', 'Control+,')

    for (const trigger of [page.getByTestId('global-search'), page.locator('main').getByRole('textbox').first()]) {
      await trigger.focus()
      await page.keyboard.press('Control+,')
      await expect(page.getByTestId('settings-dialog')).toBeVisible()
      await expect(page.getByRole('dialog')).toHaveCount(1)

      await page.keyboard.press('Control+,')
      await expect(page.getByRole('dialog')).toHaveCount(1)
      await page.getByTestId('settings-close').click()
      await expect(page.getByTestId('settings-dialog')).toBeHidden()
      await expect(trigger).toBeFocused()
    }
  })
})
