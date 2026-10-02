/*
 * This file is part of the OPSI-WebGUI application.
 * OPSI-WebGUI is the web-based management interface for OPSI.
 * https://opsi.org/en/
 *
 * Copyright (c) UIB GmbH info@uib.de 2026
 * All rights reserved.
 * License: AGPL-3.0
 */

import { test, expect } from '../../fixtures'
import { runUITest } from '../../runner/runUITest'
import { ensureQuickPanelOpen, waitForTable } from '../../utils/ui'
import type { Page } from '@playwright/test'

/** Quick-panel visual/a11y coverage and client/product quick-action checks. */

async function openQuickPanelTab(page: Page, tabText: RegExp): Promise<void> {
  await ensureQuickPanelOpen(page)
  const tab = page.getByTestId('quickpanel').getByRole('tab').filter({ hasText: tabText }).first()
  await expect(tab).toBeVisible()
  await tab.click()
  await expect(tab).toHaveAttribute('data-state', 'active')
}

async function selectFirstClientForQuickActions(page: Page): Promise<void> {
  await waitForTable(page)
  const firstRow = page.locator('table tbody tr').first()
  await expect(firstRow).toBeVisible({ timeout: 10000 })

  const checkbox = firstRow.locator('[role="checkbox"], input[type="checkbox"]').first()
  if (await checkbox.isVisible().catch(() => false)) {
    const ariaChecked = (await checkbox.getAttribute('aria-checked')) === 'true'
    const nativeChecked = await checkbox.isChecked().catch(() => false)
    if (!ariaChecked && !nativeChecked) {
      await checkbox.click()
      await page.waitForTimeout(500)
    }
  } else {
    await firstRow.click()
    await page.waitForTimeout(500)
  }
}

async function prepareClientQuickActions(page: Page): Promise<void> {
  await selectFirstClientForQuickActions(page)
  await openQuickPanelTab(page, /overview|übersicht|dashboard/i)
}

async function openClientQuickActionsMenu(page: Page) {
  await prepareClientQuickActions(page)
  const trigger = page.getByTestId('quickpanel-client-actions').locator('button').first()
  await expect(trigger).toBeVisible({ timeout: 10000 })
  await expect(trigger).toBeEnabled({ timeout: 10000 })
  const menuItems = page.getByRole('option')
  if (
    !(await menuItems
      .first()
      .isVisible()
      .catch(() => false))
  ) {
    await trigger.click()
  }
  await expect(menuItems.first()).toBeVisible({ timeout: 10000 })
  return menuItems
}

async function openClientQuickActionDialog(page: Page, actionName: RegExp): Promise<void> {
  const menuItems = await openClientQuickActionsMenu(page)
  const action = menuItems.filter({ hasText: actionName }).first()
  await expect(action).toBeVisible({ timeout: 10000 })
  await action.click()
  await page.waitForTimeout(400)
  await expect(page.locator('[role="dialog"]').first()).toBeVisible({ timeout: 5000 })
}

function clientQuickActionDialogShot(name: string, actionName: RegExp) {
  return {
    name,
    captureSelector: '[role="dialog"]',
    before: async (page: Page) => openClientQuickActionDialog(page, actionName),
    after: async (page: Page) => {
      await page.keyboard.press('Escape')
      await page.waitForTimeout(200)
    },
  }
}

async function mockClientActionResponse(page: Page): Promise<void> {
  await page.unroute('**/opsidata/clients/action')
  await page.route('**/opsidata/clients/action', async (route) => {
    const payload = route.request().postDataJSON() as { demoMode?: boolean } | null
    const body = payload?.demoMode
      ? {
          'test-client-01.example.test': [
            {
              productId: 'opsi-client-agent',
              productVersion: '4.3.0.0',
              packageVersion: '1',
              installationStatus: 'installed',
              actionRequest: 'setup',
            },
          ],
        }
      : {}
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(body),
    })
  })
}

async function openProductQuickActions(page: Page, preview = false): Promise<void> {
  await page.keyboard.press('Escape').catch(() => undefined)
  await selectFirstClientForQuickActions(page)
  await ensureQuickPanelOpen(page)

  const trigger = page.getByTestId('quickpanel-product-actions').locator('button').first()
  await expect(trigger).toBeVisible({ timeout: 10000 })
  await expect(trigger).toBeEnabled({ timeout: 10000 })
  await trigger.click()
  await expect(page.locator('[role="dialog"]').first()).toBeVisible({ timeout: 5000 })
  if (!preview) return

  const statusCombo = page.getByLabel(/installationsstatus|installation status/i).first()
  if (await statusCombo.isVisible().catch(() => false)) {
    await statusCombo.click()
    const installedOption = page
      .getByRole('option')
      .filter({ hasText: /installed/i })
      .first()
    if (await installedOption.isVisible().catch(() => false)) {
      await installedOption.click()
    } else {
      await page.keyboard.press('ArrowDown')
      await page.keyboard.press('Enter')
    }
  }

  const actionCombo = page.getByLabel(/aktionsanforderung|action request/i).first()
  if (await actionCombo.isVisible().catch(() => false)) {
    await actionCombo.click()
    const setupOption = page
      .getByRole('option')
      .filter({ hasText: /setup|always|once/i })
      .first()
    if (await setupOption.isVisible().catch(() => false)) {
      await setupOption.click()
    } else {
      await page.keyboard.press('ArrowDown')
      await page.keyboard.press('ArrowDown')
      await page.keyboard.press('Enter')
    }
  }

  const previewButton = page.getByRole('button', { name: /refresh|aktualisieren/i }).first()
  await expect(previewButton).toBeVisible({ timeout: 5000 })
  await previewButton.click()
  await expect(page.locator('[role="dialog"] table').first()).toBeVisible({ timeout: 10000 })
}

async function reopenClientQuickActionsMenu(page: Page): Promise<void> {
  await page.keyboard.press('Escape').catch(() => undefined)
  const trigger = page.getByTestId('quickpanel-client-actions').locator('button').first()
  await expect(trigger).toBeVisible({ timeout: 10000 })
  const menuItem = page.getByRole('option').first()
  if (!(await menuItem.isVisible().catch(() => false))) {
    await trigger.click()
  }
  await expect(menuItem).toBeVisible({ timeout: 10000 })
}

test.describe('Quick Panel - tabs', () => {
  test('quickpanel overview tab', async ({ page }) => {
    test.setTimeout(process.env.CI_PIPELINE_SOURCE === 'schedule' ? 480_000 : 180_000)
    await runUITest(page, {
      name: 'quickpanel-tab-overview',
      route: '/clients',
      waitAfterNav: 0,
      functional: async (p) => {
        await waitForTable(p)
        // Select a client row so the overview has something to show
        const firstRow = p.locator('table tbody tr').first()
        if (await firstRow.isVisible().catch(() => false)) {
          await firstRow.click()
          await p.waitForTimeout(400)
        }
        await openQuickPanelTab(p, /overview|übersicht|dashboard/i)
        await expect(p.getByTestId('quickpanel')).toBeVisible({ timeout: 5000 })
        await expect(p.getByTestId('quickpanel-tab-overview')).toBeVisible()
      },
      checkpoints: [
        {
          name: 'quickpanel-tab-clients',
          run: async (p) => {
            await waitForTable(p)
            await openQuickPanelTab(p, /client|gruppe|group/i)
            await expect(p.getByTestId('quickpanel-tab-clients')).toBeVisible()
          },
          reset: async (p) => openQuickPanelTab(p, /overview|übersicht|dashboard/i),
        },
      ],
      vrMask: ['[data-testid="session-timer"]'],
    })
  })

  test('quickpanel servers tab', async ({ page }) => {
    await runUITest(page, {
      name: 'quickpanel-tab-servers',
      route: '/servers',
      waitAfterNav: 4000,
      functional: async (p) => {
        await openQuickPanelTab(p, /server/i)
        await expect(p.getByTestId('quickpanel-tab-servers')).toBeVisible()
        // Server list should render
        await expect(p.getByTestId('quickpanel-tab-servers').locator('[class*="item"], [role="listitem"], li').first()).toBeVisible({
          timeout: 8000,
        })
      },
      vrMask: ['[data-testid="session-timer"]'],
    })
  })

  test('quickpanel products tab', async ({ page }) => {
    await runUITest(page, {
      name: 'quickpanel-tab-products',
      route: '/products/LocalbootProduct',
      waitAfterNav: 5000,
      functional: async (p) => {
        await openQuickPanelTab(p, /product|produkt/i)
        await expect(p.getByTestId('quickpanel-tab-products')).toBeVisible()
      },
      vrMask: ['[data-testid="session-timer"]'],
    })
  })
})

test.describe('Quick Actions', () => {
  test('client quick actions dropdown open', async ({ page }) => {
    test.setTimeout(process.env.CI_PIPELINE_SOURCE === 'schedule' ? 480_000 : 270_000)
    await runUITest(page, {
      name: 'quickactions-client-dropdown',
      route: '/clients',
      waitAfterNav: 0,
      skipKeyboardWalk: true,
      functional: async (p) => {
        const menuItems = await openClientQuickActionsMenu(p)
        expect(await menuItems.count()).toBeGreaterThan(0)
      },
      checkpoints: [
        {
          name: 'quickactions-client-popup',
          run: async (p) => {
            const menuItems = await openClientQuickActionsMenu(p)
            const firstAction = menuItems.first()
            await expect(firstAction).toBeVisible({ timeout: 10000 })
            await firstAction.click()
            await expect(p.locator('[role="dialog"]').first()).toBeVisible({ timeout: 5000 })
          },
          reset: reopenClientQuickActionsMenu,
          vrMask: ['[data-testid="session-timer"]', '[class*="timestamp"]'],
          skipKeyboardWalk: true,
        },
        {
          name: 'quickactions-product-popup',
          run: async (p) => {
            await mockClientActionResponse(p)
            await openProductQuickActions(p)
          },
          reset: reopenClientQuickActionsMenu,
          skipKeyboardWalk: false,
        },
      ],
      vrMask: ['[data-testid="session-timer"]'],
      elementShots: [
        clientQuickActionDialogShot('quickactions-client-deploy-agent-dialog', /deploy|agent/i),
        {
          name: 'opsi-webgui-product-quick-actions-preview',
          captureSelector: '[role="dialog"]',
          before: async (p) => {
            await mockClientActionResponse(p)
            await openProductQuickActions(p, true)
          },
          after: async (p) => {
            await p.keyboard.press('Escape').catch(() => undefined)
            await p.waitForTimeout(200)
          },
        },
      ],
    })
  })
})
