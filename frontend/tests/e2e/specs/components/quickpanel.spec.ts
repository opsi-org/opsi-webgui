import { test, expect } from '../../fixtures'
import { runUITest } from '../../runner/runUITest'

test.describe('Components', () => {
  test('quickpanel opens and is accessible', async ({ page }) => {
    await runUITest(page, {
      name: 'component-quickpanel',
      route: '/clients',
      waitAfterNav: 4000,
      functional: async (p) => {
        const toggle = p.getByTestId('quickpanel-toggle')
        const panel = p.getByTestId('quickpanel')
        await expect(toggle).toBeVisible({ timeout: 10000 })

        if (!(await panel.isVisible().catch(() => false))) {
          await toggle.click()
        }
        await expect(panel).toBeVisible({ timeout: 5000 })
        await toggle.click()
        await expect(panel).toBeHidden({ timeout: 5000 })
        await toggle.click()
        await expect(panel).toBeVisible({ timeout: 5000 })
      },
      // Content depends on the current selection, so it is not pixel-stable.
      skipVisualRegression: true,
    })
  })
})
