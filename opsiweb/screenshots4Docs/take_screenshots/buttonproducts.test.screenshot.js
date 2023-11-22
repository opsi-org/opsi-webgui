const { test } = require('@playwright/test')
const { callStoryId } = require('../../uib-components/.utils/playwright/pw-story-call')
const en = require('../../uib-components/locale/opsi-webgui_en.json')
const de = require('../../uib-components/locale/opsi-webgui_de.json')

test('Button Products', async ({ page }) => {
  // starting on page clients
  await callStoryId(page, 'button-btn-row-link-to', 'btn-row-link-to-products')
  const component = page.locator('[data-testid="ButtonBTNRowLinkTo"]')
  await (new Promise(resolve => setTimeout(resolve, 1000)))
  await page.evaluate((val) => { document.querySelector('.label').innerHTML = val }, en['title.products'])
  await component.screenshot({ path: './screenshots/en/opsi-webgui_buttonproducts.png' })
  await page.evaluate((val) => { document.querySelector('.label').innerHTML = val }, de['title.products'])
  await component.screenshot({ path: './screenshots/de/opsi-webgui_buttonproducts.png' })
})
