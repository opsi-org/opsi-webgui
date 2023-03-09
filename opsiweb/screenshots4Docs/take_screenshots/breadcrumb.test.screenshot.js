const { test } = require('@playwright/test')
const { callStoryId } = require('../../uib-components/.utils/playwright/pw-story-call')

test('Breadcrumb', async ({ page }) => {
  await callStoryId(page, 'bar-b-breadcrumb', 'b-breadcrumb')
  const component = await page.locator('[data-testid="BarBBreadcrumb"]')
  await (new Promise(resolve => setTimeout(resolve, 1000)))
  await page.setViewportSize({ width: 200, height: 270 })
  await component.evaluate(() => { document.querySelector('.breadcrumb').innerHTML = 'Clients / Configuration' })
  await component.screenshot({ path: './screenshots/en/opsi-webgui_breadcrumb.png' })
  await component.evaluate(() => { document.querySelector('.breadcrumb').innerHTML = 'Clients / Konfiguration' })
  await component.screenshot({ path: './screenshots/de/opsi-webgui_breadcrumb.png' })
})
