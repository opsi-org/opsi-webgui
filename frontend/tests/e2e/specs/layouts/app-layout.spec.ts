import { test, expect } from '../../fixtures'
import { runUITest } from '../../runner/runUITest'

test.describe('Layouts', () => {
  test('app layout sidebar navigation', async ({ page }) => {
    await runUITest(page, {
      name: 'layout-app',
      route: '/clients',
      waitAfterNav: 3000,
      // Visual regression would duplicate the clients.png baseline (same route);
      // this test only verifies the sidebar/layout chrome functionally.
      skipVisualRegression: true,
      functional: async (p) => {
        const sidebar = p.getByRole('navigation').first()
        await expect(sidebar).toBeVisible({ timeout: 10000 })
        await expect(p.getByTestId('nav-dashboard')).toBeVisible()
        await expect(p.getByTestId('nav-clients')).toBeVisible()
      },
    })
  })

  test('sidebar link navigates to the target route', async ({ page }) => {
    await page.goto('/clients', { waitUntil: 'load', timeout: 30000 })
    await page.waitForTimeout(2000)

    await page.getByTestId('nav-dashboard').click()
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 10000 })

    await page.getByTestId('nav-clients').click()
    await expect(page).toHaveURL(/\/clients/, { timeout: 10000 })
  })
})
