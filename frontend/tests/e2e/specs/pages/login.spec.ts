import { test, expect } from '../../fixtures'
import { runUITest } from '../../runner/runUITest'

test.describe('Login', () => {
  // Login page doesn't use stored auth
  test.use({ storageState: { cookies: [], origins: [] } })

  test('login page', async ({ page }) => {
    await runUITest(page, {
      name: 'login',
      route: '/login',
      waitAfterNav: 2000,
      docName: 'opsi-webgui-login',
      functional: async (p) => {
        await expect(p.locator('input[type="password"]')).toBeVisible({ timeout: 15000 })
        await expect(p.locator('button[type="submit"]')).toBeVisible()
      },
    })
  })

  test('login with valid credentials', async ({ page }) => {
    await page.goto('/login', { waitUntil: 'networkidle', timeout: 30000 })
    await page.waitForFunction(() => !document.body.textContent?.includes('Loading...'), {
      timeout: 30000,
    })

    const passwordInput = page.locator('input[type="password"]')
    await passwordInput.waitFor({ state: 'visible', timeout: 15000 })
    const usernameInput = page.locator('input:not([type="password"]):visible').first()

    await usernameInput.fill(process.env.TEST_USER || 'adminuser')
    await passwordInput.fill(process.env.TEST_PASSWORD || 'adminuser')
    await page.locator('button[type="submit"]').click()

    await expect(page).toHaveURL(/\/(clients|dashboard)/, { timeout: 30000 })
  })

  test('login with invalid credentials stays on login', async ({ page }) => {
    await page.goto('/login', { waitUntil: 'networkidle', timeout: 30000 })

    const passwordInput = page.locator('input[type="password"]')
    await passwordInput.waitFor({ state: 'visible', timeout: 15000 })
    const usernameInput = page.locator('input:not([type="password"]):visible').first()

    await usernameInput.fill('adminuser')
    await passwordInput.fill('wrong-password')
    await page.locator('button[type="submit"]').click()

    await page.waitForTimeout(3000)
    await expect(page).toHaveURL(/\/login/)
  })

  test('unauthenticated user redirects to login', async ({ page }) => {
    await page.context().clearCookies()
    await page.goto('/clients', { waitUntil: 'networkidle', timeout: 30000 })
    await expect(page).toHaveURL(/\/login/, { timeout: 15000 })
  })
})
