/*
 * This file is part of the OPSI-WebGUI application.
 * OPSI-WebGUI is the web-based management interface for OPSI.
 * https://opsi.org/en/
 *
 * Copyright (c) UIB GmbH info@uib.de 2026
 * All rights reserved.
 * License: AGPL-3.0
 */

/**
 * Messagebus connection + auto-refresh e2e.
 *
 * Runs against the real opsiconfd messagebus: updates a temporary test client
 * through the API and verifies that
 *   - the connection status is displayed in the top bar,
 *   - auto-refresh reloads the clients table when an event arrives,
 *   - with auto-refresh disabled the "changes detected" alert appears
 *     instead.
 */
import { test, expect } from '../../fixtures'
import { randomUUID } from 'node:crypto'
import { openSettings, waitForTable } from '../../utils/ui'

test.describe('Messagebus & auto-refresh', () => {
  test('connection status is shown in the top bar only', async ({ page }, testInfo) => {
    await page.goto('/clients')
    await waitForTable(page)
    const connectionStatus = page.locator('header [aria-label*="Messagebus"]')
    await expect(connectionStatus).toHaveAttribute('aria-label', /Messagebus (connected|verbunden|connecté)$/i, {
      timeout: 20000,
    })
    await connectionStatus.screenshot({ path: testInfo.outputPath('messagebus-topbar-status.png'), animations: 'disabled' })
    const close = await openSettings(page)
    const settings = page.getByTestId('settings-dialog')
    await expect(settings.getByRole('status')).toHaveCount(0)
    await expect(settings.getByRole('alert')).toHaveCount(0)
    await expect(settings).not.toContainText(/opsi-Messagebus/i)
    await close()
  })

  test('external updates respect the refresh preference', async ({ page }) => {
    const clientId = `settings-${randomUUID()}.test.local`
    const endpoint = `/addons/webgui/api/opsidata/clients/${clientId}`
    await page.goto('/clients')
    await waitForTable(page)
    const created = await page.request.post('/addons/webgui/api/opsidata/clients', {
      data: { client: { hostId: clientId, description: 'Settings refresh test' } },
    })
    expect(created.ok(), await created.text()).toBe(true)
    const oldPreference = await page.evaluate(() => localStorage.getItem('opsi-webgui-messagebus'))
    try {
      await page.reload()
      await waitForTable(page)
      let close = await openSettings(page)
      await expect(page.locator('header [aria-label*="Messagebus"]')).toHaveAttribute(
        'aria-label',
        /Messagebus (connected|verbunden|connecté)$/i,
        { timeout: 20000 },
      )
      await page.getByTestId('auto-refresh-checkbox').check()
      await close()
      await Promise.all([
        page.waitForResponse((response) => response.url().includes('/opsidata/clients?') && response.request().method() === 'GET'),
        page.getByTestId('page-refresh-button').click(),
      ])
      await expect(page.getByTestId('page-refresh-button')).toBeEnabled()
      const nextLoad = page.waitForResponse(
        (response) => response.url().includes('/opsidata/clients?') && response.request().method() === 'GET',
      )
      const updated = await page.request.put(endpoint, { data: { hostId: clientId, description: 'Automatic refresh' } })
      expect(updated.ok(), await updated.text()).toBe(true)
      await nextLoad
      await expect(page.getByTestId('page-refresh-button')).toBeEnabled()
      await page.waitForTimeout(2500)
      await expect(page.getByTestId('page-refresh-button')).not.toHaveAccessibleName(/Changes detected|Änderungen erkannt/i)

      close = await openSettings(page)
      await page.getByTestId('auto-refresh-checkbox').uncheck()
      await close()
      let loads = 0
      page.on('request', (request) => {
        if (request.url().includes('/opsidata/clients?') && request.method() === 'GET') loads++
      })
      const manualUpdate = await page.request.put(endpoint, { data: { hostId: clientId, description: 'Manual refresh' } })
      expect(manualUpdate.ok(), await manualUpdate.text()).toBe(true)
      await expect(page.getByTestId('page-refresh-button')).toHaveAccessibleName(/Changes detected|Änderungen erkannt/i, {
        timeout: 10000,
      })
      await page.waitForTimeout(2500)
      expect(loads).toBe(0)
    } finally {
      const deleted = await page.request.delete(endpoint)
      expect(deleted.ok(), await deleted.text()).toBe(true)
      await page.evaluate((stored) => {
        if (stored === null) localStorage.removeItem('opsi-webgui-messagebus')
        else localStorage.setItem('opsi-webgui-messagebus', stored)
      }, oldPreference)
    }
  })
})
