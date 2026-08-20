/**
 * Global auth setup: logs in once per browser, persists session for all specs.
 */

import { chromium, firefox } from '@playwright/test'
import path from 'node:path'
import fs from 'node:fs'

const TEST_USER = process.env.TEST_USER || 'adminuser'
const TEST_PASSWORD = process.env.TEST_PASSWORD || 'adminuser'
const baseURL = process.env.BASE_URL || 'https://localhost:3000/addons/webgui/app'
const TEST_SESSION_EXPIRY_SEC = Math.max(Number(process.env.TEST_SESSION_EXPIRY_SEC || '10800'), 1800)

export function authFileFor(browserName: 'chromium' | 'firefox'): string {
  return path.resolve(process.cwd(), `test-results/.auth/${browserName}.json`)
}

export const AUTH_FILE = authFileFor('chromium')

async function extendSessionLifetime(page: import('@playwright/test').Page) {
  await page.evaluate(
    async ({ expiry }) => {
      const storageKey = 'opsi-webgui-user'
      const currentRaw = window.localStorage.getItem(storageKey)
      const current = currentRaw ? (JSON.parse(currentRaw) as Record<string, unknown>) : {}

      current.sessionExpiry = expiry
      current.sessionEndTime = new Date(Date.now() + expiry * 1000).toISOString()
      current.usernameUpdated = Date.now()
      window.localStorage.setItem(storageKey, JSON.stringify(current))

      const response = await fetch('/addons/webgui/api/user/configuration', {
        credentials: 'include',
        headers: {
          Accept: 'application/json, text/plain, */*',
          'X-opsi-session-lifetime': String(expiry),
        },
      })

      if (!response.ok) {
        throw new Error(`Failed to extend session lifetime: ${response.status} ${response.statusText}`)
      }
    },
    { expiry: TEST_SESSION_EXPIRY_SEC },
  )
}

async function loginAndStore(browserName: 'chromium' | 'firefox') {
  const browserType = browserName === 'firefox' ? firefox : chromium
  const authFile = authFileFor(browserName)

  const browser = await browserType.launch()
  const context = await browser.newContext({ baseURL, ignoreHTTPSErrors: true })
  const page = await context.newPage()

  await page.goto(`${baseURL.replace(/\/$/, '')}/login`, { waitUntil: 'load', timeout: 30000 })
  await page.waitForTimeout(5000)

  await page.waitForFunction(() => !document.body.textContent?.includes('Loading...'), {
    timeout: 30000,
  })

  const passwordInput = page.locator('input[type="password"]').first()
  await passwordInput.waitFor({ state: 'visible', timeout: 30000 })
  const usernameInput = page
    .locator(
      '#login-username, input[autocomplete="username"], input[aria-label*="user" i], input[placeholder*="user" i], input[placeholder*="benutzer" i]',
    )
    .first()

  await usernameInput.fill(TEST_USER)
  await passwordInput.fill(TEST_PASSWORD)
  await page.locator('button[type="submit"]').click()

  await page.waitForURL((url) => !/\/login(?:\?|$|\/)/.test(`${url.pathname}${url.search}`), {
    timeout: 30000,
  })
  await page.waitForLoadState('domcontentloaded', { timeout: 30000 })
  await page.locator('main').first().waitFor({ state: 'visible', timeout: 30000 })
  await extendSessionLifetime(page)
  await page.waitForTimeout(300)

  await context.storageState({ path: authFile })
  await browser.close()
}

async function authSetup() {
  fs.mkdirSync(path.dirname(AUTH_FILE), { recursive: true })

  await loginAndStore('chromium')

  if (process.env.CI_PIPELINE_SOURCE === 'schedule') {
    await loginAndStore('firefox')
  }
}

export default authSetup
