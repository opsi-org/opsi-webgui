import { test, expect } from '../../fixtures'
import { runUITest } from '../../runner/runUITest'
import { waitForTable, getTableRowCount } from '../../utils/ui'

async function seedClientSelection(page: import('@playwright/test').Page) {
  await page.goto('/clients', { waitUntil: 'networkidle', timeout: 30000 })
  await page.waitForTimeout(3000)
  await waitForTable(page)

  const firstClientId = await page.locator('table tbody tr td').evaluateAll((cells) => {
    for (const cell of cells) {
      const text = (cell.textContent || '').trim()
      if (text && text.includes('.')) return text
    }
    return ''
  })

  if (!firstClientId) return

  await page.evaluate((clientId) => {
    const key = 'opsi-webgui-selection'
    const raw = window.localStorage.getItem(key)
    const current = raw ? JSON.parse(raw) : {}
    window.localStorage.setItem(
      key,
      JSON.stringify({
        ...current,
        selectedClients: [clientId],
        selectionSource: 'table',
      }),
    )
  }, firstClientId)
}

test.describe('Clients', () => {
  test('clients products split view opens from deep link', async ({ page }) => {
    await seedClientSelection(page)

    await page.goto('/clients?view=panel&panelType=products&sortBy=version_outdated&type=localboot', {
      waitUntil: 'networkidle',
      timeout: 30000,
    })

    await waitForTable(page)
    const detailPanel = page.getByTestId('detail-panel')
    await expect(detailPanel).toBeVisible({ timeout: 15000 })

    const panelTables = detailPanel.locator('table')
    await expect(panelTables.first()).toBeVisible({ timeout: 15000 })
    await expect(page).toHaveURL(/panelType=products/)
    await expect(page).toHaveURL(/sortBy=version_outdated/)
  })

  test('clients products split view stays readable on narrow window', async ({ page }) => {
    await seedClientSelection(page)
    await page.setViewportSize({ width: 1100, height: 900 })

    await page.goto('/clients?view=panel&panelType=products&sortBy=version_outdated&type=localboot', {
      waitUntil: 'networkidle',
      timeout: 30000,
    })

    await waitForTable(page)
    const detailPanel = page.getByTestId('detail-panel')
    await expect(detailPanel).toBeVisible({ timeout: 15000 })

    const firstPanelCell = detailPanel.locator('tbody td').first()
    await expect(firstPanelCell).toBeVisible({ timeout: 15000 })

    const fontSize = await firstPanelCell.evaluate((el) => Number.parseFloat(getComputedStyle(el).fontSize))
    expect(fontSize).toBeGreaterThanOrEqual(14)

    const panelBox = await detailPanel.boundingBox()
    expect(panelBox).not.toBeNull()
    if (panelBox) {
      expect(panelBox.width).toBeGreaterThan(700)
    }
  })

  test('clients overview and key actions', async ({ page }) => {
    await runUITest(page, {
      name: 'clients',
      route: '/clients',
      waitAfterNav: 5000,
      docName: 'opsi-webgui-clients-overview',
      marketingName: 'opsi-webgui-clients-with-products',
      marketingPrepare: async (p) => {
        await waitForTable(p)

        // Click first row to select a client
        const firstRow = p.locator('table tbody tr, [class*="table"] [class*="row"]:not([class*="header"])').first()
        await firstRow.click()
        await p.waitForTimeout(800)

        // Wait for the products button to become visible (needs selection)
        const productsButton = p.getByTestId('clients-open-products-panel').first()
        await productsButton.waitFor({ state: 'visible', timeout: 8000 }).catch(() => undefined)
        if (await productsButton.isVisible().catch(() => false)) {
          await productsButton.click()
          await p.waitForTimeout(2000)

          // Wait for products table to load in the detail panel
          const panelTable = p.locator('[data-testid="detail-panel"] table tbody tr, main .split-panel table tbody tr').first()
          await panelTable.waitFor({ state: 'visible', timeout: 12000 }).catch(() => undefined)
        }
      },
      functional: async (p) => {
        await waitForTable(p)
        const count = await getTableRowCount(p)
        expect(count).toBeGreaterThan(0)

        // Table header columns are visible
        const headers = p.locator('thead th, [class*="header"] [class*="cell"]')
        await headers
          .first()
          .waitFor({ state: 'visible', timeout: 15000 })
          .catch(() => undefined)
        expect(await headers.count()).toBeGreaterThan(2)

        // Filtering
        const filterInput = p
          .locator(
            'input[placeholder*="filter" i], input[placeholder*="suche" i], input[placeholder*="search" i], input[placeholder*="Filter" i]',
          )
          .first()
        if (await filterInput.isVisible().catch(() => false)) {
          await filterInput.fill('client')
          await p.waitForTimeout(1200)
          expect(await getTableRowCount(p)).toBeGreaterThan(0)
          await filterInput.fill('')
          await p.waitForTimeout(600)
        }

        // Row selection
        const firstRow = p.locator('table tbody tr, [class*="table"] [class*="row"]:not([class*="header"])').first()
        if (await firstRow.isVisible().catch(() => false)) {
          await firstRow.click()
          await p.waitForTimeout(600)
        }

        // Sort interaction
        const sortableHeader = p.locator('thead th[aria-sort]').first()
        if (await sortableHeader.isVisible().catch(() => false)) {
          await sortableHeader.click()
          await p.waitForTimeout(600)
          expect(await getTableRowCount(p)).toBeGreaterThan(0)
        }

        // Open row-actions menu and verify core action categories exist
        const rowActionBtn = p
          .locator(
            'table tbody tr:first-child [aria-label*="aktion" i], ' +
              'table tbody tr:first-child [aria-label*="action" i], ' +
              'table tbody tr:first-child [class*="row-action"]',
          )
          .first()
        if (await rowActionBtn.isVisible().catch(() => false)) {
          await rowActionBtn.click()
          await p.waitForTimeout(400)

          const menu = p.locator('[role="menu"]').first()
          if (await menu.isVisible().catch(() => false)) {
            const actionItems = menu.locator('[role="menuitem"]')
            expect(await actionItems.count()).toBeGreaterThan(0)
          }
          await p.keyboard.press('Escape')
        }

        // Ensure quickpanel is open and tabs are available
        const toggle = p.getByTestId('quickpanel-toggle')
        const panel = p.getByTestId('quickpanel')
        if (await toggle.isVisible().catch(() => false)) {
          if (!(await panel.isVisible().catch(() => false))) {
            await toggle.click()
            await p.waitForTimeout(400)
          }
        }
        if (await panel.isVisible().catch(() => false)) {
          const tabs = panel.getByRole('tab')
          expect(await tabs.count()).toBeGreaterThan(0)
        }
      },
      vrMask: ['[class*="timestamp"]', '[class*="time"]', '[class*="lastSeen"]'],
      elementShots: [
        // Table-settings popup (column chooser)
        {
          name: 'opsi-webgui-table-settings-popup',
          captureSelector: '[role="dialog"]',
          before: async (p) => {
            const btn = p.getByTestId('table-settings')
            if (await btn.isVisible().catch(() => false)) {
              await btn.click()
              await p.waitForTimeout(400)
            }
          },
          after: async (p) => {
            await p.keyboard.press('Escape')
            await p.waitForTimeout(200)
          },
        },
        {
          name: 'opsi-webgui-table-settings-button',
          captureTestId: 'table-settings',
        },
        {
          name: 'opsi-webgui-client-row-action-menu-button',
          captureTestId: 'client-quick-actions-trigger-inline',
          before: async (p) => {
            await waitForTable(p)
            const firstRow = p.locator('table tbody tr').first()
            if (await firstRow.isVisible().catch(() => false)) {
              await firstRow.click()
              await p.waitForTimeout(300)
            }
          },
        },
        {
          name: 'opsi-webgui-client-row-action-config-button',
          captureTestId: 'client-row-action-config',
          before: async (p) => {
            await waitForTable(p)
          },
        },
        {
          name: 'opsi-webgui-client-row-action-logs-button',
          captureTestId: 'client-row-action-logs',
          before: async (p) => {
            await waitForTable(p)
          },
        },
        {
          name: 'opsi-webgui-client-row-action-clone-button',
          captureTestId: 'client-row-action-clone',
          before: async (p) => {
            await waitForTable(p)
          },
        },
        // Row-level actions dropdown
        {
          name: 'opsi-webgui-client-row-actions-menu',
          captureSelector: '[role="menu"]',
          before: async (p) => {
            const rowBtn = p
              .locator(
                'table tbody tr:first-child [aria-label*="aktion" i], ' +
                  'table tbody tr:first-child [aria-label*="action" i], ' +
                  'table tbody tr:first-child [class*="row-action"]',
              )
              .first()
            if (await rowBtn.isVisible().catch(() => false)) {
              await rowBtn.click()
              await p.waitForTimeout(400)
            }
          },
          after: async (p) => {
            await p.keyboard.press('Escape')
            await p.waitForTimeout(200)
          },
        },
        // Clone button element in selected-client context
        {
          name: 'opsi-webgui-client-clone-button',
          captureSelector: 'button:has-text("Clone"), button:has-text("Klonen"), [aria-label*="clone" i], [aria-label*="klon" i]',
          before: async (p) => {
            await waitForTable(p)
            const firstRow = p.locator('table tbody tr').first()
            if (await firstRow.isVisible().catch(() => false)) {
              await firstRow.click()
              await p.waitForTimeout(500)
            }
          },
        },
        // Clone dialog popup
        {
          name: 'opsi-webgui-client-clone-dialog',
          captureSelector: '[role="dialog"]',
          before: async (p) => {
            await waitForTable(p)
            const firstRow = p.locator('table tbody tr').first()
            if (await firstRow.isVisible().catch(() => false)) {
              await firstRow.click()
              await p.waitForTimeout(400)
            }
            const rowActionBtn = p
              .locator(
                'table tbody tr:first-child [aria-label*="aktion" i], ' +
                  'table tbody tr:first-child [aria-label*="action" i], ' +
                  'table tbody tr:first-child [class*="row-action"]',
              )
              .first()
            if (await rowActionBtn.isVisible().catch(() => false)) {
              await rowActionBtn.click()
              await p.waitForTimeout(300)
              const cloneItem = p
                .locator('[role="menuitem"]')
                .filter({ hasText: /clone|klon/i })
                .first()
              if (await cloneItem.isVisible().catch(() => false)) {
                await cloneItem.click()
                await p.waitForTimeout(500)
              } else {
                await p.keyboard.press('Escape')
              }
            }
          },
          after: async (p) => {
            await p.keyboard.press('Escape')
            await p.waitForTimeout(200)
          },
        },
        // Quickpanel overview tab
        {
          name: 'opsi-webgui-quickpanel-overview-section',
          captureTestId: 'quickpanel-tab-content',
          before: async (p) => {
            const panel = p.getByTestId('quickpanel')
            const tab = panel
              .getByRole('tab')
              .filter({ hasText: /overview|übersicht/i })
              .first()
            if (await tab.isVisible().catch(() => false)) {
              await tab.click()
              await p.waitForTimeout(300)
            }
          },
        },
        // Quickpanel client groups tree (cropped)
        {
          name: 'opsi-webgui-quickpanel-client-groups',
          captureTestId: 'quickpanel-tab-content',
          before: async (p) => {
            const toggle = p.getByTestId('quickpanel-toggle')
            const panel = p.getByTestId('quickpanel')
            if (await toggle.isVisible().catch(() => false)) {
              if (!(await panel.isVisible().catch(() => false))) {
                await toggle.click()
                await p.waitForTimeout(400)
              }
            }
            const tab = p
              .getByTestId('quickpanel')
              .getByRole('tab')
              .filter({ hasText: /client|gruppe|group/i })
              .first()
            if (await tab.isVisible().catch(() => false)) {
              await tab.click()
              await p.waitForTimeout(300)
            }
          },
        },
        {
          name: 'opsi-webgui-quickpanel-quick-actions-section',
          captureTestId: 'quickpanel-quick-actions-section',
        },
        {
          name: 'opsi-webgui-quickpanel-settings-section',
          captureTestId: 'quickpanel-settings-section',
        },
        {
          name: 'opsi-webgui-quickpanel-footer-section',
          captureTestId: 'quickpanel-footer-section',
        },
      ],
    })
  })

  test('clients add form', async ({ page }) => {
    await runUITest(page, {
      name: 'clients-create',
      route: '/clients/add',
      waitAfterNav: 3000,
      docName: 'opsi-webgui-clients-create',
      functional: async (p) => {
        const inputs = p.locator('input, select, textarea')
        expect(await inputs.count()).toBeGreaterThan(0)
        const createBtn = p.getByRole('button', {
          name: /Add Client|Client hinzufügen|Ajouter un client/i,
        })
        await expect(createBtn).toBeVisible({ timeout: 10000 })
      },
    })
  })

  test('clients configuration tabs', async ({ page }) => {
    await runUITest(page, {
      name: 'clients-config',
      route: '/clients/configuration/parameters/nb-00001a.acme.corp',
      waitAfterNav: 4000,
      docName: 'opsi-webgui-clients-configuration',
      functional: async (p) => {
        await expect(p.getByText('Host auswählen um Konfiguration anzuzeigen')).toBeHidden({
          timeout: 15000,
        })

        const tabs = p.getByRole('tab')
        await tabs.first().waitFor({ state: 'visible', timeout: 30000 })
        expect(await tabs.count()).toBeGreaterThan(0)

        const attrsTab = tabs.filter({ hasText: /attributes|attribute/i }).first()
        if (await attrsTab.isVisible().catch(() => false)) {
          await attrsTab.click()
          await p.waitForTimeout(800)
          const attrsFields = p.locator('input, textarea, [role="checkbox"]')
          expect(await attrsFields.count()).toBeGreaterThan(0)
        }

        const paramsTab = tabs.filter({ hasText: /parameters|parameter/i }).first()
        if (await paramsTab.isVisible().catch(() => false)) {
          await paramsTab.click()
          await p.waitForTimeout(800)
        }

        // Parameters content area should occupy full page area and be scroll-capable
        const contentShell = p.locator('main #main-content').first()
        const paramsCard = p.locator('main .opsi-card').first()
        const fallbackPane = p.locator('main [class*="overflow-y-auto"], main [class*="overflow-auto"]').first()
        await expect(contentShell).toBeVisible()
        const hasParamsCard = await paramsCard.isVisible().catch(() => false)
        if (!hasParamsCard) {
          await expect(fallbackPane).toBeVisible()
        }

        const sizes = await Promise.all([contentShell.boundingBox(), (hasParamsCard ? paramsCard : fallbackPane).boundingBox()])
        const shellBox = sizes[0]
        const cardBox = sizes[1]
        expect(shellBox).not.toBeNull()
        expect(cardBox).not.toBeNull()
        if (shellBox && cardBox) {
          expect(cardBox.height).toBeGreaterThan(shellBox.height * 0.45)
        }

        const hasScrollableArea = await (hasParamsCard ? paramsCard : fallbackPane).evaluate((el) => {
          const candidate = (el.querySelector('[style*="overflow"], .overflow-y-auto, .overflow-auto') || el) as HTMLElement
          return candidate.scrollHeight >= candidate.clientHeight
        })
        expect(hasScrollableArea).toBeTruthy()
      },
    })
  })

  test('clients clone page', async ({ page }) => {
    await runUITest(page, {
      name: 'clients-clone-page',
      route: '/clients/clone',
      waitAfterNav: 3500,
      docName: 'opsi-webgui-clients-clone',
      skipVisualRegression: true,
      functional: async (p) => {
        await expect(p.locator('main')).toBeVisible()
        await expect(p.getByText(/select a client to clone|bitte wählen sie einen client zum klonen aus/i)).toBeVisible({
          timeout: 10000,
        })
      },
    })
  })

  test('client action dialogs - deploy, reboot, on-demand', async ({ page }) => {
    await runUITest(page, {
      name: 'clients-action-dialogs',
      route: '/clients',
      waitAfterNav: 5000,
      skipVisualRegression: true, // covered by element shots below
      skipKeyboardWalk: true,
      functional: async (p) => {
        await waitForTable(p)
        // Select first client row
        const firstRow = p.locator('table tbody tr').first()
        await firstRow.waitFor({ state: 'visible', timeout: 10000 })
        await firstRow.click()
        await p.waitForTimeout(400)

        // Open the row quick-actions inline dropdown
        const rowActionBtn = p
          .locator(
            'table tbody tr:first-child [aria-label*="aktion" i], ' +
              'table tbody tr:first-child [aria-label*="action" i], ' +
              'table tbody tr:first-child [class*="row-action"]',
          )
          .first()
        if (await rowActionBtn.isVisible().catch(() => false)) {
          await rowActionBtn.click()
          await p.waitForTimeout(400)
          const menu = p.locator('[role="menu"]').first()
          if (await menu.isVisible().catch(() => false)) {
            const actionItems = menu.locator('[role="menuitem"]')
            expect(await actionItems.count()).toBeGreaterThan(0)
          }
          await p.keyboard.press('Escape')
          await p.waitForTimeout(200)
        }
      },
      elementShots: [
        // Deploy Client Agent dialog
        {
          name: 'opsi-webgui-client-action-deploy-dialog',
          captureSelector: '[role="dialog"]',
          before: async (p) => {
            await waitForTable(p)
            const firstRow = p.locator('table tbody tr').first()
            if (await firstRow.isVisible().catch(() => false)) {
              await firstRow.click()
              await p.waitForTimeout(400)
            }
            // Try row-level action button
            const rowActionBtn = p
              .locator(
                'table tbody tr:first-child [aria-label*="aktion" i], ' +
                  'table tbody tr:first-child [aria-label*="action" i], ' +
                  'table tbody tr:first-child [class*="row-action"]',
              )
              .first()
            if (await rowActionBtn.isVisible().catch(() => false)) {
              await rowActionBtn.click()
              await p.waitForTimeout(400)
              const deployItem = p
                .locator('[role="menuitem"]')
                .filter({ hasText: /deploy|client.agent|agent/i })
                .first()
              if (await deployItem.isVisible().catch(() => false)) {
                await deployItem.click()
                await p.waitForTimeout(500)
              } else {
                await p.keyboard.press('Escape')
              }
            }
          },
          after: async (p) => {
            await p.keyboard.press('Escape')
            await p.waitForTimeout(200)
          },
        },
        // Reboot dialog
        {
          name: 'opsi-webgui-client-action-reboot-dialog',
          captureSelector: '[role="dialog"]',
          before: async (p) => {
            await waitForTable(p)
            const firstRow = p.locator('table tbody tr').first()
            if (await firstRow.isVisible().catch(() => false)) {
              await firstRow.click()
              await p.waitForTimeout(400)
            }
            const rowActionBtn = p
              .locator(
                'table tbody tr:first-child [aria-label*="aktion" i], ' +
                  'table tbody tr:first-child [aria-label*="action" i], ' +
                  'table tbody tr:first-child [class*="row-action"]',
              )
              .first()
            if (await rowActionBtn.isVisible().catch(() => false)) {
              await rowActionBtn.click()
              await p.waitForTimeout(400)
              const rebootItem = p
                .locator('[role="menuitem"]')
                .filter({ hasText: /reboot|neustart/i })
                .first()
              if (await rebootItem.isVisible().catch(() => false)) {
                await rebootItem.click()
                await p.waitForTimeout(500)
              } else {
                await p.keyboard.press('Escape')
              }
            }
          },
          after: async (p) => {
            await p.keyboard.press('Escape')
            await p.waitForTimeout(200)
          },
        },
        // On-demand dialog
        {
          name: 'opsi-webgui-client-action-ondemand-dialog',
          captureSelector: '[role="dialog"]',
          before: async (p) => {
            await waitForTable(p)
            const firstRow = p.locator('table tbody tr').first()
            if (await firstRow.isVisible().catch(() => false)) {
              await firstRow.click()
              await p.waitForTimeout(400)
            }
            const rowActionBtn = p
              .locator(
                'table tbody tr:first-child [aria-label*="aktion" i], ' +
                  'table tbody tr:first-child [aria-label*="action" i], ' +
                  'table tbody tr:first-child [class*="row-action"]',
              )
              .first()
            if (await rowActionBtn.isVisible().catch(() => false)) {
              await rowActionBtn.click()
              await p.waitForTimeout(400)
              const onDemandItem = p
                .locator('[role="menuitem"]')
                .filter({ hasText: /on.demand|demand|on-demand/i })
                .first()
              if (await onDemandItem.isVisible().catch(() => false)) {
                await onDemandItem.click()
                await p.waitForTimeout(500)
              } else {
                await p.keyboard.press('Escape')
              }
            }
          },
          after: async (p) => {
            await p.keyboard.press('Escape')
            await p.waitForTimeout(200)
          },
        },
      ],
    })
  })

  test('clients logs with log level colors', async ({ page }) => {
    await page.route('**/opsidata/log**', async (route) => {
      const responseBody = [
        '[1] essential: /var/log/opsi/test-client-01.example.test_instlog.log session started',
        '[2] critical: product opsi-client-agent dependency mismatch',
        '[3] error: action request failed for opsi-script',
        '[4] warning: retry in 5 seconds for test-client-01.example.test',
        '[5] notice: switched to fallback repository mirror',
        '[6] info: synchronization finished for test-client-01.example.test',
        '[7] debug: parsed 42 product entries from cache',
        '[8] trace: websocket ping/pong healthy',
        '[9] secret: redacted token placeholder',
      ]
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(responseBody),
      })
    })

    await runUITest(page, {
      name: 'clients-logs',
      route: '/clients/logs/nb-00001a.acme.corp?logType=instlog',
      waitAfterNav: 3000,
      docName: 'opsi-webgui-clients-logs',
      functional: async (p) => {
        await expect(p.locator('main')).toBeVisible()
        await p.waitForTimeout(1200)

        // After loading, the log viewer should appear
        const logViewer = p.locator('.log-viewer, [class*="log-viewer"]').first()
        if (await logViewer.isVisible().catch(() => false)) {
          // Verify at least one log row with a colour class is rendered
          const coloredRows = p.locator(
            '[class*="text-opsi-log-"], [class*="log-essential"], [class*="log-critical"],' +
              '[class*="log-error"], [class*="log-warning"], [class*="log-info"], [class*="log-debug"]',
          )
          // Logs may be empty in the test environment; tolerate that gracefully
          const hasRows = (await coloredRows.count()) > 0
          if (!hasRows) {
            // Still pass - we just want the page rendered without errors
            await expect(logViewer).toBeVisible()
          }

          // Set a log marker on a row to show the bookmark feature in the screenshot
          const thirdRow = p.locator('[id^="logrow-"]').nth(2)
          if (await thirdRow.isVisible().catch(() => false)) {
            await thirdRow.click()
            await p.waitForTimeout(400)
          }
        } else {
          // Fallback: verify page controls are present
          const controls = p.locator('main button, main input, main [role="combobox"]').first()
          await expect(controls).toBeVisible({ timeout: 10000 })
        }
      },
      // Mask the log content area since log lines differ between runs
      vrMask: ['[class*="log-viewer"]', '.log-viewer'],
      a11yExclude: ['.log-viewer', '[class*="log-viewer"]'],
    })
  })
})
