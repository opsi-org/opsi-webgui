import { test, expect } from '../../fixtures'
import { runUITest } from '../../runner/runUITest'

test.describe('Dashboard', () => {
  test('dashboard overview', async ({ page }) => {
    await runUITest(page, {
      name: 'dashboard',
      route: '/dashboard',
      waitAfterNav: 5000,
      docName: 'opsi-webgui-dashboard',
      // The dashboard is the single representative dark-mode documentation shot.
      docDarkMode: true,
      // Cropped topbar controls for the documentation (generated via test ids).
      elementShots: [
        { name: 'opsi-webgui-control-theme-toggle', testId: 'theme-toggle' },
        { name: 'opsi-webgui-control-language-dropdown', testId: 'language-dropdown' },
        { name: 'opsi-webgui-control-quickpanel-toggle', testId: 'quickpanel-toggle' },
        {
          name: 'opsi-webgui-control-language-menu',
          before: async (p) => {
            await p.getByTestId('language-dropdown').click()
            await p.waitForTimeout(300)
          },
          captureTestId: 'language-dropdown-menu',
          after: async (p) => {
            await p.keyboard.press('Escape')
          },
        },
      ],
      functional: async (p) => {
        const serverCard = p.locator('.opsi-card').first()
        await expect(serverCard).toBeVisible({ timeout: 10000 })

        await expect(p.getByText(/healthCheck|Health/i).first()).toBeVisible({ timeout: 10000 })

        const statsSection = p.locator('[class*="stat"], [class*="card"]')
        expect(await statsSection.count()).toBeGreaterThan(0)
      },
      vrMask: ['[class*="timestamp"]', '[class*="time"]', '[data-testid*="timer"]'],
    })
  })

  test('dashboard health check navigation', async ({ page }) => {
    await page.goto('/dashboard', { waitUntil: 'networkidle', timeout: 30000 })
    await page.waitForTimeout(3000)

    // Click health check card to navigate to admin diagnostics. The card text
    // is localised (DE "Systemzustand")
    const healthCard = page
      .locator('.opsi-card-hover')
      .filter({ hasText: /health|zustand/i })
      .first()
    if (await healthCard.isVisible().catch(() => false)) {
      await healthCard.click()
      await expect(page).toHaveURL(/\/admin\/diagnostics/i, { timeout: 15000 })
    }
  })
})
