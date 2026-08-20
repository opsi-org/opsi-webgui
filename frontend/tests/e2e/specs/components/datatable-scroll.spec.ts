import { test, expect } from '../../fixtures'
import { waitForTable, getTableRowCount } from '../../utils/ui'

const tableContainer = (pageOrSel: import('@playwright/test').Page) =>
  pageOrSel
    .locator('div[role="region"]')
    .filter({ has: pageOrSel.locator('table') })
    .first()

async function metrics(page: import('@playwright/test').Page) {
  return tableContainer(page).evaluate((el) => ({
    scrollHeight: el.scrollHeight,
    clientHeight: el.clientHeight,
    scrollWidth: el.scrollWidth,
    clientWidth: el.clientWidth,
    overflowX: getComputedStyle(el).overflowX,
    overflowY: getComputedStyle(el).overflowY,
  }))
}

test.describe('DataTable scroll', () => {
  test('vertical scroll: content overflows and the container scrolls', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 })
    await page.goto('/clients', { waitUntil: 'networkidle', timeout: 30000 })
    await page.waitForTimeout(3000)
    await waitForTable(page)

    const m = await metrics(page)
    expect(m.overflowY).toMatch(/auto|scroll/)
    // 20 rows on an 800px-tall window overflow ->  vertical scrollbar.
    expect(m.scrollHeight).toBeGreaterThan(m.clientHeight)
  })

  test('horizontal scroll: wide table scrolls sideways on a narrow window', async ({ page }) => {
    await page.setViewportSize({ width: 820, height: 800 })
    await page.goto('/clients', { waitUntil: 'networkidle', timeout: 30000 })
    await page.waitForTimeout(3000)
    await waitForTable(page)

    const m = await metrics(page)
    expect(m.overflowX).toMatch(/auto|scroll/)
    // Many columns + actions are wider than an 820px window -> horizontal scroll.
    expect(m.scrollWidth).toBeGreaterThan(m.clientWidth)
  })

  test('4K regression: large viewport eagerly fills beyond the first page', async ({ page }) => {
    // A 4K-class viewport: 20 rows can never fill it
    await page.setViewportSize({ width: 2560, height: 1440 })
    await page.goto('/clients', { waitUntil: 'networkidle', timeout: 30000 })
    await page.waitForTimeout(3000)
    await waitForTable(page)

    await expect.poll(async () => getTableRowCount(page), { timeout: 15000, intervals: [500, 1000, 1500] }).toBeGreaterThan(20)

    const m = await metrics(page)
    expect(m.scrollHeight).toBeGreaterThanOrEqual(m.clientHeight)
  })
})
