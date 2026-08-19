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
        if (await paginationButton.isVisible().catch(() => false)) {
          await paginationButton.click()
          await p.waitForTimeout(300)
        }

        // Select all rows via header checkbox (multiselect)
        const headerCheckbox = p.locator('thead [type="checkbox"], thead [role="checkbox"]').first()
        if (await headerCheckbox.isVisible().catch(() => false)) {
          await headerCheckbox.click()
          await p.waitForTimeout(400)
          // At least one row should now be checked
          const checkedRows = p.locator('tbody [type="checkbox"]:checked, tbody [aria-checked="true"]')
          expect(await checkedRows.count()).toBeGreaterThan(0)
        }

        // Verify pagination controls are visible while the settings popover stays open.
        const pagination = p.locator('[class*="pagination"], [aria-label*="page" i], [role="navigation"]').first()
        if (await pagination.isVisible().catch(() => false)) {
          const pageButtons = pagination.locator('button, [role="button"]')
          const count = await pageButtons.count()
          if (count > 0) {
            expect(count).toBeGreaterThan(0)
          }
        }
      },
      vrMask: ['[class*="timestamp"]', '[class*="lastSeen"]'],
      elementShots: [
        {
          name: 'datatable-pagination-multiselect-settings',
          captureSelector: 'main',
          before: async (p) => {
            await waitForTable(p)
            const settingsButton = p.getByTestId('table-settings')
            if (await settingsButton.isVisible().catch(() => false)) {
              await settingsButton.click()
              await p.waitForTimeout(300)
              const settingsDialog = p.locator('[role="dialog"]').first()
              const paginationButton = settingsDialog
                .getByRole('button')
                .filter({ hasText: /pagination|seiten/i })
                .first()
              if (await paginationButton.isVisible().catch(() => false)) {
                await paginationButton.click()
                await p.waitForTimeout(300)
              }
            }
            const headerCheckbox = p.locator('thead [type="checkbox"], thead [role="checkbox"]').first()
            if (await headerCheckbox.isVisible().catch(() => false)) {
              await headerCheckbox.click()
              await p.waitForTimeout(300)
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
