/**
 * Global auth setup: logs in once, persists session for all specs.
 */

import { chromium } from '@playwright/test'
import path from 'node:path'
import fs from 'node:fs'

const TEST_USER = process.env.TEST_USER || 'adminuser'
const TEST_PASSWORD = process.env.TEST_PASSWORD || 'adminuser'
const baseURL = process.env.BASE_URL || 'https://localhost:3000/addons/webgui/app'

export const AUTH_FILE = path.resolve(process.cwd(), 'test-results/.auth/session.json')

async function authSetup() {
  fs.mkdirSync(path.dirname(AUTH_FILE), { recursive: true })

  const browser = await chromium.launch()
  const context = await browser.newContext({ baseURL, ignoreHTTPSErrors: true })
  const page = await context.newPage()

  await page.goto(`${baseURL.replace(/\/$/, '')}/login`, { waitUntil: 'load', timeout: 30000 })
  await page.waitForTimeout(5000)

  await page.waitForFunction(() => !document.body.textContent?.includes('Loading...'), {
    timeout: 30000,
  })

  const passwordInput = page.locator('input[type="password"]')
  await passwordInput.waitFor({ state: 'visible', timeout: 30000 })
  const usernameInput = page.locator('input:not([type="password"]):visible').first()

  await usernameInput.fill(TEST_USER)
  await passwordInput.fill(TEST_PASSWORD)
  await page.locator('button[type="submit"]').click()

  await page.waitForURL(/\/(clients|dashboard)/, { timeout: 30000 })

  await context.storageState({ path: AUTH_FILE })
  await browser.close()
}

export default authSetup
