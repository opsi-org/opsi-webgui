import { test, expect } from '../../fixtures'
import { runUITest } from '../../runner/runUITest'
import { waitForTable } from '../../utils/ui'
import type { Page } from '@playwright/test'

/**
 * Quick-panel component specs: VR baseline + a11y for every tab, and
 * for both client and product quick-action controls.
 *
 * The quick panel lives in the layout on every page; we use the clients
 * page as the host (good default data set).
 */

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

async function seedClientSelectionFromCurrentTable(page: Page): Promise<void> {
  const firstClientId = await page.locator('table tbody tr').first().locator('td').nth(1).innerText().catch(() => '')
  const normalized = firstClientId.trim()
  if (!normalized) return
  await page.evaluate((clientId: string) => {
    const key = 'opsi-webgui-selection'
    const raw = window.localStorage.getItem(key)
    const current = raw ? JSON.parse(raw) : {}
    window.localStorage.setItem(key, JSON.stringify({
      ...current,
      selectedClients: [clientId],
      selectionSource: 'quickpanel',
    }))
  }, normalized)
  await page.reload({ waitUntil: 'domcontentloaded' })
  await page.waitForTimeout(1200)
  await waitForTable(page)
}

async function openQuickPanelTab(page: Page, tabText: RegExp): Promise<void> {
  await ensureQuickPanelOpen(page)
  const tab = page.getByTestId('quickpanel').getByRole('tab').filter({ hasText: tabText }).first()
  if (await tab.isVisible().catch(() => false)) {
    await tab.click()
    await page.waitForTimeout(400)
  }
}

async function selectFirstClientForQuickActions(page: Page): Promise<void> {
  await waitForTable(page)
  const firstRow = page.locator('table tbody tr').first()
  await expect(firstRow).toBeVisible({ timeout: 10000 })

  const checkbox = firstRow.locator('[role="checkbox"], input[type="checkbox"]').first()
  if (await checkbox.isVisible().catch(() => false)) {
    const ariaChecked = (await checkbox.getAttribute('aria-checked')) || ''
    if (ariaChecked !== 'true') {
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
  await seedClientSelectionFromCurrentTable(page)
  await openQuickPanelTab(page, /overview|übersicht/i)
}

async function openClientQuickActionsMenu(page: Page) {
  await prepareClientQuickActions(page)
  const trigger = page.getByTestId('quickpanel-client-actions').locator('button').first()
  await expect(trigger).toBeVisible({ timeout: 10000 })
  await expect(trigger).toBeEnabled({ timeout: 10000 })
  await trigger.click()
  const menuItems = page.getByRole('menuitem')
  await expect(menuItems.first()).toBeVisible({ timeout: 10000 })
  return menuItems
}

async function openClientQuickActionDialog(page: Page, itemIndex: number): Promise<void> {
  const menuItems = await openClientQuickActionsMenu(page)
  await expect(menuItems.nth(itemIndex)).toBeVisible({ timeout: 10000 })
  await menuItems.nth(itemIndex).click()
  await page.waitForTimeout(400)
  await expect(page.locator('[role="dialog"]').first()).toBeVisible({ timeout: 5000 })
}

test.describe('Quick Panel - tabs', () => {
  test('quickpanel overview tab', async ({ page }) => {
    await runUITest(page, {
      name: 'quickpanel-tab-overview',
      route: '/clients',
      waitAfterNav: 5000,
      functional: async (p) => {
        await waitForTable(p)
        // Select a client row so the overview has something to show
        const firstRow = p.locator('table tbody tr').first()
        if (await firstRow.isVisible().catch(() => false)) {
          await firstRow.click()
          await p.waitForTimeout(400)
        }
        await openQuickPanelTab(p, /overview|übersicht/i)
        await expect(p.getByTestId('quickpanel')).toBeVisible({ timeout: 5000 })
      },
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
        await expect(p.getByTestId('quickpanel')).toBeVisible({ timeout: 5000 })
        // Server list should render
        const items = p
          .getByTestId('quickpanel')
          .locator('[class*="item"], [role="listitem"], li')
          .first()
        if (await items.waitFor({ state: 'visible', timeout: 8000 }).catch(() => false)) {
          expect(
            await p
              .getByTestId('quickpanel')
              .locator('[class*="item"], [role="listitem"], li')
              .count()
          ).toBeGreaterThan(0)
        }
      },
      vrMask: ['[data-testid="session-timer"]'],
    })
  })

  test('quickpanel clients tab', async ({ page }) => {
    await runUITest(page, {
      name: 'quickpanel-tab-clients',
      route: '/clients',
      waitAfterNav: 5000,
      functional: async (p) => {
        await waitForTable(p)
        await openQuickPanelTab(p, /client|gruppe|group/i)
        await expect(p.getByTestId('quickpanel')).toBeVisible({ timeout: 5000 })
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
        await expect(p.getByTestId('quickpanel')).toBeVisible({ timeout: 5000 })
      },
      vrMask: ['[data-testid="session-timer"]'],
    })
  })
})

test.describe('Quick Actions', () => {
  test('client quick actions dropdown open', async ({ page }) => {
    await runUITest(page, {
      name: 'quickactions-client-dropdown',
      route: '/clients',
      waitAfterNav: 5000,
      skipKeyboardWalk: true,
      functional: async (p) => {
        const menuItems = await openClientQuickActionsMenu(p)
        expect(await menuItems.count()).toBeGreaterThan(0)
      },
      vrMask: ['[data-testid="session-timer"]'],
    })
  })

  test('client quick actions popup open', async ({ page }) => {
    await runUITest(page, {
      name: 'quickactions-client-popup',
      route: '/clients',
      waitAfterNav: 5000,
      skipKeyboardWalk: true,
      functional: async (p) => {
        await openClientQuickActionDialog(p, 0)
      },
      vrMask: ['[data-testid="session-timer"]', '[class*="timestamp"]'],
      elementShots: [
        {
          name: 'quickactions-client-ondemand-dialog',
          captureSelector: '[role="dialog"]',
          before: async (p) => openClientQuickActionDialog(p, 0),
          after: async (p) => {
            await p.keyboard.press('Escape')
            await p.waitForTimeout(200)
          },
        },
        {
          name: 'quickactions-client-notify-dialog',
          captureSelector: '[role="dialog"]',
          before: async (p) => openClientQuickActionDialog(p, 1),
          after: async (p) => {
            await p.keyboard.press('Escape')
            await p.waitForTimeout(200)
          },
        },
        {
          name: 'quickactions-client-reboot-dialog',
          captureSelector: '[role="dialog"]',
          before: async (p) => openClientQuickActionDialog(p, 2),
          after: async (p) => {
            await p.keyboard.press('Escape')
            await p.waitForTimeout(200)
          },
        },
        {
          name: 'quickactions-client-shutdown-dialog',
          captureSelector: '[role="dialog"]',
          before: async (p) => openClientQuickActionDialog(p, 3),
          after: async (p) => {
            await p.keyboard.press('Escape')
            await p.waitForTimeout(200)
          },
        },
        {
          name: 'quickactions-client-deploy-dialog',
          captureSelector: '[role="dialog"]',
          before: async (p) => openClientQuickActionDialog(p, 4),
          after: async (p) => {
            await p.keyboard.press('Escape')
            await p.waitForTimeout(200)
          },
        },
        {
          name: 'quickactions-client-delete-dialog',
          captureSelector: '[role="dialog"]',
          before: async (p) => openClientQuickActionDialog(p, 5),
          after: async (p) => {
            await p.keyboard.press('Escape')
            await p.waitForTimeout(200)
          },
        },
      ],
    })
  })

  test('product quick popup open', async ({ page }) => {
    await runUITest(page, {
      name: 'quickactions-product-popup',
      route: '/clients',
      waitAfterNav: 5000,
      functional: async (p) => {
        await p.route('**/opsidata/clients/action', async (route) => {
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

        await selectFirstClientForQuickActions(p)
        await ensureQuickPanelOpen(p)

        const productQABtn = p.getByTestId('quickpanel-product-actions').locator('button').first()
        await expect(productQABtn).toBeVisible({ timeout: 10000 })
        await productQABtn.click()

        const popup = p.locator('[role="dialog"]').first()
        await expect(popup).toBeVisible({ timeout: 5000 })
      },
      vrMask: ['[data-testid="session-timer"]'],
      elementShots: [
        {
          name: 'opsi-webgui-product-quick-actions-preview',
          captureSelector: '[role="dialog"]',
          before: async (p) => {
            await selectFirstClientForQuickActions(p)
            await ensureQuickPanelOpen(p)
            await p.route('**/opsidata/clients/action', async (route) => {
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

            const productQABtn = p.getByTestId('quickpanel-product-actions').locator('button').first()
            await expect(productQABtn).toBeVisible({ timeout: 10000 })
            await productQABtn.click()

            const statusCombo = p.getByLabel(/installationsstatus|installation status/i).first()
            if (await statusCombo.isVisible().catch(() => false)) {
              await statusCombo.click()
              const installedOption = p.getByRole('option').filter({ hasText: /installed/i }).first()
              if (await installedOption.isVisible().catch(() => false)) {
                await installedOption.click()
              } else {
                await p.keyboard.press('ArrowDown')
                await p.keyboard.press('Enter')
              }
            }

            const actionCombo = p.getByLabel(/aktionsanforderung|action request/i).first()
            if (await actionCombo.isVisible().catch(() => false)) {
              await actionCombo.click()
              const setupOption = p.getByRole('option').filter({ hasText: /setup|always|once/i }).first()
              if (await setupOption.isVisible().catch(() => false)) {
                await setupOption.click()
              } else {
                await p.keyboard.press('ArrowDown')
                await p.keyboard.press('ArrowDown')
                await p.keyboard.press('Enter')
              }
            }

            const previewBtn = p.getByRole('button', { name: /refresh|aktualisieren/i }).first()
            await expect(previewBtn).toBeVisible({ timeout: 5000 })
            await previewBtn.click()
            await expect(p.locator('[role="dialog"] table').first()).toBeVisible({ timeout: 10000 })
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
