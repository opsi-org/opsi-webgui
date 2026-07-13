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

        await p.getByTestId('nav-dashboard').click()
        await expect(p).toHaveURL(/\/dashboard/, { timeout: 10000 })
        await p.getByTestId('nav-clients').click()
        await expect(p).toHaveURL(/\/clients/, { timeout: 10000 })
      },
    })
  })
})
