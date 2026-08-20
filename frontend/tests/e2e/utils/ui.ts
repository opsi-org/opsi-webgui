/**
 * UI helpers : theme, locale, animations, table utilities.
 */

import type { Page } from '@playwright/test'
import { expect } from '@playwright/test'

export type Theme = 'light' | 'dark'
export type Locale = 'en' | 'de'

/**
 * Switch the app theme via the theme toggle button.
 */
export async function setTheme(page: Page, target: Theme): Promise<void> {
  const toggle = page.getByTestId('theme-toggle')
  if (!(await toggle.isVisible().catch(() => false))) return

  const current = await toggle.getAttribute('data-theme')
  if (current === target) return

  // Close potentially open overlays/dialogs that can intercept pointer events
  await page.keyboard.press('Escape').catch(() => undefined)
  await page.waitForTimeout(100)

  try {
    await toggle.click({ timeout: 5000 })
  } catch {
    // Last resort: force click when an overlay transition still intercepts events
    await toggle.click({ force: true, timeout: 5000 })
  }
  await page.waitForTimeout(300)
}

export async function applyLocaleCookie(page: Page, target: Locale): Promise<void> {
  const origin = new URL(process.env.BASE_URL || 'https://localhost:3000/addons/webgui/app').origin
  await page.context().addCookies([{ name: 'opsi-webgui-user-locale', value: target, url: origin }])
}

export async function setLocale(page: Page, target: Locale): Promise<void> {
  const dropdown = page.getByTestId('language-dropdown')
  try {
    await dropdown.waitFor({ state: 'visible', timeout: 10000 })
  } catch {
    return
  }

  const labelMatches = async () => (await dropdown.textContent())?.trim().toLowerCase() === target
  if (await labelMatches()) return

  await dropdown.click()
  await page.waitForTimeout(200)
  const option = page.getByTestId(`language-dropdown-item-${target}`)
  await option.waitFor({ state: 'visible', timeout: 5000 })
  await option.click()

  await expect(dropdown).toContainText(new RegExp(target, 'i'), { timeout: 5000 })
  await page.waitForTimeout(300)
}

export async function waitForLoaded(page: Page, timeout = 10000): Promise<void> {
  const spinners = page.locator('.animate-spin')
  try {
    await expect(spinners).toHaveCount(0, { timeout })
  } catch {
    // wait for spinner to disappear, but don't fail if its still there (e.g. reachability check on clients page)
  }

  // Best-effort app shell readiness check (skip login route)
  if (!/\/login(?:\?|$|\/)/.test(page.url())) {
    await page
      .locator('main, #main-content, [data-testid="main-content"]')
      .first()
      .waitFor({ state: 'visible', timeout })
      .catch(() => undefined)
  }

  await page.waitForTimeout(200)
}

/**
 * Disable CSS animations/transitions to stabilize screenshots.
 */
export async function disableAnimations(page: Page): Promise<void> {
  await page.addStyleTag({
    content: `
			*, *::before, *::after {
				animation-duration: 0s !important;
				animation-delay: 0s !important;
				transition-duration: 0s !important;
				transition-delay: 0s !important;
			}
		`,
  })
}

/**
 * Wait for a data table to render at least one row.
 */
export async function waitForTable(page: Page, timeout = 30000): Promise<void> {
  const row = page.locator('table tbody tr, [class*="table"] [class*="row"]:not([class*="header"]), [role="rowgroup"] [role="row"]').first()

  try {
    await row.waitFor({ state: 'visible', timeout })
    return
  } catch (error) {
    const url = page.url()
    if (/\/login(?:\?|$|\/)/.test(url)) {
      const usernameInput = page
        .locator(
          '#login-username, input[autocomplete="username"], input[aria-label*="user" i], input[placeholder*="user" i], input[placeholder*="benutzer" i]',
        )
        .first()
      const passwordInput = page.locator('#login-password, input[type="password"]').first()
      const canLogin = await Promise.all([
        usernameInput
          .waitFor({ state: 'visible', timeout: 8000 })
          .then(() => true)
          .catch(() => false),
        passwordInput
          .waitFor({ state: 'visible', timeout: 8000 })
          .then(() => true)
          .catch(() => false),
      ]).then(([u, p]) => u && p)

      if (canLogin) {
        const testUser = process.env.TEST_USER || 'adminuser'
        const testPassword = process.env.TEST_PASSWORD || 'adminuser'
        await usernameInput.fill(testUser)
        await passwordInput.fill(testPassword)
        await page.locator('button[type="submit"]').first().click()
        await page.waitForURL((current) => !/\/login(?:\?|$|\/)/.test(`${current.pathname}${current.search}`), {
          timeout: 30000,
        })
        await page.waitForLoadState('domcontentloaded', { timeout: 15000 }).catch(() => undefined)
        await row.waitFor({ state: 'visible', timeout: Math.max(timeout, 45000) })
        return
      }

      throw new Error(`waitForTable failed: page is on login route (${url})`)
    }

    const browserName = page.context().browser()?.browserType().name()
    if (browserName === 'firefox') {
      await page.waitForLoadState('domcontentloaded', { timeout: 10000 }).catch(() => undefined)
      await page.waitForTimeout(1200)
      await page.reload({ waitUntil: 'domcontentloaded', timeout: 30000 }).catch(() => undefined)
      await page.waitForTimeout(1200)
      await row.waitFor({ state: 'visible', timeout: Math.max(timeout, 45000) })
      return
    }

    throw error
  }
}

/**
 * Get the row count from a data table.
 */
export async function getTableRowCount(page: Page): Promise<number> {
  return page.locator('table tbody tr, [class*="table"] [class*="row"]:not([class*="header"]), [role="rowgroup"] [role="row"]').count()
}
