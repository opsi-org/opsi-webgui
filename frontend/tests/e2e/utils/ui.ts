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

  await toggle.click()
  await page.waitForTimeout(300)
}

export async function applyLocaleCookie(page: Page, target: Locale): Promise<void> {
  const origin = new URL(
    process.env.BASE_URL || 'https://localhost:3000/addons/webgui/app'
  ).origin
  await page.context().addCookies([
    { name: 'opsi-webgui-user-locale', value: target, url: origin },
  ])
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
    // Leave the spinner visible in the shot so the slow load is noticeable.
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
export async function waitForTable(page: Page, timeout = 15000): Promise<void> {
  await page
    .locator('table tbody tr, [class*="table"] [class*="row"]:not([class*="header"])')
    .first()
    .waitFor({ state: 'visible', timeout })
}

/**
 * Get the row count from a data table.
 */
export async function getTableRowCount(page: Page): Promise<number> {
  return page
    .locator('table tbody tr, [class*="table"] [class*="row"]:not([class*="header"])')
    .count()
}
