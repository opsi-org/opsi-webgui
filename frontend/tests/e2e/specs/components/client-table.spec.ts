import { test, expect } from '../../fixtures'
import { runUITest } from '../../runner/runUITest'
import { waitForTable, getTableRowCount } from '../../utils/ui'

test.describe('Components', () => {
  test('data table rendering and pagination', async ({ page }) => {
    await runUITest(page, {
      name: 'component-client-table',
      route: '/clients',
      waitAfterNav: 5000,
      functional: async (p) => {
        await waitForTable(p)
        const count = await getTableRowCount(p)
        expect(count).toBeGreaterThan(0)

        const settingsBtn = p.getByTestId('table-settings')
        if (await settingsBtn.isVisible().catch(() => false)) {
          await settingsBtn.click()
          await p.waitForTimeout(500)

          await expect(p.getByRole('dialog')).toBeVisible({ timeout: 5000 })

          await p.keyboard.press('Escape')
          await p.waitForTimeout(300)
        }

        // Column header sorting
        const header = p.locator('thead th').first()
        if (await header.isVisible().catch(() => false)) {
          await header.click()
          await p.waitForTimeout(1000)
          const newCount = await getTableRowCount(p)
          expect(newCount).toBeGreaterThan(0)
        }
      },
      skipVisualRegression: true,
    })
  })
})
