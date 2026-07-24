/**
 * Playwright test fixtures for opsi-webgui e2e.
 */
import { test as base, expect } from '@playwright/test'
import type { Page } from '@playwright/test'

export const APP_BASE = '/addons/webgui/app'

export const test = base.extend<{ page: Page }>({
  page: async ({ page }, use, testInfo) => {
    const originalGoto = page.goto.bind(page)
    const isFirefox = testInfo.project.name.includes('firefox')
    const testUser = process.env.TEST_USER || 'adminuser'
    const testPassword = process.env.TEST_PASSWORD || 'adminuser'
    const disableAutoAuth =
      testInfo.file.endsWith('/tests/e2e/specs/pages/login.spec.ts') ||
      testInfo.project.name.includes('login')

    const isLoginUrl = (url: string) => /\/login(?:\?|$|\/)/.test(url)

    const ensureAuthenticated = async (target: string): Promise<void> => {
      if (target.includes('/login')) return
      const url = page.url()
      if (!isLoginUrl(url)) return

      const usernameInput = page
        .locator(
          '#login-username, input[autocomplete="username"], input[aria-label*="user" i], input[placeholder*="user" i], input[placeholder*="benutzer" i]'
        )
        .first()
      const passwordInput = page.locator('#login-password, input[type="password"]').first()

      const userVisible = await usernameInput
        .waitFor({ state: 'visible', timeout: 10000 })
        .then(() => true)
        .catch(() => false)
      const passVisible = await passwordInput
        .waitFor({ state: 'visible', timeout: 10000 })
        .then(() => true)
        .catch(() => false)
      if (!userVisible || !passVisible) return

      await usernameInput.fill(testUser)
      await passwordInput.fill(testPassword)
      await page.locator('button[type="submit"]').first().click()
      await page.waitForURL((current) => !isLoginUrl(`${current.pathname}${current.search}`), {
        timeout: 30000,
      })
    }

    page.goto = ((url: string, options?: Parameters<typeof originalGoto>[1]) => {
      let target = url
      if (typeof url === 'string' && url.startsWith('/') && !url.startsWith(APP_BASE)) {
        target = `${APP_BASE}${url}`
      }

      const gotoWithRetry = async () => {
        const maxAttempts = isFirefox ? 2 : 1
        let lastError: unknown
        for (let attempt = 1; attempt <= maxAttempts; attempt++) {
          try {
            return await originalGoto(target, options)
          } catch (error) {
            lastError = error
            const msg = String(error)
            const retryable =
              isFirefox &&
              /(NS_BINDING_ABORTED|frame was detached|Navigation interrupted)/i.test(msg)
            if (!retryable || attempt >= maxAttempts) throw error
            await page.waitForTimeout(400)
          }
        }
        throw lastError
      }

      return gotoWithRetry().then(async (res) => {
        if (!disableAutoAuth) {
          await ensureAuthenticated(target)
          if (isFirefox && isLoginUrl(page.url())) {
            await page
              .reload({ waitUntil: 'domcontentloaded', timeout: 30000 })
              .catch(() => undefined)
            await ensureAuthenticated(target)
          }
        }
        return res
      })
    }) as typeof page.goto
    await use(page)
  },
})

export { expect }
