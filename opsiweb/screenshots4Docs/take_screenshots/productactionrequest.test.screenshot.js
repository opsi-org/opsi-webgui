const { test } = require('@playwright/test')
const { callStoryId } = require('../../uib-components/.utils/playwright/pw-story-call')

test('Products Actionrequest', async ({ page }) => {
  await callStoryId(page, 'dropdown-dd-product-request', 'dd-product-request-head')
  await page.setViewportSize({ width: 300, height: 350 })
  await page.click('[data-testid="DropdownDDProductRequest"]')
  await (new Promise(resolve => setTimeout(resolve, 1000)))
  await page.screenshot({ path: './screenshots/en/opsi-webgui_productactionreq.png' })
  await page.screenshot({ path: './screenshots/de/opsi-webgui_productactionreq.png' })
})
