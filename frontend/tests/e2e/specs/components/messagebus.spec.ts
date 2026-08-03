/**
 * Messagebus connection + auto-refresh e2e.
 *
 * Runs against the real opsiconfd messagebus: triggers host_updated events
 * via the JSONRPC API and verifies that
 *   - the connection status is displayed in the quick panel,
 *   - auto-refresh reloads the clients table when an event arrives,
 *   - with auto-refresh disabled the "changes detected" alert appears
 *     instead (with a visual-regression baseline of the alert).
 */
import { test, expect } from '../../fixtures'
import { waitForTable } from '../../utils/ui'
import type { Page } from '@playwright/test'

const TEST_USER = process.env.TEST_USER || 'adminuser'
const TEST_PASSWORD = process.env.TEST_PASSWORD || 'adminuser'

function opsiconfdOrigin(): string {
  if (process.env.OPSICONFD_URL) return process.env.OPSICONFD_URL.replace(/\/$/, '')
  const base = process.env.BASE_URL || 'https://localhost:3000/addons/webgui/app'
  const url = new URL(base)
  // In live-dev mode the SPA runs on :3000 but opsiconfd (rpc + messagebus)
  // listens on :4447.
  if (url.port === '3000') url.port = '4447'
  return url.origin
}

async function rpc(page: Page, method: string, params: unknown[]): Promise<unknown> {
  const response = await page.request.post(`${opsiconfdOrigin()}/rpc`, {
    data: { id: 1, method, params },
    headers: {
      Authorization: `Basic ${Buffer.from(`${TEST_USER}:${TEST_PASSWORD}`).toString('base64')}`,
    },
    ignoreHTTPSErrors: true,
  })
  expect(response.ok(), `RPC ${method} failed: ${response.status()}`).toBeTruthy()
  const body = (await response.json()) as { result?: unknown; error?: unknown }
  expect(body.error, `RPC ${method} error: ${JSON.stringify(body.error)}`).toBeFalsy()
  return body.result
}

async function ensureQuickPanelOpen(page: Page): Promise<void> {
  const toggle = page.getByTestId('quickpanel-toggle')
  const panel = page.getByTestId('quickpanel')
  if (await toggle.isVisible().catch(() => false)) {
    if (!(await panel.isVisible().catch(() => false))) {
      await toggle.click()
      await page.waitForTimeout(400)
    }
  }
}

async function setAutoRefresh(page: Page, enabled: boolean): Promise<void> {
  await ensureQuickPanelOpen(page)
  const checkbox = page
    .getByTestId('quickpanel')
    .locator(
      '[role="checkbox"][aria-label*="Auto-Refresh" i], [role="checkbox"][aria-label*="auto" i]'
    )
    .first()
  await checkbox.waitFor({ state: 'visible', timeout: 10000 })
  const checked = (await checkbox.getAttribute('aria-checked')) === 'true'
  if (checked !== enabled) {
    await checkbox.click()
    await page.waitForTimeout(300)
  }
}

async function firstClientId(page: Page): Promise<string> {
  await waitForTable(page)
  const cell = page.locator('table tbody tr').first().locator('td').nth(1)
  const text = (await cell.innerText()).trim()
  expect(text, 'could not read a client id from the clients table').toBeTruthy()
  return text.split('\n')[0]!.trim()
}

test.describe('Messagebus & auto-refresh', () => {
  test('connection status is shown in the quick panel', async ({ page }) => {
    await page.goto('/clients')
    await waitForTable(page)
    await ensureQuickPanelOpen(page)

    const settings = page.getByTestId('quickpanel-settings-section')
    await expect(settings).toBeVisible({ timeout: 10000 })
    // Wait for the websocket to connect (green "connected" state)
    await expect(settings.getByText(/Verbunden|connected/i).first()).toBeVisible({
      timeout: 20000,
    })
    await expect(settings).toHaveScreenshot('messagebus-quickpanel-status.png')
  })

  test('auto-refresh reloads the clients table on host_updated events', async ({ page }) => {
    await page.goto('/clients')
    const clientId = await firstClientId(page)
    await setAutoRefresh(page, true)

    const hosts = (await rpc(page, 'host_getObjects', [[], { id: clientId }])) as Array<{
      id: string
      type: string
      description?: string
    }>
    expect(hosts.length).toBeGreaterThan(0)
    const originalDescription = hosts[0]!.description ?? ''
    const marker = `e2e auto-refresh ${Date.now()}`

    try {
      await rpc(page, 'host_updateObject', [
        { id: clientId, type: 'OpsiClient', description: marker },
      ])

      // messagebus event -> matched -> debounced (2s) refresh -> new data rendered
      await expect(page.getByText(marker).first()).toBeVisible({ timeout: 30000 })
    } finally {
      await rpc(page, 'host_updateObject', [
        { id: clientId, type: 'OpsiClient', description: originalDescription },
      ]).catch(() => undefined)
    }
  })

  test('changes-detected alert appears when auto-refresh is disabled', async ({ page }) => {
    await page.goto('/clients')
    const clientId = await firstClientId(page)
    await setAutoRefresh(page, false)

    const hosts = (await rpc(page, 'host_getObjects', [[], { id: clientId }])) as Array<{
      description?: string
    }>
    const originalDescription = hosts[0]?.description ?? ''
    const marker = `e2e changes-detected ${Date.now()}`

    try {
      await rpc(page, 'host_updateObject', [
        { id: clientId, type: 'OpsiClient', description: marker },
      ])

      // The page toolbar shows a single "changes detected" refresh button
      // instead of reloading automatically (no duplicated global alert).
      const changesButton = page
        .locator('main button')
        .filter({ hasText: /Änderungen erkannt|Changes detected/i })
        .first()
      await expect(changesButton).toBeVisible({ timeout: 20000 })

      // Table must NOT have refreshed automatically
      await expect(page.locator('main table').getByText(marker)).toHaveCount(0)

      // Visual baseline of the changes-detected button
      await expect(changesButton).toHaveScreenshot('messagebus-changes-alert.png')

      // Clicking it refreshes the table in place -> marker visible
      await changesButton.click()
      await waitForTable(page)
      await expect(page.getByText(marker).first()).toBeVisible({ timeout: 30000 })
      await expect(changesButton).toBeHidden()
    } finally {
      await setAutoRefresh(page, true).catch(() => undefined)
      await rpc(page, 'host_updateObject', [
        { id: clientId, type: 'OpsiClient', description: originalDescription },
      ]).catch(() => undefined)
    }
  })
})
