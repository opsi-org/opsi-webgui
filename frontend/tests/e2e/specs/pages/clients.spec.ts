import { test, expect } from '../../fixtures'
import { runUITest } from '../../runner/runUITest'
import { waitForTable, getTableRowCount } from '../../utils/ui'

test.describe('Clients', () => {
  test('clients list with data', async ({ page }) => {
    await runUITest(page, {
      name: 'clients',
      route: '/clients',
      waitAfterNav: 5000,
      docName: 'opsi-webgui-clients-overview',
      functional: async (p) => {
        await waitForTable(p)
        const count = await getTableRowCount(p)
        expect(count).toBeGreaterThan(0)

        // Table header columns are visible
        const headers = p.locator('thead th, [class*="header"] [class*="cell"]')
        expect(await headers.count()).toBeGreaterThan(2)
      },
      vrMask: ['[class*="timestamp"]', '[class*="time"]', '[class*="lastSeen"]'],
    })
  })

  test('clients table filtering', async ({ page }) => {
    await page.goto('/clients', { waitUntil: 'networkidle', timeout: 30000 })
    await page.waitForTimeout(3000)
    await waitForTable(page)

    const initialCount = await getTableRowCount(page)

    const filterInput = page
      .locator(
        'input[placeholder*="filter" i], input[placeholder*="suche" i], input[placeholder*="search" i], input[placeholder*="Filter" i]'
      )
      .first()
    if (await filterInput.isVisible().catch(() => false)) {
      await filterInput.fill('client')
      await page.waitForTimeout(1500)

      const filteredCount = await getTableRowCount(page)
      expect(filteredCount).toBeLessThanOrEqual(initialCount)

      await filterInput.fill('')
      await page.waitForTimeout(1500)
    }
  })

  test('clients table row selection', async ({ page }) => {
    await page.goto('/clients', { waitUntil: 'networkidle', timeout: 30000 })
    await page.waitForTimeout(3000)
    await waitForTable(page)

    const firstRow = page
      .locator('table tbody tr, [class*="table"] [class*="row"]:not([class*="header"])')
      .first()
    await firstRow.click()
    await page.waitForTimeout(1000)

    const hasPanel = await page
      .locator('[class*="panel"], [class*="detail"], [class*="aside"]')
      .first()
      .isVisible()
      .catch(() => false)
    const hasSelection = await page
      .locator('[class*="selected"], button:has-text("1")')
      .first()
      .isVisible()
      .catch(() => false)
    expect(hasPanel || hasSelection).toBeTruthy()
  })

  test('clients table sorting', async ({ page }) => {
    await page.goto('/clients', { waitUntil: 'networkidle', timeout: 30000 })
    await page.waitForTimeout(3000)
    await waitForTable(page)

    const sortableHeader = page.locator('thead th').first()
    if (await sortableHeader.isVisible().catch(() => false)) {
      await sortableHeader.click()
      await page.waitForTimeout(1000)
      const count = await getTableRowCount(page)
      expect(count).toBeGreaterThan(0)
    }
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
        const submitBtn = p.locator('button[type="submit"], button[title]')
        await expect(submitBtn.first()).toBeVisible({ timeout: 10000 })
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
        const tabs = p.locator('[role="tablist"] [role="tab"], [class*="tab"]')
        if (
          await tabs
            .first()
            .isVisible()
            .catch(() => false)
        ) {
          expect(await tabs.count()).toBeGreaterThan(0)
        }
      },
    })
  })

  test('clients logs', async ({ page }) => {
    await runUITest(page, {
      name: 'clients-logs',
      route: '/clients/logs',
      waitAfterNav: 3000,
      docName: 'opsi-webgui-clients-logs',
      a11yExclude: ['.xterm', '[class*="terminal"]'],
    })
  })
})
