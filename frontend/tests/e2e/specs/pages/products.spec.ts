import { test, expect } from '../../fixtures'
import { runUITest } from '../../runner/runUITest'
import { waitForTable, getTableRowCount } from '../../utils/ui'

async function seedClientSelectionFromClientsPage(page: import('@playwright/test').Page) {
  await page.goto('/clients', { waitUntil: 'networkidle', timeout: 30000 })
  await page.waitForTimeout(3000)
  await waitForTable(page)

  const clientIds = await page.locator('table tbody tr td').evaluateAll((cells) => {
    const ids: string[] = []
    for (const cell of cells) {
      const text = (cell.textContent || '').trim()
      if (text && text.includes('.')) ids.push(text)
      if (ids.length === 2) break
    }
    return ids
  })

  if (clientIds.length > 0) {
    await page.evaluate((ids) => {
      const key = 'opsi-webgui-selection'
      const raw = window.localStorage.getItem(key)
      const current = raw ? JSON.parse(raw) : {}
      window.localStorage.setItem(key, JSON.stringify({
        ...current,
        selectedClients: ids,
        selectionSource: 'quickpanel',
      }))
    }, clientIds)
  }
}

test.describe('Products', () => {
  test('products localboot overview and actions', async ({ page }) => {
    await seedClientSelectionFromClientsPage(page)
    await runUITest(page, {
      name: 'products-localboot',
      route: '/products/LocalbootProduct',
      waitAfterNav: 5000,
      docName: 'opsi-webgui-products-localboot',
      functional: async (p) => {
        await waitForTable(p)
        const count = await getTableRowCount(p)
        expect(count).toBeGreaterThan(0)

        const headers = p.locator('thead th, [class*="header"] [class*="cell"]')
        expect(await headers.count()).toBeGreaterThan(1)

        const filterInput = p
          .locator(
            'input[placeholder*="filter" i], input[placeholder*="suche" i], input[placeholder*="search" i]'
          )
          .first()
        if (await filterInput.isVisible().catch(() => false)) {
          await filterInput.fill('opsi')
          await p.waitForTimeout(1200)
          expect(await getTableRowCount(p)).toBeGreaterThan(0)
          await filterInput.fill('')
          await p.waitForTimeout(600)
        }

        // Open the first row detail panel and verify that properties + dependencies load.
        const firstRow = p.locator('table tbody tr').first()
        if (await firstRow.isVisible().catch(() => false)) {
          await firstRow.click()
          await p.waitForTimeout(800)
        }

        const detailPanel = p.locator('aside, [class*="detail"], [class*="panel"]').first()
        if (await detailPanel.isVisible().catch(() => false)) {
          const propsTab = p.getByRole('tab').filter({ hasText: /propert|eigenschaft/i }).first()
          if (await propsTab.isVisible().catch(() => false)) {
            await propsTab.click()
            await p.waitForTimeout(600)
            await expect(detailPanel.locator('input, select, textarea, button, [role="checkbox"]').first()).toBeVisible({ timeout: 10000 })
          }

          const depTab = p.getByRole('tab').filter({ hasText: /depend|abhängig/i }).first()
          if (await depTab.isVisible().catch(() => false)) {
            await depTab.click()
            await p.waitForTimeout(600)
            const depContent = detailPanel.getByText(/required|status|aktion|type/i).first()
            await expect(depContent).toBeVisible({ timeout: 10000 })
          }
        }

        // Action-request dropdown/menu (non-destructive: open only).
        const actionSel = p
          .locator(
            'table tbody tr:first-child select, ' +
            'table tbody tr:first-child [class*="action-request"] button, ' +
            'table tbody tr:first-child [class*="action"] button'
          )
          .first()
        if (await actionSel.isVisible().catch(() => false)) {
          await actionSel.click()
          await p.waitForTimeout(400)
          // Close dropdown before a11y inspection runs to avoid focus trap
          await p.keyboard.press('Escape')
          await p.waitForTimeout(200)
        }
      },
      vrMask: ['[class*="timestamp"]', '[class*="time"]', '[class*="version"]'],
      elementShots: [
        {
          name: 'opsi-webgui-products-action-request-button',
          captureSelector:
            'table tbody tr:first-child [class*="action-request"] button, table tbody tr:first-child [class*="action"] button, table tbody tr:first-child select',
        },
        {
          name: 'opsi-webgui-products-action-request-dropdown',
          captureSelector: '[role="listbox"], [role="menu"], [class*="dropdown"]',
          before: async (p) => {
            const actionSel = p
              .locator(
                'table tbody tr:first-child select, ' +
                'table tbody tr:first-child [class*="action-request"] button, ' +
                'table tbody tr:first-child [class*="action"] button'
              )
              .first()
            if (await actionSel.isVisible().catch(() => false)) {
              await actionSel.click()
              await p.waitForTimeout(400)
            }
          },
          after: async (p) => {
            await p.keyboard.press('Escape')
            await p.waitForTimeout(200)
          },
        },
        {
          name: 'opsi-webgui-products-properties-table',
          captureTestId: 'detail-panel',
          before: async (p) => {
            const firstRow = p.locator('table tbody tr').first()
            if (await firstRow.isVisible().catch(() => false)) {
              await firstRow.click()
              await p.waitForTimeout(700)
            }
            const propsTab = p
              .getByTestId('detail-panel')
              .getByRole('tab')
              .filter({ hasText: /propert|eigenschaft/i })
              .first()
            if (await propsTab.isVisible().catch(() => false)) {
              await propsTab.click()
              await p.waitForTimeout(500)
            }
          },
        },
        {
          name: 'opsi-webgui-products-dependencies-table',
          captureTestId: 'detail-panel',
          before: async (p) => {
            const firstRow = p.locator('table tbody tr').first()
            if (await firstRow.isVisible().catch(() => false)) {
              await firstRow.click()
              await p.waitForTimeout(700)
            }
            const depTab = p
              .getByTestId('detail-panel')
              .getByRole('tab')
              .filter({ hasText: /depend|abhängig/i })
              .first()
            if (await depTab.isVisible().catch(() => false)) {
              await depTab.click()
              await p.waitForTimeout(500)
            }
          },
        },
        {
          name: 'opsi-webgui-quickpanel-product-groups',
          captureTestId: 'quickpanel-tab-content',
          before: async (p) => {
            // Open quickpanel if not open
            const toggle = p.getByTestId('quickpanel-toggle')
            const panel = p.getByTestId('quickpanel')
            if (await toggle.isVisible().catch(() => false)) {
              if (!(await panel.isVisible().catch(() => false))) {
                await toggle.click()
                await p.waitForTimeout(400)
              }
            }
            // Switch to products/groups tab
            const tab = p
              .getByTestId('quickpanel')
              .getByRole('tab')
              .filter({ hasText: /product|produkt/i })
              .first()
            if (await tab.isVisible().catch(() => false)) {
              await tab.click()
              await p.waitForTimeout(300)
            }
          },
        },
      ],
    })
  })

})
