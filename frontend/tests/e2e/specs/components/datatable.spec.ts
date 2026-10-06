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
import { waitForTable } from '../../utils/ui'

/**
 * Component-level specs for the shared AppDataTable.
 * Uses the clients page (large dataset) to exercise multiselect and table settings.
 */
test.describe('DataTable - component', () => {
  test('datatable multiselect and settings popover', async ({ page }) => {
    await runUITest(page, {
      name: 'datatable-overview',
      route: '/clients',
      waitAfterNav: 5000,
      functional: async (p) => {
        await waitForTable(p)

        const settingsButton = p.getByTestId('table-settings')
        await settingsButton.waitFor({ state: 'visible', timeout: 10000 })
        await settingsButton.click()
        await p.waitForTimeout(300)

        const settingsDialog = p.locator('[role="dialog"]').first()
        await expect(settingsDialog).toBeVisible({ timeout: 5000 })

        // Select all rows via header checkbox (multiselect)
        const headerCheckbox = p.locator('thead [type="checkbox"], thead [role="checkbox"]').first()
        await expect(headerCheckbox).toBeVisible()
        await headerCheckbox.click()
        await p.waitForTimeout(400)
        // At least one row should now be checked
        const checkedRows = p.locator('tbody [type="checkbox"]:checked, tbody [aria-checked="true"]')
        await expect(checkedRows.first()).toBeVisible()
      },
      vrMask: ['[class*="timestamp"]', '[class*="lastSeen"]'],
    })
  })
})
