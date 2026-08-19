import { test, expect } from '../../fixtures'
import { runUITest } from '../../runner/runUITest'
import { waitForTable, getTableRowCount } from '../../utils/ui'

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

        // Open quickpanel
        const toggle = p.getByTestId('quickpanel-toggle')
        const panel = p.getByTestId('quickpanel')
        if (await toggle.isVisible().catch(() => false)) {
          if (!(await panel.isVisible().catch(() => false))) {
            await toggle.click()
            await p.waitForTimeout(400)
          }
        }
      },
      elementShots: [
        // Quickpanel servers tab with a server selected
        {
          name: 'opsi-webgui-quickpanel-server-selection-tab',
          captureTestId: 'quickpanel-tab-content',
          before: async (p) => {
            const panel = p.getByTestId('quickpanel')
            const tab = panel
              .getByRole('tab')
              .filter({ hasText: /server/i })
              .first()
            if (await tab.isVisible().catch(() => false)) {
              await tab.click()
              await p.waitForTimeout(300)
            }
          },
        },
        // Quickpanel overview tab showing the selected server
        {
          name: 'opsi-webgui-quickpanel-overview-with-server',
          captureTestId: 'quickpanel-tab-content',
          before: async (p) => {
            const panel = p.getByTestId('quickpanel')
            const tab = panel
              .getByRole('tab')
              .filter({ hasText: /overview|übersicht/i })
              .first()
            if (await tab.isVisible().catch(() => false)) {
              await tab.click()
              await p.waitForTimeout(300)
            }
          },
        },
      ],
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
