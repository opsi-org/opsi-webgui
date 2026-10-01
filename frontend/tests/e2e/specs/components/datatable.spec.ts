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
import { waitForTable, getTableRowCount } from '../../utils/ui'

/**
 * Component-level specs for the shared AppDataTable.
 * Uses the clients page (large dataset) so pagination and multiselect
 * are fully exercised and visible in screenshots.
 */
test.describe('DataTable - component', () => {
  test('datatable pagination, multiselect, and settings popover', async ({ page }) => {
    await runUITest(page, {
      name: 'datatable-overview',
      route: '/clients',
      waitAfterNav: 5000,
      functional: async (p) => {
        await waitForTable(p)
        const count = await getTableRowCount(p)
        expect(count).toBeGreaterThan(0)

        const settingsButton = p.getByTestId('table-settings')
        await settingsButton.waitFor({ state: 'visible', timeout: 10000 })
        await settingsButton.click()
        await p.waitForTimeout(300)

        const settingsDialog = p.locator('[role="dialog"]').first()
        await expect(settingsDialog).toBeVisible({ timeout: 5000 })

        const paginationButton = settingsDialog
          .getByRole('button')
          .filter({ hasText: /pagination|seiten/i })
          .first()
        await expect(paginationButton).toBeVisible()
        await paginationButton.click()
        await p.waitForTimeout(300)

        // Select all rows via header checkbox (multiselect)
        const headerCheckbox = p.locator('thead [type="checkbox"], thead [role="checkbox"]').first()
        await expect(headerCheckbox).toBeVisible()
        await headerCheckbox.click()
        await p.waitForTimeout(400)
        // At least one row should now be checked
        const checkedRows = p.locator('tbody [type="checkbox"]:checked, tbody [aria-checked="true"]')
        await expect(checkedRows.first()).toBeVisible()

        // Verify pagination controls are visible while the settings popover stays open.
        const paginationControls = p.locator(
          'main button[aria-label*="page" i], main button[aria-label*="next" i], main button[aria-label*="previous" i]',
        )
        const pageSummary = p.getByText(/showing|zeige|affichage/i).first()
        await expect(pageSummary).toBeVisible()
        if ((await getTableRowCount(p)) > 20) {
          await expect(paginationControls.first()).toBeVisible()
        }
      },
      vrMask: ['[class*="timestamp"]', '[class*="lastSeen"]'],
    })
  })
})
