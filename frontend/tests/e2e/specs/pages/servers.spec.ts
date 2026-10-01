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
import { ensureQuickPanelOpen, waitForTable, getTableRowCount } from '../../utils/ui'

test.describe('Servers', () => {
  test('servers overview with quickpanel', async ({ page }) => {
    await runUITest(page, {
      name: 'servers',
      route: '/servers',
      waitAfterNav: 3000,
      docName: 'opsi-webgui-servers-overview',
      functional: async (p) => {
        await waitForTable(p)
        const count = await getTableRowCount(p)
        expect(count).toBeGreaterThan(0)

        // Select first server row so it shows in quickpanel overview
        const firstRow = p.locator('table tbody tr').first()
        if (await firstRow.isVisible().catch(() => false)) {
          await firstRow.click()
          await p.waitForTimeout(500)
        }

        await ensureQuickPanelOpen(p)
      },
    })
  })

  test('servers configuration', async ({ page }) => {
    await runUITest(page, {
      name: 'servers-config',
      route: '/servers/configuration',
      waitAfterNav: 3000,
      docName: 'opsi-webgui-servers-configuration',
      functional: async (p) => {
        // Config tabs should be present and switchable
        const tabs = p.getByRole('tab')
        if (
          await tabs
            .first()
            .isVisible()
            .catch(() => false)
        ) {
          const tabCount = await tabs.count()
          expect(tabCount).toBeGreaterThan(0)

          // Click second tab if available
          if (tabCount > 1) {
            await tabs.nth(1).click()
            await p.waitForTimeout(1000)
          }
        }
      },
      elementShots: [
        {
          name: 'opsi-webgui-server-create-configuration-button',
          captureSelector:
            'button:has-text("Neu"), button:has-text("New"), button:has-text("Hinzufügen"), button:has-text("Add"), button:has-text("Create")',
        },
        // New-config / add-config dialog
        {
          name: 'opsi-webgui-servers-new-config-dialog',
          captureSelector: '[role="dialog"]',
          before: async (p) => {
            const addBtn = p
              .locator(
                'button:has-text("Neu"), button:has-text("New"), button:has-text("Hinzufügen"), ' +
                  'button:has-text("Add"), button:has-text("Create"), ' +
                  '[aria-label*="add" i], [aria-label*="create" i], [aria-label*="neu" i]',
              )
              .first()
            if (await addBtn.isVisible().catch(() => false)) {
              await addBtn.click()
              await p.waitForTimeout(800)
            }
          },
          after: async (p) => {
            await p.keyboard.press('Escape')
            await p.waitForTimeout(200)
          },
        },
      ],
    })
  })
})
