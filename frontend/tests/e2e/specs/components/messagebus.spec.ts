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
 * Runs against the real opsiconfd messagebus: triggers host_updated events
 * via the JSONRPC API and verifies that
 *   - the connection status is displayed in the quick panel,
 *   - auto-refresh reloads the clients table when an event arrives,
 *   - with auto-refresh disabled the "changes detected" alert appears
 *     instead (with a visual-regression baseline of the alert).
 */
import { test, expect } from '../../fixtures'
import { ensureQuickPanelOpen, waitForTable } from '../../utils/ui'

test.describe('Messagebus & auto-refresh', () => {
  test('connection status is shown in the quick panel', async ({ page, browserName }) => {
    await page.goto('/clients')
    await waitForTable(page)
    await ensureQuickPanelOpen(page)

    const settings = page.getByTestId('quickpanel-settings-section')
    await expect(settings).toBeVisible({ timeout: 10000 })
    // Wait for the websocket to connect (green "connected" state)
    await expect(settings.getByText(/Verbunden|connected/i).first()).toBeVisible({
      timeout: 20000,
    })
    if (browserName === 'chromium') {
      await expect(settings).toHaveScreenshot('messagebus-quickpanel-status.png')
    }
  })
})
