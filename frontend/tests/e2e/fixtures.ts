/**
 * Playwright test fixtures for opsi-webgui e2e.
 */
import { test as base, expect } from '@playwright/test'
import type { Page } from '@playwright/test'

export const APP_BASE = '/addons/webgui/app'

export const test = base.extend<{ page: Page }>({
  page: async ({ page }, use) => {
    const originalGoto = page.goto.bind(page)
    page.goto = ((url: string, options?: Parameters<typeof originalGoto>[1]) => {
      let target = url
      if (typeof url === 'string' && url.startsWith('/') && !url.startsWith(APP_BASE)) {
        target = `${APP_BASE}${url}`
      }
      return originalGoto(target, options)
    }) as typeof page.goto
    await use(page)
  },
})

export { expect }
