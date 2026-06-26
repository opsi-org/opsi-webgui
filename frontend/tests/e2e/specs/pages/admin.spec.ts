import { test, expect } from '../../fixtures'
import { runUITest } from '../../runner/runUITest'

test.describe('Admin', () => {
  test('admin health check', async ({ page }) => {
    await runUITest(page, {
      name: 'admin-health',
      route: '/admin/diagnostics/healthcheck',
      waitAfterNav: 5000,
      docName: 'opsi-webgui-admin-healthcheck',
      functional: async (p) => {
        await expect(
          p.locator('[class*="health"], [class*="check"], [class*="status"]').first()
        ).toBeVisible({ timeout: 15000 })
      },
      vrMask: ['[class*="timestamp"]', '[class*="time"]', '[class*="uptime"]'],
    })
  })

  test('admin terminal', async ({ page }) => {
    await runUITest(page, {
      name: 'admin-terminal',
      route: '/admin/terminal',
      waitAfterNav: 3000,
      docName: 'opsi-webgui-admin-terminal',
      functional: async (p) => {
        const terminal = p.locator('.xterm, [class*="terminal"], [class*="Terminal"]').first()
        await expect(terminal).toBeVisible({ timeout: 10000 })
      },
      a11yExclude: ['.xterm', '[class*="terminal"]'],
      // The xterm.js terminal owns keyboard input (Tab is sent to the shell)
      skipKeyboardWalk: true,
      skipVisualRegression: true,
    })
  })

  test('admin maintenance', async ({ page }) => {
    await runUITest(page, {
      name: 'admin-maintenance',
      route: '/admin/maintenance',
      waitAfterNav: 3000,
      docName: 'opsi-webgui-admin-maintenance',
      functional: async (p) => {
        // Maintenance page content
        await expect(p.locator('main')).toBeVisible()
      },
    })
  })
})
