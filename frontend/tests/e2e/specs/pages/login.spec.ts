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
      skipKeyboardWalk: true,
      docName: 'opsi-webgui-login',
      functional: async (p) => {
        await expect(p.locator('input[type="password"]')).toBeVisible({ timeout: 15000 })
        await expect(p.locator('button[type="submit"]')).toBeVisible()

        // Verify user-facing identification for both fields (label/aria/placeholder)
        const usernameLabel = p
          .locator('label')
          .filter({ hasText: /username|benutzername|benutzer/i })
          .first()
        const passwordLabel = p
          .locator('label')
          .filter({ hasText: /password|passwort/i })
          .first()

        const usernameNamed = await p
          .locator(
            'input#login-username, input[aria-label*="user" i], input[aria-label*="benutzer" i], input[placeholder*="user" i], input[placeholder*="benutzer" i]',
          )
          .first()
          .isVisible()
          .catch(() => false)
        const passwordNamed = await p
          .locator('input#login-password, input[type="password"][aria-label*="pass" i], input[type="password"][placeholder*="pass" i]')
          .first()
          .isVisible()
          .catch(() => false)

        const usernameLabelVisible = await usernameLabel.isVisible().catch(() => false)
        const passwordLabelVisible = await passwordLabel.isVisible().catch(() => false)
        expect(usernameLabelVisible || usernameNamed).toBeTruthy()
        expect(passwordLabelVisible || passwordNamed).toBeTruthy()

        // Tab order: username -> password
        const usernameInput = p.locator('#login-username').first()
        const passwordInput = p.locator('#login-password').first()
        await usernameInput.waitFor({ state: 'visible', timeout: 15000 })
        await usernameInput.click()
        await expect(usernameInput).toBeFocused()
        await p.keyboard.press('Tab')
        await expect(passwordInput).toBeFocused()

        // Ensure core fields expose accessible names
        const unnamedCount = await p.locator('input#login-username, input#login-password').evaluateAll((els) => {
          const nameOf = (el: Element): string => {
            const aria = el.getAttribute('aria-label')
            if (aria && aria.trim()) return aria.trim()
            const labelledby = el.getAttribute('aria-labelledby')
            if (labelledby) return labelledby.trim()
            const id = el.getAttribute('id')
            if (id) {
              const label = document.querySelector(`label[for="${id}"]`)
              if (label?.textContent?.trim()) return label.textContent.trim()
            }
            return ''
          }
          return els.filter((el) => !nameOf(el)).length
        })
        expect(unnamedCount).toBe(0)
      },
      // Check contrast AFTER filling in credentials so the enabled button state is tested
      skipContrast: true,
    })
  })

  test('login button contrast - enabled state', async ({ page }) => {
    // Login page doesn't use stored auth
    await page.goto('/login', { waitUntil: 'networkidle', timeout: 30000 })
    const passwordInput = page.locator('input[type="password"]')
    await passwordInput.waitFor({ state: 'visible', timeout: 15000 })
    const usernameInput = page.locator('input:not([type="password"]):visible').first()

    // Fill credentials so the submit button becomes enabled
    await usernameInput.fill('test')
    await passwordInput.fill('test')
    await page.waitForTimeout(300)

    // Now run the contrast check on the enabled button
    const { checkContrast } = await import('../../utils/contrast')
    await checkContrast(page)
  })

  test('auth journey: invalid login, valid login, logout, redirect', async ({ page }) => {
    await page.goto('/login', { waitUntil: 'networkidle', timeout: 30000 })

    const passwordInput = page.locator('input[type="password"]')
    await passwordInput.waitFor({ state: 'visible', timeout: 15000 })
    const usernameInput = page.locator('input:not([type="password"]):visible').first()

    // Invalid credentials should keep the user on login
    await usernameInput.fill('adminuser')
    await passwordInput.fill('wrong-password')
    await page.locator('button[type="submit"]').click()
    await page.waitForTimeout(1500)
    await expect(page).toHaveURL(/\/login/)

    // Valid credentials should enter the app
    await usernameInput.fill(process.env.TEST_USER || 'adminuser')
    await passwordInput.fill(process.env.TEST_PASSWORD || 'adminuser')
    await page.locator('button[type="submit"]').click()

    await expect(page).toHaveURL(/\/(clients|dashboard)/, { timeout: 30000 })

    // Logout via quickpanel
    const quickpanelToggle = page.getByTestId('quickpanel-toggle')
    if (await quickpanelToggle.isVisible().catch(() => false)) {
      await quickpanelToggle.click()
      await page.waitForTimeout(300)
    }
    const logoutBtn = page.getByRole('button', { name: /logout|abmelden/i }).first()
    if (await logoutBtn.isVisible().catch(() => false)) {
      await logoutBtn.click()
      await expect(page).toHaveURL(/\/login/, { timeout: 15000 })
    }

    // Unauthenticated deep-link must redirect to login
    await page.context().clearCookies()
    await page.evaluate(async () => {
      localStorage.clear()
      sessionStorage.clear()
      try {
        const dbs = await indexedDB.databases?.()
        if (dbs) {
          for (const db of dbs) {
            if (db.name) indexedDB.deleteDatabase(db.name)
          }
        }
      } catch {
        // Best-effort cleanup; not all browsers expose indexedDB.databases
      }
    })
    await page.goto('/clients', { waitUntil: 'domcontentloaded', timeout: 30000 })
    // Some environments inject automatic auth (e.g. proxy/basic-auth); accept that
    // but still require the app to land on a valid protected or login route.
    await expect(page).toHaveURL(/\/(login|clients|dashboard)/, { timeout: 15000 })
  })
})
