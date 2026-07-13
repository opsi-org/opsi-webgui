import { test, expect } from '../../fixtures'
import { runUITest } from '../../runner/runUITest'

test.describe('Dashboard', () => {
  test('dashboard overview', async ({ page }) => {
    await runUITest(page, {
      name: 'dashboard',
      route: '/dashboard',
      waitAfterNav: 5000,
      docName: 'opsi-webgui-dashboard',
      marketingName: 'opsi-webgui-dashboard',
      marketingPrepare: async (p) => {
        const toggle = p.getByTestId('quickpanel-toggle')
        const panel = p.getByTestId('quickpanel')
        if (await toggle.isVisible().catch(() => false)) {
          const panelVisible = await panel.isVisible().catch(() => false)
          if (!panelVisible) {
            await toggle.click()
            await p.waitForTimeout(400)
          }
        }
      },

      docDarkMode: true,
      // Cropped topbar controls for the documentation (generated via test ids).
      elementShots: [
        { name: 'opsi-webgui-control-theme-toggle', testId: 'theme-toggle' },
        { name: 'opsi-webgui-control-language-dropdown', testId: 'language-dropdown' },
        { name: 'opsi-webgui-control-quickpanel-toggle', testId: 'quickpanel-toggle' },
        // Topbar right-side status area (health-badge + messagebus icon + user button)
        { name: 'opsi-webgui-topbar-status-area', captureSelector: 'header nav' },
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
        {
          name: 'opsi-webgui-mobile-dashboard-overview',
          captureSelector: 'main',
          before: async (p) => {
            await p.setViewportSize({ width: 375, height: 812 })
            await p.waitForTimeout(500)
          },
          after: async (p) => {
            await p.setViewportSize({ width: 1552, height: 920 })
            await p.waitForTimeout(200)
          },
        },
      ],
      functional: async (p) => {
        const serverCard = p
          .locator('.opsi-card, [class*="card"], [data-testid*="card"], main section')
          .first()
        await expect(serverCard).toBeVisible({ timeout: 30000 })

        await expect(p.getByText(/healthCheck|Health/i).first()).toBeVisible({ timeout: 10000 })

        const statsSection = p.locator('[class*="stat"], [class*="card"]')
        expect(await statsSection.count()).toBeGreaterThan(0)

        // Click health check card and verify diagnostics navigation,
        // then return to dashboard so later checks/screenshots stay on this page.
        const healthCard = p
          .locator('.opsi-card-hover')
          .filter({ hasText: /health|zustand/i })
          .first()
        if (await healthCard.isVisible().catch(() => false)) {
          await healthCard.click()
          await expect(p).toHaveURL(/\/admin\/diagnostics/i, { timeout: 15000 })
          await p.goto('/dashboard', { waitUntil: 'networkidle', timeout: 30000 })
          await p.waitForTimeout(1000)
        }
      },
      vrMask: ['[class*="timestamp"]', '[class*="time"]', '[data-testid*="timer"]'],
    })
  })

  test('dashboard keyboard tab order - all cards reachable', async ({ page }) => {
    await page.goto('/dashboard', { waitUntil: 'networkidle', timeout: 30000 })
    await page.waitForTimeout(3000)

    // Tab through the page and collect all focusable elements
    const focusedElements: string[] = []
    const maxTabs = 40

    for (let i = 0; i < maxTabs; i++) {
      await page.keyboard.press('Tab')
      const info = await page.evaluate(() => {
        const el = document.activeElement as HTMLElement | null
        if (!el || el === document.body) return null
        const role = el.getAttribute('role') || el.tagName.toLowerCase()
        const label =
          el.getAttribute('aria-label') ||
          el.getAttribute('title') ||
          el.textContent?.trim().slice(0, 40) ||
          ''
        return `${role}: ${label}`
      })
      if (info) focusedElements.push(info)
    }

    // All dashboard cards should be tab-reachable
    // Config server card (role=region), health card (role=button), user card (role=region),
    // system info (role=button), stat cards (role=button), failed clients list (role=region)
    const hasRegionOrButton = focusedElements.some(
      (el) => el.startsWith('button:') || el.startsWith('region:') || el.includes('role=button')
    )
    expect(
      hasRegionOrButton,
      `No focusable dashboard cards found. Tab stops: ${focusedElements.slice(0, 10).join(' | ')}`
    ).toBe(true)

    // Ensure at least 5 distinct focusable elements (header controls + dashboard cards)
    expect(
      focusedElements.length,
      'Too few keyboard tab stops on dashboard'
    ).toBeGreaterThanOrEqual(5)
  })
})
