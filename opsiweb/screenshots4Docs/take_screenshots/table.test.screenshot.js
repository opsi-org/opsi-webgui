const { test } = require('@playwright/test')
const { callStoryId } = require('../../uib-components/.utils/playwright/pw-story-call')
const en = require('../../uib-components/locale/opsi-webgui_en.json')
const de = require('../../uib-components/locale/opsi-webgui_de.jsonjson')

test.describe('Table', () => {
  test('Filter', async ({ page }) => {
    await callStoryId(page, 'input-i-filter', 'i-filter')
    const component = page.locator('[data-testid="IFilter"]')
    await (new Promise(resolve => setTimeout(resolve, 1000)))
    await page.setViewportSize({ width: 220, height: 340 })
    await component.type('Filter ID')
    await component.screenshot({ path: './screenshots/en/opsi-webgui_table_filter.png' })
    await component.screenshot({ path: './screenshots/de/opsi-webgui_table_filter.png' })
  })
  test('Sort', async ({ page }) => {
    await callStoryId(page, 'dropdown-dd-table-sorting', 'dd-table-sorting')
    await page.click('[data-testid="DropdownDDTableSorting"] .btn')
    await (new Promise(resolve => setTimeout(resolve, 1000)))
    await page.setViewportSize({ width: 220, height: 340 })
    await page.evaluate((val) => { document.querySelector('.sortDirection').innerHTML = val }, en['button.sort.tablecolumns.sortDirection'])
    await page.screenshot({ path: './screenshots/en/opsi-webgui_table_sort.png' })
    await page.evaluate((val) => { document.querySelector('.sortDirection').innerHTML = val }, de['button.sort.tablecolumns.sortDirection'])
    await page.screenshot({ path: './screenshots/de/opsi-webgui_table_sort.png' })
  })
  test('Sort column', async ({ page }) => {
    await callStoryId(page, 'table-t-infinite-scroll-smooth', 't-infinite-scroll-smooth')
    await (new Promise(resolve => setTimeout(resolve, 1000)))
    // await comp.setViewportSize({ width: 50 })
    await page.evaluate((val) => { document.querySelector('[aria-sort="none"]').innerHTML = val }, '')
    const comp = await page.locator('[aria-sort="none"]')

    await comp.screenshot({ path: './screenshots/en/opsi-webgui_table_sort_column.png' })
    await comp.screenshot({ path: './screenshots/de/opsi-webgui_table_sort_column.png' })
  })
  test('Column Selection', async ({ page }) => {
    await callStoryId(page, 'dropdown-dd-table-column-visibility', 'dd-table-column-visibility')
    await page.click('[data-testid="DropdownDDTableColumnVisibility"] .btn')
    await (new Promise(resolve => setTimeout(resolve, 1000)))
    await page.setViewportSize({ width: 220, height: 260 })
    await page.screenshot({ path: './screenshots/en/opsi-webgui_table_columnselect.png' })
    await page.screenshot({ path: './screenshots/de/opsi-webgui_table_columnselect.png' })
  })

  test('Refresh', async ({ page }) => {
    await callStoryId(page, 'button-btn-refetch', 'btn-refetch')
    const component = page.locator('[data-testid="BTNRefetch"]')
    await (new Promise(resolve => setTimeout(resolve, 1000)))
    await page.setViewportSize({ width: 220, height: 340 })
    // await page.evaluate((val) => { document.querySelector('.refreshlabel').innerHTML = val }, 'Refresh')
    await component.screenshot({ path: './screenshots/en/opsi-webgui_table_refresh.png' })
    // await page.evaluate((val) => { document.querySelector('.refreshlabel').innerHTML = val }, 'Aktualisierung')
    await component.screenshot({ path: './screenshots/de/opsi-webgui_table_refresh.png' })
  })
})
