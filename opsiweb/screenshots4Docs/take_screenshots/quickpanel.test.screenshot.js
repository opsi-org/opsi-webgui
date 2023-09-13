const { test } = require('@playwright/test')
const { callStoryId } = require('../../uib-components/.utils/playwright/pw-story-call')
// const en = require('../../uib-components/locale/en.json')
// const de = require('../../uib-components/locale/de.json')

test.describe('Quick Panel', () => {
  test('tab depots', async ({ page }) => {
    await page.unroute('**/api/**')
    await page.route('**/api/**', (route) => {
      console.log('ROUTE NOT MOCKED: \t\t', route._parent._initializer.url)
      route.abort()
    })
    await callStoryId(page, 'bar-b-quick-panel', 'b-quick-panel')
    await (new Promise(resolve => setTimeout(resolve, 1000)))
    // await page.evaluate((val) => { document.querySelector('label>.text-small').innerHTML = val }, en['form.quicksave'])

    const component1 = await page.locator('#qp-tab-depots___BV_tab_button__')
    await component1.screenshot({ path: './screenshots/en/opsi-webgui_quickpanel_tab_depots.png' })
    await component1.screenshot({ path: './screenshots/de/opsi-webgui_quickpanel_tab_depots.png' })
    component1.click()
    const t = await page.locator('#qp-tab-depots')
    await (new Promise(resolve => setTimeout(resolve, 1000)))
    await t.screenshot({ path: './screenshots/de/opsi-webgui_quickpanel_tab_depots_content.png' })
  })

  test('tab clients', async ({ page }) => {
    await page.unroute('**/api/**')
    await page.route('**/api/**', (route) => {
      console.log('ROUTE NOT MOCKED: \t\t', route._parent._initializer.url)
      route.abort()
    })
    await callStoryId(page, 'bar-b-quick-panel', 'b-quick-panel')
    await (new Promise(resolve => setTimeout(resolve, 1000)))
    // await page.evaluate((val) => { document.querySelector('label>.text-small').innerHTML = val }, en['form.quicksave'])

    const component2 = await page.locator('#qp-tab-clients___BV_tab_button__')
    await component2.screenshot({ path: './screenshots/en/opsi-webgui_quickpanel_tab_clients.png' })
    await component2.screenshot({ path: './screenshots/de/opsi-webgui_quickpanel_tab_clients.png' })
    component2.click()
    const t = await page.locator('#qp-tab-clients')
    await (new Promise(resolve => setTimeout(resolve, 1000)))
    await t.screenshot({ path: './screenshots/de/opsi-webgui_quickpanel_tab_clients_content.png' })
  })

  test('tab products', async ({ page }) => {
    await page.unroute('**/api/**')
    await page.route('**/api/**', (route) => {
      console.log('ROUTE NOT MOCKED: \t\t', route._parent._initializer.url)
      route.abort()
    })
    await callStoryId(page, 'bar-b-quick-panel', 'b-quick-panel')
    await (new Promise(resolve => setTimeout(resolve, 1000)))
    // await page.evaluate((val) => { document.querySelector('label>.text-small').innerHTML = val }, en['form.quicksave'])

    const component3 = await page.locator('#qp-tab-products___BV_tab_button__')
    await component3.screenshot({ path: './screenshots/en/opsi-webgui_quickpanel_tab_products.png' })
    await component3.screenshot({ path: './screenshots/de/opsi-webgui_quickpanel_tab_products.png' })
    component3.click()
    const t = await page.locator('#qp-tab-products')
    await (new Promise(resolve => setTimeout(resolve, 1000)))
    await t.screenshot({ path: './screenshots/de/opsi-webgui_quickpanel_tab_products_content.png' })
    // await page.evaluate((val) => { document.querySelector('label>.text-small').innerHTML = val }, de['form.quicksave'])
    // todo select items..
  })

  test('tab selection', async ({ page }) => {
    await page.unroute('**/api/**')
    await page.route('**/api/**', (route) => {
      console.log('ROUTE NOT MOCKED: \t\t', route._parent._initializer.url)
      route.abort()
    })
    await callStoryId(page, 'bar-b-quick-panel', 'b-quick-panel')
    await (new Promise(resolve => setTimeout(resolve, 1000)))
    // await page.evaluate((val) => { document.querySelector('label>.text-small').innerHTML = val }, en['form.quicksave'])

    await (new Promise(resolve => setTimeout(resolve, 1000)))
    const component0 = await page.locator('#qp-tab-selection___BV_tab_button__')
    await component0.screenshot({ path: './screenshots/en/opsi-webgui_quickpanel_tab_selection.png' })
    await component0.screenshot({ path: './screenshots/de/opsi-webgui_quickpanel_tab_selection.png' })
    component0.click()
    const t = await page.locator('.tab-content')
    await t.screenshot({ path: './screenshots/de/opsi-webgui_quickpanel_tab_selection_content.png' })
  })
})
