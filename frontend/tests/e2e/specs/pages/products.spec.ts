import { test, expect } from '../../fixtures'
import { runUITest } from '../../runner/runUITest'
import { waitForTable, getTableRowCount } from '../../utils/ui'

test.describe('Products', () => {
  test('products localboot list', async ({ page }) => {
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
      },
      vrMask: ['[class*="timestamp"]', '[class*="time"]', '[class*="version"]'],
    })
  })

  test('products netboot list', async ({ page }) => {
    await runUITest(page, {
      name: 'products-netboot',
      route: '/products/NetbootProduct',
      waitAfterNav: 5000,
      docName: 'opsi-webgui-products-netboot',
      // Visual baseline is covered by products-localboot (same table layout);
      // netboot is validated functionally only to avoid a redundant snapshot.
      skipVisualRegression: true,
      functional: async (p) => {
        await waitForTable(p)
        const count = await getTableRowCount(p)
        expect(count).toBeGreaterThan(0)
      },
    })
  })

  test('products table filtering', async ({ page }) => {
    await page.goto('/products/LocalbootProduct', { waitUntil: 'networkidle', timeout: 30000 })
    await page.waitForTimeout(5000)
    await waitForTable(page)

    const filterInput = page
      .locator(
        'input[placeholder*="filter" i], input[placeholder*="suche" i], input[placeholder*="search" i]'
      )
      .first()
    if (await filterInput.isVisible().catch(() => false)) {
      await filterInput.fill('opsi')
      await page.waitForTimeout(2000)
      const count = await getTableRowCount(page)
      expect(count).toBeGreaterThan(0)
    }
  })

  test('products index renders', async ({ page }) => {
    await page.goto('/products', { waitUntil: 'networkidle', timeout: 30000 })
    await page.waitForTimeout(3000)
    await waitForTable(page)
    expect(await getTableRowCount(page)).toBeGreaterThan(0)
  })
})
