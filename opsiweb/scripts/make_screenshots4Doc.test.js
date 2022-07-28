const { test } = require('@playwright/test')
const { callStoryId } = require('../uib-components/.utils/playwright/pw-story-call')

test.describe('GUI', () => {
  // Default layout with client page
  test.describe('Main layout', () => {})
  test.describe('Page content', () => {
    test('breadcrumb', async ({ page }) => {
      await callStoryId(page, 'bar-b-breadcrumb', 'b-breadcrumb')
      const component = await page.locator('[data-testid="BarBBreadcrumb"]')
      await component.evaluate(() => { document.querySelector('.breadcrumb').innerHTML = 'Server / Configuration' })
      await component.screenshot({ path: './screenshots/en/opsiweb_breadcrumb.png' })
      await component.evaluate(() => { document.querySelector('.breadcrumb').innerHTML = 'Server / Konfiguration' })
      await component.screenshot({ path: './screenshots/de/opsiweb_breadcrumb.png' })
    })
    test('header', async ({ page }) => {
      await callStoryId(page, 'bar-b-collapse-page-header', 'b-collapse-page-header')
      const component = await page.locator('[data-testid="BarBCollapsePageHeader"]')
      await component.evaluate(() => { document.querySelector('.nav-title').innerHTML = 'Clients' })
      await component.evaluate(() => { document.querySelector('.tableheader_depots').innerHTML = 'Server' })
      await component.evaluate(() => { document.querySelector('.tableheader_hostgroup').innerHTML = 'Hostgroups' })
      await component.evaluate(() => { document.querySelector('.tableheader_products').innerHTML = 'Products' })
      await component.screenshot({ path: './screenshots/en/opsiweb_header.png' })
      await component.evaluate(() => { document.querySelector('.tableheader_hostgroup').innerHTML = 'Hostgruppen' })
      await component.evaluate(() => { document.querySelector('.tableheader_products').innerHTML = 'Produkte' })
      await component.screenshot({ path: './screenshots/de/opsiweb_header.png' })
    })
  })
  test.describe('Table features', () => {
    test('table filter', async ({ page }) => {
      await callStoryId(page, 'input-i-filter', 'i-filter')
      const component = await page.locator('[data-testid="IFilter"]')
      await component.type('Filter ID')
      await component.screenshot({ path: './screenshots/en/opsiweb_table_filter.png' })
      await component.screenshot({ path: './screenshots/de/opsiweb_table_filter.png' })
    })
    test('table sorting', async ({ page }) => {
      await callStoryId(page, 'dropdown-dd-table-sorting', 'dd-table-sorting')
      await page.click('[data-testid="DropdownDDTableSorting"] .btn')
      await page.setViewportSize({ width: 220, height: 150 })
      await page.screenshot({ path: './screenshots/en/opsiweb_table_sorting.png' })
      await page.screenshot({ path: './screenshots/de/opsiweb_table_sorting.png' })
    })
    test('table pagination', async ({ page }) => {
      await callStoryId(page, 'bar-b-table-footer', 'b-table-footer')
      const component = await page.locator('[data-testid="BTableFooter"]')
      await component.screenshot({ path: './screenshots/en/opsiweb_table_pagination.png' })
      await component.screenshot({ path: './screenshots/de/opsiweb_table_pagination.png' })
    })
  })
  test.describe('OPSI specific settings', () => {
    // Setting page with Modules content selected
    test('opsi modules', async ({ page }) => {
      await callStoryId(page, 'view-v-modules', 'v-modules')
      const component = await page.locator('[data-testid="VModules"]')
      await component.screenshot({ path: './screenshots/en/opsiweb_opsiModules.png' })
      await component.screenshot({ path: './screenshots/de/opsiweb_opsiModules.png' })
    })
  })
  test.describe('GUI settings', () => {
    // test('language selection from login page footer', async ({ page }) => {
    //   await callStoryId(page, 'bar-b-auth-footer', 'b-auth-footer')
    //   const component = await page.locator('[data-testid="BarBAuthFooter"]')
    //   await component.evaluate(() => { document.querySelector('.BAuthFooter-version').innerHTML = 'x.x.x' })
    //   await component.screenshot({ path: './screenshots/en/opsiweb_login_language.png' })
    //   await component.screenshot({ path: './screenshots/de/opsiweb_login_language.png' })
    // })
    test('language', async ({ page }) => {
      await callStoryId(page, 'dropdown-dd-lang', 'dd-lang')
      const component = await page.locator('[data-testid="DropdownDDLang"]')
      await component.click()
      await page.setViewportSize({ width: 220, height: 150 })
      await page.screenshot({ path: './screenshots/en/opsiweb_language.png' })
      await page.screenshot({ path: './screenshots/de/opsiweb_language.png' })
    })
    test('theme', async ({ page }) => {
      await callStoryId(page, 'dropdown-dd-theme', 'dd-theme')
      await page.click('[data-testid="DropdownDDTheme"] .btn')
      await page.setViewportSize({ width: 220, height: 150 })
      await page.screenshot({ path: './screenshots/en/opsiweb_theme.png' })
      await page.screenshot({ path: './screenshots/de/opsiweb_theme.png' })
    })
  })
})
