const { test } = require('@playwright/test')
const { callStoryId } = require('../../uib-components/.utils/playwright/pw-story-call')
const en = require('../../uib-components/locale/en.json')
const de = require('../../uib-components/locale/de.json')

test.describe('Table', () => {
  test('filter', async ({ page }) => {
    await callStoryId(page, 'input-i-filter', 'i-filter')
    const component = await page.locator('[data-testid="IFilter"]')
    await (new Promise(resolve => setTimeout(resolve, 1000)))
    await page.setViewportSize({ width: 200, height: 340 })
    await component.type('Filter ID')
    await component.screenshot({ path: './screenshots/en/opsiweb_table_filter.png' })
    await component.screenshot({ path: './screenshots/de/opsiweb_table_filter.png' })
  })
  test('sorting', async ({ page }) => {
    await callStoryId(page, 'dropdown-dd-table-sorting', 'dd-table-sorting')
    await page.click('[data-testid="DropdownDDTableSorting"] .btn')
    await (new Promise(resolve => setTimeout(resolve, 1000)))
    await page.setViewportSize({ width: 200, height: 340 })
    await page.evaluate((val) => { document.querySelector('.sortDirection').innerHTML = val }, en['button.sort.tablecolumns.sortDirection'])
    await page.screenshot({ path: './screenshots/en/opsiweb_table_sorting.png' })
    await page.evaluate((val) => { document.querySelector('.sortDirection').innerHTML = val }, de['button.sort.tablecolumns.sortDirection'])
    await page.screenshot({ path: './screenshots/de/opsiweb_table_sorting.png' })
  })
  test('column selection', async ({ page }) => {
    await callStoryId(page, 'dropdown-dd-table-column-visibility', 'dd-table-column-visibility')
    await page.click('[data-testid="DropdownDDTableColumnVisibility"] .btn')
    await (new Promise(resolve => setTimeout(resolve, 1000)))
    await page.setViewportSize({ width: 200, height: 260 })
    await page.screenshot({ path: './screenshots/en/opsiweb_table_columnselection.png' })
    await page.screenshot({ path: './screenshots/de/opsiweb_table_columnselection.png' })
  })

  test('refresh', async ({ page }) => {
    await callStoryId(page, 'button-btn-refetch', 'btn-refetch')
    const component = await page.locator('[data-testid="BTNRefetch"]')
    await (new Promise(resolve => setTimeout(resolve, 1000)))
    await page.setViewportSize({ width: 200, height: 340 })
    await page.evaluate((val) => { document.querySelector('.refreshlabel').innerHTML = val }, 'Refresh')
    await component.screenshot({ path: './screenshots/en/opsiweb_table_refresh.png' })
    await page.evaluate((val) => { document.querySelector('.refreshlabel').innerHTML = val }, 'Aktualisierung')
    await component.screenshot({ path: './screenshots/de/opsiweb_table_refresh.png' })
  })
})
